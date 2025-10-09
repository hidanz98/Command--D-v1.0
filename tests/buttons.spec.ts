import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bot de QA Automático - Sistema Command-D
 * Testa todos os botões em todas as páginas
 */

interface ButtonTestResult {
  page: string;
  buttonText: string;
  buttonSelector: string;
  status: 'success' | 'error' | 'warning';
  error?: string;
  screenshot?: string;
  timestamp: string;
}

interface UserCredentials {
  role: string;
  email: string;
  password: string;
}

const USERS: UserCredentials[] = [
  {
    role: 'Admin',
    email: 'cabecadeefeitocine@gmail.com',
    password: 'admin123',
  },
  {
    role: 'Funcionário',
    email: 'funcionario@empresa.com',
    password: 'admin123',
  },
  {
    role: 'Cliente',
    email: 'joao.silva@email.com',
    password: '123456',
  },
];

// Páginas para testar (após login)
const PAGES_TO_TEST = [
  { url: '/', name: 'Home' },
  { url: '/equipamentos', name: 'Equipamentos' },
  { url: '/carrinho', name: 'Carrinho' },
  { url: '/painel-admin', name: 'Painel Admin' },
  { url: '/area-cliente', name: 'Área Cliente' },
];

// Seletores de botões
const BUTTON_SELECTORS = [
  'button',
  '[role="button"]',
  '[type="button"]',
  '[type="submit"]',
  '.btn',
  'a.button',
];

let allResults: ButtonTestResult[] = [];

/**
 * Função para fazer login
 */
async function login(page: Page, credentials: UserCredentials) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Preencher email
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.fill(credentials.email);
  await page.waitForTimeout(500);

  // Preencher senha
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.fill(credentials.password);
  await page.waitForTimeout(500);

  // Garantir que o botão de login esteja habilitado e visível
  const loginButton = page.locator('button:has-text("Entrar"), button[type="submit"]').first();
  await loginButton.waitFor({ state: 'visible' });
  await expect(loginButton).toBeEnabled();
  
  // Capturar erros de console
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await loginButton.click();

  // Aguardar um pouco para o React processar o clique e executar o login
  await page.waitForTimeout(2000);

  // Verificar se ainda está na página de login (indicaria falha) ou se navegou
  const currentURL = page.url();
  const isStillOnLogin = currentURL.includes('/login');

  if (isStillOnLogin) {
    // Login falhou - ainda está na página de login
    return { success: false, errors: consoleErrors, error: 'Login failed - still on /login page after click' };
  }

  // Login bem-sucedido - navegou para outra página
  return { success: true, errors: consoleErrors };
}

/**
 * Função para encontrar todos os botões visíveis na página
 */
async function findAllButtons(page: Page): Promise<{ element: any; text: string; selector: string }[]> {
  const buttons = [];

  for (const selector of BUTTON_SELECTORS) {
    const elements = await page.locator(selector).all();

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      // Verificar se o botão está visível
      try {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;

        // Obter texto do botão
        const text = await element.innerText().catch(() => '');
        const ariaLabel = await element.getAttribute('aria-label').catch(() => '');
        const title = await element.getAttribute('title').catch(() => '');
        
        const buttonText = text || ariaLabel || title || `[${selector}]`;
        
        buttons.push({
          element,
          text: buttonText.trim().substring(0, 50), // Limitar tamanho
          selector: `${selector}:nth-of-type(${i + 1})`,
        });
      } catch (error) {
        // Ignorar elementos que não podem ser acessados
        continue;
      }
    }
  }

  return buttons;
}

/**
 * Função para clicar em um botão e verificar erros
 */
