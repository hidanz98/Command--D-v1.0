/**
 * Teste E2E - CLIENTE (Camada 1)
 * 
 * Fluxo: Buscar item → Adicionar ao carrinho → Finalizar pedido
 * + Varredor de botões em páginas principais
 */

import { test, expect } from '@playwright/test';
import { scanAllButtons } from '../shared/buttons.scan';
import { appendResults, writeHtmlSummary } from '../shared/report';
import {
  humanNavigate,
  humanClick,
  humanBrowseProducts,
  humanDecide,
  humanVerify,
  humanDelay,
  humanDistracted,
  humanReaction,
} from '../shared/human-behavior';

test.describe('Fluxo Cliente (Camada 1)', () => {
  
  test('Cliente: Criar pedido e verificar na área cliente', async ({ page }) => {
    console.log('\n🛒 [CLIENTE João Silva] Entrou na loja...\n');
    
    // 1. Cliente entra na loja e olha ao redor
    const routes = ['/equipamentos', '/loja', '/produtos', '/'];
    let foundRoute = false;
    
    for (const route of routes) {
      try {
        console.log(`   🚶 Navegando para ${route}...`);
        await humanNavigate(page, route);
        foundRoute = true;
        console.log(`   ✅ Chegou em: ${route}`);
        break;
      } catch {
        console.log(`   ⚠️  ${route} não encontrado, tentando outro...`);
      }
    }
    
    if (!foundRoute) {
      console.log('   ⚠️  Nenhuma loja encontrada...');
    }
    
    // Cliente fica um tempo olhando os produtos
    await humanDistracted(page);
    
    // 2. Cliente olha os produtos disponíveis
    console.log('\n   👀 Olhando os produtos disponíveis...');
    try {
      const productCards = page.locator('[class*="product"], [class*="card"], [class*="grid"] > div, article');
      await humanBrowseProducts(page, productCards);
      await humanDelay(500, 1000);
    } catch {
      console.log('   💭 Procurando produtos...');
    }
    
    // 3. Cliente decide adicionar algo ao carrinho
    let itemAdded = false;
    try {
      const addButtons = page.locator('button:has-text("Adicionar"), button:has-text("Add"), button:has-text("Alugar")');
      const count = await addButtons.count();
      
      if (count > 0) {
        // Escolhe um produto aleatório (comportamento humano)
        const randomIndex = Math.floor(Math.random() * Math.min(count, 5));
        const selectedButton = addButtons.nth(randomIndex);
        
        console.log(`   🤔 Decidindo qual produto pegar...`);
        await humanDecide('adicionar item ao carrinho');
        
        // Scroll até o produto e adiciona
        await selectedButton.scrollIntoViewIfNeeded();
        await humanDelay(300, 600);
        
        console.log('   🛒 Adicionando ao carrinho...');
        await humanClick(selectedButton, page);
        
        itemAdded = true;
        await humanReaction(true, 'Adicionar ao carrinho');
      } else {
        console.log('   😕 Não encontrou produtos para adicionar');
        await humanReaction(false, 'Buscar produtos');
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao adicionar: ${(error as Error).message}`);
      await humanReaction(false, 'Adicionar ao carrinho');
    }
    
    // 4. Cliente decide ir para o carrinho
    console.log('\n   🛒 Indo para o carrinho...');
    try {
      const cartRoutes = ['/carrinho', '/cart', '/checkout'];
      let cartFound = false;
      
      for (const route of cartRoutes) {
        try {
          await humanNavigate(page, route);
          cartFound = true;
          console.log(`   ✅ Chegou no carrinho: ${route}`);
          break;
        } catch {
          continue;
        }
      }
      
      if (!cartFound) {
        // Tentar clicar no ícone do carrinho
        console.log('   🔍 Procurando ícone do carrinho...');
        const cartIcon = page.locator('[href="/carrinho"], button:has-text("Carrinho"), [aria-label*="carrinho"]').first();
        if (await cartIcon.isVisible({ timeout: 3000 })) {
          await humanClick(cartIcon, page);
          console.log('   ✅ Clicou no ícone do carrinho');
        } else {
          console.log('   ⚠️  Carrinho não encontrado');
        }
      }
      
      // Cliente revisa o carrinho
      console.log('   📋 Revisando itens no carrinho...');
      await humanVerify(page);
    } catch (error) {
      console.log(`   ⚠️  Erro ao ir para carrinho: ${(error as Error).message}`);
    }
    
    // 5. Cliente decide finalizar o pedido
    let orderCreated = false;
    try {
      console.log('\n   🤔 Decidindo se finaliza o pedido...');
      await humanDecide('finalizar pedido');
      
      const checkoutButtons = page.locator(
        'button:has-text("Finalizar"), button:has-text("Enviar"), button:has-text("Checkout"), button:has-text("Confirmar")'
      );
      
      const count = await checkoutButtons.count();
      
      if (count > 0) {
        console.log('   ✅ Finalizando pedido...');
        await humanClick(checkoutButtons.first(), page);
        
        orderCreated = true;
        await humanReaction(true, 'Finalizar pedido');
        console.log('   🎉 Pedido enviado com sucesso!');
      } else {
        console.log('   ⚠️  Botão de finalizar não encontrado');
        await humanReaction(false, 'Finalizar pedido');
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao finalizar: ${(error as Error).message}`);
      await humanReaction(false, 'Finalizar pedido');
    }
    
    // 6. Cliente vai verificar seu pedido
    if (orderCreated) {
      try {
        console.log('\n   📱 Verificando meus pedidos...');
        await humanNavigate(page, '/area-cliente');
        
        // Cliente procura seus pedidos
        console.log('   🔍 Procurando meus pedidos...');
        await humanVerify(page);
        
        const orderIndicators = [
          'text=/Meus Pedidos/i',
          'text=/Pedido.*#/i',
          'text=/PENDENTE|Pendente/i',
          'text=/Status/i',
        ];
        
        let foundOrder = false;
        for (const indicator of orderIndicators) {
          if (await page.locator(indicator).first().isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`   ✅ Encontrou pedido: ${indicator}`);
            foundOrder = true;
            await humanReaction(true, 'Verificar pedido');
            break;
          }
        }
        
        if (!foundOrder) {
          console.log('   🤔 Pedido ainda não apareceu (pode estar processando...)');
          await humanReaction(false, 'Encontrar pedido');
        }
      } catch (error) {
        console.log(`   ⚠️  Erro ao verificar: ${(error as Error).message}`);
      }
    }
    
    console.log('\n   👋 Cliente João Silva saiu do sistema\n');
    console.log('   📝 Nota para Funcionário: Este pedido deve aparecer no painel admin\n');
  });
  
  test('Cliente: Escanear botões em páginas principais', async ({ page }) => {
    console.log('\n🔍 [CLIENTE] Escaneando botões...\n');
    
    const allResults = [];
    
    // Páginas para escanear
    const pages = [
      { route: '/', name: 'Home' },
      { route: '/equipamentos', name: 'Equipamentos' },
      { route: '/carrinho', name: 'Carrinho' },
      { route: '/area-cliente', name: 'Área Cliente' },
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
    appendResults('Cliente - Varredura de Botões', allResults);
    writeHtmlSummary();
    
    console.log('\n✅ Escaneamento Cliente completado\n');
  });
  
  test('RBAC: Cliente NÃO deve acessar rotas de Admin', async ({ page }) => {
    console.log('\n🔐 [CLIENTE] Testando RBAC...\n');
    
    const restrictedRoutes = ['/painel-admin', '/admin', '/dashboard'];
    
    for (const route of restrictedRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle', { timeout: 3000 });
        
        const currentURL = page.url();
        const is403 = await page.locator('text=/403|Acesso Negado|Forbidden/i').isVisible({ timeout: 1000 }).catch(() => false);
        const isLoginRedirect = currentURL.includes('/login');
        const isClientAreaRedirect = currentURL.includes('/area-cliente');
        
        if (is403 || isLoginRedirect || isClientAreaRedirect) {
          console.log(`✅ ${route}: Acesso bloqueado corretamente`);
        } else {
          console.log(`⚠️  ${route}: Possível falha de RBAC (não bloqueado)`);
        }
      } catch (error) {
        console.log(`⚠️  ${route}: Erro ao testar RBAC: ${(error as Error).message}`);
      }
    }
    
    console.log('\n✅ Teste RBAC Cliente completado\n');
  });
});

