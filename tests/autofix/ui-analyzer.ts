/**
 * Analisador de UI - QA Auto-Fix
 * 
 * Analisa resultados dos testes e identifica problemas automaticamente
 */

import * as fs from 'fs';
import * as path from 'path';

export interface UIIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'button' | 'form' | 'navigation' | 'rbac' | 'integration';
  title: string;
  description: string;
  location: {
    page: string;
    selector?: string;
    line?: number;
  };
  evidence: string[];
  suggestedFix: string;
  autoFixable: boolean;
}

export class UIAnalyzer {
  private issues: UIIssue[] = [];
  private testResults: any[] = [];

  /**
   * Carregar resultados dos testes
   */
  async loadTestResults() {
    try {
      const resultsPath = path.join(process.cwd(), 'playwright-report', 'e2e-results.jsonl');
      
      if (!fs.existsSync(resultsPath)) {
        console.log('⚠️  Nenhum resultado encontrado. Execute os testes primeiro.');
        return;
      }

      const content = fs.readFileSync(resultsPath, 'utf-8');
      const lines = content.trim().split('\n');
      
      this.testResults = lines.map(line => JSON.parse(line));
      
      console.log(`✅ Carregados ${this.testResults.length} resultados de teste`);
    } catch (error) {
      console.error(`❌ Erro ao carregar resultados: ${(error as Error).message}`);
    }
  }

  /**
   * Analisar resultados e detectar problemas
   */
  analyze() {
    console.log('\n🔍 Analisando resultados dos testes...\n');

    // 1. Analisar botões com falha
    this.analyzeButtonFailures();

    // 2. Analisar problemas de navegação
    this.analyzeNavigationIssues();

    // 3. Analisar problemas de integração
    this.analyzeIntegrationIssues();

    // 4. Analisar RBAC
    this.analyzeRBACIssues();

    // 5. Prioritizar problemas
    this.prioritizeIssues();

    console.log(`\n📊 Total de problemas detectados: ${this.issues.length}\n`);

    return this.issues;
  }

