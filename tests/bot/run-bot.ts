/**
 * 🚀 Script para Executar o Bot de Testes
 * 
 * Uso:
 * npm run bot           - Executa uma vez e para
 * npm run bot:watch     - Executa continuamente
 * npm run bot:quick     - Executa sem auto-fix
 */

import { IntelligentQABot } from './intelligent-qa-bot';

// Configuração baseada em argumentos
const args = process.argv.slice(2);
const mode = args[0] || 'once';

const configs = {
  once: {
    autoRun: false,
    autoFix: true,
    notifyOnFailure: true,
  },
  watch: {
    autoRun: true,
    runInterval: 30, // 30 minutos
    autoFix: true,
    notifyOnFailure: true,
  },
  quick: {
    autoRun: false,
    autoFix: false,
    notifyOnFailure: false,
  },
};

async function main() {
  const config = configs[mode as keyof typeof configs] || configs.once;
  const bot = new IntelligentQABot(config);

  // Tratamento de sinais para parada graceful
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Recebido sinal de interrupção...');
    await bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Recebido sinal de término...');
    await bot.stop();
    process.exit(0);
  });

  // Iniciar bot
  await bot.start();

  // Se não for modo watch, parar após primeira execução
  if (!config.autoRun) {
    await bot.stop();
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});

