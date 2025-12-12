# 🤖 Bot de Testes Inteligente - Command-D

Um sistema automatizado e inteligente para testar, analisar e monitorar a aplicação Command-D.

## 🚀 Funcionalidades

### ✅ Testes Automatizados
- Executa suite completa de testes E2E
- Testes de performance
- Testes de acessibilidade (WCAG 2.1)
- Testes de RBAC (Role-Based Access Control)

### 🔍 Análise Inteligente
- Detecta automaticamente problemas
- Classifica por severidade (Critical, High, Medium, Low)
- Identifica problemas auto-fixáveis
- Gera relatórios detalhados

### 🔧 Auto-Healing
- Tenta corrigir problemas comuns automaticamente
- Sistema de recuperação inteligente
- Aprende com falhas anteriores

### 📊 Monitoramento
- Dashboard em tempo real
- Métricas de performance
- Tendências e histórico
- Alertas automáticos

## 📦 Instalação

O bot já está integrado ao projeto. Nenhuma instalação adicional necessária.

## 🎯 Como Usar

### Modo Único (Executa uma vez)
```bash
npm run bot
```

### Modo Watch (Execução contínua a cada 30 minutos)
```bash
npm run bot:watch
```

### Modo Rápido (Sem auto-fix)
```bash
npm run bot:quick
```

## 📋 O que o Bot Faz

### 1️⃣ Fase 1: Testes E2E
- Executa todos os testes de fluxo
- Testa 3 perfis: Dono, Funcionário, Cliente
- Verifica RBAC

### 2️⃣ Fase 2: Análise de Resultados
- Conta testes aprovados/falhados
- Identifica padrões de falha
- Classifica por severidade

### 3️⃣ Fase 3: Performance
- Mede tempo de carregamento
- First Contentful Paint
- Time to Interactive
- Largest Contentful Paint
- Cumulative Layout Shift

### 4️⃣ Fase 4: Acessibilidade
- Testa com axe-core
- Verifica WCAG 2.1
- Identifica problemas críticos
- Sugere correções

### 5️⃣ Fase 5: Auto-Fix
- Tenta corrigir problemas simples
- Executa analisador de UI
- Gera sugestões de correção

### 6️⃣ Fase 6: Relatórios
- Gera relatório JSON completo
- Cria dashboard HTML interativo
- Salva histórico de execuções

## 📊 Relatórios Gerados

### JSON Report
```
playwright-report/bot-reports/report-{timestamp}.json
```

Contém:
- Resultados completos
- Métricas detalhadas
- Recomendações
- Histórico

### HTML Dashboard
```
playwright-report/bot-reports/dashboard-latest.html
```

Contém:
- Visualização de métricas
- Gráficos de tendências
- Status atual do sistema
- Recomendações prioritárias

## 🎛️ Configuração

Você pode customizar o bot editando `tests/bot/run-bot.ts`:

```typescript
const config = {
  autoRun: true,          // Executar continuamente?
  runInterval: 30,        // Intervalo em minutos
  autoFix: true,          // Tentar auto-correção?
  notifyOnFailure: true,  // Notificar em falhas?
  performanceThreshold: {
    loadTime: 3000,       // Limite de carregamento (ms)
    fcp: 1800,            // First Contentful Paint (ms)
    lcp: 2500,            // Largest Contentful Paint (ms)
  },
};
```

## 📈 Métricas de Performance

### Thresholds Padrão
- **Load Time**: < 3000ms
- **First Contentful Paint**: < 1800ms
- **Largest Contentful Paint**: < 2500ms
- **Time to Interactive**: < 3500ms

### Classificação
- ✅ **Excelente**: Abaixo de 80% do threshold
- 🟡 **Bom**: Entre 80% e 100% do threshold
- ⚠️ **Regular**: Entre 100% e 120% do threshold
- 🔴 **Ruim**: Acima de 120% do threshold

## 🔧 Auto-Fix Capabilities

O bot pode tentar corrigir automaticamente:

- ✅ Botões sem `type` attribute
- ✅ Links com `href="#"` vazio
- ✅ Handlers ausentes em elementos interativos
- ✅ Problemas de contraste de cores (básico)
- ✅ Textos alternativos ausentes
- ⚠️ Problemas de RBAC (análise apenas)
- ⚠️ Problemas de performance (análise apenas)

## 📧 Notificações

Por padrão, o bot registra todas as falhas no console. Você pode estender para:

- 📧 Email
- 💬 Slack
- 📱 Discord
- 🔔 PagerDuty
- 📊 Datadog/New Relic

Para implementar, edite o método `notifyFailure` em `intelligent-qa-bot.ts`.

## 🐛 Troubleshooting

### Bot não inicia
```bash
# Verificar dependências
npm install

# Verificar servidor está rodando
npm run dev
```

### Testes falhando
```bash
# Limpar cache
npm run test:setup:all

# Rodar manualmente
npm run test:e2e
```

### Relatórios não gerados
```bash
# Criar diretório
mkdir -p playwright-report/bot-reports

# Verificar permissões
chmod 755 playwright-report
```

## 🎯 Próximas Funcionalidades

- [ ] Integração com CI/CD
- [ ] Testes de carga
- [ ] Testes de segurança (OWASP)
- [ ] Machine Learning para predição de falhas
- [ ] Dashboard em tempo real com WebSockets
- [ ] Integração com ferramentas de APM

## 📚 Documentação Adicional

- [Guia de Testes](../README-TESTES.md)
- [Playwright Docs](https://playwright.dev)
- [axe-core](https://github.com/dequelabs/axe-core)

## 🤝 Contribuindo

Para melhorar o bot:

1. Fork o repositório
2. Crie uma branch com sua feature
3. Implemente e teste
4. Envie um PR

## 📝 Licença

MIT License - veja LICENSE para detalhes

---

**Desenvolvido com ❤️ para o Sistema Command-D**