async function clickButtonAndCheck(
  page: Page,
  button: { element: any; text: string; selector: string },
  pageName: string,
  context: BrowserContext
): Promise<ButtonTestResult> {
  const result: ButtonTestResult = {
    page: pageName,
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

  // Monitorar requests com erro (4xx, 5xx)
  const failedRequests: string[] = [];
  const responseListener = (response: any) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  };
  page.on('response', responseListener);

  try {
    // Scroll até o botão
    await button.element.scrollIntoViewIfNeeded();
    
    // Aguardar um pouco
    await page.waitForTimeout(500);

    // Clicar no botão
    await button.element.click({ timeout: 5000 });

    // Aguardar possíveis mudanças
    await page.waitForTimeout(1000);

    // Verificar se houve erros
    if (consoleErrors.length > 0) {
      result.status = 'warning';
      result.error = `Console errors: ${consoleErrors.join(', ')}`;
    }

    if (failedRequests.length > 0) {
      result.status = 'error';
      result.error = `Failed requests: ${failedRequests.join(', ')}`;
      
      // Tirar screenshot
      const screenshotPath = `playwright-report/screenshots/${pageName}-${button.text.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshot = screenshotPath;
    }

  } catch (error: any) {
    result.status = 'error';
    result.error = error.message;

    // Tirar screenshot do erro
    const screenshotPath = `playwright-report/screenshots/${pageName}-${button.text.replace(/[^a-zA-Z0-9]/g, '_')}-error.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshot = screenshotPath;
  } finally {
    // Remover listeners
    page.off('console', consoleListener);
    page.off('response', responseListener);
  }

  return result;
}

/**
 * Teste principal: Login e teste de botões
 */
test.describe('Bot QA - Teste de Todos os Botões', () => {
  
  // Criar pasta para screenshots
  test.beforeAll(async () => {
    const screenshotsDir = path.join(process.cwd(), 'playwright-report', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  // Testar cada perfil de usuário
  for (const user of USERS) {
    test.describe(`Testes como ${user.role}`, () => {
      
      test(`Login como ${user.role}`, async ({ page, context }) => {
        console.log(`\n🔐 Fazendo login como ${user.role}...`);
        
        const loginResult = await login(page, user);
        
        if (!loginResult.success) {
          console.error(`❌ Falha no login: ${loginResult.error}`);
          expect(loginResult.success).toBeTruthy();
          return;
        }
        
        console.log(`✅ Login como ${user.role} realizado com sucesso!`);
      });

      test(`Testar botões em todas as páginas - ${user.role}`, async ({ page, context }) => {
        console.log(`\n🤖 Testando botões como ${user.role}...\n`);
        
        // Fazer login
        const loginResult = await login(page, user);
        if (!loginResult.success) {
          console.error(`❌ Não foi possível fazer login como ${user.role}`);
          return;
        }

        // Testar cada página
        for (const pageInfo of PAGES_TO_TEST) {
          try {
            console.log(`\n📄 Testando página: ${pageInfo.name} (${pageInfo.url})`);
            
            await page.goto(pageInfo.url);
            await page.waitForLoadState('networkidle');
            
            // Encontrar todos os botões
            const buttons = await findAllButtons(page);
            console.log(`   Encontrados ${buttons.length} botões`);

            // Testar cada botão
            for (let i = 0; i < buttons.length; i++) {
              const button = buttons[i];
              console.log(`   [${i + 1}/${buttons.length}] Testando: "${button.text}"`);
              
              const result = await clickButtonAndCheck(page, button, pageInfo.name, context);
              allResults.push(result);

              if (result.status === 'success') {
                console.log(`      ✅ Sucesso`);
              } else if (result.status === 'warning') {
                console.log(`      ⚠️  Warning: ${result.error}`);
              } else {
                console.log(`      ❌ Erro: ${result.error}`);
              }

              // Voltar para a página original (caso o botão tenha navegado)
              try {
                await page.goto(pageInfo.url);
                await page.waitForLoadState('networkidle');
              } catch (error) {
                console.log(`      ⚠️  Não foi possível voltar para ${pageInfo.url}`);
              }
            }

          } catch (error: any) {
            console.error(`   ❌ Erro ao testar página ${pageInfo.name}: ${error.message}`);
          }
        }
      });
    });
  }

  // Gerar relatórios finais
  test.afterAll(async () => {
    console.log('\n\n📊 ========== RELATÓRIO FINAL ==========\n');
    
    // Estatísticas
    const total = allResults.length;
    const success = allResults.filter((r) => r.status === 'success').length;
    const warnings = allResults.filter((r) => r.status === 'warning').length;
    const errors = allResults.filter((r) => r.status === 'error').length;

    console.log(`Total de botões testados: ${total}`);
    console.log(`✅ Sucessos: ${success} (${((success / total) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${warnings} (${((warnings / total) * 100).toFixed(1)}%)`);
    console.log(`❌ Erros: ${errors} (${((errors / total) * 100).toFixed(1)}%)`);

    // Listar erros
    if (errors > 0) {
      console.log('\n\n❌ BOTÕES COM ERRO:\n');
      allResults
        .filter((r) => r.status === 'error')
        .forEach((r) => {
          console.log(`  • ${r.page} - "${r.buttonText}"`);
          console.log(`    Erro: ${r.error}`);
          if (r.screenshot) {
            console.log(`    Screenshot: ${r.screenshot}`);
          }
          console.log('');
        });
    }

    // Salvar relatório JSON
    const reportPath = path.join(process.cwd(), 'playwright-report', 'button-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        total,
        success,
        warnings,
        errors,
        successRate: `${((success / total) * 100).toFixed(1)}%`,
      },
      results: allResults,
    }, null, 2));

    console.log(`\n📁 Relatório JSON salvo em: ${reportPath}`);
    
    // Gerar relatório HTML simples
    generateHTMLReport(allResults, { total, success, warnings, errors });
    
    console.log('\n========================================\n');
  });
});

/**
 * Gerar relatório HTML
 */
function generateHTMLReport(
  results: ButtonTestResult[],
  summary: { total: number; success: number; warnings: number; errors: number }
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Testes - Bot QA</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stats { display: flex; gap: 20px; }
    .stat { flex: 1; text-align: center; padding: 15px; border-radius: 4px; }
    .stat.success { background: #d4edda; color: #155724; }
    .stat.warning { background: #fff3cd; color: #856404; }
    .stat.error { background: #f8d7da; color: #721c24; }
    .stat h2 { margin: 0; font-size: 36px; }
    .stat p { margin: 5px 0 0 0; }
    table { width: 100%; background: white; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #007bff; color: white; }
    tr:hover { background: #f8f9fa; }
    .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .status.success { background: #d4edda; color: #155724; }
    .status.warning { background: #fff3cd; color: #856404; }
    .status.error { background: #f8d7da; color: #721c24; }
    .error-detail { color: #721c24; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🤖 Relatório de Testes - Bot QA Automático</h1>
  <p><strong>Sistema:</strong> Command-D Multi-Tenant</p>
  <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  
  <div class="summary">
    <h2>📊 Resumo</h2>
    <div class="stats">
      <div class="stat">
        <h2>${summary.total}</h2>
        <p>Total de Botões</p>
      </div>
      <div class="stat success">
        <h2>${summary.success}</h2>
        <p>Sucessos (${((summary.success / summary.total) * 100).toFixed(1)}%)</p>
      </div>
      <div class="stat warning">
        <h2>${summary.warnings}</h2>
        <p>Warnings (${((summary.warnings / summary.total) * 100).toFixed(1)}%)</p>
      </div>
      <div class="stat error">
        <h2>${summary.errors}</h2>
        <p>Erros (${((summary.errors / summary.total) * 100).toFixed(1)}%)</p>
      </div>
    </div>
  </div>

  <h2>📋 Resultados Detalhados</h2>
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
          <td>${r.error ? `<span class="error-detail">${r.error}</span>` : '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>
  `;

  const htmlPath = path.join(process.cwd(), 'playwright-report', 'button-test-report.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`📁 Relatório HTML salvo em: ${htmlPath}`);
}

