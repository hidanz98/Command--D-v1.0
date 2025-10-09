/**
 * Script Principal de Auto-Fix
 * 
 * Executa análise de UI e gera relatório de problemas
 */

import { UIAnalyzer } from './ui-analyzer';

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║        🤖 AUTO-FIX - ANÁLISE AUTOMÁTICA DE UI            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const analyzer = new UIAnalyzer();

  // 1. Carregar resultados dos testes
  console.log('📂 Fase 1: Carregar resultados dos testes\n');
  await analyzer.loadTestResults();

  // 2. Analisar e detectar problemas
  console.log('\n📊 Fase 2: Analisar e detectar problemas\n');
  const issues = analyzer.analyze();

  // 3. Gerar relatório
  console.log('\n📝 Fase 3: Gerar relatório\n');
  const report = analyzer.generateReport();
  analyzer.saveReport(report);

  // 4. Resumo
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DA ANÁLISE                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  
  const critical = issues.filter(i => i.severity === 'critical').length;
  const high = issues.filter(i => i.severity === 'high').length;
  const medium = issues.filter(i => i.severity === 'medium').length;
  const low = issues.filter(i => i.severity === 'low').length;
  const autoFixable = issues.filter(i => i.autoFixable).length;

  console.log(`║ 🔴 Críticos:        ${critical.toString().padEnd(37)}║`);
  console.log(`║ 🟡 Altos:           ${high.toString().padEnd(37)}║`);
  console.log(`║ 🟢 Médios:          ${medium.toString().padEnd(37)}║`);
  console.log(`║ ⚪ Baixos:          ${low.toString().padEnd(37)}║`);
  console.log(`║ 🔧 Auto-Fixáveis:   ${autoFixable.toString().padEnd(37)}║`);
  console.log(`║ 📊 Total:           ${issues.length.toString().padEnd(37)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (issues.length === 0) {
    console.log('✅ Nenhum problema detectado! Sistema está 100% funcional.\n');
  } else {
    console.log('📄 Ver relatório completo: playwright-report/ui-analysis-report.md\n');
    
    // Mostrar top 5 problemas
    console.log('🎯 TOP 5 PROBLEMAS PRIORITÁRIOS:\n');
    issues.slice(0, 5).forEach((issue, idx) => {
      const emoji = {
        critical: '🔴',
        high: '🟡',
        medium: '🟢',
        low: '⚪',
      }[issue.severity];
      
      console.log(`${idx + 1}. ${emoji} [${issue.category.toUpperCase()}] ${issue.title}`);
      console.log(`   📍 ${issue.location.page}`);
      console.log(`   💡 ${issue.suggestedFix.substring(0, 80)}${issue.suggestedFix.length > 80 ? '...' : ''}\n`);
    });
  }

  console.log('🚀 Próximo passo: Verificar relatório e aplicar correções\n');
}

main().catch(error => {
  console.error('\n❌ Erro durante auto-fix:', error);
  process.exit(1);
});

