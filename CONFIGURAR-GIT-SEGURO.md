# 🔐 CONFIGURAR GIT DE FORMA SEGURA

## ⚠️ PRIMEIRO: REVOGAR TOKEN COMPROMETIDO

### 1. Acesse:
```
https://github.com/settings/tokens
```

### 2. Encontre o token que começa com:
```
ghp_yeq...
```

### 3. Clique em "Delete" ou "Revoke"

---

## 🔑 OPÇÃO 1: SSH KEYS (RECOMENDADO)

### Vantagens:
- ✅ Mais seguro
- ✅ Não expira
- ✅ Não precisa digitar senha
- ✅ Melhor prática

### Passo 1: Verificar se já tem SSH key
```bash
ls -la ~/.ssh
```

Se aparecer `id_rsa.pub` ou `id_ed25519.pub`, você já tem uma chave!

### Passo 2: Gerar nova SSH key (se não tiver)
```bash
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
```

Pressione Enter 3 vezes (aceitar padrões)

### Passo 3: Copiar a chave pública
```bash
# Windows (PowerShell)
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard

# Ou abrir e copiar manualmente
notepad ~/.ssh/id_ed25519.pub
```

### Passo 4: Adicionar no GitHub
1. Vá em: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Título: "Meu Computador"
4. Cole a chave
5. Clique em "Add SSH key"

### Passo 5: Testar conexão
```bash
ssh -T git@github.com
```

Deve aparecer:
```
Hi SEU_USUARIO! You've successfully authenticated...
```

### Passo 6: Alterar remote do repositório
```bash
# Ver remote atual
git remote -v

# Se estiver usando HTTPS, mudar para SSH
git remote set-url origin git@github.com:SEU_USUARIO/SEU_REPO.git

# Verificar
git remote -v
```

### Passo 7: Testar push
```bash
git push origin main
```

**PRONTO! Agora não precisa mais de token!** ✅

---

## 🔑 OPÇÃO 2: PERSONAL ACCESS TOKEN (Menos Seguro)

### Se preferir usar token (não recomendado):

### Passo 1: Criar novo token
1. Vá em: https://github.com/settings/tokens
2. "Generate new token" → "Generate new token (classic)"
3. Nome: "Command-D Dev"
4. Expiração: 90 dias (ou menor)
5. Permissões:
   - ✅ repo (todas)
   - ✅ workflow
6. "Generate token"
7. **COPIAR E GUARDAR EM LUGAR SEGURO** (aparece só 1 vez!)

### Passo 2: Configurar Git para usar o token

#### Windows (PowerShell):
```powershell
git config --global credential.helper wincred
```

#### Windows (Git Credential Manager):
```bash
# Já vem instalado com Git for Windows
# Ao fazer git push, vai pedir:
# Username: SEU_USUARIO_GITHUB
# Password: COLAR_O_TOKEN_AQUI (não a senha!)
```

### Passo 3: Fazer push
```bash
git push origin main
```

Quando pedir senha, cole o **TOKEN** (não sua senha do GitHub)!

---

## 🛡️ BOAS PRÁTICAS DE SEGURANÇA

### ✅ FAÇA:
- Use SSH keys sempre que possível
- Se usar token, configure expiração (30-90 dias)
- Nunca compartilhe tokens/senhas
- Revogue tokens antigos periodicamente
- Use Git Credential Manager

### ❌ NUNCA:
- Compartilhar tokens em chats/emails
- Commitar tokens no código
- Usar tokens sem expiração
- Dar permissões desnecessárias aos tokens
- Usar a mesma senha em vários lugares

---

## 🔒 CONFIGURAÇÕES ADICIONAIS DE SEGURANÇA

### 1. Habilitar 2FA no GitHub
```
https://github.com/settings/security
```

### 2. Configurar assinatura de commits (GPG)
```bash
# Gerar chave GPG
gpg --full-generate-key

# Listar chaves
gpg --list-secret-keys --keyid-format=long

# Adicionar ao Git
git config --global user.signingkey SUA_CHAVE
git config --global commit.gpgsign true

# Exportar chave pública
gpg --armor --export SUA_CHAVE

# Adicionar no GitHub
# Settings → SSH and GPG keys → New GPG key
```

### 3. Proteger branches principais
```
GitHub → Repositório → Settings → Branches
→ Add rule
→ Branch name pattern: main
→ ✅ Require pull request reviews
→ ✅ Require status checks to pass
→ Save
```

---

## 🚀 COMANDOS ÚTEIS DO GIT

### Ver configuração atual
```bash
git config --list
```

### Configurar usuário
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### Ver remotes
```bash
git remote -v
```

### Mudar de HTTPS para SSH
```bash
# De:
https://github.com/usuario/repo.git

# Para:
git@github.com:usuario/repo.git

# Comando:
git remote set-url origin git@github.com:usuario/repo.git
```

### Limpar credenciais salvas (Windows)
```powershell
git credential-manager delete https://github.com
```

### Salvar credenciais (se necessário)
```bash
# Cache por 1 hora
git config --global credential.helper cache

# Cache permanente (Windows)
git config --global credential.helper wincred
```

---

## 📝 CHECKLIST FINAL

Antes de fazer push:
- [ ] Token antigo revogado
- [ ] SSH key configurada (recomendado)
- [ ] OU novo token criado e salvo
- [ ] Remote configurado corretamente
- [ ] Teste de conexão OK
- [ ] 2FA habilitado no GitHub

---

## 🆘 PROBLEMAS COMUNS

### "Permission denied (publickey)"
```bash
# Adicionar chave SSH ao agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### "fatal: Authentication failed"
```bash
# Limpar credenciais antigas
git credential-manager delete https://github.com

# Fazer push novamente (vai pedir credenciais)
git push origin main
```

### "fatal: remote origin already exists"
```bash
# Remover e adicionar novamente
git remote remove origin
git remote add origin git@github.com:usuario/repo.git
```

---

## 🎯 RESUMO RÁPIDO

### Para começar agora:

1. **Revogar token exposto:** https://github.com/settings/tokens

2. **Configurar SSH:**
```bash
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
Get-Content ~/.ssh/id_ed25519.pub
# Copiar e adicionar em: https://github.com/settings/keys
```

3. **Mudar remote:**
```bash
git remote set-url origin git@github.com:SEU_USUARIO/Sistema-Command-D.git
```

4. **Testar:**
```bash
git push origin main
```

**PRONTO! Agora está seguro! 🔐**

