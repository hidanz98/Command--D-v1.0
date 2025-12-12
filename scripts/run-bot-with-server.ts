/**
 * 🚀 Script para Executar Bot com Servidor
 * 
 * Inicia o servidor, espera estar pronto, executa o bot e depois finaliza
 */

import { spawn, ChildProcess } from 'child_process';
import * as http from 'http';

let serverProcess: ChildProcess | null = null;

/**
 * Verificar se servidor está respondendo
 */
async function isServerReady(port: number = 8080): Promise<boolean> {
  return new Promise((resolve) => {
    const options = {
      host: 'localhost',
      port: port,
      timeout: 2000,
    };

    const request = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });

    request.on('error', () => {
      resolve(false);
    });

    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });

    request.end();
  });
}

/**
 * Aguardar servidor ficar pronto
 */
async function waitForServer(maxAttempts: number = 30): Promise<boolean> {
  console.log('⏳ Aguardando servidor ficar pronto...');
  
  for (let i = 0; i < maxAttempts; i++) {
    const ready = await isServerReady();
    
    if (ready) {
      console.log('✅ Servidor está pronto!\n');
      return true;
    }
    
    process.stdout.write(`\r   Tentativa ${i + 1}/${maxAttempts}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n❌ Servidor não ficou pronto a tempo');
  return false;
}

/**
 * Iniciar servidor
 */
async function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🚀 Iniciando servidor...\n');

    // Usar npm run dev para iniciar o servidor
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('ready')) {
        console.log('✅ Servidor iniciado com sucesso\n');
        resolve();
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      // Ignorar warnings normais do Vite
      const error = data.toString();
      if (!error.includes('(!) ') && !error.includes('deprecated')) {
        console.error('⚠️  Servidor:', error);
      }
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar servidor:', error);
      reject(error);
    });

    // Dar tempo para o servidor iniciar
    setTimeout(resolve, 5000);
  });
}

/**
 * Parar servidor
 */
async function stopServer(): Promise<void> {
  if (serverProcess) {
    console.log('\n🛑 Parando servidor...');
    
    // Tentar parar gracefully
    serverProcess.kill('SIGTERM');
    
    // Se não parar, forçar
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
    
    serverProcess = null;
    console.log('✅ Servidor parado\n');
  }
}

/**
 * Executar bot
 */
async function runBot(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🤖 Executando Bot de Testes...\n');
    
    const botProcess = spawn('npm', ['run', 'bot'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit',
    });

    botProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Bot finalizou com código ${code}`));
      }
    });

    botProcess.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Main
 */
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     🤖 BOT DE TESTES COM SERVIDOR INTEGRADO            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Iniciar servidor
    await startServer();

    // 2. Aguardar servidor ficar pronto
    const serverReady = await waitForServer();
    
    if (!serverReady) {
      throw new Error('Servidor não ficou pronto a tempo');
    }

    // 3. Executar bot
    await runBot();

    // 4. Sucesso
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║           ✅ EXECUÇÃO CONCLUÍDA COM SUCESSO             ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Erro durante execução:', error);
    process.exitCode = 1;
  } finally {
    // Sempre parar servidor ao finalizar
    await stopServer();
  }
}

// Tratamento de sinais
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Recebido CTRL+C...');
  await stopServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Recebido sinal de término...');
  await stopServer();
  process.exit(0);
});

// Executar
main();

