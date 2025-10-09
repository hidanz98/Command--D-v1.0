# 🤖 Guia Rápido - Bot de QA Automático

## ✅ Sistema Instalado e Configurado!

---

## 🚀 Como Usar (3 Passos)

### 1️⃣ Certifique-se que o servidor está rodando

```bash
npm run dev
```

✅ Servidor deve estar em: **http://localhost:8081**

---

### 2️⃣ Execute os testes

```bash
# Teste completo (sem ver o navegador)
npm run test:e2e

# Ver o navegador executando (modo headed)
npm run test:e2e:headed

# Modo UI interativo
npm run test:e2e:ui
```

---

### 3️⃣ Veja os relatórios

```bash
# Relatório HTML interativo do Playwright
npm run test:e2e:report

# OU abra manualmente:
# playwright-report/button-test-report.html
```

---

## 📊 O Que o Bot Faz

### Testa 3 Perfis:
1. **👨‍💼 Admin** - `cabecadeefeitocine@gmail.com`
2. **👨‍💼 Funcionário** - `funcionario@empresa.com`
3. **👤 Cliente** - `joao.silva@email.com`

### Para Cada Perfil:
1. Faz login
2. Navega por 5 páginas principais
3. Clica em **TODOS os botões** visíveis
4. Registra erros de:
   - ❌ Console errors
   - ❌ Requests 4xx/5xx
   - ❌ Timeouts
   - ❌ Exceções JavaScript
5. Tira screenshot se houver erro
6. Gera relatório detalhado

---

## 📁 Arquivos Gerados

Após rodar os testes, você terá:

```
playwright-report/
├── index.html                  # Relatório interativo Playwright ⭐
├── button-test-report.html     # Relatório customizado de botões ⭐
├── button-test-results.json    # Dados em JSON
└── screenshots/                # Screenshots de erros
    ├── PainelAdmin-Botao1-error.png
    └── ...
```

---

## 📋 Comandos Disponíveis

```bash
# Teste completo
npm run test:e2e

# Ver navegador durante teste
npm run test:e2e:headed

# Modo UI interativo
npm run test:e2e:ui

# Ver relatório após testes
npm run test:e2e:report

# Rodar apenas um perfil
npx playwright test --grep "Admin"
npx playwright test --grep "Funcionário"
npx playwright test --grep "Cliente"

# Debug mode
npx playwright test --debug
```

---

## 📊 Exemplo de Saída

Durante a execução, você verá:

```bash
🔐 Fazendo login como Admin...
✅ Login como Admin realizado com sucesso!

🤖 Testando botões como Admin...

📄 Testando página: Painel Admin (/painel-admin)
   Encontrados 45 botões
   [1/45] Testando: "Dashboard"
      ✅ Sucesso
   [2/45] Testando: "Pedidos"
      ✅ Sucesso
   [3/45] Testando: "Aprovar Cadastro"
      ✅ Sucesso
   ...

📊 ========== RELATÓRIO FINAL ==========

Total de botões testados: 150
✅ Sucessos: 147 (98.0%)
⚠️  Warnings: 2 (1.3%)
❌ Erros: 1 (0.7%)

❌ BOTÕES COM ERRO:

  • Painel Admin - "Salvar Configurações"
    Erro: Failed requests: 500 /api/config
    Screenshot: playwright-report/screenshots/PainelAdmin-Salvar-error.png

📁 Relatório JSON: playwright-report/button-test-results.json
📁 Relatório HTML: playwright-report/button-test-report.html

========================================
```

---

## ✅ Resultado Esperado

### Sistema Funcionando Bem:
```
✅ Sucessos: > 95%
⚠️  Warnings: < 5%
❌ Erros: 0%
```

### Se Houver Erros:
1. Abra o relatório HTML
2. Veja qual botão falhou
3. Veja a screenshot
4. Corrija o bug
5. Re-teste

---

## 🐛 Problemas Comuns

### ❌ "Error: page.goto: net::ERR_CONNECTION_REFUSED"
**Solução:** Execute `npm run dev` antes dos testes

### ❌ "Timeout 30000ms exceeded"
**Solução:** Página demorou muito. Normal em primeira execução.

### ⚠️ Muitos warnings
**Solução:** Analise se são erros críticos ou apenas avisos normais

---

## 📖 Documentação Completa

Para mais detalhes, veja:
- **`tests/README-TESTES.md`** - Documentação completa
- **`playwright.config.ts`** - Configurações
- **`tests/buttons.spec.ts`** - Código dos testes

---

## 🎯 Workflow Recomendado

### Antes de Fazer Deploy:
```bash
1. npm run dev              # Inicia servidor
2. npm run test:e2e:headed  # Roda testes (vendo o navegador)
3. npm run test:e2e:report  # Vê relatório
4. Corrige bugs encontrados
5. Re-testa
6. Deploy apenas se 100% OK
```

### Desenvolvimento Diário:
```bash
1. Faz mudanças no código
2. npm run test:e2e        # Testa rapidamente
3. Se tudo OK, commit
4. Se houver erros, corrige
```

---

## 📊 Estrutura dos Testes

### Testes Criados:
```typescript
// Para cada perfil (Admin, Funcionário, Cliente):
describe('Testes como Admin', () => {
  
  test('Login como Admin', async ({ page }) => {
    // Faz login
  });

  test('Testar botões em todas as páginas', async ({ page }) => {
    // Navega páginas
    // Clica em todos os botões
    // Registra resultados
  });
});
```

### Páginas Testadas:
- `/` - Home
- `/equipamentos` - Lista de equipamentos
- `/carrinho` - Carrinho de compras
- `/painel-admin` - Painel administrativo
- `/area-cliente` - Área do cliente

### Seletores de Botões:
- `button`
- `[role="button"]`
- `[type="button"]`
- `[type="submit"]`
- `.btn`
- `a.button`

---

## 🔥 Recursos Avançados

### Filtrar Testes:
```bash
# Apenas Admin
npx playwright test --grep "Admin"

# Apenas login
npx playwright test --grep "Login"

# Excluir um teste
npx playwright test --grep-invert "Cliente"
```

### Modo Debug:
```bash
# Pausa em cada step
npx playwright test --debug

# Modo headed + slow motion
npx playwright test --headed --slow-mo=1000
```

### Relatórios:
```bash
# HTML
npm run test:e2e:report

# JSON
cat playwright-report/button-test-results.json | jq

# Ver vídeos
ls playwright-report/videos/
```

---

## 🎊 Pronto!

**Seu sistema agora tem QA automático completo!**

### Execute:
```bash
npm run test:e2e
npm run test:e2e:report
```

### Resultado:
✅ Todos os botões testados  
✅ Relatórios detalhados  
✅ Screenshots de erros  
✅ 100% de cobertura de botões  

---

**🚀 Teste agora mesmo!**

```bash
npm run test:e2e:headed
```

**Data:** Outubro 2024  
**Status:** ✅ QA Automático Configurado e Pronto!

