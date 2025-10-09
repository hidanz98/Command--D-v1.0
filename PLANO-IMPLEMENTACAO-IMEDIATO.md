# 🚀 PLANO DE IMPLEMENTAÇÃO IMEDIATO

## 🎯 OBJETIVO
Implementar as melhorias críticas de segurança e funcionalidades essenciais nas próximas 2 semanas.

---

## SEMANA 1: SEGURANÇA E PERMISSÕES

### DIA 1-2: Sistema de Permissões (RBAC)

#### 1. Criar Schema de Permissões no Prisma
```prisma
// prisma/schema.prisma

model Permission {
  id          String   @id @default(cuid())
  resource    String   // 'pedidos', 'financeiro', 'clientes', etc
  action      String   // 'create', 'read', 'update', 'delete', 'approve'
  description String?
  
  roles       RolePermission[]
  
  @@unique([resource, action])
  @@map("permissions")
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permissionId String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  conditions   Json?      // { "ownOnly": true, "departmentOnly": false }
  
  createdAt    DateTime   @default(now())
  
  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  hierarchy   Int      @default(0)
  tenantId    String?
  tenant      Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  permissions RolePermission[]
  users       User[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("roles")
}

// Atualizar model User
model User {
  // ... campos existentes
  roleId      String?
  role        Role?    @relation(fields: [roleId], references: [id])
}
```

#### 2. Criar Serviço de Permissões
```typescript
// server/services/permissionService.ts

import { prisma } from '../lib/prisma';

export class PermissionService {
  // Verificar se usuário tem permissão
  static async hasPermission(
    userId: string,
    resource: string,
    action: string,
    targetData?: any
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.role) {
      return false;
    }

    // Verificar se tem a permissão
    const rolePermission = user.role.permissions.find(
      rp => rp.permission.resource === resource && 
            rp.permission.action === action
    );

    if (!rolePermission) {
      return false;
    }

    // Verificar condições (ownOnly, departmentOnly, etc)
    if (rolePermission.conditions) {
      const conditions = rolePermission.conditions as any;
      
      if (conditions.ownOnly && targetData) {
        // Verificar se o recurso pertence ao usuário
        if (targetData.userId !== userId) {
          return false;
        }
      }
      
      // Adicionar mais condições conforme necessário
    }

    return true;
  }

  // Criar permissão
  static async createPermission(data: {
    resource: string;
    action: string;
    description?: string;
  }) {
    return prisma.permission.create({ data });
  }

  // Atribuir permissão a role
  static async assignPermissionToRole(
    roleId: string,
    permissionId: string,
    conditions?: any
  ) {
    return prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
        conditions
      }
    });
  }
}
```

#### 3. Middleware de Permissões
```typescript
// server/middleware/permissions.ts

import { RequestHandler } from 'express';
import { PermissionService } from '../services/permissionService';
import { AuthenticatedRequest } from './auth';

export const requirePermission = (
  resource: string,
  action: string
): RequestHandler => {
  return async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const hasPermission = await PermissionService.hasPermission(
        req.user.userId,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Sem permissão para esta ação',
          required: { resource, action }
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};
```

#### 4. Hook Frontend para Permissões
```typescript
// client/hooks/usePermissions.ts

import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

interface Permission {
  resource: string;
  action: string;
}

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = useMemo(() => {
    return (resource: string, action: string): boolean => {
      if (!user?.role?.permissions) {
        return false;
      }

      return user.role.permissions.some(
        (p: Permission) => p.resource === resource && p.action === action
      );
    };
  }, [user]);

  const canCreate = (resource: string) => hasPermission(resource, 'create');
  const canRead = (resource: string) => hasPermission(resource, 'read');
  const canUpdate = (resource: string) => hasPermission(resource, 'update');
  const canDelete = (resource: string) => hasPermission(resource, 'delete');

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
  };
}
```

#### 5. Componente PermissionGuard
```typescript
// client/components/security/PermissionGuard.tsx

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  fallback = null,
  children,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### DIA 3-4: Audit Log

#### 1. Schema de Audit Log
```prisma
// Adicionar ao schema.prisma

model AuditLog {
  id          String   @id @default(cuid())
  
  // Quem fez
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  // O que fez
  action      String   // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  resource    String   // 'Order', 'Client', 'User', etc
  resourceId  String?  // ID do recurso afetado
  
  // Detalhes
  changes     Json?    // Antes/depois
  metadata    Json?    // IP, user agent, etc
  
  // Quando
  timestamp   DateTime @default(now())
  
  // Onde
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([userId, timestamp])
  @@index([resource, resourceId])
  @@index([tenantId, timestamp])
  @@map("audit_logs")
}
```

#### 2. Serviço de Audit Log
```typescript
// server/services/auditService.ts

import { prisma } from '../lib/prisma';

export class AuditService {
  static async log(data: {
    userId: string;
    tenantId: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: any;
    metadata?: any;
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          ...data,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Audit log error:', error);
      // Não falhar a operação principal se o log falhar
    }
  }

