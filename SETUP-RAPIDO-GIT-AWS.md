# 🚀 SETUP RÁPIDO: GIT + AWS (30 minutos)

## ✅ CHECKLIST COMPLETA

Siga essa ordem exata:

---

## PARTE 1: GIT (10 minutos)

### ✅ PASSO 1: Revogar token exposto
1. Abra: https://github.com/settings/tokens
2. Encontre: `ghp_yeq...`
3. Clique: **Delete**

### ✅ PASSO 2: Configurar SSH
```powershell
# 1. Gerar chave (pressione Enter 3x)
ssh-keygen -t ed25519 -C "seu-email@gmail.com"

# 2. Copiar chave pública
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard

# 3. Adicionar no GitHub
# Vá em: https://github.com/settings/keys
# Clique: "New SSH key"
# Título: "Meu PC"
# Cole a chave
# Salve
```

### ✅ PASSO 3: Configurar repositório
```bash
# Ver qual é seu usuário GitHub
git config user.name

# Mudar remote para SSH
git remote set-url origin git@github.com:SEU_USUARIO/Sistema-Command-D.git

# Testar conexão
ssh -T git@github.com
# Deve aparecer: "Hi SEU_USUARIO! You've successfully..."

# Fazer push
git push origin main
```

✅ **GIT PRONTO!**

---

## PARTE 2: AWS EC2 (10 minutos)

### ✅ PASSO 1: Criar EC2 (se não tiver)

1. **AWS Console** → **EC2** → **Launch Instance**

2. **Configurações:**
```
Nome: command-d-server
AMI: Ubuntu Server 22.04 LTS
Tipo: t3.medium (2 vCPU, 4GB RAM)
Key pair: Criar nova "command-d-key" (baixar .pem)
Storage: 30 GB gp3

Network Settings:
  ✅ Allow SSH (22) from My IP
  ✅ Allow HTTP (80) from Anywhere
  ✅ Allow HTTPS (443) from Anywhere

Launch Instance!
```

3. **Aguardar 2 minutos** até Status = Running

4. **Anotar:**
```
IP Público: _______________ (ex: 54.123.45.67)
Key Pair: command-d-key.pem (salvar em lugar seguro)
```

### ✅ PASSO 2: Conectar no servidor

```powershell
# Ir para pasta da chave
cd Downloads

# Conectar (substitua o IP)
ssh -i command-d-key.pem ubuntu@SEU_IP_AQUI
```

Se pedir confirmação, digite: `yes`

### ✅ PASSO 3: Instalar tudo no servidor

```bash
# Copiar e colar esse script completo:
wget https://raw.githubusercontent.com/SEU_USUARIO/Sistema-Command-D/main/scripts/setup-aws-server.sh
bash setup-aws-server.sh
```

O script vai perguntar:
- **Senha do banco:** Crie uma senha forte
- **Domínio:** Se tiver domínio, digite. Senão, deixe em branco por enquanto

**Aguardar ~5 minutos** para instalar tudo!

✅ **SERVIDOR PRONTO!**

---

## PARTE 3: PRIMEIRO DEPLOY (5 minutos)

### ✅ Ainda conectado no servidor EC2:

```bash
# 1. Ir para pasta da aplicação
cd /home/ubuntu/app

# 2. Clonar repositório
git clone https://github.com/SEU_USUARIO/Sistema-Command-D.git .

# 3. Instalar dependências
npm install

# 4. Criar .env
nano .env
```

Cole isso (ajuste a senha do banco):
```env
DATABASE_URL="postgresql://command_d_user:SUA_SENHA@localhost:5432/command_d_db"
JWT_SECRET="$(openssl rand -hex 32)"
NODE_ENV="production"
PORT=8080
```

Salvar: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# 5. Build
npm run build

# 6. Rodar migrações
npx prisma migrate deploy

# 7. Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save

# 8. Ver logs
pm2 logs command-d
```

### ✅ Testar no navegador:

```
http://SEU_IP_AQUI:8080
```

Se aparecer o sistema, **FUNCIONOU!** 🎉

✅ **PRIMEIRO DEPLOY PRONTO!**

---

## PARTE 4: GITHUB ACTIONS (5 minutos)

Agora configurar deploy automático!

### ✅ PASSO 1: Criar IAM User na AWS

1. **AWS Console** → **IAM** → **Users** → **Create user**

```
Username: github-actions-command-d
Permissions: Attach policies directly
  ✅ AmazonEC2FullAccess