  /**
   * Analisar falhas de botões
   */
  private analyzeButtonFailures() {
    for (const result of this.testResults) {
      if (result.buttonScanResults) {
        for (const button of result.buttonScanResults) {
          if (!button.ok) {
            this.issues.push({
              id: `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              severity: this.calculateSeverity(button),
              category: 'button',
              title: `Botão "${button.label}" falhou`,
              description: `O botão "${button.label}" na página ${button.pagePath} não funcionou corretamente.`,
              location: {
                page: button.pagePath,
                selector: button.selectorHint,
              },
              evidence: button.errors || [],
              suggestedFix: this.suggestButtonFix(button),
              autoFixable: this.isButtonAutoFixable(button),
            });
          }
        }
      }
    }
  }

  /**
   * Analisar problemas de navegação
   */
  private analyzeNavigationIssues() {
    // Procurar por "não encontrado", "timeout", etc nos logs
    for (const result of this.testResults) {
      const resultStr = JSON.stringify(result).toLowerCase();
      
      if (resultStr.includes('não encontrado') || resultStr.includes('not found')) {
        this.issues.push({
          id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          severity: 'high',
          category: 'navigation',
          title: 'Elemento não encontrado',
          description: 'Um elemento esperado não foi encontrado na página.',
          location: {
            page: result.pagePath || 'unknown',
          },
          evidence: [JSON.stringify(result, null, 2)],
          suggestedFix: 'Verificar seletores e adicionar alternativas',
          autoFixable: false,
        });
      }
    }
  }

  /**
   * Analisar problemas de integração
   */
  private analyzeIntegrationIssues() {
    const integrationPatterns = [
      { pattern: 'pedido não aparece', issue: 'Pedidos não aparecem no painel admin' },
      { pattern: 'produtos não visíveis', issue: 'Produtos não aparecem para clientes' },
      { pattern: 'carrinho vazio', issue: 'Produtos não adicionam ao carrinho' },
    ];

    for (const result of this.testResults) {
      const resultStr = JSON.stringify(result).toLowerCase();
      
      for (const {pattern, issue} of integrationPatterns) {
        if (resultStr.includes(pattern)) {
          this.issues.push({
            id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            severity: 'critical',
            category: 'integration',
            title: issue,
            description: `Problema de integração detectado: ${issue}`,
            location: {
              page: result.pagePath || 'multiple',
            },
            evidence: [resultStr.substring(0, 200)],
            suggestedFix: 'Verificar fluxo de dados entre perfis e estado da aplicação',
            autoFixable: false,
          });
        }
      }
    }
  }

  /**
   * Analisar problemas de RBAC
   */
  private analyzeRBACIssues() {
    for (const result of this.testResults) {
      if (result.name && result.name.includes('rbac')) {
        const resultStr = JSON.stringify(result).toLowerCase();
        
        if (resultStr.includes('possível falha') || resultStr.includes('não bloqueado')) {
          this.issues.push({
            id: `rbac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            severity: 'high',
            category: 'rbac',
            title: 'Possível falha de RBAC detectada',
            description: 'Uma rota que deveria ser bloqueada pode estar acessível.',
            location: {
              page: result.pagePath || 'admin routes',
            },
            evidence: [resultStr.substring(0, 200)],
            suggestedFix: 'Verificar middleware de autenticação e autorização nas rotas',
            autoFixable: false,
          });
        }
      }
    }
  }

  /**
   * Calcular severidade de um problema de botão
   */
  private calculateSeverity(button: any): 'critical' | 'high' | 'medium' | 'low' {
    const label = button.label.toLowerCase();
    
    // Crítico: botões de checkout, pagamento, finalizar
    if (label.includes('finalizar') || label.includes('checkout') || label.includes('pagar')) {
      return 'critical';
    }
    
    // Alto: adicionar ao carrinho, salvar, cadastrar
    if (label.includes('adicionar') || label.includes('salvar') || label.includes('cadastrar')) {
      return 'high';
    }
    
    // Médio: ver mais, detalhes, editar
    if (label.includes('ver') || label.includes('detalhes') || label.includes('editar')) {
      return 'medium';
    }
    
    // Baixo: outros
    return 'low';
  }

  /**
   * Sugerir correção para botão
   */
  private suggestButtonFix(button: any): string {
    const errors = (button.errors || []).join(' ').toLowerCase();
    
    if (errors.includes('timeout')) {
      return 'Aumentar timeout do botão ou otimizar ação disparada';
    }
    
    if (errors.includes('not visible') || errors.includes('não visível')) {
      return 'Verificar se elemento está oculto por CSS/JS ou dentro de modal/accordion';
    }
    
    if (errors.includes('not enabled') || errors.includes('desabilitado')) {
      return 'Verificar condições que habilitam o botão (validação de formulário, estado)';
    }
    
    if (errors.includes('click')) {
      return 'Verificar se há overlay bloqueando o clique ou se elemento está dinamicamente renderizado';
    }
    
    return 'Verificar seletor e comportamento do botão no código';
  }

  /**
   * Verificar se problema de botão é auto-fixável
   */
  private isButtonAutoFixable(button: any): boolean {
    const errors = (button.errors || []).join(' ').toLowerCase();
    
    // Auto-fixável: botões sem type, href="#", handlers ausentes
    const autoFixablePatterns = [
      'type attribute',
      'href="#"',
      'onclick missing',
      'handler not found',
    ];
    
    return autoFixablePatterns.some(pattern => errors.includes(pattern));
  }

  /**
   * Prioritizar problemas por severidade
   */
  private prioritizeIssues() {
    const severityOrder: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    this.issues.sort((a, b) => {
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Gerar relatório de problemas
   */
  generateReport(): string {
    const report: string[] = [];
    
    report.push('# 🔍 RELATÓRIO DE ANÁLISE DE UI\n');
    report.push(`**Data:** ${new Date().toLocaleString()}\n`);
    report.push(`**Total de Problemas:** ${this.issues.length}\n`);
    report.push(`**Auto-Fixáveis:** ${this.issues.filter(i => i.autoFixable).length}\n\n`);

    // Agrupar por severidade
    const bySeverity = {
      critical: this.issues.filter(i => i.severity === 'critical'),
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low'),
    };

    // Problemas críticos
    if (bySeverity.critical.length > 0) {
      report.push('## 🔴 PROBLEMAS CRÍTICOS (P0)\n');
      for (const issue of bySeverity.critical) {
        report.push(this.formatIssue(issue));
      }
    }

    // Problemas altos
    if (bySeverity.high.length > 0) {
      report.push('## 🟡 PROBLEMAS ALTOS (P1)\n');
      for (const issue of bySeverity.high) {
        report.push(this.formatIssue(issue));
      }
    }

    // Problemas médios
    if (bySeverity.medium.length > 0) {
      report.push('## 🟢 PROBLEMAS MÉDIOS (P2)\n');
      for (const issue of bySeverity.medium) {
        report.push(this.formatIssue(issue));
      }
    }

    // Problemas baixos
    if (bySeverity.low.length > 0) {
      report.push('## ⚪ PROBLEMAS BAIXOS (P3)\n');
      for (const issue of bySeverity.low) {
        report.push(this.formatIssue(issue));
      }
    }

    return report.join('\n');
  }

  /**
   * Formatar problema para relatório
   */
  private formatIssue(issue: UIIssue): string {
    const autofix = issue.autoFixable ? '🔧 AUTO-FIXÁVEL' : '⚙️ MANUAL';
    
    return `
### ${issue.title} [${autofix}]

**Categoria:** ${issue.category}  
**Página:** \`${issue.location.page}\`  
${issue.location.selector ? `**Seletor:** \`${issue.location.selector}\`\n` : ''}
**Descrição:** ${issue.description}

**Correção Sugerida:**  
\`\`\`
${issue.suggestedFix}
\`\`\`

${issue.evidence.length > 0 ? `**Evidências:**\n\`\`\`\n${issue.evidence.join('\n')}\n\`\`\`\n` : ''}
---
`;
  }

  /**
   * Salvar relatório
   */
  saveReport(report: string) {
    const reportPath = path.join(process.cwd(), 'playwright-report', 'ui-analysis-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n✅ Relatório salvo: ${reportPath}\n`);
  }

  /**
   * Obter problemas detectados
   */
  getIssues(): UIIssue[] {
    return this.issues;
  }
}

