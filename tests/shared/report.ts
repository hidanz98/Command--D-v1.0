/**
 * Gerador de Relatórios - QA Autônomo
 * 
 * Gera relatórios JSONL e HTML dos resultados dos testes
 */

import * as fs from 'fs';
import * as path from 'path';
import { ButtonScanResult } from './buttons.scan';

const REPORT_DIR = path.join(process.cwd(), 'playwright-report');
const JSONL_PATH = path.join(REPORT_DIR, 'e2e-results.jsonl');
const HTML_PATH = path.join(REPORT_DIR, 'e2e-summary.html');

/**
 * Garante que o diretório de relatórios existe
 */
function ensureReportDir() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
}

/**
 * Adiciona resultados ao arquivo JSONL
 */
export function appendResults(name: string, data: ButtonScanResult[]) {
  ensureReportDir();
  
  const record = {
    timestamp: new Date().toISOString(),
    testName: name,
    results: data,
    summary: {
      total: data.length,
      success: data.filter(r => r.ok).length,
      failed: data.filter(r => !r.ok).length,
      successRate: data.length > 0 ? ((data.filter(r => r.ok).length / data.length) * 100).toFixed(1) + '%' : '0%',
    },
  };
  
  const line = JSON.stringify(record) + '\n';
  fs.appendFileSync(JSONL_PATH, line);
  
  console.log(`📁 Resultados salvos: ${JSONL_PATH}`);
}

/**
 * Lê todos os registros do arquivo JSONL
 */
function readAllRecords(): any[] {
  ensureReportDir();
  
  if (!fs.existsSync(JSONL_PATH)) {
    return [];
  }
  
  const content = fs.readFileSync(JSONL_PATH, 'utf-8');
  const lines = content.trim().split('\n').filter(l => l.length > 0);
  
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(r => r !== null);
}

/**
 * Gera relatório HTML resumido
 */
export function writeHtmlSummary(records?: any[]) {
  ensureReportDir();
  
  if (!records) {
    records = readAllRecords();
  }
  
  if (records.length === 0) {
    console.log('⚠️  Nenhum registro para gerar HTML');
    return;
  }
  
  // Calcular totais
  let totalTests = 0;
  let totalButtons = 0;
  let totalSuccess = 0;
  let totalFailed = 0;
  
  records.forEach(rec => {
    totalTests++;
    totalButtons += rec.summary.total;
    totalSuccess += rec.summary.success;
    totalFailed += rec.summary.failed;
  });
  
  const overallSuccessRate = totalButtons > 0 ? ((totalSuccess / totalButtons) * 100).toFixed(1) : '0';
  
  // Coletar top erros
  const allErrors: { test: string; page: string; button: string; error: string }[] = [];
  
  records.forEach(rec => {
    rec.results.forEach((result: ButtonScanResult) => {
      if (!result.ok) {
        allErrors.push({
          test: rec.testName,
          page: result.pagePath,
          button: result.label,
          error: result.errors[0] || result.failedRequests[0] || result.consoleErrors[0] || 'Unknown error',
        });
      }
    });
  });
  
  const topErrors = allErrors.slice(0, 20);
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA E2E - Relatório 3 Camadas</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 30px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .summary-card h2 { font-size: 36px; margin-bottom: 5px; }
    .summary-card p { color: #666; font-size: 14px; }
    .summary-card.success h2 { color: #22c55e; }
    .summary-card.failed h2 { color: #ef4444; }
    .summary-card.total h2 { color: #3b82f6; }
    table { width: 100%; background: white; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #3b82f6; color: white; font-weight: 600; position: sticky; top: 0; }
    tr:hover { background: #f9fafb; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge.success { background: #d1fae5; color: #065f46; }
    .badge.failed { background: #fee2e2; color: #991b1b; }
    .error-text { color: #991b1b; font-size: 12px; max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .section-title { margin-top: 40px; margin-bottom: 20px; color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    .timestamp { color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 QA E2E - Relatório 3 Camadas</h1>
    <p class="subtitle">Sistema Command-D | Testes: Dono, Funcionário, Cliente</p>
    <p class="timestamp">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
    
    <div class="summary-grid">
      <div class="summary-card total">
        <h2>${totalTests}</h2>
        <p>Testes Executados</p>
      </div>
      <div class="summary-card total">
        <h2>${totalButtons}</h2>
        <p>Botões Testados</p>
      </div>
      <div class="summary-card success">
        <h2>${totalSuccess}</h2>
        <p>Sucessos</p>
      </div>
      <div class="summary-card failed">
        <h2>${totalFailed}</h2>
        <p>Falhas</p>
      </div>
      <div class="summary-card ${parseFloat(overallSuccessRate) >= 90 ? 'success' : 'failed'}">
        <h2>${overallSuccessRate}%</h2>
        <p>Taxa de Sucesso</p>
      </div>
    </div>
    
    <h2 class="section-title">📊 Resumo por Teste</h2>
    <table>
      <thead>
        <tr>
          <th>Teste</th>
          <th>Timestamp</th>
          <th>Botões</th>
          <th>Sucesso</th>
          <th>Falhas</th>
          <th>Taxa</th>
        </tr>
      </thead>
      <tbody>
        ${records.map(rec => `
          <tr>
            <td><strong>${rec.testName}</strong></td>
            <td class="timestamp">${new Date(rec.timestamp).toLocaleString('pt-BR')}</td>
            <td>${rec.summary.total}</td>
            <td><span class="badge success">${rec.summary.success}</span></td>
            <td><span class="badge failed">${rec.summary.failed}</span></td>
            <td>${rec.summary.successRate}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    ${topErrors.length > 0 ? `
      <h2 class="section-title">❌ Top 20 Erros</h2>
      <table>
        <thead>
          <tr>
            <th>Teste</th>
            <th>Página</th>
            <th>Botão</th>
            <th>Erro</th>
          </tr>
        </thead>
        <tbody>
          ${topErrors.map(err => `
            <tr>
              <td>${err.test}</td>
              <td><code>${err.page}</code></td>
              <td>${err.button}</td>
              <td class="error-text" title="${err.error}">${err.error}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p style="margin-top: 20px; color: #22c55e;">✅ Nenhum erro encontrado!</p>'}
    
    <p style="margin-top: 40px; color: #999; font-size: 12px; text-align: center;">
      Gerado por QA Autônomo | Playwright E2E Testing
    </p>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(HTML_PATH, html);
  console.log(`📁 Relatório HTML salvo: ${HTML_PATH}`);
}

