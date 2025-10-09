# 🤖 Bot de QA Automático - Sistema Command-D

## 📋 Sobre

Este bot de QA automático testa **TODOS os botões** em **TODAS as páginas** do sistema Command-D, para os 3 perfis de usuário:

- 👨‍💼 **Admin** (`cabecadeefeitocine@gmail.com`)
- 👨‍💼 **Funcionário** (`funcionario@empresa.com`)
- 👤 **Cliente** (`joao.silva@email.com`)

---

## 🚀 Como Usar

### 1️⃣ Certifique-se que o servidor está rodando

```bash
npm run dev
```

O servidor deve estar em: **http://localhost:8081**

---

### 2️⃣ Executar os Testes

```bash
# Rodar todos os testes
npx playwright test

# Rodar em modo headed (vendo o navegador)
npx playwright test --headed

# Rodar apenas testes de um perfil específico
npx playwright test --grep "Admin"
npx playwright test --grep "Funcionário"
npx playwright test --grep "Cliente"

# Rodar com mais detalhes
npx playwright test --reporter=list
```

---

### 3️⃣ Ver Relatórios

#### Relatório HTML Interativo (Playwright):
```bash
npx playwright show-report
```

Isso abrirá o relatório interativo do Playwright no navegador.

#### Relatório HTML Customizado (Botões):
Abra o arquivo:
```
playwright-report/button-test-report.html
```

#### Relatório JSON:
```
playwright-report/button-test-results.json
```

---

## 📊 O Que o Bot Testa

### Para Cada Perfil de Usuário:

1. **Login**
   - Acessa `/login`
   - Preenche credenciais
   - Clica em "Entrar"
   - Verifica sucesso do login

2. **Navegação de Páginas**
   - Home (`/`)
   - Equipamentos (`/equipamentos`)
   - Carrinho (`/carrinho`)
   - Painel Admin (`/painel-admin`)
   - Área Cliente (`/area-cliente`)

3. **Teste de Botões**
   Para cada página:
   - Localiza TODOS os botões visíveis
   - Clica em cada botão, um por um
   - Monitora:
     - ✅ Erros no console
     - ✅ Requisições 4xx/5xx
     - ✅ Timeouts
     - ✅ Exceções JavaScript
   - Tira screenshot se houver erro
   - Volta para a página original

---

## 📁 Estrutura de Arquivos

```
tests/
├── buttons.spec.ts          # Teste principal
└── README-TESTES.md         # Esta documentação

playwright-report/           # Gerado após os testes
├── index.html              # Relatório interativo Playwright
├── button-test-report.html # Relatório customizado de botões
├── button-test-results.json # Dados em JSON
├── results.json            # Resultados Playwright
└── screenshots/            # Screenshots de erros
    ├── Home-Botao1-error.png
    ├── PainelAdmin-Botao2-error.png
    └── ...

playwright.config.ts         # Configuração Playwright
```

---

## 🔧 Configurações

### Timeouts:
- **Teste completo:** 60 segundos
- **Ação (click, fill):** 10 segundos
- **Navegação:** 30 segundos

### Capturas:
- **Screenshot:** Apenas em falhas
- **Vídeo:** Apenas em falhas
- **Trace:** Apenas em falhas

### Seletores de Botões:
O bot busca por:
- `button`
- `[role="button"]`
- `[type="button"]`
- `[type="submit"]`
- `.btn`
- `a.button`

---

## 📊 Formato do Relatório JSON

```json
{
  "summary": {
    "total": 150,
    "success": 145,
    "warnings": 3,
    "errors": 2,
    "successRate": "96.7%"
  },
  "results": [
    {
      "page": "Home",
      "buttonText": "Ver Equipamentos",
      "buttonSelector": "button:nth-of-type(1)",
      "status": "success",
      "timestamp": "2024-10-09T21:30:00.000Z"
    },
    {
      "page": "Painel Admin",
      "buttonText": "Salvar Configurações",
      "buttonSelector": "button:nth-of-type(5)",
      "status": "error",
      "error": "Failed requests: 500 /api/config",
      "screenshot": "playwright-report/screenshots/PainelAdmin-Salvar_Configuracoes-error.png",
      "timestamp": "2024-10-09T21:35:00.000Z"
    }
  ]
}
```

---

## ✅ Interpretando Resultados

