/**
 * Simulador de Comportamento Humano
 * 
 * Faz o bot agir como uma pessoa real usando o sistema
 */

import { Page, Locator } from '@playwright/test';

/**
 * Delay aleatório entre min e max ms (comportamento humano)
 */
export async function humanDelay(min: number = 500, max: number = 2000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Clique como humano (move mouse, pausa, clica)
 */
export async function humanClick(locator: Locator, page: Page) {
  try {
    // Scroll suave até o elemento
    await locator.scrollIntoViewIfNeeded();
    await humanDelay(200, 500);
    
    // Mover mouse até o elemento (hover)
    await locator.hover();
    await humanDelay(100, 300);
    
    // Clicar
    await locator.click();
    await humanDelay(300, 800);
  } catch (error) {
    // Fallback: clique direto se hover falhar
    await locator.click({ timeout: 5000 });
  }
}

/**
 * Digitar como humano (letra por letra com delays variáveis)
 */
export async function humanType(locator: Locator, text: string) {
  await locator.click();
  await humanDelay(100, 300);
  
  // Limpar campo primeiro
  await locator.clear();
  await humanDelay(100, 200);
  
  // Digitar letra por letra
  for (let i = 0; i < text.length; i++) {
    await locator.pressSequentially(text[i], { delay: Math.random() * 150 + 50 });
  }
  
  await humanDelay(200, 500);
}

/**
 * Ler a página (simula pessoa lendo antes de agir)
 */
export async function humanRead(page: Page, duration: number = 1000) {
  // Scroll suave para baixo e para cima (como pessoa lendo)
  try {
    await page.evaluate(async (readDuration) => {
      const scrollAmount = 200;
      const steps = Math.floor(readDuration / 300);
      
      for (let i = 0; i < steps; i++) {
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        await new Promise(r => setTimeout(r, 300));
      }
      
      // Voltar ao topo suavemente
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, duration);
  } catch {
    // Fallback simples
    await humanDelay(duration, duration + 500);
  }
}

/**
 * Procurar elemento na página (simula pessoa procurando)
 */
export async function humanSearch(page: Page, locator: Locator): Promise<boolean> {
  try {
    // Scroll aleatório como se estivesse procurando
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollBy({ 
          top: Math.random() * 300 - 150, 
          behavior: 'smooth' 
        });
      });
      await humanDelay(200, 400);
    }
    
    // Verificar se encontrou
    const isVisible = await locator.isVisible({ timeout: 2000 });
    if (isVisible) {
      // Scroll até o elemento
      await locator.scrollIntoViewIfNeeded();
      await humanDelay(300, 600);
    }
    return isVisible;
  } catch {
    return false;
  }
}

/**
 * Hesitar (simula pessoa pensando)
 */
export async function humanHesitate() {
  await humanDelay(800, 2000);
}

/**
 * Verificar resultado (simula pessoa conferindo o que fez)
 */
export async function humanVerify(page: Page) {
  // Scroll suave pela página para conferir
  await page.evaluate(() => {
    window.scrollBy({ top: 150, behavior: 'smooth' });
  });
  await humanDelay(500, 1000);
  
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await humanDelay(300, 600);
}

/**
 * Navegar como humano (com transição suave)
 */
export async function humanNavigate(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  
  // Simular pessoa olhando a página que carregou
  await humanRead(page, 800);
}

/**
 * Preencher formulário como humano
 */
export async function humanFillForm(fields: { locator: Locator; value: string; label: string }[]) {
  for (const field of fields) {
    console.log(`   📝 Preenchendo "${field.label}"...`);
    
    // Pessoa procura o campo
    await humanDelay(200, 500);
    
    // Clica no campo
    await field.locator.scrollIntoViewIfNeeded();
    await humanDelay(100, 300);
    await field.locator.click();
    await humanDelay(100, 200);
    
    // Digita
    await humanType(field.locator, field.value);
    
    console.log(`   ✅ "${field.label}" preenchido`);
  }
  
  // Pessoa revisa o formulário
  console.log('   👀 Revisando formulário...');
  await humanHesitate();
}

/**
 * Simular erro humano (às vezes errar e corrigir)
 */
export async function humanMistake(locator: Locator, wrongText: string, rightText: string) {
  // Digitar errado
  await humanType(locator, wrongText);
  await humanDelay(300, 600);
  
  // Perceber o erro
  await humanDelay(500, 1000);
  
  // Corrigir
  await locator.click();
  await locator.clear();
  await humanDelay(200, 400);
  await humanType(locator, rightText);
}

/**
 * Comportamento de compra (olhar produtos, comparar)
 */
export async function humanBrowseProducts(page: Page, productCards: Locator) {
  const count = await productCards.count();
  
  if (count === 0) return;
  
  console.log(`   👀 Olhando ${count} produtos disponíveis...`);
  
  // Olhar alguns produtos aleatoriamente
  const productsToView = Math.min(3, count);
  
  for (let i = 0; i < productsToView; i++) {
    const randomIndex = Math.floor(Math.random() * count);
    const product = productCards.nth(randomIndex);
    
    try {
      await product.scrollIntoViewIfNeeded();
      await humanDelay(500, 1200);
      
      // Às vezes hover sobre o produto
      if (Math.random() > 0.5) {
        await product.hover();
        await humanDelay(300, 600);
      }
    } catch {
      continue;
    }
  }
}

/**
 * Simular decisão (pensar antes de confirmar ação importante)
 */
export async function humanDecide(action: string) {
  console.log(`   🤔 Pensando sobre: ${action}...`);
  await humanDelay(1000, 2500);
}

/**
 * Movimento natural do mouse na página
 */
export async function humanMouseMove(page: Page) {
  try {
    await page.mouse.move(
      Math.random() * 800 + 100,
      Math.random() * 400 + 100,
      { steps: 10 }
    );
  } catch {
    // Ignorar se falhar
  }
}

/**
 * Simular pessoa distraída (olha outras coisas na página)
 */
export async function humanDistracted(page: Page) {
  if (Math.random() > 0.7) { // 30% de chance de se distrair
    console.log('   💭 Olhando outras coisas na página...');
    
    await page.evaluate(() => {
      window.scrollBy({ 
        top: Math.random() * 200 - 100, 
        behavior: 'smooth' 
      });
    });
    
    await humanDelay(800, 1500);
    
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/**
 * Simular satisfação/frustração com resultado
 */
export async function humanReaction(success: boolean, action: string) {
  if (success) {
    console.log(`   😊 "${action}" realizado com sucesso!`);
    await humanDelay(300, 600);
  } else {
    console.log(`   😕 Tentativa de "${action}" não funcionou como esperado`);
    await humanHesitate();
  }
}

