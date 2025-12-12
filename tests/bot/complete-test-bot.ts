/**
 * 🤖 BOT DE TESTES COMPLETO - Sistema Command-D
 * 
 * Executa TODOS os testes de TODAS as funcionalidades:
 * - Cliente: Cadastro, Locações, Área do Cliente
 * - Funcionário: Aprovações, Gestão, Relatórios
 * - Dono: Produtos, Configurações, Dashboard
 */

import { chromium, Browser } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface TestSuite {
  name: string;
  profile: string;
  tests: TestCase[];
}

interface TestCase {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export class CompleteTestBot {
  private browser: Browser | null = null;
  private results: Map<string, TestSuite> = new Map();
  private startTime: number = 0;

  /**
   * 🚀 Iniciar Bot de Testes Completo
   */
  async start() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   🤖 BOT DE TESTES COMPLETO - TODAS AS FUNCIONALIDADES  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    this.startTime = Date.now();
    this.browser = await chromium.launch({ headless: false });

    // Definir suites de teste
    this.setupTestSuites();

    console.log('📋 Suites de Teste Configuradas:\n');
    this.results.forEach((suite, key) => {
      console.log(`   ${this.getProfileEmoji(suite.profile)} ${suite.name}: ${suite.tests.length} testes`);
    });
    console.log('');

    // Executar testes
    await this.runAllTests();

    // Gerar relatórios
    await this.generateComprehensiveReport();

    // Limpar
    await this.cleanup();
  }

  /**
   * 📋 Configurar Suites de Teste
   */
  private setupTestSuites() {
    // Suite Cliente
    this.results.set('client', {
      name: 'Testes de Cliente',
      profile: 'client',
      tests: [
        { name: 'Cadastro Completo', description: 'Preencher e enviar cadastro', status: 'pending', duration: 0 },
        { name: 'Buscar Produtos', description: 'Navegar e buscar no catálogo', status: 'pending', duration: 0 },
        { name: 'Adicionar ao Carrinho', description: 'Adicionar produtos ao carrinho', status: 'pending', duration: 0 },
        { name: 'Finalizar Locação', description: 'Completar processo de locação', status: 'pending', duration: 0 },
        { name: 'Ver Meus Pedidos', description: 'Acessar área do cliente', status: 'pending', duration: 0 },
        { name: 'Acompanhar Status', description: 'Ver status dos pedidos', status: 'pending', duration: 0 },
      ],
    });

    // Suite Funcionário
    this.results.set('employee', {
      name: 'Testes de Funcionário',
      profile: 'employee',
      tests: [
        { name: 'Ver Pedidos Pendentes', description: 'Listar pedidos para aprovação', status: 'pending', duration: 0 },
        { name: 'Aprovar Cadastro', description: 'Aprovar cadastro de cliente', status: 'pending', duration: 0 },
        { name: 'Gerenciar Status', description: 'Alterar status de pedidos', status: 'pending', duration: 0 },
        { name: 'Verificar Estoque', description: 'Consultar disponibilidade', status: 'pending', duration: 0 },
        { name: 'Gerar Relatórios', description: 'Exportar relatórios', status: 'pending', duration: 0 },
        { name: 'Comunicar Cliente', description: 'Enviar notificações', status: 'pending', duration: 0 },
      ],
    });

    // Suite Dono
    this.results.set('owner', {
      name: 'Testes de Dono/Admin',
      profile: 'owner',
      tests: [
        { name: 'Cadastrar Produto', description: 'Adicionar novo produto', status: 'pending', duration: 0 },
        { name: 'Editar Produto', description: 'Modificar produto existente', status: 'pending', duration: 0 },
        { name: 'Configurar Preços', description: 'Ajustar taxas e valores', status: 'pending', duration: 0 },
        { name: 'Ver Dashboard', description: 'Visualizar métricas', status: 'pending', duration: 0 },
        { name: 'Gerenciar Usuários', description: 'Administrar funcionários', status: 'pending', duration: 0 },
        { name: 'Configurar Categorias', description: 'Gerenciar categorias', status: 'pending', duration: 0 },
        { name: 'Exportar Dados', description: 'Gerar relatórios gerenciais', status: 'pending', duration: 0 },
      ],
    });
  }