### Status:
- **✅ success:** Botão funcionou perfeitamente, sem erros
- **⚠️ warning:** Botão funcionou, mas houve erros no console
- **❌ error:** Botão causou erro (request 4xx/5xx ou exceção)

### Console do Teste:
Durante a execução, você verá:

```
🔐 Fazendo login como Admin...
✅ Login como Admin realizado com sucesso!

🤖 Testando botões como Admin...

📄 Testando página: Home (/)
   Encontrados 12 botões
   [1/12] Testando: "Ver Equipamentos"
      ✅ Sucesso
   [2/12] Testando: "Adicionar ao Carrinho"
      ✅ Sucesso
   [3/12] Testando: "Login"
      ⚠️  Warning: Console errors: TypeError: Cannot read...
   ...

📄 Testando página: Painel Admin (/painel-admin)
   Encontrados 45 botões
   [1/45] Testando: "Dashboard"
      ✅ Sucesso
   [2/45] Testando: "Salvar Configurações"
      ❌ Erro: Failed requests: 500 /api/config
   ...

📊 ========== RELATÓRIO FINAL ==========

Total de botões testados: 150
✅ Sucessos: 145 (96.7%)
⚠️  Warnings: 3 (2.0%)
❌ Erros: 2 (1.3%)

❌ BOTÕES COM ERRO:

  • Painel Admin - "Salvar Configurações"
    Erro: Failed requests: 500 /api/config
    Screenshot: playwright-report/screenshots/PainelAdmin-Salvar_Configuracoes-error.png

  • Carrinho - "Finalizar Pedido"
    Erro: Timeout 10000ms exceeded
    Screenshot: playwright-report/screenshots/Carrinho-Finalizar_Pedido-error.png

📁 Relatório JSON salvo em: playwright-report/button-test-results.json
📁 Relatório HTML salvo em: playwright-report/button-test-report.html

========================================
```

---

## 🐛 Troubleshooting

### Erro: "Error: page.goto: net::ERR_CONNECTION_REFUSED"
```
❌ Problema: Servidor não está rodando
✅ Solução: Execute `npm run dev` antes dos testes
```

### Erro: "Timeout 30000ms exceeded"
```
❌ Problema: Página demorou muito para carregar
✅ Solução: Aumente o timeout em playwright.config.ts
```

### Muitos botões com warning
```
⚠️  Isso pode ser normal se o sistema logar muitos avisos
💡 Analise os erros no console para ver se são críticos
```

### Screenshots não estão salvando
```
✅ Verifique se a pasta playwright-report/screenshots existe
✅ O script cria automaticamente, mas pode haver problemas de permissão
```

---

## 🎯 Próximos Passos

### Depois de rodar os testes:

1. **Ver relatório HTML:**
   ```bash
   npx playwright show-report
   ```

2. **Analisar erros:**
   - Abra `button-test-report.html`
   - Veja quais botões falharam
   - Abra as screenshots

3. **Corrigir bugs:**
   - Para cada erro encontrado:
     - Identifique o botão
     - Veja o erro (console, request, etc)
     - Corrija no código
     - Re-teste

4. **Re-testar:**
   ```bash
   npx playwright test
   ```

---

## 📈 Estatísticas Esperadas

### Sistema Funcional:
```
✅ Sucessos: > 95%
⚠️  Warnings: < 5%
❌ Erros: 0%
```

### Sistema com Problemas:
```
✅ Sucessos: < 90%
⚠️  Warnings: > 10%
❌ Erros: > 5%
```

---

## 🔄 Automatização (CI/CD)

Para rodar automaticamente no GitHub Actions:

```yaml
# .github/workflows/qa-tests.yml
name: QA Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start server
        run: npm run dev &
        
      - name: Wait for server
        run: npx wait-on http://localhost:8081
      
      - name: Run tests
        run: npx playwright test
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📞 Suporte

### Documentação Playwright:
- https://playwright.dev/

### Comandos Úteis:
```bash
# Ver versão
npx playwright --version

# Atualizar Playwright
npm install -D @playwright/test@latest

# Debug mode
npx playwright test --debug

# Apenas um teste
npx playwright test tests/buttons.spec.ts

# UI Mode (interativo)
npx playwright test --ui
```

---

**✅ Sistema de QA Automático Pronto!**

**Execute `npx playwright test` e veja a mágica acontecer! 🚀**

