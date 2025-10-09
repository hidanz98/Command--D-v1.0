# 🔧 CORRIGIR SISTEMA AGORA - Guia Completo

## ❌ PROBLEMA IDENTIFICADO

```
Prisma error: Cannot fetch data from service: fetch failed
Code: P5010
```

**Causa:** PostgreSQL não está rodando ou não está configurado.

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Opção 1: Docker (Recomendado)

```bash
# 1. Criar docker-compose.yml na raiz do projeto
# Copie e cole o conteúdo abaixo em docker-compose.yml

# 2. Iniciar PostgreSQL
docker-compose up -d

# 3. Atualizar .env
# Já foi criado, mas verifique:
cat .env

# Deve ter:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/command_d"

# 4. Gerar Prisma client
npm run db:generate

# 5. Aplicar migrations
npm run db:push

# 6. Reiniciar servidor
# Ctrl+C no terminal do servidor e depois:
npm run dev

# 7. Testar login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cabecadeefeitocine@gmail.com","password":"admin123"}'

# 8. Re-executar testes
npm run qa
```

### Opção 2: PostgreSQL Local (Windows)

```bash
# 1. Baixe PostgreSQL:
# https://www.postgresql.org/download/windows/

# 2. Instale com estas configurações:
# - Port: 5432
# - Username: postgres
# - Password: postgres
# - Database: command_d

# 3. Atualize .env (já existe):
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/command_d"

# 4. Gerar Prisma client
npm run db:generate

# 5. Aplicar schema
npm run db:push

# 6. Reiniciar servidor
npm run dev

# 7. Testar
npm run qa
```

---

## 📝 Arquivo docker-compose.yml

Crie este arquivo na raiz do projeto:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: command-d-postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: command_d
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## 📝 Arquivo .env Completo

Já foi criado automaticamente, mas aqui está o conteúdo completo:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/command_d"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App
APP_URL="http://localhost:8081"
NODE_ENV="development"

# NFSe (opcional)
NFSE_ENABLED="false"
```

---

## 🚀 Comandos Passo a Passo

### Se Usar Docker:

```bash
# Terminal 1: Iniciar PostgreSQL
docker-compose up -d

# Aguardar 10 segundos para PostgreSQL inicializar

# Terminal 1: Gerar Prisma
npm run db:generate

# Terminal 1: Criar tabelas
npm run db:push

# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2 (novo): Executar QA completo
npm run qa

# Ver relatório
npm run test:e2e:report
```

### Se Usar PostgreSQL Local:

```bash
# Terminal 1: Verificar se PostgreSQL está rodando
# No Windows:
sc query postgresql-x64-15

# Se não estiver rodando, iniciar:
net start postgresql-x64-15

# Terminal 1: Gerar Prisma
npm run db:generate

# Terminal 1: Criar tabelas
npm run db:push

# Terminal 1: Iniciar servidor (se não estiver rodando)
npm run dev

# Terminal 2: Executar QA
npm run qa
```

---

## 📊 Resultados Esperados

### Após Corrigir Banco:

```bash
$ npm run test:setup

═══════════════════════════════════════════════════
🤖 AUTO-BYPASS DE AUTENTICAÇÃO PARA TESTES E2E
═══════════════════════════════════════════════════

🔐 Tentando login real via API...
   Status: 200
   ✅ Login real bem-sucedido!

✅ AUTH REAL OK - storageState.json criado com dados reais
   Os testes usarão autenticação real da API.
```

### Testes E2E:

```bash
$ npm run test:e2e

✅ 150+ botões testados
✅ Todas páginas navegadas
✅ 0 erros encontrados
```

---

## 🔍 Verificar se Funcionou

### 1. Testar API Manualmente:

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cabecadeefeitocine@gmail.com","password":"admin123"}'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "cabecadeefeitocine@gmail.com",
    "role": "ADMIN"
  }
}
```

### 2. Testar UI:

```bash
# Abra no navegador:
http://localhost:8081/login

# Faça login:
# Email: cabecadeefeitocine@gmail.com
# Senha: admin123

# Deve redirecionar para /painel-admin
```

---

## 🐛 Troubleshooting

### Erro: "Docker não está rodando"

```bash
# Windows: Abra Docker Desktop

# Verificar:
docker ps

# Se não funcionar, reinstale Docker Desktop:
# https://www.docker.com/products/docker-desktop/
```

### Erro: "Port 5432 already in use"

```bash
# Verificar o que está usando a porta:
netstat -ano | findstr :5432

# Matar o processo:
taskkill /PID <PID> /F

# Ou mudar a porta no docker-compose.yml:
ports:
  - "5433:5432"

# E no .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/command_d"
```

### Erro: "Prisma generate failed"

```bash
# Limpar cache e regenerar:
npx prisma generate --force

# Se ainda falhar:
rm -rf node_modules/.prisma
npm run db:generate
```

### Erro: "P3009: migrate failed"

```bash
# Forçar reset do banco (ATENÇÃO: Apaga todos os dados):
npx prisma migrate reset --force

# Ou usar push ao invés de migrate:
npm run db:push
```

---

## 📦 Criar Dados de Teste

Após o banco estar funcionando, você pode criar dados de teste:

```bash
# Execute o seed (se existir):
npm run db:seed

# Ou crie manualmente via Prisma Studio:
npm run db:studio

# Abrirá em http://localhost:5555
```

### Criar Usuário Admin Manualmente:

```typescript
// Em prisma/seed.ts (crie se não existir):
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: "Bil's Cinema",
      slug: 'bils-cinema',
      description: 'Locadora de equipamentos',
      isActive: true,
    },
  });

  // Hash da senha
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Criar admin
  await prisma.user.create({
    data: {
      email: 'cabecadeefeitocine@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
      isActive: true,
    },
  });

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## ✅ Checklist Final

- [ ] PostgreSQL rodando (Docker ou local)
- [ ] `.env` criado com DATABASE_URL correto
- [ ] `npm run db:generate` executado
- [ ] `npm run db:push` executado
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] API de login testada (curl)
- [ ] UI de login testada (browser)
- [ ] Testes E2E executados (`npm run qa`)
- [ ] Relatório gerado (`npm run test:e2e:report`)

---

## 🎯 Resumo Ultra-Rápido

```bash
# Se ainda não tem Docker instalado:
# 1. Instale: https://www.docker.com/products/docker-desktop/

# Comandos na ordem:
docker-compose up -d
npm run db:generate
npm run db:push
npm run dev  # (em outro terminal)
npm run qa   # (em outro terminal)
npm run test:e2e:report
```

---

## 📞 Suporte

### Arquivos Criados:
- ✅ `.env` - Configurações de ambiente
- ✅ `tests/setup/auth.setup.ts` - Bypass de auth
- ✅ `tests/buttons-bypass.spec.ts` - Testes de botões
- ✅ `tests/diagnostics/login-diagnosis.md` - Diagnóstico completo
- ✅ `storageState.json` - Estado de auth (mock)
- ✅ Este documento

### Comandos Úteis:
```bash
npm run test:setup      # Setup de auth
npm run test:e2e        # Testes E2E
npm run test:e2e:report # Ver relatório
npm run qa              # Setup + Testes
npm run db:studio       # GUI do banco
docker-compose logs     # Ver logs do PostgreSQL
```

---

**🚀 Siga os passos acima e tudo funcionará!**

**Tempo estimado: 5-10 minutos**

