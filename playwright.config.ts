import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração Playwright Multi-Project
 * Sistema Command-D - QA 3 Camadas (Dono/Funcionário/Cliente)
 * 
 * Cada perfil tem seu próprio storageState e testes isolados
 */
export default defineConfig({
  testDir: './tests',
  
  // Timeout por teste (aumentado para comportamento humano)
  timeout: 240 * 1000, // 4 minutos para comportamento humano realista
  
  // Timeout para expectativas
  expect: {
    timeout: 15000, // 15s para ações individuais
  },
  
  // Relatórios
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/e2e-results.json' }],
    ['list'],
  ],
  
  // Configurações compartilhadas
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:8080',
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on',
    navigationTimeout: 30000,
    actionTimeout: 10000,
  },
  
  // Projetos por Perfil (3 Camadas)
  projects: [
    // CAMADA 3: Dono / Admin (Acesso Total)
    {
      name: 'owner',
      testMatch: /.*owner\.flow\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'storage/owner.json',
      },
    },
    
    // CAMADA 2: Funcionário (Gerenciar Pedidos, Aprovar)
    {
      name: 'employee',
      testMatch: /.*employee\.flow\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'storage/employee.json',
      },
    },
    
    // CAMADA 1: Cliente (Fazer Pedidos, Acompanhar)
    {
      name: 'client',
      testMatch: /.*client\.flow\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'storage/client.json',
      },
    },
  ],
});

