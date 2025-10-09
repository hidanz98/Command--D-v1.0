# 🏢 COMMAND-D - ARQUITETURA SAAS MULTI-LOCADORA

## 🎯 MODELO DE NEGÓCIO

Você (Otávio) é o **dono do Sistema Command-D** e vai:
- 💰 **Alugar o sistema** para locadoras
- 🔧 **Fazer atualizações** sem perder dados
- 🔐 **Controlar licenças** (ativa/desativa)
- 📊 **Painel Master** para gerenciar clientes
- 🤝 **Sistema de parceria** entre locadoras
- 🔄 **Indicação de clientes** entre lojas
- 📦 **Retirada em qualquer sede** (se parceiras)

---

## 🏗️ ARQUITETURA FINAL

```
┌────────────────────────────────────────────────────────────────┐
│                    PAINEL MASTER - OTÁVIO                      │
│            https://master.command-d.com.br                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  GERENCIAMENTO DE LICENÇAS                                │ │
│  │  ✓ Criar nova locadora                                   │ │
│  │  ✓ Ativar/Desativar licença                              │ │
│  │  ✓ Definir plano (Básico/Pro/Enterprise)                 │ │
│  │  ✓ Ver status de pagamento                               │ │
│  │  ✓ Estatísticas globais (sem dados sensíveis)            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  DEPLOY E ATUALIZAÇÕES                                    │ │
│  │  ✓ Deploy de nova instância                              │ │
│  │  ✓ Atualizar todas locadoras                             │ │
│  │  ✓ Rollback se necessário                                │ │
│  │  ✓ Monitoramento de saúde                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  PARCERIAS E NETWORK                                      │ │
│  │  ✓ Aprovar parcerias entre locadoras                     │ │
│  │  ✓ Ver estatísticas de indicações                        │ │
│  │  ✓ Comissões de indicação                                │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Gerencia Licenças
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  BIL'S CINEMA    │  │  CABEÇA EFEITO   │  │  TERCEIRA LOJA   │
│  (Licença Ativa) │  │  (Licença Ativa) │  │  (Licença Demo)  │
│                  │  │                  │  │                  │
│  CNPJ: 123...    │  │  CNPJ: 456...    │  │  CNPJ: 789...    │
│  Plano: Pro      │  │  Plano: Pro      │  │  Plano: Básico   │
│                  │  │                  │  │                  │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │ Produtos:  │  │  │  │ Produtos:  │  │  │  │ Produtos:  │  │
│  │ Câmeras    │  │  │  │ Iluminação │  │  │  │ Áudio      │  │
│  │ Lentes     │  │  │  │ Maquinário │  │  │  │ Microfones │  │
│  │ Tripés     │  │◄─┼──┼►│ Gruas     │  │  │  │ Mixers     │  │
│  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
│                  │  │                  │  │                  │
│  PARCEIRA COM:   │  │  PARCEIRA COM:   │  │  SEM PARCEIROS   │
│  - Cabeça Efeito │  │  - Bil's Cinema  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🔑 SISTEMA DE LICENCIAMENTO

### 1. Banco de Dados Master

```prisma
// prisma/schema-master.prisma
// Banco separado só para o Otávio

model LicenseHolder {
  id              String   @id @default(cuid())
  
  // Informações da Locadora
  companyName     String
  cnpj            String   @unique
  ownerName       String
  ownerEmail      String   @unique
  ownerPhone      String
  
  // Licença
  licenseKey      String   @unique
  licenseStatus   LicenseStatus  @default(TRIAL)
  licenseExpiry   DateTime?
  
  // Plano
  plan            PlanType       @default(BASIC)
  monthlyFee      Float
  
  // Servidor/Instância
  subdomain       String   @unique // Ex: bilscinema
  serverUrl       String?  // Ex: https://bilscinema.command-d.com.br
  databaseUrl     String?  // Conexão com DB da locadora
  apiKey          String   @unique
  apiSecret       String
  
  // Status Técnico
  isActive        Boolean  @default(false)
  lastHeartbeat   DateTime?
  version         String?  // Versão do sistema instalado
  
  // Financeiro
  paymentStatus   PaymentStatus  @default(PENDING)
  lastPayment     DateTime?
  nextPayment     DateTime?
  
  // Parcerias
  partnerships    Partnership[]  @relation("PartnerFrom")
  partneredWith   Partnership[]  @relation("PartnerTo")
  
  // Auditoria
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?  // ID do Otávio ou outro admin
  
  @@map("license_holders")
}

