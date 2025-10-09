# 🏢 ARQUITETURA DISTRIBUÍDA - MÚLTIPLAS UNIDADES

## 🎯 CONCEITO

Ao invés de multi-tenant, teremos:
- **1 servidor por locadora/unidade** (leveza e performance)
- **Painel Admin centralizado** que conecta todas unidades
- **API federada** para comunicação entre servidores
- **Dados isolados** por servidor (segurança)

---

## 🏗️ ARQUITETURA PROPOSTA

```
┌─────────────────────────────────────────────────────────┐
│          PAINEL ADMIN MASTER (Servidor Central)         │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Dashboard Consolidado                           │   │
│  │  - Visão geral de todas unidades                │   │
│  │  - Métricas consolidadas                        │   │
│  │  - Relatórios multi-unidade                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Gerenciamento de Conexões                       │   │
│  │  - Lista de unidades conectadas                  │   │
│  │  - Status (online/offline)                       │   │
│  │  - Credenciais de acesso                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ API REST / WebSocket
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────────┐            ┌───────────────────┐
│   UNIDADE 1       │            │   UNIDADE 2       │
│   (Servidor BH)   │            │   (Servidor SP)   │
│                   │            │                   │
│  ┌─────────────┐  │            │  ┌─────────────┐  │
│  │ PostgreSQL  │  │            │  │ PostgreSQL  │  │
│  │ (Local)     │  │            │  │ (Local)     │  │
│  └─────────────┘  │            │  └─────────────┘  │
│                   │            │                   │
│  ┌─────────────┐  │            │  ┌─────────────┐  │
│  │ Express API │  │            │  │ Express API │  │
│  │ + React App │  │            │  │ + React App │  │
│  └─────────────┘  │            │  └─────────────┘  │
│                   │            │                   │
│  Funcionários: 5  │            │  Funcionários: 3  │
│  Produtos: 250    │            │  Produtos: 180    │
│  Pedidos: 45/mês  │            │  Pedidos: 30/mês  │
└───────────────────┘            └───────────────────┘
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (Multi-tenant)
```typescript
// Todos dados no mesmo banco
┌─────────────────────────────┐
│      PostgreSQL Central     │
├─────────────────────────────┤
│ tenant_id: bh               │
│   - 5.000 produtos          │
│   - 1.000 clientes          │
│   - 10.000 pedidos          │
├─────────────────────────────┤
│ tenant_id: sp               │
│   - 5.000 produtos          │
│   - 1.000 clientes          │
│   - 10.000 pedidos          │
└─────────────────────────────┘
❌ Problema: DB fica gigante
❌ Queries lentas (muitos WHERE tenant_id)
❌ Backup demorado
❌ Falha afeta todos
```

### ✅ DEPOIS (Distribuído)
```typescript
// Cada unidade tem seu próprio banco
┌──────────────┐       ┌──────────────┐
│   DB-BH      │       │   DB-SP      │
│  250 produtos│       │  180 produtos│
│  150 clientes│       │  100 clientes│
│  500 pedidos │       │  300 pedidos │
└──────────────┘       └──────────────┘

✅ DB leve e rápido
✅ Queries rápidas
✅ Backup rápido
✅ Falha isolada
✅ Escalabilidade infinita
```

---

## 🔧 IMPLEMENTAÇÃO

### 1. REMOVER MULTI-TENANT DO SCHEMA

```prisma
// prisma/schema.prisma - SIMPLIFICADO

// ❌ REMOVER: Tenant, TenantSettings
// ❌ REMOVER: Todos os campos tenantId
// ✅ MANTER: Estrutura normal sem tenant

model StoreConfig {
  id          String   @id @default("default")
  
  // Informações da Loja
  name        String
  cnpj        String
  phone       String
  email       String
  website     String?
  logo        String?
  
  // Endereço
  address     Json
  
  // Cores e Branding
  primaryColor    String   @default("#fbbf24")
  secondaryColor  String   @default("#1f2937")
  
  // API Credentials para Federação
  apiKey      String   @unique
  apiSecret   String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("store_config")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String
  role        UserRole
  
  // ❌ REMOVER tenantId
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("users")
}

