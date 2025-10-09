/**
 * Sistema de Fila para NFSe com Sincronização Automática
 * Permite emissão offline e sincronização quando a API PBH voltar
 */

import { EventEmitter } from "events";

export interface NFSeQueueItem {
  id: string;
  tenantId: string;
  status: "pendente" | "processando" | "sucesso" | "erro" | "sincronizando";
  tentativas: number;
  maxTentativas: number;
  criado: Date;
  ultimaTentativa?: Date;
  proximaTentativa?: Date;
  dados: {
    tomador: any;
    servico: any;
  };
  resultado?: {
    numero?: string;
    codigoVerificacao?: string;
    chaveAcesso?: string;
    xml?: string;
  };
  erro?: {
    mensagem: string;
    codigo?: string;
    detalhes?: any;
  };
}

export class NFSeQueue extends EventEmitter {
  private queue: Map<string, NFSeQueueItem> = new Map();
  private processing = false;
  private intervalId?: NodeJS.Timeout;
  private readonly INTERVALO_PROCESSAMENTO = 30000; // 30 segundos
  private readonly INTERVALO_SINCRONIZACAO = 60000; // 1 minuto
  private readonly MAX_TENTATIVAS = 5;
  
  constructor() {
    super();
    this.iniciarProcessamento();
  }
  
  /**
   * Adiciona uma NFSe à fila para emissão
   */
  async adicionar(item: Omit<NFSeQueueItem, "id" | "status" | "tentativas" | "criado" | "maxTentativas">): Promise<string> {
    const id = this.gerarId();
    const novoItem: NFSeQueueItem = {
      ...item,
      id,
      status: "pendente",
      tentativas: 0,
      maxTentativas: this.MAX_TENTATIVAS,
      criado: new Date(),
    };
    
    this.queue.set(id, novoItem);
    this.emit("item-adicionado", novoItem);
    
    console.log(`✅ NFSe ${id} adicionada à fila`);
    
    // Tentar processar imediatamente
    this.processarProximo();
    
    return id;
  }
  
  /**
   * Inicia o processamento automático da fila
   */
  private iniciarProcessamento() {
    // Processar a cada 30 segundos
    this.intervalId = setInterval(() => {
      this.processarProximo();
    }, this.INTERVALO_PROCESSAMENTO);
    
    // Sincronizar a cada 1 minuto
    setInterval(() => {
      this.sincronizarPendentes();
    }, this.INTERVALO_SINCRONIZACAO);
    
    console.log("🔄 Sistema de fila NFSe iniciado");
  }
  
