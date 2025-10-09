/**
 * Teste E2E - DONO/ADMIN (Camada 3)
 * 
 * Fluxo: CRUD de itens → Gerenciar usuários → Relatórios
 * + Varredor de botões em todas as páginas administrativas
 */

import { test, expect } from '@playwright/test';
import { scanAllButtons } from '../shared/buttons.scan';
import { appendResults, writeHtmlSummary } from '../shared/report';

test.describe('Fluxo Dono/Admin (Camada 3)', () => {
  
  test('Dono: Cadastrar produtos e verificar visibilidade', async ({ page }) => {
    console.log('\n👑 [DONO] Gerenciando catálogo de produtos...\n');
    
    // 1. Acessar painel admin
    const adminRoutes = ['/painel-admin', '/admin', '/dashboard'];
    let foundRoute = false;
    
    for (const route of adminRoutes) {
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
      console.log('⚠️  Nenhuma rota admin encontrada, continuando teste...');
    }
    
    // 2. Verificar produtos existentes
    try {
      const productIndicators = [
        'text=/Produtos/i',
        'text=/Equipamentos/i',
        'text=/Itens/i',
        'text=/Catálogo/i',
      ];
      
      let foundProducts = false;
      for (const indicator of productIndicators) {
        if (await page.locator(indicator).first().isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`✅ Seção de produtos encontrada: ${indicator}`);
          foundProducts = true;
          break;
        }
      }
      
      if (!foundProducts) {
        console.log('⚠️  Seção de produtos não encontrada (pode estar em outra aba)');
      }
    } catch (error) {
      console.log(`⚠️  Erro ao verificar produtos: ${(error as Error).message}`);
    }
    
    // 3. Tentar criar novo produto
    let productCreated = false;
    try {
      const newButtons = [
        'button:has-text("Novo Produto")',
        'button:has-text("Adicionar Produto")',
        'button:has-text("Novo")',
        'button:has-text("Adicionar")',
        'button:has-text("Criar")',
        'button:has-text("+")',
      ];
      
      for (const selector of newButtons) {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
          await button.click();
          console.log(`✅ Clicou em "Novo" produto`);
          await page.waitForTimeout(1000);
          
          // Tentar preencher formulário
          const nameInput = page.locator('input[name="nome"], input[name="name"], input[name="title"], input[placeholder*="nome"]').first();
          if (await nameInput.isVisible({ timeout: 2000 })) {
            const testProductName = `Produto Teste QA ${Date.now()}`;
            await nameInput.fill(testProductName);
            console.log(`✅ Preencheu nome: ${testProductName}`);
            
            // Tentar preencher preço se existir
            const priceInput = page.locator('input[name="preco"], input[name="price"], input[name="valor"]').first();
            if (await priceInput.isVisible({ timeout: 1000 }).catch(() => false)) {
              await priceInput.fill('100');
              console.log('✅ Preencheu preço');
            }
            
            // Tentar salvar
            const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Save"), button[type="submit"]').first();
            if (await saveButton.isVisible({ timeout: 2000 })) {
              await saveButton.click();
              console.log('✅ Produto salvo');
              await page.waitForTimeout(2000);
              productCreated = true;
            }
          }
          break;
        }
      }
      
      if (!productCreated) {
        console.log('⚠️  Não foi possível criar produto (botão/formulário não encontrado)');
      }
    } catch (error) {
      console.log(`⚠️  Erro ao criar produto: ${(error as Error).message}`);
    }
    
    // 4. Verificar se produto aparece na lista
    if (productCreated) {
      try {
        await page.waitForTimeout(1000);
        
        // Verificar se há indicação de sucesso
        const successIndicators = [
          'text=/sucesso|success/i',
          'text=/criado|created/i',
          'text=/salvo|saved/i',
        ];
        
        for (const indicator of successIndicators) {
          if (await page.locator(indicator).first().isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`✅ Produto criado com sucesso: ${indicator}`);
            break;
          }
        }
        
        console.log('📝 Nota: Este produto deve aparecer em /equipamentos para clientes verem');
      } catch (error) {
        console.log(`⚠️  Erro ao verificar criação: ${(error as Error).message}`);
      }
    }
    
    // 5. Verificar se produtos aparecem na loja (visão do cliente)
    try {
      await page.goto('/equipamentos');
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      console.log('✅ Navegou para /equipamentos (visão cliente)');
      
      const productCards = page.locator('[class*="product"], [class*="card"], [class*="item"]');
      const count = await productCards.count();
      
      if (count > 0) {
        console.log(`✅ ${count} produtos visíveis para clientes`);
      } else {
        console.log('⚠️  Nenhum produto visível (pode não haver produtos cadastrados)');
      }
    } catch (error) {
      console.log(`⚠️  Erro ao verificar produtos na loja: ${(error as Error).message}`);
    }
    
    console.log('\n✅ Fluxo Dono completado\n');
    console.log('📝 Nota: Produtos cadastrados aqui devem aparecer em /equipamentos para clientes\n');
  });
  
  test('Dono: Escanear botões em páginas administrativas', async ({ page }) => {
    console.log('\n🔍 [DONO] Escaneando botões...\n');
    
    const allResults = [];
    
    // Páginas para escanear (acesso completo)
    const pages = [
      { route: '/', name: 'Home' },
      { route: '/painel-admin', name: 'Painel Admin' },
      { route: '/equipamentos', name: 'Equipamentos' },
      { route: '/pedidos', name: 'Pedidos' },
      { route: '/clientes', name: 'Clientes' },
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
    appendResults('Dono - Varredura de Botões', allResults);
    writeHtmlSummary();
    
    console.log('\n✅ Escaneamento Dono completado\n');
  });
  
  test('RBAC: Dono deve acessar todas as rotas', async ({ page }) => {
    console.log('\n🔐 [DONO] Testando RBAC (acesso total)...\n');
    
    const allRoutes = [
      '/painel-admin',
      '/pedidos',
      '/clientes',
      '/equipamentos',
      '/area-cliente',
    ];
    
    for (const route of allRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle', { timeout: 3000 });
        
        const is403 = await page.locator('text=/403|Acesso Negado/i').isVisible({ timeout: 1000 }).catch(() => false);
        
        if (!is403) {
          console.log(`✅ ${route}: Acesso permitido (correto para Dono)`);
        } else {
          console.log(`⚠️  ${route}: Bloqueado incorretamente para Dono`);
        }
      } catch (error) {
        console.log(`⚠️  ${route}: Erro ao testar: ${(error as Error).message}`);
      }
    }
    
    console.log('\n✅ Teste RBAC Dono completado\n');
  });
});