  /**
   * 🧪 Executar Todos os Testes
   */
  private async runAllTests() {
    console.log('🚀 Iniciando Execução de Testes...\n');

    try {
      // Executar suite de testes completa via Playwright
      console.log('📋 Executando testes E2E completos...\n');
      
      const { stdout, stderr } = await execAsync('npm run test:e2e:complete', {
        cwd: process.cwd(),
      });

      console.log('✅ Testes E2E completos executados\n');
      
      // Parsear resultados
      await this.parseTestResults();

    } catch (error: any) {
      console.log('⚠️  Alguns testes falharam, analisando resultados...\n');
      await this.parseTestResults();
    }
  }

  /**
   * 📊 Parsear Resultados dos Testes
   */
  private async parseTestResults() {
    const resultsPath = path.join(process.cwd(), 'playwright-report', 'e2e-results.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.log('⚠️  Arquivo de resultados não encontrado');
      return;
    }

    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      
      // Atualizar status dos testes baseado nos resultados
      results.suites?.forEach((suite: any) => {
        suite.specs?.forEach((spec: any) => {
          spec.tests?.forEach((test: any) => {
            const result = test.results?.[0];
            
            // Encontrar suite correspondente
            this.results.forEach((testSuite) => {
              const matchingTest = testSuite.tests.find(t => 
                test.title?.includes(t.name) || t.name.includes(test.title)
              );
              
              if (matchingTest) {
                matchingTest.status = result?.status || 'skipped';
                matchingTest.duration = result?.duration || 0;
                if (result?.error) {
                  matchingTest.error = result.error.message;
                }
              }
            });
          });
        });
      });

    } catch (error) {
      console.error('❌ Erro ao parsear resultados:', error);
    }
  }

  /**
   * 📝 Gerar Relatório Compreensivo
   */
  private async generateComprehensiveReport() {
    console.log('\n📝 Gerando Relatório Completo...\n');

    const totalDuration = Date.now() - this.startTime;
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    // Calcular estatísticas
    this.results.forEach((suite) => {
      suite.tests.forEach((test) => {
        totalTests++;
        if (test.status === 'passed') passedTests++;
        else if (test.status === 'failed') failedTests++;
        else if (test.status === 'skipped') skippedTests++;
      });
    });

    // Exibir resumo
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║              📊 RESUMO DOS TESTES COMPLETOS              ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ Total de Testes:     ${totalTests.toString().padEnd(35)}║`);
    console.log(`║ ✅ Aprovados:         ${passedTests.toString().padEnd(35)}║`);
    console.log(`║ ❌ Falhados:          ${failedTests.toString().padEnd(35)}║`);
    console.log(`║ ⏭️  Pulados:           ${skippedTests.toString().padEnd(35)}║`);
    console.log(`║ ⏱️  Duração Total:     ${(totalDuration / 1000).toFixed(1)}s`.padEnd(59) + '║');
    
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';
    console.log(`║ 📈 Taxa de Sucesso:   ${successRate}%`.padEnd(59) + '║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Exibir detalhes por perfil
    this.results.forEach((suite, key) => {
      console.log(`\n${this.getProfileEmoji(suite.profile)} ${suite.name.toUpperCase()}\n`);
      
      suite.tests.forEach((test) => {
        const statusEmoji = this.getStatusEmoji(test.status);
        const durationStr = test.duration > 0 ? `(${(test.duration / 1000).toFixed(1)}s)` : '';
        
        console.log(`   ${statusEmoji} ${test.name.padEnd(25)} ${test.description} ${durationStr}`);
        
        if (test.error) {
          console.log(`      ❌ Erro: ${test.error.substring(0, 80)}...`);
        }
      });
    });

    // Gerar arquivo JSON
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
        successRate: parseFloat(successRate),
      },
      suites: Array.from(this.results.values()),
    };

    const reportDir = path.join(process.cwd(), 'playwright-report', 'complete-tests');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `complete-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Relatório JSON salvo: ${reportPath}`);

    // Gerar dashboard HTML
    await this.generateHTML Dashboard(reportData, reportDir);
  }

  /**
   * 📊 Gerar Dashboard HTML
   */
  private async generateHTMLDashboard(reportData: any, reportDir: string) {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🤖 Relatório Completo - Bot de Testes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f8f9fa;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
    }
    .stat-value {
      font-size: 3em;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label { color: #666; margin-top: 10px; }
    .suites { padding: 30px; }
    .suite {
      margin-bottom: 30px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }
    .suite-header {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 15px 20px;
      font-size: 1.3em;
      font-weight: bold;
    }
    .suite-tests { padding: 15px; }
    .test-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.2s;
    }
    .test-item:hover { background: #f8f9fa; }
    .test-item:last-child { border-bottom: none; }
    .test-status {
      font-size: 1.5em;
      margin-right: 10px;
    }
    .test-info { flex: 1; }
    .test-name { font-weight: bold; color: #333; }
    .test-desc { color: #666; font-size: 0.9em; }
    .test-duration {
      color: #999;
      font-size: 0.9em;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f8f9fa;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Relatório Completo de Testes</h1>
      <p>Sistema Command-D - Todas as Funcionalidades</p>
      <p style="font-size: 0.9em; margin-top: 10px;">
        ${new Date(reportData.timestamp).toLocaleString('pt-BR')}
      </p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${reportData.summary.total}</div>
        <div class="stat-label">Total de Testes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #10b981;">${reportData.summary.passed}</div>
        <div class="stat-label">Aprovados</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #ef4444;">${reportData.summary.failed}</div>
        <div class="stat-label">Falhados</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reportData.summary.successRate}%</div>
        <div class="stat-label">Taxa de Sucesso</div>
      </div>
    </div>

    <div class="suites">
      ${reportData.suites.map((suite: any) => `
        <div class="suite">
          <div class="suite-header">
            ${this.getProfileEmoji(suite.profile)} ${suite.name}
          </div>
          <div class="suite-tests">
            ${suite.tests.map((test: any) => `
              <div class="test-item">
                <span class="test-status">${this.getStatusEmoji(test.status)}</span>
                <div class="test-info">
                  <div class="test-name">${test.name}</div>
                  <div class="test-desc">${test.description}</div>
                  ${test.error ? `<div style="color: #ef4444; font-size: 0.8em; margin-top: 5px;">❌ ${test.error}</div>` : ''}
                </div>
                <span class="test-duration">
                  ${test.duration > 0 ? `${(test.duration / 1000).toFixed(1)}s` : '-'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>🤖 Bot de Testes Completo - Sistema Command-D</p>
      <p>Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `;

    const dashboardPath = path.join(reportDir, 'complete-dashboard.html');
    fs.writeFileSync(dashboardPath, html);
    console.log(`📊 Dashboard HTML salvo: ${dashboardPath}\n`);
  }

  /**
   * 🎨 Helpers
   */
  private getProfileEmoji(profile: string): string {
    const emojis: Record<string, string> = {
      client: '🛒',
      employee: '👷',
      owner: '👑',
    };
    return emojis[profile] || '📋';
  }

  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      passed: '✅',
      failed: '❌',
      skipped: '⏭️',
      pending: '⏳',
      running: '🔄',
    };
    return emojis[status] || '❓';
  }

  /**
   * 🧹 Cleanup
   */
  private async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const bot = new CompleteTestBot();
  bot.start().catch(console.error);
}

export default CompleteTestBot;