enum LicenseStatus {
  TRIAL       // 30 dias grátis
  ACTIVE      // Pago e funcionando
  SUSPENDED   // Não pagou
  CANCELLED   // Cancelado
  EXPIRED     // Expirou
}

enum PlanType {
  BASIC       // R$ 200/mês - 1 usuário, 100 produtos
  PRO         // R$ 500/mês - 5 usuários, 500 produtos
  ENTERPRISE  // R$ 1000/mês - Ilimitado
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

model Partnership {
  id              String   @id @default(cuid())
  
  // Locadoras Parceiras
  partnerFromId   String
  partnerFrom     LicenseHolder  @relation("PartnerFrom", fields: [partnerFromId], references: [id])
  
  partnerToId     String
  partnerTo       LicenseHolder  @relation("PartnerTo", fields: [partnerToId], references: [id])
  
  // Status da Parceria
  status          PartnershipStatus  @default(PENDING)
  
  // Configurações
  allowProductSharing   Boolean  @default(false)  // Pode ver produtos um do outro
  allowPickupAtPartner  Boolean  @default(false)  // Cliente pode retirar na outra loja
  allowClientReferral   Boolean  @default(true)   // Pode indicar clientes
  
  // Comissões
  referralCommission    Float    @default(0)     // % de comissão por indicação
  
  // Auditoria
  approvedBy      String?   // ID do Otávio
  approvedAt      DateTime?
  createdAt       DateTime  @default(now())
  
  @@unique([partnerFromId, partnerToId])
  @@map("partnerships")
}

enum PartnershipStatus {
  PENDING     // Aguardando aprovação
  ACTIVE      // Ativa
  SUSPENDED   // Suspensa
  CANCELLED   // Cancelada
}

model SystemUpdate {
  id              String   @id @default(cuid())
  
  version         String
  changelog       String
  isMandatory     Boolean  @default(false)
  
  // Deploy
  deployedAt      DateTime?
  deployedBy      String?
  
  // Status por locadora
  deployments     UpdateDeployment[]
  
  createdAt       DateTime @default(now())
  
  @@map("system_updates")
}

model UpdateDeployment {
  id              String   @id @default(cuid())
  
  updateId        String
  update          SystemUpdate  @relation(fields: [updateId], references: [id])
  
  licenseHolderId String
  
  status          DeployStatus  @default(PENDING)
  startedAt       DateTime?
  completedAt     DateTime?
  error           String?
  
  @@map("update_deployments")
}

enum DeployStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  ROLLED_BACK
}
```

### 2. Validação de Licença em Tempo Real

```typescript
// server/middleware/licenseValidation.ts

import { prisma as masterPrisma } from '../lib/masterPrisma';
import { RequestHandler } from 'express';

export const validateLicense: RequestHandler = async (req, res, next) => {
  try {
    const apiKey = process.env.LICENSE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Sistema não configurado corretamente' 
      });
    }

    // Verificar licença no servidor master
    const license = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey }
    });

    if (!license) {
      return res.status(401).json({ 
        error: 'Licença inválida' 
      });
    }

    // Verificar status
    if (license.licenseStatus === 'SUSPENDED') {
      return res.status(403).json({ 
        error: 'Licença suspensa. Entre em contato com o suporte.',
        reason: 'PAYMENT_OVERDUE'
      });
    }

    if (license.licenseStatus === 'EXPIRED') {
      return res.status(403).json({ 
        error: 'Licença expirada',
        reason: 'LICENSE_EXPIRED'
      });
    }

    if (!license.isActive) {
      return res.status(403).json({ 
        error: 'Sistema desativado pelo administrador',
        reason: 'DEACTIVATED'
      });
    }

    // Atualizar heartbeat
    await masterPrisma.licenseHolder.update({
      where: { id: license.id },
      data: { lastHeartbeat: new Date() }
    });

    // Adicionar info da licença na request
    req.license = license;
    
    next();
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({ 
      error: 'Erro ao validar licença' 
    });
  }
};
```

### 3. Heartbeat Automático

```typescript
// server/jobs/heartbeat.ts

import { prisma as masterPrisma } from '../lib/masterPrisma';

