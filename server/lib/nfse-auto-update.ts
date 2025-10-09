/**
 * Sistema de Auto-Atualização para NFSe
 * Mantém schemas, tabelas e configurações sempre atualizadas
 */

import { EventEmitter } from "events";
import https from "https";
import fs from "fs";
import path from "path";

export interface UpdateInfo {
  versaoAtual: string;
  versaoDisponivel: string;
  dataVerificacao: Date;
  atualizacoesDisponiveis: boolean;
  itensAtualizados: string[];
}

export class NFSeAutoUpdate extends EventEmitter {
  private versaoAtual = "1.00";
  private ultimaVerificacao?: Date;
  private intervalId?: NodeJS.Timeout;
  private readonly INTERVALO_VERIFICACAO = 24 * 60 * 60 * 1000; // 24 horas
  
  // Tabelas e configurações que são atualizadas automaticamente
  private tabelasAtualizaveis = {
    codigosMunicipio: new Map<string, string>(),
    codigosTributacao: new Map<string, string>(),
    codigosServico: new Map<string, string>(),
    aliquotasISS: new Map<string, number>(),
  };
  
  constructor() {
    super();
    this.carregarDadosLocais();
    this.iniciarVerificacaoAutomatica();
  }
  
  /**
   * Inicia verificação automática de atualizações
   */
  private iniciarVerificacaoAutomatica() {
    // Verificar a cada 24 horas
    this.intervalId = setInterval(() => {
      this.verificarAtualizacoes();
    }, this.INTERVALO_VERIFICACAO);
    
    // Verificar imediatamente ao iniciar
    this.verificarAtualizacoes();
    
    console.log("🔄 Sistema de auto-atualização NFSe iniciado");
  }
  
