/**
 * Setup de Autenticação - DONO / ADMIN
 * Perfil: Camada 3 (Acesso completo)
 * 
 * Tenta login real via API. Se falhar, cria mock para testes E2E.
 * ⚠️ APENAS PARA TESTES E2E - NÃO USAR EM PRODUÇÃO
 */

import { chromium, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.APP_URL || 'http://localhost:8081';

const OWNER_CREDENTIALS = {
  email: 'cabecadeefeitocine@gmail.com',
  password: 'admin123',
  role: 'ADMIN',
  displayName: 'Dono da Locadora',
};

interface AuthResult {
  success: boolean;
  method: 'real-api' | 'mock-storage';
  message: string;
  error?: string;
}

async function tryRealLogin(): Promise<AuthResult> {
  console.log('\n🔐 [DONO] Tentando login real via API...');
  console.log(`   Email: ${OWNER_CREDENTIALS.email}`);

  try {
    const apiContext = await request.newContext({ baseURL: BASE_URL });
    const response = await apiContext.post('/api/auth/login', {
      data: {
        email: OWNER_CREDENTIALS.email,
        password: OWNER_CREDENTIALS.password,
      },
      timeout: 10000,
    });

    console.log(`   Status: ${response.status()}`);

    if (response.ok()) {
      const data = await response.json();
      console.log('   ✅ Login real bem-sucedido!');

      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(BASE_URL);

      if (data.token) {
        await page.evaluate((token) => {
          localStorage.setItem('token', token);
        }, data.token);
      }

      if (data.user) {
        await page.evaluate((user) => {
          localStorage.setItem('bil_cinema_user', JSON.stringify(user));
        }, data.user);
      }

      await context.storageState({ path: 'storage/owner.json' });
      await browser.close();

      return {
        success: true,
        method: 'real-api',
        message: 'Login real via API funcionou. StorageState salvo.',
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
    console.log(`   ❌ Erro: ${error.message}`);
    return {
      success: false,
      method: 'real-api',
      message: 'Erro ao conectar com API de login',
      error: error.message,
    };
  }
}

async function createMockAuth(): Promise<AuthResult> {
  console.log('\n🔧 [DONO] Criando mock de autenticação...');

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(BASE_URL);

    await page.evaluate((creds) => {
      const mockToken = btoa(JSON.stringify({
        userId: 'owner-mock-123',
        email: creds.email,
        role: creds.role,
        exp: Date.now() + 86400000,
      }));

      localStorage.setItem('token', `MOCK.${mockToken}.TEST`);

      const userData = {
        id: 'owner-mock-123',
        name: creds.displayName,
        email: creds.email,
        phone: '(31) 3568-8485',
        document: '12.345.678/0001-90',
        address: 'Admin Address',
        role: 'admin',
      };
      localStorage.setItem('bil_cinema_user', JSON.stringify(userData));
      localStorage.setItem('auth_test', '1');
      localStorage.setItem('is_authenticated', 'true');
    }, OWNER_CREDENTIALS);

    await context.addCookies([
      {
        name: 'auth_test_owner',
        value: '1',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await context.storageState({ path: 'storage/owner.json' });
    await browser.close();

    console.log('   ✅ Mock criado com sucesso!');
    console.log('   ⚠️  Usando dados MOCK - não é login real');

    return {
      success: true,
      method: 'mock-storage',
      message: 'Mock de autenticação criado para testes.',
    };
  } catch (error: any) {
    return {
      success: false,
      method: 'mock-storage',
      message: 'Erro ao criar mock',
      error: error.message,
    };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🤖 SETUP AUTH - DONO (Camada 3)');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Base URL: ${BASE_URL}`);

  const realLoginResult = await tryRealLogin();

  if (realLoginResult.success) {
    console.log('\n✅ AUTH REAL OK - storage/owner.json criado');
    return;
  }

  console.log('\n⚠️  AUTH REAL FALHOU - criando fallback mock...');
  console.log(`   Motivo: ${realLoginResult.message}`);

  const mockResult = await createMockAuth();

  if (mockResult.success) {
    console.log('\n✅ MOCK AUTH OK - storage/owner.json criado com dados mock');
  } else {
    console.log('\n❌ FALHA TOTAL - não foi possível criar auth');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════\n');
}

main();