export async function sendHeartbeat() {
  const apiKey = process.env.LICENSE_API_KEY;
  const version = process.env.APP_VERSION;
  
  try {
    await fetch(`${process.env.MASTER_API_URL}/api/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey!
      },
      body: JSON.stringify({
        version,
        timestamp: new Date().toISOString(),
        metrics: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          // Estatísticas não sensíveis
          totalProducts: await getTotalProducts(),
          totalActiveUsers: await getTotalActiveUsers(),
        }
      })
    });
  } catch (error) {
    console.error('Heartbeat failed:', error);
  }
}

// Executar a cada 5 minutos
setInterval(sendHeartbeat, 5 * 60 * 1000);
```

---

## 🤝 SISTEMA DE PARCERIAS

### 1. Interface de Parceria

```typescript
// client/components/PartnershipManager.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Handshake, Building2, Package, Users, MapPin } from 'lucide-react';

interface Partner {
  id: string;
  companyName: string;
  cnpj: string;
  status: 'pending' | 'active' | 'suspended';
  allowProductSharing: boolean;
  allowPickupAtPartner: boolean;
  allowClientReferral: boolean;
  referralCommission: number;
}

export const PartnershipManager: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [availablePartners, setAvailablePartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    const response = await fetch('/api/partnerships');
    const data = await response.json();
    setPartners(data.partners);
    setAvailablePartners(data.available);
  };

  const requestPartnership = async (partnerId: string) => {
    await fetch('/api/partnerships/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId })
    });
    fetchPartners();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Handshake className="w-6 h-6 text-blue-400" />
            <CardTitle>Gerenciar Parcerias</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            Faça parcerias com outras locadoras para:
          </p>
          <ul className="space-y-2 text-gray-300 mb-6">
            <li className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-400" />
              Compartilhar catálogo de produtos
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Permitir retirada em qualquer sede
            </li>
            <li className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Indicar clientes e ganhar comissão
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Parcerias Ativas */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Parcerias Ativas</h3>
        {partners.filter(p => p.status === 'active').map(partner => (
          <Card key={partner.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <h4 className="text-lg font-semibold text-white">
                      {partner.companyName}
                    </h4>
                    <Badge variant="success">Ativa</Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    CNPJ: {partner.cnpj}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {partner.allowProductSharing ? (
                        <Badge variant="success">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                      <span className="text-sm">Compartilhamento de Produtos</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {partner.allowPickupAtPartner ? (
                        <Badge variant="success">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                      <span className="text-sm">Retirada na Parceira</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {partner.allowClientReferral ? (
                        <Badge variant="success">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                      <span className="text-sm">Indicação de Clientes</span>
                    </div>

                    {partner.referralCommission > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{partner.referralCommission}%</Badge>
                        <span className="text-sm">Comissão de Indicação</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Locadoras Disponíveis */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">
          Locadoras Disponíveis para Parceria
        </h3>
        {availablePartners.map(partner => (
          <Card key={partner.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <h4 className="text-lg font-semibold text-white">
                      {partner.companyName}
                    </h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    CNPJ: {partner.cnpj}
                  </p>
                </div>

                <Button
                  onClick={() => requestPartnership(partner.id)}
                  className="flex items-center gap-2"
                >
                  <Handshake className="w-4 h-4" />
                  Solicitar Parceria
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

### 2. Catálogo Compartilhado

```typescript
// server/routes/sharedCatalog.ts

import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { prisma as masterPrisma } from '../lib/masterPrisma';

export const getSharedCatalog: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.LICENSE_API_KEY;

    // Buscar parcerias ativas
    const license = await masterPrisma.licenseHolder.findUnique({
      where: { apiKey },
      include: {
        partnerships: {
          where: {
            status: 'ACTIVE',
            allowProductSharing: true
          },
          include: {
            partnerTo: true
          }
        }
      }
    });

    if (!license) {
      return res.status(401).json({ error: 'Licença inválida' });
    }

    // Buscar produtos próprios
    const ownProducts = await prisma.product.findMany({
      where: { isActive: true }
    });

    // Buscar produtos das parceiras
    const partnerProducts = await Promise.all(
      license.partnerships.map(async (partnership) => {
        // Fazer requisição para API da parceira
        const response = await fetch(
          `${partnership.partnerTo.serverUrl}/api/products/public`,
          {
            headers: {
              'X-API-Key': partnership.partnerTo.apiKey
            }
          }
        );
        
        const data = await response.json();
        return data.products.map((p: any) => ({
          ...p,
          isPartnerProduct: true,
          partnerName: partnership.partnerTo.companyName,
          partnerId: partnership.partnerTo.id
        }));
      })
    );

    res.json({
      ownProducts,
      partnerProducts: partnerProducts.flat(),
      totalProducts: ownProducts.length + partnerProducts.flat().length
    });
  } catch (error) {
    console.error('Shared catalog error:', error);
    res.status(500).json({ error: 'Erro ao buscar catálogo compartilhado' });
  }
};
```

---

## 🎛️ PAINEL MASTER DO OTÁVIO

```typescript
// client/pages/MasterAdminPanel.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Settings,
  Download
} from 'lucide-react';