enum UserRole {
  ADMIN
  EMPLOYEE
  CLIENT
  // ❌ REMOVER MASTER_ADMIN e TENANT_ADMIN
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  price       Float
  
  // ❌ REMOVER tenantId
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("products")
}

// Mesma lógica para Order, Client, etc.
// Todos SEM tenantId
```

### 2. CRIAR API DE FEDERAÇÃO

```typescript
// server/services/federationService.ts

interface RemoteStore {
  id: string;
  name: string;
  url: string; // Ex: https://bh.minhalocadora.com
  apiKey: string;
  apiSecret: string;
  status: 'online' | 'offline';
  lastSync: Date;
}

export class FederationService {
  private stores: Map<string, RemoteStore> = new Map();

  // Adicionar loja remota
  addStore(store: RemoteStore) {
    this.stores.set(store.id, store);
  }

  // Fazer request para loja remota
  async request(storeId: string, endpoint: string, options: RequestInit = {}) {
    const store = this.stores.get(storeId);
    if (!store) {
      throw new Error(`Store ${storeId} not found`);
    }

    // Adicionar autenticação
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.generateToken(store)}`,
      'X-API-Key': store.apiKey,
    };

    const response = await fetch(`${store.url}/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Buscar dados de todas lojas
  async fetchFromAllStores<T>(endpoint: string): Promise<{
    storeId: string;
    storeName: string;
    data: T;
    error?: string;
  }[]> {
    const promises = Array.from(this.stores.entries()).map(
      async ([storeId, store]) => {
        try {
          const data = await this.request(storeId, endpoint);
          return {
            storeId,
            storeName: store.name,
            data,
          };
        } catch (error) {
          return {
            storeId,
            storeName: store.name,
            data: null as T,
            error: (error as Error).message,
          };
        }
      }
    );

    return Promise.all(promises);
  }

  // Verificar status de todas lojas
  async checkAllStores() {
    const results = await this.fetchFromAllStores<{ status: string }>('/health');
    
    results.forEach(result => {
      const store = this.stores.get(result.storeId);
      if (store) {
        store.status = result.error ? 'offline' : 'online';
        store.lastSync = new Date();
      }
    });

    return results;
  }

  private generateToken(store: RemoteStore): string {
    // Gerar JWT para autenticação entre servidores
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      {
        storeId: store.id,
        type: 'federation',
      },
      store.apiSecret,
      { expiresIn: '5m' }
    );
  }
}
```

### 3. PAINEL ADMIN MASTER

```typescript
// client/components/MasterDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Package, 
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface StoreMetrics {
  storeId: string;
  storeName: string;
  status: 'online' | 'offline';
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalClients: number;
    activeEmployees: number;
  };
  lastUpdate: Date;
}

