# 🚀 SETUP COMPLETO - NOVA INSTÂNCIA AWS

## ✅ PRÉ-REQUISITOS

- ✅ Nova instância EC2 criada (Ubuntu 22.04)
- ✅ IP Público: `54.232.38.166`
- ✅ Arquivo `.pem` (chave SSH)
- ✅ Security Group com porta 8080 liberada

---

## 🎯 PASSO 1: CONECTAR NO SERVIDOR (2 min)

### No PowerShell do Windows:

```powershell
# Substitua pelo caminho da sua chave .pem
ssh -i "C:\caminho\para\sua-chave.pem" ubuntu@54.232.38.166
```

**Se der erro de permissão:**
1. Clique com botão direito no arquivo `.pem`
2. Propriedades > Segurança > Avançado
3. Desabilitar herança
4. Remover todos os usuários exceto você

---

## 🎯 PASSO 2: EXECUTAR SCRIPT AUTOMÁTICO (5-10 min)

### Depois de conectado no servidor, execute:

```bash
# Baixar o script de setup
wget https://raw.githubusercontent.com/hidanz98/Command--D-v1.0/main/scripts/setup-aws-new-instance.sh

# Dar permissão de execução
chmod +x setup-aws-new-instance.sh

# Executar o script
./setup-aws-new-instance.sh
```

**O script vai:**
- ✅ Atualizar sistema
- ✅ Instalar Node.js 20
- ✅ Instalar PM2
- ✅ Instalar PostgreSQL
- ✅ Criar banco de dados
- ✅ Clonar repositório
- ✅ Configurar .env automaticamente
- ✅ Build da aplicação
- ✅ Iniciar com PM2

**Aguarde ~5-10 minutos** ⏳

---

## 🎯 ALTERNATIVA: COMANDOS MANUAIS (Se o script falhar)

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verificar versão
```

### 3. Instalar PM2
```bash
sudo npm install -g pm2
pm2 -v  # Verificar versão
```

### 4. Instalar PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 5. Criar Banco de Dados
```bash
sudo -u postgres psql << EOF
CREATE DATABASE command_d;
CREATE USER command_admin WITH PASSWORD 'CommandD2024!Seguro';
GRANT ALL PRIVILEGES ON DATABASE command_d TO command_admin;
ALTER DATABASE command_d OWNER TO command_admin;
\q
EOF
```

### 6. Clonar Repositório
```bash
cd /home/ubuntu
git clone https://github.com/hidanz98/Command--D-v1.0.git sistema-command-d
cd sistema-command-d
```

### 7. Criar Arquivo .env
```bash
nano .env
```

**Cole este conteúdo:**
```env
NODE_ENV=production
PORT=8080

DATABASE_URL="postgresql://command_admin:CommandD2024!Seguro@localhost:5432/command_d?schema=public"

JWT_SECRET="sua_chave_secreta_super_forte_aqui_12345678"

APP_URL="http://54.232.38.166:8080"

ENABLE_HEARTBEAT=false
ENABLE_PARTNERSHIPS=false
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

### 8. Instalar e Build
```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

### 9. Iniciar com PM2
```bash
pm2 start npm --name "command-d" -- start
pm2 save
pm2 startup
# Copie e execute o comando que aparecer
```

---

## 🔍 PASSO 3: VERIFICAR SE ESTÁ FUNCIONANDO (2 min)

### No servidor (SSH):

```bash
# Ver status do PM2
pm2 status

# Ver logs
pm2 logs command-d

# Testar localmente
curl http://localhost:8080
```

### No navegador:

```
http://54.232.38.166:8080
```

**Deve aparecer a tela do sistema!** ✅

---

## 🛠️ COMANDOS ÚTEIS

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs command-d

# Ver logs recentes
pm2 logs command-d --lines 100

# Reiniciar aplicação
pm2 restart command-d

# Parar aplicação
pm2 stop command-d

# Iniciar aplicação
pm2 start command-d

# Ver métricas
pm2 monit

# Atualizar código do GitHub
cd /home/ubuntu/sistema-command-d
git pull origin main
npm install
npm run build
pm2 restart command-d
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Porta 8080 não responde

**Solução 1: Verificar Security Group AWS**
1. AWS Console > EC2 > Security Groups
2. Encontrar security group da instância
3. Inbound Rules > Edit
4. Adicionar regra:
   - Type: Custom TCP
   - Port: 8080
   - Source: 0.0.0.0/0
   - Description: Node.js App

**Solução 2: Verificar se aplicação está rodando**
```bash
pm2 status
pm2 logs command-d
```

### Problema: Erro de banco de dados

**Solução:**
```bash
cd /home/ubuntu/sistema-command-d
npx prisma generate
npx prisma db push
pm2 restart command-d
```

### Problema: Erro ao clonar repositório

**Solução:**
```bash
cd /home/ubuntu
rm -rf sistema-command-d
git clone https://github.com/hidanz98/Command--D-v1.0.git sistema-command-d
```

---

## 📋 CHECKLIST FINAL

- [ ] Servidor conectado via SSH
- [ ] Node.js 20 instalado
- [ ] PM2 instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `command_d` criado
- [ ] Repositório clonado
- [ ] Arquivo `.env` configurado
- [ ] Build concluído
- [ ] PM2 rodando aplicação
- [ ] Porta 8080 liberada no Security Group
- [ ] Sistema acessível em http://54.232.38.166:8080

---

## 🎉 SUCESSO!

Se tudo funcionou, você deve conseguir acessar:

```
http://54.232.38.166:8080
```

E ver a tela inicial do sistema Command-D! 🚀

---

## 📞 PRÓXIMOS PASSOS

1. **Testar funcionalidades** - Login, equipamentos, etc
2. **Configurar domínio** (opcional) - Para usar um domínio personalizado
3. **Instalar SSL** (opcional) - Para usar HTTPS
4. **Configurar backup** - Backup automático do banco de dados

---

## 💡 DICA: DEPLOY AUTOMÁTICO

Depois que estiver tudo funcionando, o GitHub Actions vai fazer deploy automático quando você fizer push!

Só certifique-se que os secrets do GitHub estão corretos:
- `EC2_HOST` = `54.232.38.166`
- `EC2_SSH_KEY` = conteúdo da sua chave `.pem`
- `EC2_USER` = `ubuntu`

