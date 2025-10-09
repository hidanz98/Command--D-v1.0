/**
 * SISTEMA DE HEARTBEAT
 * 
 * Este job roda em cada instalação (cada locadora)
 * e envia um "ping" para o servidor master do Otávio
 * informando que o sistema está online.
 * 
 * O Otávio consegue ver quais sistemas estão ativos/inativos
 */

import { prisma } from '../lib/prisma';

const MASTER_API_URL = process.env.MASTER_API_URL || 'https://master.command-d.com.br';
const LICENSE_API_KEY = process.env.LICENSE_API_KEY;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

// Intervalo: 5 minutos
const HEARTBEAT_INTERVAL = 5 * 60 * 1000;

interface HeartbeatMetrics {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  version: string;
  timestamp: string;
  stats?: {
    totalProducts?: number;
    totalActiveUsers?: number;
    totalOrders?: number;
    databaseSize?: number;
  };
}

/**
 * Coletar métricas do sistema (sem dados sensíveis!)
 */
async function collectMetrics(): Promise<HeartbeatMetrics> {
  try {
    // Estatísticas não sensíveis
    const [totalProducts, totalActiveUsers, totalOrders] = await Promise.all([
      prisma.product.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.order.count()
    ]);

    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      stats: {
        totalProducts,
        totalActiveUsers,
        totalOrders
      }
    };
  } catch (error) {
    console.error('Erro ao coletar métricas:', error);
    
    // Retornar métricas básicas
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: APP_VERSION,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Enviar heartbeat para o servidor master
 */
export async function sendHeartbeat(): Promise<void> {
  if (!LICENSE_API_KEY) {
    console.warn('LICENSE_API_KEY não configurada. Heartbeat desabilitado.');
    return;
  }

  try {
    const metrics = await collectMetrics();

    const response = await fetch(`${MASTER_API_URL}/api/master/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LICENSE_API_KEY
      },
      body: JSON.stringify({
        version: APP_VERSION,
        metrics
      }),
      signal: AbortSignal.timeout(10000) // 10s timeout
    });

    if (response.ok) {
      const data = await response.json();
      
      // Verificar status da licença na resposta
      if (data.data) {
        const { licenseStatus, isActive, expiresAt } = data.data;
        
        if (licenseStatus === 'SUSPENDED' || licenseStatus === 'EXPIRED') {
          console.warn(`⚠️  AVISO: Licença ${licenseStatus.toLowerCase()}!`);
        }
        
        if (!isActive) {
          console.warn('⚠️  AVISO: Sistema marcado como inativo pelo administrador!');
        }

        if (expiresAt) {
          const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            console.warn(`⚠️  AVISO: Licença expira em ${daysUntilExpiry} dias!`);
          }
        }
      }
      
      console.log('✅ Heartbeat enviado com sucesso');
    } else {
      console.error(`❌ Erro ao enviar heartbeat: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ Heartbeat timeout (servidor master não respondeu)');
      } else {
        console.error('❌ Erro ao enviar heartbeat:', error.message);
      }
    }
  }
}

/**
 * Iniciar heartbeat automático
 */
export function startHeartbeat(): void {
  if (!LICENSE_API_KEY) {
    console.log('⚠️  Heartbeat desabilitado (LICENSE_API_KEY não configurada)');
    return;
  }

  console.log(`🫀 Heartbeat iniciado (intervalo: ${HEARTBEAT_INTERVAL / 1000}s)`);
  
  // Enviar imediatamente ao iniciar
  sendHeartbeat();
  
  // Depois continuar enviando no intervalo
  setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
}

/**
 * Job para verificar licença local (cache)
 * Evita fazer request em toda chamada de API
 */
let licenseCache: {
  status: string;
  isActive: boolean;
  lastCheck: number;
} | null = null;

const LICENSE_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function checkLicenseCache(): Promise<boolean> {
  if (!LICENSE_API_KEY) {
    return true; // Se não tem licença configurada, permite (desenvolvimento)
  }

  // Usar cache se ainda válido
  if (licenseCache && Date.now() - licenseCache.lastCheck < LICENSE_CACHE_TTL) {
    return licenseCache.isActive && licenseCache.status === 'ACTIVE';
  }

  try {
    const response = await fetch(`${MASTER_API_URL}/api/master/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LICENSE_API_KEY
      },
      body: JSON.stringify({
        version: APP_VERSION,
        metrics: { uptime: process.uptime() }
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      
      licenseCache = {
        status: data.data.licenseStatus,
        isActive: data.data.isActive,
        lastCheck: Date.now()
      };

      return licenseCache.isActive && licenseCache.status === 'ACTIVE';
    }
  } catch (error) {
    console.error('Erro ao verificar licença:', error);
  }

  // Em caso de erro, usar cache antigo ou permitir (failsafe)
  return licenseCache ? licenseCache.isActive : true;
}