  /**
   * Para o processamento automático
   */
  parar() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log("⏸️ Sistema de fila NFSe pausado");
  }
  
  /**
   * Processa o próximo item da fila
   */
  private async processarProximo() {
    if (this.processing) {
      return; // Já está processando
    }
    
    // Buscar próximo item pendente
    const proximo = this.obterProximoPendente();
    if (!proximo) {
      return; // Nenhum item pendente
    }
    
    this.processing = true;
    
    try {
      await this.processar(proximo);
    } catch (error) {
      console.error("Erro ao processar item da fila:", error);
    } finally {
      this.processing = false;
    }
  }
  
  /**
   * Obtém o próximo item pendente que pode ser processado
   */
  private obterProximoPendente(): NFSeQueueItem | null {
    const agora = new Date();
    
    for (const item of this.queue.values()) {
      // Item pendente ou com erro que pode tentar novamente
      if (
        (item.status === "pendente" || item.status === "erro") &&
        item.tentativas < item.maxTentativas &&
        (!item.proximaTentativa || item.proximaTentativa <= agora)
      ) {
        return item;
      }
    }
    
    return null;
  }
  
  /**
   * Processa um item da fila
   */
  private async processar(item: NFSeQueueItem) {
    console.log(`🔄 Processando NFSe ${item.id} (tentativa ${item.tentativas + 1}/${item.maxTentativas})`);
    
    item.status = "processando";
    item.tentativas++;
    item.ultimaTentativa = new Date();
    this.queue.set(item.id, item);
    
    try {
      // TODO: Implementar chamada real à API PBH
      const resultado = await this.emitirNFSe(item);
      
      // Sucesso!
      item.status = "sucesso";
      item.resultado = resultado;
      delete item.erro;
      delete item.proximaTentativa;
      this.queue.set(item.id, item);
      
      this.emit("item-processado", item);
      console.log(`✅ NFSe ${item.id} emitida com sucesso: Nº ${resultado.numero}`);
      
    } catch (error: any) {
      console.error(`❌ Erro ao emitir NFSe ${item.id}:`, error.message);
      
      item.status = "erro";
      item.erro = {
        mensagem: error.message,
        codigo: error.code,
        detalhes: error.details,
      };
      
      // Calcular próxima tentativa (exponential backoff)
      if (item.tentativas < item.maxTentativas) {
        const delayMinutos = Math.pow(2, item.tentativas); // 2, 4, 8, 16, 32 minutos
        item.proximaTentativa = new Date(Date.now() + delayMinutos * 60 * 1000);
        console.log(`⏰ Próxima tentativa em ${delayMinutos} minutos`);
      } else {
        console.log(`❌ NFSe ${item.id} falhou após ${item.maxTentativas} tentativas`);
        this.emit("item-falhou", item);
      }
      
      this.queue.set(item.id, item);
      this.emit("item-erro", item);
    }
  }
  
  /**
   * Emite a NFSe (integração com API PBH)
   */
  private async emitirNFSe(item: NFSeQueueItem): Promise<any> {
    // Simular chamada à API PBH
    // TODO: Implementar integração real
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular erro de API indisponível (20% de chance)
    if (Math.random() < 0.2) {
      throw new Error("API PBH temporariamente indisponível");
    }
    
    // Simular sucesso
    const numero = Math.floor(Math.random() * 999999) + 1;
    const codigoVerificacao = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    return {
      numero: numero.toString(),
      codigoVerificacao,
      chaveAcesso: `31${new Date().getFullYear()}${item.dados.servico.valorServico}${numero}`,
      dataEmissao: new Date().toISOString(),
      valorServico: item.dados.servico.valorServico,
      valorISS: item.dados.servico.valorServico * (item.dados.servico.aliquota / 100),
      link: `https://bhissdigital.pbh.gov.br/nfse/${numero}`,
    };
  }
  
  /**
   * Sincroniza itens pendentes (retenta automaticamente)
   */
  private async sincronizarPendentes() {
    const pendentes = Array.from(this.queue.values()).filter(
      item => item.status === "erro" && item.tentativas < item.maxTentativas
    );
    
    if (pendentes.length > 0) {
      console.log(`🔄 Sincronizando ${pendentes.length} NFSe(s) pendente(s)`);
      
      for (const item of pendentes) {
        // Verificar se já pode tentar novamente
        if (!item.proximaTentativa || item.proximaTentativa <= new Date()) {
          await this.processar(item);
        }
      }
    }
  }
  
  /**
   * Obtém o status de um item da fila
   */
  obterStatus(id: string): NFSeQueueItem | undefined {
    return this.queue.get(id);
  }
  
  /**
   * Obtém todos os itens da fila
   */
  obterTodos(): NFSeQueueItem[] {
    return Array.from(this.queue.values());
  }
  
  /**
   * Obtém itens por tenant
   */
  obterPorTenant(tenantId: string): NFSeQueueItem[] {
    return Array.from(this.queue.values()).filter(item => item.tenantId === tenantId);
  }
  
  /**
   * Obtém estatísticas da fila
   */
  obterEstatisticas() {
    const todos = Array.from(this.queue.values());
    return {
      total: todos.length,
      pendentes: todos.filter(i => i.status === "pendente").length,
      processando: todos.filter(i => i.status === "processando").length,
      sucesso: todos.filter(i => i.status === "sucesso").length,
      erro: todos.filter(i => i.status === "erro").length,
      sincronizando: todos.filter(i => i.status === "sincronizando").length,
    };
  }
  
  /**
   * Limpa itens antigos já processados (mais de 7 dias)
   */
  limparAntigos() {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let removidos = 0;
    
    for (const [id, item] of this.queue.entries()) {
      if (item.status === "sucesso" && item.criado < seteDiasAtras) {
        this.queue.delete(id);
        removidos++;
      }
    }
    
    if (removidos > 0) {
      console.log(`🧹 ${removidos} NFSe(s) antiga(s) removida(s) da fila`);
    }
  }
  
  /**
   * Reprocessa um item que falhou
   */
  async reprocessar(id: string): Promise<boolean> {
    const item = this.queue.get(id);
    if (!item) {
      return false;
    }
    
    if (item.status !== "erro") {
      return false;
    }
    
    // Resetar tentativas e status
    item.tentativas = 0;
    item.status = "pendente";
    delete item.proximaTentativa;
    delete item.erro;
    this.queue.set(id, item);
    
    console.log(`🔄 NFSe ${id} reprocessando manualmente`);
    await this.processar(item);
    
    return true;
  }
  
  /**
   * Gera um ID único para o item
   */
  private gerarId(): string {
    return `nfse_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Singleton global
export const nfseQueue = new NFSeQueue();

// Limpar itens antigos a cada 24 horas
setInterval(() => {
  nfseQueue.limparAntigos();
}, 24 * 60 * 60 * 1000);