interface LicenseHolderStats {
  id: string;
  companyName: string;
  cnpj: string;
  plan: string;
  status: string;
  paymentStatus: string;
  monthlyFee: number;
  lastPayment: Date;
  nextPayment: Date;
  lastHeartbeat: Date;
  version: string;
  isActive: boolean;
  // Estatísticas não sensíveis
  metrics: {
    totalProducts: number;
    totalActiveUsers: number;
    uptime: number;
  };
}

export const MasterAdminPanel: React.FC = () => {
  const [licenses, setLicenses] = useState<LicenseHolderStats[]>([]);
  const [stats, setStats] = useState({
    totalLicenses: 0,
    activeLicenses: 0,
    monthlyRevenue: 0,
    overduePayments: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const response = await fetch('/api/master/dashboard');
    const data = await response.json();
    setLicenses(data.licenses);
    setStats(data.stats);
  };

  const toggleLicense = async (licenseId: string, active: boolean) => {
    await fetch(`/api/master/licenses/${licenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: active })
    });
    fetchDashboard();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: { color: 'success', icon: CheckCircle },
      TRIAL: { color: 'warning', icon: AlertTriangle },
      SUSPENDED: { color: 'destructive', icon: XCircle },
      EXPIRED: { color: 'secondary', icon: XCircle },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.ACTIVE;
    const Icon = variant.icon;
    
    return (
      <Badge variant={variant.color as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Painel Master - Command-D
          </h1>
          <p className="text-gray-400">
            Gerenciamento de Licenças e Clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDashboard} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Licença
          </Button>
        </div>
      </div>

      {/* Estatísticas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Licenças</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalLicenses}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Licenças Ativas</p>
                <p className="text-3xl font-bold text-white">
                  {stats.activeLicenses}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Receita Mensal</p>
                <p className="text-3xl font-bold text-white">
                  R$ {stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Pagamentos Atrasados</p>
                <p className="text-3xl font-bold text-white">
                  {stats.overduePayments}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Licenças */}
      <div className="space-y-4">
        {licenses.map((license) => (
          <Card key={license.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">
                      {license.companyName}
                    </h3>
                    {getStatusBadge(license.status)}
                    <Badge variant={license.isActive ? 'success' : 'secondary'}>
                      {license.isActive ? 'Ativo' : 'Desativado'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-gray-400 text-sm">CNPJ</p>
                      <p className="text-white font-medium">{license.cnpj}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Plano</p>
                      <p className="text-white font-medium">{license.plan}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Mensalidade</p>
                      <p className="text-white font-medium">
                        R$ {license.monthlyFee}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Versão</p>
                      <p className="text-white font-medium">{license.version}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Produtos</p>
                      <p className="text-white font-medium">
                        {license.metrics.totalProducts}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Usuários Ativos</p>
                      <p className="text-white font-medium">
                        {license.metrics.totalActiveUsers}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Último Heartbeat</p>
                      <p className="text-white font-medium">
                        {new Date(license.lastHeartbeat).toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Próximo Pagamento</p>
                      <p className="text-white font-medium">
                        {new Date(license.nextPayment).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => toggleLicense(license.id, !license.isActive)}
                    variant={license.isActive ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {license.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

---

## 💰 MODELO DE PRECIFICAÇÃO

### Planos Sugeridos

| Plano | Preço/Mês | Usuários | Produtos | E-commerce | Suporte |
|-------|-----------|----------|----------|------------|---------|
| **Básico** | R$ 200 | 1 | 100 | ✓ | Email |
| **Pro** | R$ 500 | 5 | 500 | ✓ | Email + Chat |
| **Enterprise** | R$ 1.000 | Ilimitado | Ilimitado | ✓ | Prioritário |

### Receita Estimada (10 clientes)

- 3 clientes Básico: R$ 600/mês
- 5 clientes Pro: R$ 2.500/mês
- 2 clientes Enterprise: R$ 2.000/mês

**TOTAL: R$ 5.100/mês = R$ 61.200/ano** 🚀

---

## 📝 PRÓXIMOS PASSOS

1. **Criar banco Master** ✅
2. **Implementar sistema de licenças**
3. **Criar Painel Master**
4. **Sistema de parcerias**
5. **Deploy automatizado**

**Posso começar agora?** 🚀

