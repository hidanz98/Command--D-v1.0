# 📝 INSTRUÇÕES: CONFIGURAR BANCO DE DADOS

## 🐛 **PROBLEMA ATUAL:**

```
❌ Authentication failed against database server at `localhost`
❌ The provided database credentials for `postgres` are not valid
```

**Causa:** Falta o arquivo `.env` com as configurações do banco de dados.

**Impacto:**
- ❌ Pedidos de clientes NÃO estão sendo salvos
- ❌ Cadastros NÃO estão sendo salvos
- ✅ Frontend funciona (páginas carregam)
- ❌ Backend NÃO consegue salvar/buscar dados

---

## 🔧 **SOLUÇÃO RÁPIDA (3 PASSOS):**

### **PASSO 1: Criar arquivo .env**

Clique duas vezes em:
```
🔧-CRIAR-ENV.bat
```

Ou crie manualmente o arquivo `.env` na pasta `Command--D-v1.0` com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/commandd?schema=public"
JWT_SECRET="desenvolvimento_chave_secreta_super_segura_123456"
NODE_ENV="development"
PORT=8080
```

---

### **PASSO 2: Instalar PostgreSQL**

#### **Opção A: PostgreSQL (Recomendado)**

1. **Baixar:** https://www.postgresql.org/download/windows/
2. **Instalar** (deixe usuário: `postgres`, senha: `postgres`)
3. **Abrir pgAdmin** e criar banco:
   ```sql
   CREATE DATABASE commandd;
   ```

#### **Opção B: Docker (Mais Fácil)**

```bash
docker run --name commandd-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=commandd -p 5432:5432 -d postgres
```

---

### **PASSO 3: Criar tabelas no banco**

```bash
cd Command--D-v1.0
npm run db:push
```

---

## 🎯 **APÓS CONFIGURAR:**

### **1. Reiniciar o servidor**
- Feche a janela do servidor (Ctrl+C)
- Execute novamente: `🚀-INICIAR-SERVIDOR.bat`

### **2. Adicionar dados de teste**
```bash
npm run db:seed
```

### **3. Testar novamente**
```bash
npm run test:e2e
```

---

## ✅ **COMO SABER SE FUNCIONOU:**

### **No terminal do servidor, NÃO deve aparecer:**
```
❌ Authentication failed
❌ database credentials not valid
```

### **Deve aparecer:**
```
✅ Database connected
✅ Server ready at http://localhost:8080
```

### **No navegador:**
- Acesse: `http://localhost:8080/equipamentos`
- **Antes:** Erro 500 ou sem produtos
- **Depois:** Lista de produtos aparece

---

## 📊 **FLUXO COMPLETO:**

### **1. Cliente faz pedido:**
```
Cliente → /equipamentos → Adiciona ao carrinho → /carrinho → Finaliza
                                                                ↓
                                                      Salvo no banco de dados
```

### **2. Funcionário vê pedido:**
```
Funcionário → /pedidos → Lista TODOS os pedidos
                            ↓
                     Busca no banco de dados
                            ↓
                   Exibe pedidos do cliente
```

### **3. Dono vê no painel:**
```
Dono → /painel-admin → Dashboard → Total de pedidos
                          ↓
                   Conta no banco de dados
```

### **4. Aprovação de cadastros:**
```
Cliente → /cadastro → Envia dados
            ↓
    Salvo com status PENDING
            ↓
Funcionário → /aprovacoes → Lista cadastros pendentes
                               ↓
                        Busca no banco WHERE status = PENDING
                               ↓
                          Aprova/Rejeita
                               ↓
                        Atualiza no banco
```

---

## 🧪 **TESTAR MANUALMENTE:**

### **1. Fazer um cadastro:**
```
http://localhost:8080/cadastro
```
- Preencha os dados
- Clique em "Enviar"
- **Deve salvar no banco**

### **2. Ver no painel de aprovações:**
```
http://localhost:8080/aprovacoes
```
- **Deve aparecer** o cadastro que você fez
- Botões "Aprovar" e "Rejeitar" devem funcionar

### **3. Fazer um pedido:**
```
http://localhost:8080/equipamentos
→ Adicionar produtos ao carrinho
→ http://localhost:8080/carrinho
→ Finalizar pedido
```
- **Deve salvar no banco**

### **4. Ver na gestão de pedidos:**
```
http://localhost:8080/pedidos
```
- **Deve aparecer** o pedido que você fez
- Status, cliente, valor devem aparecer

---

## 🔍 **VERIFICAR SE O BANCO ESTÁ FUNCIONANDO:**

### **Método 1: Via código**
```bash
cd Command--D-v1.0
node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('✅ Banco conectado!')).catch(e => console.log('❌ Erro:', e.message))"
```

### **Método 2: Conectar direto no PostgreSQL**
```bash
psql -U postgres -d commandd -c "SELECT COUNT(*) FROM \"Product\";"
```

### **Método 3: Abrir pgAdmin**
- Ver se o banco `commandd` existe
- Ver se tem tabelas (Product, Order, Client, etc)

---

## 🆘 **SE AINDA NÃO FUNCIONAR:**

### **Erro: "database does not exist"**
```bash
psql -U postgres
CREATE DATABASE commandd;
\q
npm run db:push
```

### **Erro: "password authentication failed"**
```
Edite o .env e ajuste:
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/commandd?schema=public"
```

### **Erro: "port 5432 already in use"**
```
Já tem PostgreSQL rodando.
Verifique a senha e tente novamente.
```

### **PostgreSQL não instalado**
```
Baixe em: https://www.postgresql.org/download/
Ou use Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres
```

---

## 🎉 **DEPOIS QUE FUNCIONAR:**

✅ **Pedidos de clientes serão salvos** no banco  
✅ **Funcionários verão os pedidos** em `/pedidos`  
✅ **Cadastros pendentes aparecerão** em `/aprovacoes`  
✅ **Dashboard mostrará** totais corretos  
✅ **Sistema 100% funcional!**  

---

## 📚 **COMANDOS ÚTEIS:**

```bash
# Criar tabelas
npm run db:push

# Ver o schema do banco
npm run db:studio

# Adicionar dados de teste
npm run db:seed

# Resetar banco (CUIDADO!)
npm run db:reset

# Ver logs do banco
npm run dev
```

---

**Arquivo criado em:** 16/10/2025  
**Status:** Aguardando configuração do banco de dados  
**Próximo passo:** Clique em `🔧-CRIAR-ENV.bat`