  static async getLogsByUser(userId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { user: true }
    });
  }

  static async getLogsByResource(
    resource: string,
    resourceId: string
  ) {
    return prisma.auditLog.findMany({
      where: { resource, resourceId },
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });
  }
}
```

#### 3. Middleware de Audit Log
```typescript
// server/middleware/auditLog.ts

import { RequestHandler } from 'express';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from './auth';

export const auditLog = (
  action: string,
  resource: string
): RequestHandler => {
  return async (req: AuthenticatedRequest, res, next) => {
    // Guardar referência à função send original
    const originalSend = res.send;

    // Sobrescrever res.send para capturar resposta
    res.send = function (data: any) {
      // Se a operação foi bem-sucedida (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log assíncrono (não bloqueia a resposta)
        setImmediate(() => {
          if (req.user) {
            AuditService.log({
              userId: req.user.userId,
              tenantId: req.user.tenantId || '',
              action,
              resource,
              resourceId: req.params.id,
              changes: {
                method: req.method,
                path: req.path,
                body: req.body,
                query: req.query
              },
              metadata: {
                ip: req.ip,
                userAgent: req.get('user-agent')
              }
            });
          }
        });
      }

      // Chamar send original
      return originalSend.call(this, data);
    };

    next();
  };
};
```

### DIA 5: Rate Limiting

#### 1. Implementar Rate Limiting
```typescript
// server/middleware/rateLimiting.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

// Rate limit para autenticação (mais restritivo)
export const authRateLimit = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit para API geral
export const apiRateLimit = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições
  message: 'Muitas requisições. Tente novamente em alguns segundos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit específico por usuário
export const perUserRateLimit = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:user:'
  }),
  windowMs: 1 * 60 * 1000,
  max: 60,
  keyGenerator: (req: any) => {
    return req.user?.userId || req.ip;
  }
});
```

---

## SEMANA 2: FUNCIONALIDADES ESSENCIAIS

### DIA 1-2: Upload Seguro de Documentos

#### 1. Configurar Multer com Validação
```typescript
// server/middleware/upload.ts

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

// Tipos de arquivo permitidos
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Salvar fora do webroot por segurança
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Nome aleatório seguro
    const randomName = crypto.randomBytes(32).toString('hex');
    const ext = ALLOWED_TYPES[file.mimetype as keyof typeof ALLOWED_TYPES];
    cb(null, `${randomName}.${ext}`);
  }
});

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Verificar tipo MIME
  if (ALLOWED_TYPES[file.mimetype as keyof typeof ALLOWED_TYPES]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Máximo 5 arquivos por vez
  }
});
```

#### 2. Serviço de Documentos
```typescript
// server/services/documentService.ts

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class DocumentService {
  // Criptografar documento
  static async encryptFile(filePath: string): Promise<string> {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);

    const fileContent = await fs.readFile(filePath);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(fileContent);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const encryptedPath = `${filePath}.enc`;
    await fs.writeFile(
      encryptedPath,
      Buffer.concat([iv, encrypted])
    );

    // Deletar arquivo original
    await fs.unlink(filePath);

    return encryptedPath;
  }

  // Gerar URL assinada com expiração
  static generateSignedUrl(
    fileId: string,
    expiresIn: number = 3600
  ): string {
    const timestamp = Date.now() + expiresIn * 1000;
    const data = `${fileId}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', process.env.SECRET_KEY!)
      .update(data)
      .digest('hex');

    return `/api/documents/${fileId}?expires=${timestamp}&signature=${signature}`;
  }

  // Verificar URL assinada
  static verifySignedUrl(
    fileId: string,
    expires: string,
    signature: string
  ): boolean {
    const timestamp = parseInt(expires);
    
    // Verificar expiração
    if (Date.now() > timestamp) {
      return false;
    }

    // Verificar assinatura
    const data = `${fileId}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.SECRET_KEY!)
      .update(data)
      .digest('hex');

    return signature === expectedSignature;
  }
}
```

### DIA 3: Implementar Câmera e Captura

```typescript
// client/hooks/useCamera.ts

import { useState, useRef, useCallback } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Não foi possível acessar a câmera');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  }, [stream]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    capturePhoto
  };
}
```

### DIA 4-5: LGPD Compliance

```typescript
// client/components/security/LGPDConsent.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LGPDConsentProps {
  isOpen: boolean;
  onAccept: (consents: ConsentData) => void;
  onReject: () => void;
}

interface ConsentData {
  necessaryData: boolean; // Obrigatório
  analyticsData: boolean; // Opcional
  marketingData: boolean; // Opcional
  biometricData: boolean; // Opcional
}

