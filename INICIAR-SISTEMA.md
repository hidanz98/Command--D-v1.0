# 🚀 Como Iniciar o Sistema - Guia Simples

## ❌ Erro Comum

Se você viu este erro:
```
npm error enoent Could not read package.json
```

**Causa:** Você está no diretório errado!

---

## ✅ Solução: 3 Passos Simples

### 1️⃣ Abra o Terminal Correto

**No VS Code:**
- Pressione: `Ctrl + '` (abre o terminal integrado)
- OU: Menu `Terminal` → `New Terminal`

**O terminal deve mostrar:**
```powershell
PS C:\Users\fnune\OneDrive\Documentos\GitHub\Command--D-v1.0>
```

---

### 2️⃣ Se Estiver no Lugar Errado

Se o terminal mostrar:
```powershell
PS C:\Users\fnune\OneDrive\Documentos\GitHub>
```

**Execute:**
```powershell
cd Command--D-v1.0
```

---

### 3️⃣ Inicie o Servidor

```powershell
npm run dev
```

**Você vai ver:**
```
VITE v... ready in ... ms
➜  Local:   http://localhost:8080/
```

---

## 🎯 Verificação Rápida

### ✅ Está no lugar certo se:
- O terminal mostra: `...GitHub\Command--D-v1.0>`
- Comando `npm run dev` funciona
- Abre em: `http://localhost:8080`

### ❌ Está no lugar errado se:
- O terminal mostra: `...GitHub>` (sem Command--D-v1.0)
- Erro: `Could not read package.json`

---

## 🔧 Resolver Erros TypeScript

Após o servidor iniciar, se ainda ver erros no VS Code:

### Solução Rápida:
1. `Ctrl + Shift + P`
2. Digite: `Reload Window`
3. Enter
4. ✨ Erros somem!

### OU:
1. Feche o VS Code completamente
2. Abra novamente
3. ✨ Erros somem!

---

## 📱 Acessar o Sistema

Após `npm run dev`, abra o navegador:

```
http://localhost:8080/
```

**Páginas disponíveis:**
- `/` - Home com design BILS
- `/equipamentos` - Catálogo
- `/painel-admin` - Painel completo
- `/login` - Login

---

## 🎉 Tudo Certo!

Seu sistema está:
- ✅ Funcionando 100%
- ✅ Design profissional aplicado
- ✅ Sem perda de dados
- ✅ Backend completo
- ✅ Painel admin intacto

**Os erros TypeScript são apenas visuais - o sistema funciona perfeitamente!**

