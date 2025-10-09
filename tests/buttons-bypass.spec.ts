/**
 * Teste de Botões com Auto-Bypass de Autenticação
 * 
 * Assume que auth.setup.ts já criou storageState.json
 * Testa TODOS os botões visíveis em todas as páginas
 * 
 * ⚠️ NÃO faz login pela UI - usa storageState
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface ButtonTestResult {
  page: string;
  pageURL: string;
  buttonText: string;
  buttonSelector: string;
  status: 'success' | 'error' | 'warning';
  error?: string;
  errorType?: 'console' | 'request' | 'exception' | 'timeout';
  failedRequests?: string[];
  consoleErrors?: string[];
  screenshot?: string;
  timestamp: string;
}

// Seletores de botões
const BUTTON_SELECTORS = [
  'button',
  '[role="button"]',
  '[type="button"]',
  '[type="submit"]',
  '.btn',
  'a.button',
];

// Páginas para testar
const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/equipamentos', name: 'Equipamentos' },
  { path: '/carrinho', name: 'Carrinho' },
  { path: '/painel-admin', name: 'Painel Admin' },
  { path: '/area-cliente', name: 'Área Cliente' },
  { path: '/cadastro', name: 'Cadastro' },
];

let allResults: ButtonTestResult[] = [];

/**
 * Encontrar todos os botões visíveis na página
 */
async function findAllButtons(page: Page): Promise<{ element: any; text: string; selector: string }[]> {
  const buttons = [];

  for (const selector of BUTTON_SELECTORS) {
    const elements = await page.locator(selector).all();

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      try {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;

        // Obter texto do botão
        const text = await element.innerText().catch(() => '');
        const ariaLabel = await element.getAttribute('aria-label').catch(() => '');
        const title = await element.getAttribute('title').catch(() => '');

        const buttonText = text || ariaLabel || title || `[${selector}:${i}]`;

        buttons.push({
          element,
          text: buttonText.trim().substring(0, 50),
          selector: `${selector}:nth-of-type(${i + 1})`,
        });
      } catch (error) {
        continue;
      }
    }
  }

  return buttons;
}

/**
 * Clicar em botão e verificar erros
 */
async function clickButtonAndCheck(
  page: Page,
  button: { element: any; text: string; selector: string },
  pageName: string,
  pageURL: string
): Promise<ButtonTestResult> {
  const result: ButtonTestResult = {
    page: pageName,
    pageURL: pageURL,
    buttonText: button.text,
    buttonSelector: button.selector,
    status: 'success',
    timestamp: new Date().toISOString(),
  };

  // Monitorar erros de console
  const consoleErrors: string[] = [];
  const consoleListener = (msg: any) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  };
  page.on('console', consoleListener);

  // Monitorar requests com erro
  const failedRequests: string[] = [];
  const responseListener = (response: any) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  };
  page.on('response', responseListener);

  try {
    // Scroll até o botão
    await button.element.scrollIntoViewIfNeeded({ timeout: 3000 });

    // Aguardar um pouco
    await page.waitForTimeout(300);

    // Clicar
    await button.element.click({ timeout: 5000 });

    // Aguardar possíveis mudanças
    await page.waitForTimeout(1000);

    // Verificar erros
    if (consoleErrors.length > 0) {
      result.status = 'warning';
      result.errorType = 'console';
      result.consoleErrors = consoleErrors;
      result.error = `Console errors: ${consoleErrors.slice(0, 2).join(', ')}`;
    }

    if (failedRequests.length > 0) {
      result.status = 'error';
      result.errorType = 'request';
      result.failedRequests = failedRequests;
      result.error = `Failed requests: ${failedRequests.slice(0, 2).join(', ')}`;

      // Tirar screenshot
      const screenshotPath = `playwright-report/screenshots/${pageName}-${button.text.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      result.screenshot = screenshotPath;
    }
  } catch (error: any) {
    result.status = 'error';
    result.errorType = error.message.includes('Timeout') ? 'timeout' : 'exception';
    result.error = error.message;

    // Tirar screenshot
    const screenshotPath = `playwright-report/screenshots/${pageName}-${button.text.replace(/[^a-zA-Z0-9]/g, '_')}-error.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    result.screenshot = screenshotPath;
  } finally {
    // Remover listeners
    page.off('console', consoleListener);
    page.off('response', responseListener);
  }

  return result;
}

/**
 * Gerar relatório HTML
 */
