# 🚀 COMO ATUALIZAR O SISTEMA NA AWS

## ✅ SEU SISTEMA ESTÁ NO AR!

**URL:** http://54.232.27.34:8080

---

## 📋 FORMA AUTOMÁTICA (RECOMENDADA)

### Via Git Push (Mais fácil!)

Sempre que você fizer alterações no código localmente e quiser atualizar o servidor na AWS:

```bash
# 1. No seu computador, faça as alterações no código
# 2. Adicione as alterações
git add .

# 3. Commit
git commit -m "Descrição da atualização"

# 4. Push para GitHub
git push origin main
```

**Isso vai fazer:**
1. GitHub Actions vai detectar o push automaticamente
2. Conectar no servidor AWS via SSH
3. Fazer `git pull` do código atualizado
4. Instalar dependências novas
5. Reiniciar o PM2
6. **Sistema atualizado em ~2 minutos!**

---

## 🔧 FORMA MANUAL (Caso precise atualizar diretamente)

### Via SSH no servidor:

```bash
# Conectar no servidor
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34

# Ir para o diretório
cd /home/ubuntu/command-d

# Puxar atualizações
git pull origin main

# Instalar novas dependências (se houver)
npm install

# Reiniciar PM2
pm2 restart command-d

# Ver logs
pm2 logs command-d
```

---

## 📊 COMANDOS ÚTEIS

### Ver status do servidor
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "pm2 status"
```

### Ver logs em tempo real
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "pm2 logs command-d"
```

### Reiniciar aplicação
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "pm2 restart command-d"
```

### Parar aplicação
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "pm2 stop command-d"
```

### Iniciar aplicação
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "pm2 start command-d"
```

---

## 🗄️ BANCO DE DADOS

### Criar/Atualizar tabelas (após alterar schema.prisma)
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "cd /home/ubuntu/command-d && npx prisma db push && pm2 restart command-d"
```

### Ver tabelas no banco
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "sudo -u postgres psql commandd_prod -c '\dt'"
```

### Backup do banco
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "sudo -u postgres pg_dump commandd_prod > backup-$(date +%Y%m%d).sql"
```

---

## 🔑 INFORMAÇÕES DO SERVIDOR

### Dados de Acesso:
- **IP:** 54.232.27.34
- **Usuário:** ubuntu
- **Chave SSH:** ~/.ssh/command-d-production.pem
- **Porta da aplicação:** 8080

### URLs:
- **Sistema:** http://54.232.27.34:8080
- **GitHub:** https://github.com/hidanz98/Command--D-v1.0
- **GitHub Actions:** https://github.com/hidanz98/Command--D-v1.0/actions

### Banco de Dados:
- **Host:** localhost
- **Porta:** 5432
- **Database:** commandd_prod
- **User:** commandd
- **Password:** CommandD2024!

---

## 🎯 WORKFLOW DIÁRIO

### Para Desenvolvimento:

```bash
# 1. Editar código localmente
code .

# 2. Testar localmente
npm run dev
# Acessar: http://localhost:8080

# 3. Quando estiver pronto, commit e push
git add .
git commit -m "Nova feature X"
git push origin main

# 4. Aguardar 2-3 minutos
# 5. Sistema atualizado automaticamente!
# 6. Acessar: http://54.232.27.34:8080
```

---

## ⚠️ TROUBLESHOOTING

### Sistema não está respondendo:
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "pm2 restart command-d"
```

### Erro após git pull:
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "cd /home/ubuntu/command-d && npm install && pm2 restart command-d"
```

### Erro no banco de dados:
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "cd /home/ubuntu/command-d && npx prisma db push && pm2 restart command-d"
```

### Ver erros nos logs:
```bash
ssh -i ~/.ssh/command-d-production.pem ubuntu@54.232.27.34 "pm2 logs command-d --err --lines 100"
```

---

## 📚 GITHUB ACTIONS (Deploy Automático)

O arquivo `.github/workflows/deploy-aws.yml` contém o workflow que:

1. Detecta push na branch `main`
2. Conecta no servidor via SSH
3. Faz `git pull`
4. Instala dependências
5. Reinicia PM2

**Status:** https://github.com/hidanz98/Command--D-v1.0/actions

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

Antes de fazer push:
- [ ] Código testado localmente
- [ ] Alterações commitadas
- [ ] Mensagem de commit descritiva

Após fazer push:
- [ ] Verificar GitHub Actions (deve ficar verde ✅)
- [ ] Acessar http://54.232.27.34:8080
- [ ] Testar funcionalidade alterada
- [ ] Verificar logs se necessário

---

## 🎉 PRONTO!

Seu sistema está configurado para deploy automático!

**Basta fazer `git push` e aguardar 2-3 minutos!** 🚀

---

## 📞 CONTATOS

**Servidor AWS:** 54.232.27.34
**Repositório:** https://github.com/hidanz98/Command--D-v1.0
**Sistema:** http://54.232.27.34:8080

