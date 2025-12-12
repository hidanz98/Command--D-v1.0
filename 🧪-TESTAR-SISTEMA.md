# 🧪 COMO TESTAR O SISTEMA MANUALMENTE

## 🚀 PASSO 1: INICIAR O SERVIDOR

### Opção A: Usando o Script BAT (MAIS FÁCIL)
```
1. Clique duas vezes em: 🚀-INICIAR-SERVIDOR.bat
2. Aguarde aparecer: "✅ Server ready at http://localhost:8080"
3. Deixe esta janela aberta
```

### Opção B: Via Terminal
```bash
cd Command--D-v1.0
npm run dev
```

---

## 📋 PASSO 2: TESTAR AS PÁGINAS NO NAVEGADOR

Abra seu navegador (Chrome, Edge, Firefox) e teste cada URL:

### 🏠 **Página Principal**
```
http://localhost:8080
```
**O que deve aparecer:**
- Logo da empresa
- Navegação
- Conteúdo da página principal

---

### 📦 **CLIENTE - Testar Catálogo**
```
http://localhost:8080/equipamentos
```
**O que deve aparecer:**
- Lista de equipamentos/produtos
- Cards com imagens
- Botões de adicionar ao carrinho

---

### 🛒 **CLIENTE - Testar Carrinho**
```
http://localhost:8080/carrinho
```
**O que deve aparecer:**
- Lista de itens no carrinho
- Total
- Botão de finalizar

---

### 👤 **CLIENTE - Área do Cliente**
```
http://localhost:8080/area-cliente
```
**O que deve aparecer:**
- Informações do cliente
- Pedidos realizados
- Status dos pedidos

---

### 📝 **CLIENTE - Cadastro**
```
http://localhost:8080/cadastro
```
**O que deve aparecer:**
- Formulário de cadastro
- Campos para dados pessoais
- Upload de documentos

---

### 👨‍💼 **FUNCIONÁRIO/DONO - Painel Admin**
```
http://localhost:8080/painel-admin
```
**O que deve aparecer:**
- Dashboard administrativo
- Abas de gestão
- Estatísticas

---

### 📦 **FUNCIONÁRIO/DONO - Gestão de Pedidos**
```
http://localhost:8080/pedidos
```
**O que deve aparecer:**
- ✅ Lista de todos os pedidos
- ✅ Filtros (Pendente, Confirmado, etc)
- ✅ Busca por número ou cliente
- ✅ Cards com informações do pedido
- ✅ Botão "Ver Detalhes"
- ✅ Status coloridos

---

### ✅ **FUNCIONÁRIO - Aprovações de Cadastro**
```
http://localhost:8080/aprovacoes
```
**O que deve aparecer:**
- ✅ Lista de cadastros pendentes
- ✅ Informações do cliente (nome, email, telefone, CPF)
- ✅ Documentos enviados
- ✅ Botões "Aprovar" (verde) e "Rejeitar" (vermelho)
- ✅ Campo para motivo de rejeição

---

### 📊 **DONO - Dashboard**
```
http://localhost:8080/dashboard
```
**O que deve aparecer:**
- ✅ Cards com estatísticas
- ✅ Total de Pedidos
- ✅ Receita Total
- ✅ Clientes Ativos
- ✅ Aprovações Pendentes
- ✅ Gráficos (em desenvolvimento)

---

### 👥 **DONO - Gestão de Clientes**
```
http://localhost:8080/clientes
```
**O que deve aparecer:**
- ✅ Lista de todos os clientes
- ✅ Status (Aprovado, Pendente, Ativo)
- ✅ Informações de contato
- ✅ Busca por nome ou email

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Todas as Páginas Devem:**
- [ ] Carregar sem erro 404
- [ ] Mostrar header/navegação
- [ ] Ter design responsivo
- [ ] Botões funcionando
- [ ] Não ter erros no console (F12)

### **Funcionalidades Específicas:**

#### **Cliente:**
- [ ] Ver produtos
- [ ] Adicionar ao carrinho
- [ ] Fazer cadastro
- [ ] Ver meus pedidos

#### **Funcionário:**
- [ ] Ver todos os pedidos
- [ ] Aprovar/rejeitar cadastros
- [ ] Filtrar pedidos por status

#### **Dono:**
- [ ] Ver dashboard com métricas
- [ ] Gerenciar clientes
- [ ] Acessar todas as áreas

---

## 🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO

### **1. Console do Navegador (F12)**
```
Abra o DevTools (F12) e vá em "Console"
NÃO deve ter:
- ❌ Erros vermelhos
- ❌ 404 Not Found
- ❌ Failed to fetch

Pode ter:
- ⚠️ Warnings amarelos (normal)
```

### **2. Network (F12 → Network)**
```
Veja as requisições:
- ✅ Status 200 = OK
- ❌ Status 404 = Página não encontrada
- ❌ Status 500 = Erro do servidor
```

### **3. Elementos Visuais**
```
Cada página deve ter:
- ✅ Header com logo
- ✅ Título da página
- ✅ Cards ou listas
- ✅ Botões coloridos
- ✅ Design bonito
```

---

## 🐛 SE ALGO NÃO FUNCIONAR

### **Erro: "Cannot GET /rota"**
```
Problema: Rota não existe
Solução: Verifique se adicionou no App.tsx
```

### **Erro: "ERR_CONNECTION_REFUSED"**
```
Problema: Servidor não está rodando
Solução: Execute 🚀-INICIAR-SERVIDOR.bat
```

### **Página em branco**
```
Problema: Erro de JavaScript
Solução: 
1. Abra Console (F12)
2. Veja o erro
3. Verifique se os imports estão corretos
```

### **Dados não aparecem**
```
Problema: API não retorna dados
Solução:
1. Banco de dados pode estar vazio
2. Execute: npm run db:seed
3. Ou adicione dados manualmente
```

---

## 📱 TESTE EM DIFERENTES DISPOSITIVOS

### **Desktop**
- [ ] 1920x1080 (Full HD)
- [ ] 1366x768 (HD)

### **Tablet**
- [ ] 768x1024 (iPad)
- [ ] Rotação landscape/portrait

### **Mobile**
- [ ] 375x667 (iPhone)
- [ ] 360x640 (Android)

**Como testar:** No navegador, F12 → Toggle Device Toolbar (Ctrl+Shift+M)

---

## 📊 RELATÓRIO DE TESTE

Após testar, anote:

```
✅ Páginas que funcionam:
- /equipamentos
- /carrinho
- ...

❌ Páginas com problema:
- /dashboard - Erro: ...
- ...

🐛 Bugs encontrados:
1. 
2. 
3. 
```

---

## 🎯 RESULTADO ESPERADO

**META: 100% das páginas funcionando!**

Ao final dos testes, você deve conseguir:
- ✅ Navegar por todas as páginas
- ✅ Ver dados (ou placeholders)
- ✅ Clicar em todos os botões
- ✅ Sistema responsivo
- ✅ Zero erros 404

---

## 🚀 PRÓXIMO PASSO

Depois de testar manualmente:
1. Anote o que funciona ✅
2. Anote o que não funciona ❌
3. Execute os testes automatizados:
```bash
npm run test:e2e
```

---

**Bons testes! 🧪**