Next → Create user
```

2. **Criar Access Key:**
```
Click no usuário criado
→ Security credentials
→ Create access key
→ Application running outside AWS
→ Create access key
```

3. **ANOTAR (aparece só 1 vez!):**
```
Access Key ID: AKIA________________
Secret Access Key: ____________________
```

### ✅ PASSO 2: Adicionar Secrets no GitHub

1. Vá em seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** (para cada um):

| Nome | Valor | Onde pegar |
|------|-------|------------|
| `AWS_ACCESS_KEY_ID` | AKIA... | IAM que você criou |
| `AWS_SECRET_ACCESS_KEY` | wJal... | IAM que você criou |
| `EC2_HOST` | 54.123.45.67 | IP do seu EC2 |
| `EC2_USER` | ubuntu | Fixo |
| `SSH_PRIVATE_KEY` | Conteúdo do .pem | Abrir command-d-key.pem no Notepad |

**IMPORTANTE para SSH_PRIVATE_KEY:**
```
Abra o arquivo .pem no Notepad
Copie TUDO (inclusive -----BEGIN e -----END)
Cole no GitHub Secret
```

✅ **SECRETS CONFIGURADOS!**

---

## PARTE 5: TESTAR DEPLOY AUTOMÁTICO

### ✅ Fazer uma mudança e push:

```bash
# No seu computador (PowerShell)
cd "C:\Users\fnune\OneDrive\Documentos\GitHub\Locadora-multi-tenant--main\Sistema-Command-D"

# Fazer uma mudança pequena
echo "# Deploy Automático OK" >> README.md

# Commitar
git add .
git commit -m "test: validar deploy automático"

# Push (vai disparar deploy)
git push origin main
```

### ✅ Acompanhar deploy:

1. Vá no GitHub → Seu repositório
2. Clique na aba **Actions**
3. Vai aparecer o workflow rodando
4. Clique nele para ver o progresso em tempo real

**Aguardar ~3-5 minutos**

Se tudo ficar verde ✅, **deploy automático funcionou!**

---

## 🎯 RESUMO: O QUE VOCÊ TEM AGORA

### ✅ GIT configurado com SSH
- Push sem precisar de senha
- Seguro

### ✅ Servidor AWS rodando
- Ubuntu 22.04
- Node.js + PostgreSQL
- nginx + PM2
- Sistema funcionando

### ✅ Deploy automático
- Qualquer push → Deploy automático
- GitHub Actions configurado
- Sem trabalho manual

---

## 🔄 FLUXO DE TRABALHO DAQUI PRA FRENTE

```
1. Fazer alteração no código
   ↓
2. git add .
   ↓
3. git commit -m "feat: nova funcionalidade"
   ↓
4. git push origin main
   ↓
5. GitHub Actions faz deploy automático
   ↓
6. Em 3-5 minutos está no ar! ✅
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Permission denied (publickey)" no Git
```bash
# Adicionar chave ao agent
eval $(ssh-agent)
ssh-add ~/.ssh/id_ed25519
```

### Erro: "Connection refused" ao acessar IP
```bash
# No servidor EC2, verificar se está rodando:
pm2 status
pm2 logs command-d
```

### Erro no GitHub Actions
```
# Ver logs detalhados:
GitHub → Actions → Click no workflow que falhou → Ver logs

# Verificar se todos Secrets estão configurados
```

### Servidor EC2 não responde
```bash
# Verificar Security Group na AWS:
EC2 → Instances → Select → Security → 
Verificar se tem:
  - SSH (22) from My IP
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0
```

---

## 📞 COMANDOS ÚTEIS

### Ver status da aplicação (no servidor)
```bash
ssh -i command-d-key.pem ubuntu@SEU_IP
pm2 status
pm2 logs command-d --lines 50
```

### Reiniciar aplicação (no servidor)
```bash
pm2 restart command-d
```

### Ver uso de recursos (no servidor)
```bash
htop  # Ctrl+C para sair
df -h  # Espaço em disco
free -h  # Memória
```

### Backup manual do banco (no servidor)
```bash
pg_dump -U command_d_user command_d_db > backup.sql
```

---

## ✅ CHECKLIST FINAL

Antes de dizer que está pronto:

- [ ] Git com SSH funcionando
- [ ] EC2 criado e rodando
- [ ] Servidor configurado (script rodou)
- [ ] Primeiro deploy manual OK
- [ ] Sistema acessível no navegador
- [ ] IAM user criado
- [ ] GitHub Secrets configurados
- [ ] GitHub Actions rodando
- [ ] Deploy automático testado e funcionando

---

## 🎉 PRONTO!

Agora você tem:
- ✅ Sistema em produção na AWS
- ✅ Deploy automático a cada push
- ✅ Backup diário automático
- ✅ Monitoramento com PM2
- ✅ SSL pronto para configurar

**QUER COMEÇAR? QUAL PASSO VOCÊ ESTÁ?**

1. Configurar Git? (10 min)
2. Criar EC2? (10 min)
3. Deploy manual? (5 min)
4. GitHub Actions? (5 min)
5. Testar tudo? (5 min)

**Me diga onde está e vamos fazer juntos!** 🚀

