/**
 * Varredor de Botões - QA Autônomo
 * 
 * Coleta e testa todos os botões visíveis em uma página
 */

import { Page } from '@playwright/test';

export interface ButtonScanResult {
  pagePath: string;
  label: string;
  selectorHint: string;
  ok: boolean;
  errors: string[];
  failedRequests: string[];
  consoleErrors: string[];
}

const BUTTON_SELECTORS = [
  'button',
  '[role="button"]',
  '[type="button"]',
  '.btn',
  'a.button',
];

/**
 * Escaneia todos os botões visíveis e testa cliques
 */
export async function scanAllButtons(page: Page): Promise<ButtonScanResult[]> {
  const results: ButtonScanResult[] = [];
  const pagePath = page.url().replace(page.context().pages()[0].url().split('/').slice(0, 3).join('/'), '');
  
  console.log(`\n🔍 Escaneando botões em: ${pagePath}`);
  
  for (const selector of BUTTON_SELECTORS) {
    try {
      const buttons = await page.locator(selector).all();
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        
        try {
          const isVisible = await button.isVisible({ timeout: 1000 }).catch(() => false);
          if (!isVisible) continue;
          
          // Obter texto/label do botão
          const text = await button.innerText().catch(() => '');
          const ariaLabel = await button.getAttribute('aria-label').catch(() => '');
          const title = await button.getAttribute('title').catch(() => '');
          const label = text || ariaLabel || title || `[${selector}:${i}]`;
          
          // Capturar erros
          const errors: string[] = [];
          const failedRequests: string[] = [];
          const consoleErrors: string[] = [];
          
          // Listeners
          const consoleListener = (msg: any) => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          };
          
          const responseListener = (response: any) => {
            if (response.status() >= 400) {
              failedRequests.push(`${response.status()} ${response.request().method()} ${response.url()}`);
            }
          };
          
          const pageerrorListener = (error: Error) => {
            errors.push(`Page error: ${error.message}`);
          };
          
          page.on('console', consoleListener);
          page.on('response', responseListener);
          page.on('pageerror', pageerrorListener);
          
          let ok = true;
          
          try {
            // Scroll e clique (otimizado para velocidade)
            await button.scrollIntoViewIfNeeded({ timeout: 2000 });
            await page.waitForTimeout(100); // Reduzido de 200ms
            await button.click({ timeout: 3000 }); // Reduzido de 5000ms
            await page.waitForTimeout(300); // Reduzido de 500ms
            
            // Verificar se houve erros
            if (consoleErrors.length > 0 || failedRequests.length > 0 || errors.length > 0) {
              ok = false;
            }
          } catch (error: any) {
            ok = false;
            errors.push(error.message);
          } finally {
            // Remover listeners
            page.off('console', consoleListener);
            page.off('response', responseListener);
            page.off('pageerror', pageerrorListener);
          }
          
          results.push({
            pagePath,
            label: label.trim().substring(0, 50),
            selectorHint: `${selector}:nth(${i})`,
            ok,
            errors,
            failedRequests,
            consoleErrors,
          });
          
          if (ok) {
            console.log(`   ✅ ${label}`);
          } else {
            console.log(`   ❌ ${label}: ${errors[0] || failedRequests[0] || consoleErrors[0]}`);
          }
          
          // Voltar para a página original
          try {
            await page.goto(page.url());
            await page.waitForLoadState('networkidle', { timeout: 3000 });
          } catch {
            // Ignorar se já estiver na mesma página
          }
        } catch (error) {
          // Ignorar botões que não podem ser testados
          continue;
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao escanear ${selector}: ${(error as Error).message}`);
    }
  }
  
  console.log(`\n📊 Total: ${results.length} botões | ✅ ${results.filter(r => r.ok).length} OK | ❌ ${results.filter(r => !r.ok).length} Erros\n`);
  
  return results;
}