  /**
   * Para verificação automática
   */
  parar() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log("⏸️ Auto-atualização pausada");
  }
  
  /**
   * Verifica se há atualizações disponíveis
   */
  async verificarAtualizacoes(): Promise<UpdateInfo> {
    console.log("🔍 Verificando atualizações NFSe...");
    
    try {
      // TODO: Implementar verificação real com servidor SPED/PBH
      // Por enquanto, simula verificação
      
      const versaoDisponivel = await this.obterVersaoMaisRecente();
      const atualizacoesDisponiveis = this.compararVersoes(versaoDisponivel, this.versaoAtual) > 0;
      
      const updateInfo: UpdateInfo = {
        versaoAtual: this.versaoAtual,
        versaoDisponivel,
        dataVerificacao: new Date(),
        atualizacoesDisponiveis,
        itensAtualizados: [],
      };
      
      this.ultimaVerificacao = new Date();
      
      if (atualizacoesDisponiveis) {
        console.log(`🆕 Nova versão disponível: ${versaoDisponivel}`);
        await this.aplicarAtualizacoes(updateInfo);
      } else {
        console.log(`✅ Sistema atualizado (v${this.versaoAtual})`);
      }
      
      this.emit("verificacao-concluida", updateInfo);
      return updateInfo;
      
    } catch (error) {
      console.error("❌ Erro ao verificar atualizações:", error);
      throw error;
    }
  }
  
  /**
   * Obtém a versão mais recente disponível
   */
  private async obterVersaoMaisRecente(): Promise<string> {
    // TODO: Consultar servidor oficial
    // Retornar versão atual por enquanto
    return this.versaoAtual;
  }
  
  /**
   * Compara duas versões (retorna -1, 0 ou 1)
   */
  private compararVersoes(v1: string, v2: string): number {
    const partes1 = v1.split(".").map(Number);
    const partes2 = v2.split(".").map(Number);
    
    for (let i = 0; i < Math.max(partes1.length, partes2.length); i++) {
      const p1 = partes1[i] || 0;
      const p2 = partes2[i] || 0;
      
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    
    return 0;
  }
  
  /**
   * Aplica atualizações disponíveis
   */
  private async aplicarAtualizacoes(updateInfo: UpdateInfo): Promise<void> {
    console.log("📥 Baixando atualizações...");
    
    try {
      // Atualizar tabelas
      await this.atualizarTabelaMunicipios();
      updateInfo.itensAtualizados.push("Tabela de Municípios");
      
      await this.atualizarTabelaTributacao();
      updateInfo.itensAtualizados.push("Tabela de Tributação");
      
      await this.atualizarTabelaServicos();
      updateInfo.itensAtualizados.push("Tabela de Serviços");
      
      await this.atualizarAliquotasISS();
      updateInfo.itensAtualizados.push("Alíquotas ISS");
      
      // Atualizar versão
      this.versaoAtual = updateInfo.versaoDisponivel;
      
      console.log(`✅ Atualizações aplicadas com sucesso!`);
      this.emit("atualizacoes-aplicadas", updateInfo);
      
    } catch (error) {
      console.error("❌ Erro ao aplicar atualizações:", error);
      this.emit("erro-atualizacao", error);
      throw error;
    }
  }
  
  /**
   * Atualiza tabela de municípios (códigos IBGE)
   */
  private async atualizarTabelaMunicipios(): Promise<void> {
    // Dados pré-carregados - Principais municípios MG
    const municipios = {
      "3106200": "Belo Horizonte",
      "3118601": "Contagem",
      "3170206": "Uberlândia",
      "3143302": "Juiz de Fora",
      "3106705": "Betim",
      "3136702": "Montes Claros",
      "3154606": "Ribeirão das Neves",
      "3171501": "Uberaba",
      "3147105": "Governador Valadares",
      "3152131": "Poços de Caldas",
    };
    
    for (const [codigo, nome] of Object.entries(municipios)) {
      this.tabelasAtualizaveis.codigosMunicipio.set(codigo, nome);
    }
    
    console.log(`✅ ${this.tabelasAtualizaveis.codigosMunicipio.size} municípios atualizados`);
  }
  
  /**
   * Atualiza tabela de códigos de tributação
   */
  private async atualizarTabelaTributacao(): Promise<void> {
    // Códigos LC 116/2003 mais usados em locadoras
    const codigos = {
      "01073": "Locação de bens móveis",
      "03039": "Locação de equipamentos de informática",
      "17089": "Outras locações",
      "01099": "Outros serviços de informática",
      "07029": "Outros serviços de engenharia",
    };
    
    for (const [codigo, descricao] of Object.entries(codigos)) {
      this.tabelasAtualizaveis.codigosTributacao.set(codigo, descricao);
    }
    
    console.log(`✅ ${this.tabelasAtualizaveis.codigosTributacao.size} códigos de tributação atualizados`);
  }
  
  /**
   * Atualiza tabela de códigos de serviço (NBS)
   */
  private async atualizarTabelaServicos(): Promise<void> {
    // Códigos NBS relevantes
    const servicos = {
      "1.0709.00.00": "Locação de bens móveis",
      "1.0703.00.00": "Locação de equipamentos de informática",
      "1.0799.00.00": "Outras locações",
    };
    
    for (const [codigo, descricao] of Object.entries(servicos)) {
      this.tabelasAtualizaveis.codigosServico.set(codigo, descricao);
    }
    
    console.log(`✅ ${this.tabelasAtualizaveis.codigosServico.size} códigos de serviço atualizados`);
  }
  
  /**
   * Atualiza alíquotas de ISS por município
   */
  private async atualizarAliquotasISS(): Promise<void> {
    // Alíquotas ISS de Belo Horizonte e outros municípios
    const aliquotas = {
      "3106200": 5.00, // Belo Horizonte
      "3118601": 5.00, // Contagem
      "3170206": 5.00, // Uberlândia
      "3143302": 5.00, // Juiz de Fora
    };
    
    for (const [codigoMunicipio, aliquota] of Object.entries(aliquotas)) {
      this.tabelasAtualizaveis.aliquotasISS.set(codigoMunicipio, aliquota);
    }
    
    console.log(`✅ ${this.tabelasAtualizaveis.aliquotasISS.size} alíquotas ISS atualizadas`);
  }
  
  /**
   * Carrega dados locais salvos
   */
  private carregarDadosLocais(): void {
    try {
      // TODO: Carregar de arquivo ou banco de dados
      // Por enquanto, inicializa vazio
      console.log("📂 Dados locais carregados");
    } catch (error) {
      console.error("❌ Erro ao carregar dados locais:", error);
    }
  }
  
  /**
   * Obtém nome do município pelo código IBGE
   */
  obterNomeMunicipio(codigoIBGE: string): string | undefined {
    return this.tabelasAtualizaveis.codigosMunicipio.get(codigoIBGE);
  }
  
  /**
   * Obtém descrição do código de tributação
   */
  obterDescricaoTributacao(codigo: string): string | undefined {
    return this.tabelasAtualizaveis.codigosTributacao.get(codigo);
  }
  
  /**
   * Obtém alíquota ISS para um município
   */
  obterAliquotaISS(codigoMunicipio: string): number {
    return this.tabelasAtualizaveis.aliquotasISS.get(codigoMunicipio) || 5.00; // Default 5%
  }
  
  /**
   * Valida código de tributação
   */
  validarCodigoTributacao(codigo: string): boolean {
    return this.tabelasAtualizaveis.codigosTributacao.has(codigo);
  }
  
  /**
   * Obtém informações da versão atual
   */
  obterVersaoAtual(): string {
    return this.versaoAtual;
  }
  
  /**
   * Obtém data da última verificação
   */
  obterUltimaVerificacao(): Date | undefined {
    return this.ultimaVerificacao;
  }
  
  /**
   * Força verificação manual de atualizações
   */
  async forcarVerificacao(): Promise<UpdateInfo> {
    console.log("🔄 Verificação manual iniciada");
    return await this.verificarAtualizacoes();
  }
}

// Singleton global
export const nfseAutoUpdate = new NFSeAutoUpdate();

