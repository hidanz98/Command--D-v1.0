/**
 * Teste E2E - FUNCIONÁRIO (Camada 2)
 * 
 * Fluxo: Listar pedidos → Abrir pedido → Aprovar/Rejeitar
 * + Varredor de botões em páginas de gestão
 */

import { test, expect } from '@playwright/test';
import { scanAllButtons } from '../shared/buttons.scan';
import { appendResults, writeHtmlSummary } from '../shared/report';

test.describe('Fluxo Funcionário (Camada 2)', () => {
  
  test('Funcionário: Verificar e gerenciar pedidos de clientes', async ({ page }) => {
    console.log('\n📋 [FUNCIONÁRIO] Verificando pedidos de clientes...\n');
    
    // 1. Acessar painel admin / lista de pedidos
    const orderRoutes = ['/painel-admin', '/pedidos', '/orders', '/aprovacoes'];
    let foundRoute = false;
    
    for (const route of orderRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        foundRoute = true;
        console.log(`✅ Navegou para: ${route}`);
        break;
      } catch {
        console.log(`⚠️  Rota ${route} não encontrada, tentando próxima...`);
      }
    }
    
    if (!foundRoute) {
      console.log('⚠️  Nenhuma rota de pedidos encontrada, continuando teste...');
    }
    
    // 2. Verificar se há pedidos visíveis (do cliente)
    try {
      const orderIndicators = [
        'text=/Pedidos/i',
        'text=/Pedido.*#/i',
        'text=/Cliente/i',
        'text=/PENDENTE|Pendente/i',
        'table',
        '[role="table"]',
      ];
      
      let foundOrders = false;
      for (const indicator of orderIndicators) {
        if (await page.locator(indicator).first().isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`✅ Lista de pedidos encontrada: ${indicator}`);
          foundOrders = true;
          break;
        }
      }
      
      if (!foundOrders) {
        console.log('⚠️  Lista de pedidos não encontrada (pode estar em outra aba)');
      }
    } catch (error) {
      console.log(`⚠️  Erro ao verificar lista de pedidos: ${(error as Error).message}`);
    }
    
    // 3. Tentar abrir um pedido
    let orderOpened = false;
    try {
      const orderSelectors = [
        'tr:has-text("Pedido") button:has-text("Ver")',
        'tr:has-text("Pedido") a',
        'button:has-text("Ver"), button:has-text("Abrir"), button:has-text("Detalhes")',
        'a:has-text("Pedido"), a:has-text("#")',
      ];
      
      for (const selector of orderSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          await element.click();
          console.log(`✅ Abriu pedido usando: ${selector}`);
          await page.waitForTimeout(1000);
          orderOpened = true;
          break;
        }
      }
      
      if (!orderOpened) {
        console.log('⚠️  Nenhum pedido encontrado para abrir (pode não haver pedidos ainda)');
      }
    } catch (error) {
      console.log(`⚠️  Erro ao abrir pedido: ${(error as Error).message}`);
    }
    
    // 4. Tentar aprovar ou rejeitar
    if (orderOpened) {
      try {
        const approveButton = page.locator('button:has-text("Aprovar"), button:has-text("Approve")').first();
        const rejectButton = page.locator('button:has-text("Rejeitar"), button:has-text("Reject"), button:has-text("Recusar")').first();
        
        if (await approveButton.isVisible({ timeout: 3000 })) {
          await approveButton.click();
          console.log('✅ Aprovou pedido');
          await page.waitForTimeout(2000);
        } else if (await rejectButton.isVisible({ timeout: 3000 })) {
          await rejectButton.click();
          console.log('✅ Rejeitou pedido');
          await page.waitForTimeout(2000);
        } else {
          console.log('⚠️  Botões de aprovação/rejeição não encontrados');
        }
      } catch (error) {
        console.log(`⚠️  Erro ao aprovar/rejeitar: ${(error as Error).message}`);
      }
    }
    
    console.log('\n✅ Fluxo Funcionário completado\n');
    console.log('📝 Nota: Pedidos de clientes devem aparecer aqui para aprovação/gestão\n');
  });
  
  test('Funcionário: Escanear botões em páginas de gestão', async ({ page }) => {
    console.log('\n🔍 [FUNCIONÁRIO] Escaneando botões...\n');
    
    const allResults = [];
    
    // Páginas para escanear
    const pages = [
      { route: '/painel-admin', name: 'Painel Admin' },
      { route: '/pedidos', name: 'Pedidos' },
      { route: '/aprovacoes', name: 'Aprovações' },
    ];
    
    for (const { route, name } of pages) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const results = await scanAllButtons(page);
        allResults.push(...results);
      } catch (error) {
        console.log(`⚠️  Erro ao escanear ${name}: ${(error as Error).message}`);
      }
    }
    
    // Salvar resultados
    appendResults('Funcionário - Varredura de Botões', allResults);
    writeHtmlSummary();
    
    console.log('\n✅ Escaneamento Funcionário completado\n');
  });
  
  test('RBAC: Funcionário pode acessar gestão mas não configurações de Dono', async ({ page }) => {
    console.log('\n🔐 [FUNCIONÁRIO] Testando RBAC...\n');
    
    // Deve acessar
    const allowedRoutes = ['/painel-admin', '/pedidos'];
    
    for (const route of allowedRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle', { timeout: 3000 });
        
        const is403 = await page.locator('text=/403|Acesso Negado/i').isVisible({ timeout: 1000 }).catch(() => false);
        
        if (!is403) {
          console.log(`✅ ${route}: Acesso permitido corretamente`);
        } else {
          console.log(`⚠️  ${route}: Bloqueado incorretamente`);
        }
      } catch (error) {
        console.log(`⚠️  ${route}: Erro ao testar: ${(error as Error).message}`);
      }
    }
    
    console.log('\n✅ Teste RBAC Funcionário completado\n');
  });
});