export const MasterDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Buscar métricas de todas lojas
  const fetchAllStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/federation/metrics');
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStores();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAllStores, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcular totais consolidados
  const consolidated = stores.reduce(
    (acc, store) => ({
      totalOrders: acc.totalOrders + store.metrics.totalOrders,
      totalRevenue: acc.totalRevenue + store.metrics.totalRevenue,
      totalProducts: acc.totalProducts + store.metrics.totalProducts,
      totalClients: acc.totalClients + store.metrics.totalClients,
      activeEmployees: acc.activeEmployees + store.metrics.activeEmployees,
    }),
    {
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalClients: 0,
      activeEmployees: 0,
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Painel Administrativo Master
          </h1>
          <p className="text-gray-400">
            Visão consolidada de todas as unidades
          </p>
        </div>
        <Button
          onClick={fetchAllStores}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas Consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Pedidos Totais</p>
                <p className="text-3xl font-bold text-white">
                  {consolidated.totalOrders}
                </p>
              </div>
              <Package className="w-10 h-10 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Receita Total</p>
                <p className="text-3xl font-bold text-white">
                  R$ {consolidated.totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Produtos</p>
                <p className="text-3xl font-bold text-white">
                  {consolidated.totalProducts}
                </p>
              </div>
              <Package className="w-10 h-10 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Clientes</p>
                <p className="text-3xl font-bold text-white">
                  {consolidated.totalClients}
                </p>
              </div>
              <Users className="w-10 h-10 text-orange-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Funcionários</p>
                <p className="text-3xl font-bold text-white">
                  {consolidated.activeEmployees}
                </p>
              </div>
              <Users className="w-10 h-10 text-pink-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Lojas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stores.map((store) => (
          <Card
            key={store.storeId}
            className={`cursor-pointer transition-all ${
              selectedStore === store.storeId
                ? 'ring-2 ring-blue-500'
                : 'hover:ring-1 hover:ring-gray-400'
            }`}
            onClick={() => setSelectedStore(store.storeId)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-xl">{store.storeName}</CardTitle>
                    <p className="text-sm text-gray-400">
                      Última atualização:{' '}
                      {new Date(store.lastUpdate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {store.status === 'online' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-500 text-sm font-medium">
                        Online
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-500 text-sm font-medium">
                        Offline
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Pedidos</p>
                  <p className="text-2xl font-bold text-white">
                    {store.metrics.totalOrders}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Receita</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {store.metrics.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Produtos</p>
                  <p className="text-2xl font-bold text-white">
                    {store.metrics.totalProducts}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Clientes</p>
                  <p className="text-2xl font-bold text-white">
                    {store.metrics.totalClients}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/admin/${store.storeId}`, '_blank');
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Acessar Painel da Unidade
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Adicionar Nova Loja */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            <Building2 className="w-4 h-4 mr-2" />
            Conectar Nova Loja
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 4. GERENCIAMENTO DE CONEXÕES

```typescript
// client/components/StoreConnectionManager.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Eye, EyeOff, Link } from 'lucide-react';

interface StoreConnection {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiSecret: string;
  status: 'connected' | 'disconnected';
}

export const StoreConnectionManager: React.FC = () => {
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [showSecret, setShowSecret] = useState<{ [key: string]: boolean }>({});
  const [isAdding, setIsAdding] = useState(false);
  
  const [newConnection, setNewConnection] = useState({
    name: '',
    url: '',
    apiKey: '',
    apiSecret: '',
  });

  const handleAddConnection = async () => {
    try {
      const response = await fetch('/api/federation/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConnection),
      });

      if (response.ok) {
        const store = await response.json();
        setConnections([...connections, store]);
        setNewConnection({ name: '', url: '', apiKey: '', apiSecret: '' });
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error adding connection:', error);
    }
  };

  const handleTestConnection = async (storeId: string) => {
    try {
      const response = await fetch(`/api/federation/stores/${storeId}/test`);
      const result = await response.json();
      alert(result.status === 'success' ? 'Conexão OK!' : 'Falha na conexão');
    } catch (error) {
      alert('Erro ao testar conexão');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Gerenciar Conexões de Unidades
        </h2>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Unidade
        </Button>
      </div>

      {/* Formulário para Adicionar */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Unidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome da Unidade</Label>
              <Input
                value={newConnection.name}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, name: e.target.value })
                }
                placeholder="Ex: Loja BH - Centro"
              />
            </div>

            <div>
              <Label>URL do Servidor</Label>
              <Input
                value={newConnection.url}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, url: e.target.value })
                }
                placeholder="https://bh.minhalocadora.com"
              />
            </div>

            <div>
              <Label>API Key</Label>
              <Input
                value={newConnection.apiKey}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, apiKey: e.target.value })
                }
                placeholder="Chave de acesso da API"
              />
            </div>

            <div>
              <Label>API Secret</Label>
              <Input
                type="password"
                value={newConnection.apiSecret}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, apiSecret: e.target.value })
                }
                placeholder="Senha secreta"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddConnection} className="flex-1">
                Conectar
              </Button>
              <Button
                onClick={() => setIsAdding(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Conexões */}
      <div className="grid grid-cols-1 gap-4">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {connection.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">
                      <span className="font-medium">URL:</span> {connection.url}
                    </p>
                    <p className="text-gray-400">
                      <span className="font-medium">API Key:</span>{' '}
                      {connection.apiKey}
                    </p>
                    <p className="text-gray-400 flex items-center gap-2">
                      <span className="font-medium">API Secret:</span>
                      <span className="font-mono">
                        {showSecret[connection.id]
                          ? connection.apiSecret
                          : '••••••••••••'}
                      </span>
                      <button
                        onClick={() =>
                          setShowSecret({
                            ...showSecret,
                            [connection.id]: !showSecret[connection.id],
                          })
                        }
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {showSecret[connection.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleTestConnection(connection.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Testar
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('Desconectar esta unidade?')) {
                        // Implementar remoção
                      }
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
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

## 🔐 SEGURANÇA NA FEDERAÇÃO

### 1. Autenticação entre Servidores

```typescript
// server/middleware/federationAuth.ts

import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';

export const federationAuth: RequestHandler = (req, res, next) => {
  try {
    // Verificar API Key no header
    const apiKey = req.get('X-API-Key');
    if (!apiKey) {
      return res.status(401).json({ error: 'API Key missing' });
    }

    // Verificar token JWT
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar se é uma requisição de federação válida
    const decoded = jwt.verify(token, process.env.FEDERATION_SECRET!) as any;
    
    if (decoded.type !== 'federation') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    // Verificar se a loja está autorizada
    // (consultar no banco de dados)
    
    req.federationStore = {
      id: decoded.storeId,
      name: decoded.storeName,
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid federation token' });
  }
};
```

---

## 📦 ESTRUTURA DE PASTAS

```
project/
├── server-master/           # Servidor Master (Admin Central)
│   ├── api/
│   │   └── federation/      # Endpoints de federação
│   ├── services/
│   │   └── federationService.ts
│   └── database/
│       └── connections.db   # Lista de lojas conectadas
│
├── server-store/            # Servidor de Loja (Template)
│   ├── api/                 # API normal da loja
│   ├── database/
│   │   └── store.db         # Dados da loja
│   └── config/
│       └── federation.json  # Config para federação
│
└── client/
    ├── pages/
    │   ├── PainelAdmin.tsx      # Painel local da loja
    │   └── MasterDashboard.tsx  # Painel Master
    └── components/
        ├── StoreConnectionManager.tsx
        └── MasterDashboard.tsx
```

---

## 🚀 MIGRAÇÃO DO CÓDIGO ATUAL

### PASSO 1: Remover Multi-tenant
```bash
# 1. Criar nova branch
git checkout -b feature/remove-multi-tenant

# 2. Editar schema.prisma
# - Remover model Tenant
# - Remover model TenantSettings
# - Remover todos campos tenantId
# - Adicionar model StoreConfig

# 3. Criar migração
npx prisma migrate dev --name remove_multi_tenant

# 4. Atualizar código
# - Remover imports de TenantContext
# - Remover verificações de tenantId
# - Simplificar queries
```

### PASSO 2: Implementar Federação
```bash
# 1. Criar serviço de federação
# - server/services/federationService.ts

# 2. Criar endpoints de federação
# - server/routes/federation.ts

# 3. Criar componentes Master
# - client/components/MasterDashboard.tsx
# - client/components/StoreConnectionManager.tsx
```

---

## 💰 VANTAGENS FINANCEIRAS

### Multi-tenant (Antes)
- **Servidor:** R$ 2.000/mês (grande)
- **Banco de Dados:** R$ 800/mês (grande)
- **Backup:** R$ 200/mês
- **TOTAL:** R$ 3.000/mês para 2 lojas

### Distribuído (Depois)
- **Servidor por loja:** R$ 300/mês (pequeno) × 2 = R$ 600
- **Banco por loja:** R$ 150/mês × 2 = R$ 300
- **Servidor Master:** R$ 200/mês (tiny)
- **TOTAL:** R$ 1.100/mês para 2 lojas

**ECONOMIA: R$ 1.900/mês (63%!)**

---

## 🎯 PRÓXIMOS PASSOS

1. **Confirmar arquitetura** ✅
2. **Remover multi-tenant do schema**
3. **Implementar FederationService**
4. **Criar MasterDashboard**
5. **Testar com 2 lojas**

**Posso começar agora?** 🚀