export const LGPDConsent: React.FC<LGPDConsentProps> = ({
  isOpen,
  onAccept,
  onReject
}) => {
  const [consents, setConsents] = useState<ConsentData>({
    necessaryData: true, // Sempre true
    analyticsData: false,
    marketingData: false,
    biometricData: false
  });

  const handleAccept = () => {
    onAccept(consents);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Termos de Uso e Política de Privacidade (LGPD)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados Necessários */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox checked={true} disabled />
              <label className="font-semibold">
                Dados Necessários (Obrigatório)
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Precisamos coletar e processar seus dados básicos (nome, email, CPF, telefone)
              para criar sua conta e processar pedidos. Sem esses dados não podemos prestar
              nossos serviços.
            </p>
          </div>

          {/* Analytics */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={consents.analyticsData}
                onCheckedChange={(checked) => 
                  setConsents(prev => ({ ...prev, analyticsData: !!checked }))
                }
              />
              <label className="font-semibold">
                Dados de Uso (Opcional)
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Permitir que coletemos dados sobre como você usa nossa plataforma
              para melhorar a experiência do usuário.
            </p>
          </div>

          {/* Marketing */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={consents.marketingData}
                onCheckedChange={(checked) => 
                  setConsents(prev => ({ ...prev, marketingData: !!checked }))
                }
              />
              <label className="font-semibold">
                Comunicações de Marketing (Opcional)
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Receber emails, SMS e notificações sobre promoções, novidades e
              ofertas especiais.
            </p>
          </div>

          {/* Biometria */}
          <div className="border-l-4 border-red-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={consents.biometricData}
                onCheckedChange={(checked) => 
                  setConsents(prev => ({ ...prev, biometricData: !!checked }))
                }
              />
              <label className="font-semibold">
                Dados Biométricos (Opcional)
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Permitir uso de reconhecimento facial para agilizar o processo de
              retirada de equipamentos e aumentar a segurança.
            </p>
          </div>

          {/* Direitos */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Seus Direitos (LGPD)</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ Confirmar existência de tratamento de dados</li>
              <li>✓ Acessar seus dados</li>
              <li>✓ Corrigir dados incompletos ou desatualizados</li>
              <li>✓ Solicitar anonimização ou exclusão</li>
              <li>✓ Revogar consentimento a qualquer momento</li>
              <li>✓ Solicitar portabilidade de dados</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Aceitar e Continuar
            </Button>
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1"
            >
              Recusar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1
- [ ] Criar schema de permissões
- [ ] Implementar PermissionService
- [ ] Criar middleware de permissões
- [ ] Criar hook usePermissions
- [ ] Criar PermissionGuard component
- [ ] Migrar rotas para usar permissões
- [ ] Criar schema de AuditLog
- [ ] Implementar AuditService
- [ ] Criar middleware de audit log
- [ ] Implementar rate limiting
- [ ] Adicionar Redis ao projeto
- [ ] Testar todos endpoints com rate limit

### Semana 2
- [ ] Configurar Multer
- [ ] Implementar upload seguro
- [ ] Criar DocumentService
- [ ] Implementar criptografia de arquivos
- [ ] Criar URLs assinadas
- [ ] Implementar useCamera hook
- [ ] Criar componente CameraCapture
- [ ] Criar LGPDConsent component
- [ ] Implementar termos de uso
- [ ] Criar página de política de privacidade
- [ ] Implementar exportação de dados
- [ ] Implementar exclusão de dados

---

## 🧪 TESTES NECESSÁRIOS

### Segurança
- [ ] Testar autenticação com credenciais inválidas
- [ ] Testar rate limiting
- [ ] Testar permissões para cada role
- [ ] Testar upload de arquivos maliciosos
- [ ] Testar URLs assinadas expiradas
- [ ] Testar SQL injection
- [ ] Testar XSS
- [ ] Testar CSRF

### Funcionalidades
- [ ] Testar criação de pedidos
- [ ] Testar upload de documentos
- [ ] Testar câmera em diferentes dispositivos
- [ ] Testar consentimento LGPD
- [ ] Testar audit log
- [ ] Testar permissões no frontend

---

## 📊 MÉTRICAS DE SUCESSO

- ✅ 100% das rotas protegidas com autenticação
- ✅ 100% das ações sensíveis com audit log
- ✅ Rate limiting em todas rotas
- ✅ Upload de documentos criptografados
- ✅ Consentimento LGPD implementado
- ✅ Zero vulnerabilidades críticas

---

## 🚀 DEPLOY

### Antes do Deploy
1. Rodar migrações do Prisma
2. Configurar variáveis de ambiente
3. Configurar Redis
4. Testar em staging
5. Backup do banco de dados

### Variáveis de Ambiente Novas
```env
# Rate Limiting
REDIS_HOST=localhost
REDIS_PORT=6379

# Encryption
ENCRYPTION_KEY=<gerar com: openssl rand -hex 32>

# Signed URLs
SECRET_KEY=<gerar com: openssl rand -hex 32>

# Upload
UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=10485760
```

---

## 💡 PRÓXIMOS PASSOS (Após Semana 2)

1. Integração com gateway de pagamento
2. WhatsApp Business API
3. Sistema de reservas
4. PWA (Service Worker)
5. Notificações Push

---

**PRONTO PARA COMEÇAR! 🚀**