function generateHTMLReport(results: ButtonTestResult[], summary: any) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório QA - Auto-Bypass Auth</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .badge.auth-real { background: #d4edda; color: #155724; }
    .badge.auth-mock { background: #fff3cd; color: #856404; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stats { display: flex; gap: 20px; margin-top: 20px; }
    .stat { flex: 1; text-align: center; padding: 15px; border-radius: 4px; }
    .stat.success { background: #d4edda; color: #155724; }
    .stat.warning { background: #fff3cd; color: #856404; }
    .stat.error { background: #f8d7da; color: #721c24; }
    .stat h2 { margin: 0; font-size: 36px; }
    .stat p { margin: 5px 0 0 0; }
    table { width: 100%; background: white; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #007bff; color: white; position: sticky; top: 0; }
    tr:hover { background: #f8f9fa; }
    .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
    .status.success { background: #d4edda; color: #155724; }
    .status.warning { background: #fff3cd; color: #856404; }
    .status.error { background: #f8d7da; color: #721c24; }
    .error-detail { color: #721c24; font-size: 12px; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .page-group { background: #e9ecef; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🤖 Relatório QA - Auto-Bypass de Autenticação</h1>
  <p><strong>Sistema:</strong> Command-D Multi-Tenant</p>
  <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  <p><strong>Método de Auth:</strong> <span class="badge ${summary.authMethod === 'real' ? 'auth-real' : 'auth-mock'}">${summary.authMethod === 'real' ? '✅ AUTH REAL' : '⚠️ AUTH MOCK (Teste)'}</span></p>
  
  <div class="summary">
    <h2>📊 Resumo Geral</h2>
    <div class="stats">
      <div class="stat">
        <h2>${summary.total}</h2>
        <p>Total de Botões</p>
      </div>
      <div class="stat success">
        <h2>${summary.success}</h2>
        <p>Sucessos (${summary.successRate})</p>
      </div>
      <div class="stat warning">
        <h2>${summary.warnings}</h2>
        <p>Warnings (${summary.warningRate})</p>
      </div>
      <div class="stat error">
        <h2>${summary.errors}</h2>
        <p>Erros (${summary.errorRate})</p>
      </div>
    </div>
    <p style="margin-top: 20px;"><strong>Páginas testadas:</strong> ${summary.pagesCount}</p>
  </div>

  <h2>📋 Resultados por Página</h2>
  <table>
    <thead>
      <tr>
        <th>Página</th>
        <th>Botão</th>
        <th>Status</th>
        <th>Detalhes</th>
      </tr>
    </thead>
    <tbody>
      ${results
        .map(
          (r) => `
        <tr>
          <td>${r.page}</td>
          <td>${r.buttonText}</td>
          <td><span class="status ${r.status}">${r.status === 'success' ? '✅' : r.status === 'warning' ? '⚠️' : '❌'} ${r.status.toUpperCase()}</span></td>
          <td>${r.error ? `<span class="error-detail" title="${r.error}">${r.error}</span>` : '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2 style="margin-top: 40px;">🔧 Próximos Passos</h2>
  <div class="summary">
    ${summary.authMethod === 'mock' ? `
      <h3 style="color: #856404;">⚠️ Autenticação Mock Ativa</h3>
      <p>Os testes usaram dados FAKE porque o login real não funcionou.</p>
      <p><strong>Você precisa corrigir o login!</strong> Veja: <code>tests/diagnostics/login-diagnosis.md</code></p>
    ` : `
      <h3 style="color: #155724;">✅ Autenticação Real Funcionou</h3>
      <p>Os testes usaram login real da API.</p>
    `}
    
    <h3 style="margin-top: 20px;">Erros Encontrados:</h3>
    <ul>
      ${summary.topErrors.map((err: string) => `<li>${err}</li>`).join('')}
    </ul>
  </div>

  <p style="margin-top: 40px; color: #666; font-size: 12px;">
    Gerado por: Agente de QA Autônomo com Auto-Bypass<br>
    ${new Date().toISOString()}
  </p>
</body>
</html>
  `;

  const htmlPath = path.join(process.cwd(), 'playwright-report', 'button-test-report.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`📁 Relatório HTML salvo em: ${htmlPath}`);
}

/**
 * Testes
 */
test.describe('QA com Auto-Bypass de Autenticação', () => {
  test.beforeAll(async () => {
    // Criar pasta para screenshots
    const screenshotsDir = path.join(process.cwd(), 'playwright-report', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Verificar se storageState existe
    const storageStatePath = path.join(process.cwd(), 'storageState.json');
    if (!fs.existsSync(storageStatePath)) {
      console.warn('\n⚠️  storageState.json não encontrado!');
      console.warn('   Execute: npm run test:setup\n');
    }
  });

  test('Testar todos os botões em todas as páginas', async ({ page }) => {
    console.log('\n🤖 Iniciando testes de botões com bypass de auth...\n');

    // Injetar dados de auth no localStorage (redundância de segurança)
    await page.addInitScript(() => {
      // Se já tem no storage, não sobrescrever
      if (!localStorage.getItem('bil_cinema_user')) {
        const userData = {
          id: 'test-admin-123',
          name: 'Admin Teste',
          email: 'cabecadeefeitocine@gmail.com',
          role: 'admin',
        };
        localStorage.setItem('bil_cinema_user', JSON.stringify(userData));
        localStorage.setItem('auth_test', '1');
      }
    });

    // Testar cada página
    for (const pageInfo of PAGES_TO_TEST) {
      try {
        console.log(`\n📄 Testando página: ${pageInfo.name} (${pageInfo.path})`);

        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Encontrar botões
        const buttons = await findAllButtons(page);
        console.log(`   Encontrados ${buttons.length} botões`);

        // Testar cada botão
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          console.log(`   [${i + 1}/${buttons.length}] Testando: "${button.text}"`);

          const result = await clickButtonAndCheck(page, button, pageInfo.name, page.url());
          allResults.push(result);

          if (result.status === 'success') {
            console.log(`      ✅ Sucesso`);
          } else if (result.status === 'warning') {
            console.log(`      ⚠️  Warning: ${result.error}`);
          } else {
            console.log(`      ❌ Erro: ${result.error}`);
          }

          // Voltar para a página original
          try {
            await page.goto(pageInfo.path);
            await page.waitForLoadState('networkidle', { timeout: 5000 });
          } catch (error) {
            console.log(`      ⚠️  Não foi possível voltar para ${pageInfo.path}`);
          }
        }
      } catch (error: any) {
        console.error(`   ❌ Erro ao testar página ${pageInfo.name}: ${error.message}`);
      }
    }
  });

  test.afterAll(async () => {
    // Aguardar um pouco para garantir que tudo foi salvo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n\n📊 ========== RELATÓRIO FINAL ==========\n');

    // Estatísticas
    const total = allResults.length;
    const success = allResults.filter((r) => r.status === 'success').length;
    const warnings = allResults.filter((r) => r.status === 'warning').length;
    const errors = allResults.filter((r) => r.status === 'error').length;

    console.log(`Total de botões testados: ${total}`);
    console.log(`✅ Sucessos: ${success} (${total > 0 ? ((success / total) * 100).toFixed(1) : 0}%)`);
    console.log(`⚠️  Warnings: ${warnings} (${total > 0 ? ((warnings / total) * 100).toFixed(1) : 0}%)`);
    console.log(`❌ Erros: ${errors} (${total > 0 ? ((errors / total) * 100).toFixed(1) : 0}%)`);

    // Top erros
    const topErrors = allResults
      .filter((r) => r.status === 'error')
      .slice(0, 5)
      .map((r) => `${r.page} - "${r.buttonText}": ${r.error}`);

    // Determinar método de auth
    let authMethod = 'real';
    try {
      const authResultPath = path.join(process.cwd(), 'tests', 'diagnostics', 'auth-setup-result.json');
      if (fs.existsSync(authResultPath)) {
        const authResult = JSON.parse(fs.readFileSync(authResultPath, 'utf-8'));
        authMethod = authResult.result.method === 'mock-storage' ? 'mock' : 'real';
      }
    } catch (error) {
      // Ignorar
    }

    // Salvar JSON
    const reportPath = path.join(process.cwd(), 'playwright-report', 'button-test-results.json');
    const pagesCount = new Set(allResults.map((r) => r.page)).size;
    
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          summary: {
            total,
            success,
            warnings,
            errors,
            successRate: `${total > 0 ? ((success / total) * 100).toFixed(1) : 0}%`,
            warningRate: `${total > 0 ? ((warnings / total) * 100).toFixed(1) : 0}%`,
            errorRate: `${total > 0 ? ((errors / total) * 100).toFixed(1) : 0}%`,
            pagesCount,
            authMethod,
            topErrors,
          },
          results: allResults,
        },
        null,
        2
      )
    );

    console.log(`\n📁 Relatório JSON salvo em: ${reportPath}`);

    // Gerar HTML
    generateHTMLReport(allResults, {
      total,
      success,
      warnings,
      errors,
      successRate: `${total > 0 ? ((success / total) * 100).toFixed(1) : 0}%`,
      warningRate: `${total > 0 ? ((warnings / total) * 100).toFixed(1) : 0}%`,
      errorRate: `${total > 0 ? ((errors / total) * 100).toFixed(1) : 0}%`,
      pagesCount,
      authMethod,
      topErrors,
    });

    console.log('\n========================================\n');
  });
});

