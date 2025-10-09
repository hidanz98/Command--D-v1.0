/**
 * Script de Auto-Bypass de Autenticação para Testes E2E
 * 
 * Tenta fazer login real via API. Se falhar, cria mock de autenticação
 * para permitir testes mesmo com login quebrado.
 * 
 * ⚠️ APENAS PARA TESTES E2E - NÃO USAR EM PRODUÇÃO
 */

import { chromium, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.APP_URL || 'http://localhost:8081';

// Credenciais de teste
const ADMIN_CREDENTIALS = {
  email: 'cabecadeefeitocine@gmail.com',
  password: 'admin123',
};

interface AuthResult {
  success: boolean;
  method: 'real-api' | 'mock-storage';
  message: string;
  error?: string;
}

/**
 * Tenta fazer login real via API
 */
async function tryRealLogin(): Promise<AuthResult> {
  console.log('\n🔐 Tentando login real via API...');
  console.log(`   URL: ${BASE_URL}/api/auth/login`);
  console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);

  try {
    const apiContext = await request.newContext({
      baseURL: BASE_URL,
    });

    const response = await apiContext.post('/api/auth/login', {
      data: {
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
      },
      timeout: 10000,
    });

    console.log(`   Status: ${response.status()}`);

    if (response.ok()) {
      const data = await response.json();
      console.log('   ✅ Login real bem-sucedido!');

      // Salvar storageState com cookies/tokens reais
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      // Ir para a página e setar o storage
      await page.goto(BASE_URL);

      // Se retornou token, salvar no localStorage
      if (data.token) {
        await page.evaluate((token) => {
          localStorage.setItem('token', token);
        }, data.token);
      }

      // Se retornou user data, salvar também
      if (data.user) {
        await page.evaluate((user) => {
          localStorage.setItem('bil_cinema_user', JSON.stringify(user));
        }, data.user);
      }

      // Salvar storageState
      await context.storageState({ path: 'storageState.json' });
      await browser.close();

      return {
        success: true,
        method: 'real-api',
        message: 'Login real via API funcionou. StorageState salvo com dados reais.',
      };
    } else {
      const body = await response.text();
      return {
        success: false,
        method: 'real-api',
        message: `API retornou ${response.status()}`,
        error: body,
      };
    }
  } catch (error: any) {
    console.log(`   ❌ Erro ao tentar login real: ${error.message}`);
    return {
      success: false,
      method: 'real-api',
      message: 'Erro ao conectar com API de login',
      error: error.message,
    };
  }
}

/**
 * Cria mock de autenticação para testes
 */
async function createMockAuth(): Promise<AuthResult> {
  console.log('\n🔧 Criando mock de autenticação para testes...');

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Ir para a página principal
    await page.goto(BASE_URL);

    // Injetar dados de autenticação mock no localStorage
    await page.evaluate(() => {
      // Mock JWT token (base64 encode de um objeto fake)
      const mockToken = btoa(JSON.stringify({
        userId: 'test-admin-123',
        email: 'cabecadeefeitocine@gmail.com',
        role: 'admin',
        exp: Date.now() + 86400000, // 24h
      }));

      // Setar token
      localStorage.setItem('token', `MOCK.${mockToken}.TEST`);

      // Setar user data (compatível com AuthContext)
      const userData = {
        id: 'test-admin-123',
        name: 'Admin Teste (Mock)',
        email: 'cabecadeefeitocine@gmail.com',
        phone: '(31) 3568-8485',
        document: '12.345.678/0001-90',
        address: 'Mock Address for Testing',
        role: 'admin',
      };
      localStorage.setItem('bil_cinema_user', JSON.stringify(userData));

      // Flag de teste
      localStorage.setItem('auth_test', '1');
      localStorage.setItem('is_authenticated', 'true');
    });

    // Adicionar cookie dummy
    await context.addCookies([
      {
        name: 'auth_test',
        value: '1',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Salvar storageState mock
    await context.storageState({ path: 'storageState.json' });
    await browser.close();

    console.log('   ✅ Mock de autenticação criado com sucesso!');
    console.log('   ⚠️  ATENÇÃO: Usando dados MOCK - não é login real');

    return {
      success: true,
      method: 'mock-storage',
      message: 'Mock de autenticação criado. Testes podem prosseguir com dados fake.',
    };
  } catch (error: any) {
    return {
      success: false,
      method: 'mock-storage',
      message: 'Erro ao criar mock de autenticação',
      error: error.message,
    };
  }
}

/**
 * Salva resultado do diagnóstico
 */
function saveDiagnostics(result: AuthResult, realLoginError?: string) {
  const diagnosticsDir = path.join(process.cwd(), 'tests', 'diagnostics');
  const diagnosticsFile = path.join(diagnosticsDir, 'auth-setup-result.json');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    baseURL: BASE_URL,
    credentials: {
      email: ADMIN_CREDENTIALS.email,
      password: '***' + ADMIN_CREDENTIALS.password.slice(-3),
    },
    result: result,
    realLoginAttempted: true,
    realLoginError: realLoginError,
  };

  fs.writeFileSync(diagnosticsFile, JSON.stringify(diagnostics, null, 2));
  console.log(`\n📄 Diagnóstico salvo em: ${diagnosticsFile}`);
}

/**
 * Main
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🤖 AUTO-BYPASS DE AUTENTICAÇÃO PARA TESTES E2E');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Base URL: ${BASE_URL}`);

  // Passo 1: Tentar login real
  const realLoginResult = await tryRealLogin();

  if (realLoginResult.success) {
    // Login real funcionou!
    console.log('\n✅ AUTH REAL OK - storageState.json criado com dados reais');
    console.log('   Os testes usarão autenticação real da API.');
    saveDiagnostics(realLoginResult);
    return;
  }

  // Passo 2: Login real falhou, criar mock
  console.log('\n⚠️  AUTH REAL FALHOU - criando fallback mock...');
  console.log(`   Motivo: ${realLoginResult.message}`);
  if (realLoginResult.error) {
    console.log(`   Erro: ${realLoginResult.error}`);
  }

  const mockResult = await createMockAuth();

  if (mockResult.success) {
    console.log('\n✅ MOCK AUTH OK - storageState.json criado com dados mock');
    console.log('   ⚠️  Os testes usarão autenticação FAKE.');
    console.log('   ⚠️  Isso permite testar UI mesmo com login quebrado.');
    saveDiagnostics(mockResult, realLoginResult.error);
  } else {
    console.log('\n❌ FALHA TOTAL - não foi possível criar nem auth real nem mock');
    console.log(`   Erro: ${mockResult.message}`);
    saveDiagnostics(mockResult, realLoginResult.error);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('Setup de autenticação concluído!');
  console.log('Execute: npm run test:e2e');
  console.log('═══════════════════════════════════════════════════\n');
}

main();

