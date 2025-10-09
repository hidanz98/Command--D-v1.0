/**
 * Gerador de XML para NFSe PBH - Padrão SPED Nacional v1.00
 */

interface DPSData {
  // Configurações
  ambiente: "1" | "2"; // 1=Produção, 2=Homologação
  serie: string;
  numero: string;
  
  // Prestador
  prestador: {
    cnpj: string;
    inscricaoMunicipal: string;
    razaoSocial: string;
    nomeFantasia: string;
    endereco: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
    };
    telefone?: string;
    email?: string;
    regimeTributario: "1" | "2" | "3"; // 1=Simples, 2=Excesso, 3=Normal
  };
  
  // Tomador
  tomador: {
    cnpjCpf: string;
    inscricaoMunicipal?: string;
    nome: string;
    endereco?: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
    };
    telefone?: string;
    email?: string;
  };
  
  // Serviço
  servico: {
    codigoTributacaoNacional: string; // LC 116/2003
    codigoTributacaoMunicipal: string; // Específico BH
    codigoNBS?: string;
    descricao: string;
    discriminacao: string;
    valorServico: number;
    valorDesconto?: number;
    baseCalculo: number;
    aliquota: number;
    valorISS: number;
    valorLiquido: number;
  };
}

export class NFSeXMLGenerator {
  /**
   * Gera o XML do DPS (Declaração de Prestação de Serviços)
   */
  static gerarDPS(dados: DPSData): string {
    const dataHoraAtual = new Date().toISOString();
    const dataCompetencia = new Date().toISOString().split("T")[0];
    
    // Gerar ID do DPS
    const idDPS = `DPS${dados.prestador.cnpj}${dados.serie.padStart(5, "0")}${dados.numero.padStart(15, "0")}`;
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
  <infDPS Id="${idDPS}">
    <!-- Ambiente: 1=Produção, 2=Homologação -->
    <tpAmb>${dados.ambiente}</tpAmb>
    
    <!-- Data/Hora Emissão (UTC) -->
    <dhEmi>${dataHoraAtual}</dhEmi>
    
    <!-- Versão do Aplicativo -->
    <verAplic>SistemaCommandD-1.0</verAplic>
    
    <!-- Série do DPS -->
    <serie>${dados.serie}</serie>
    
    <!-- Número do DPS -->
    <nDPS>${dados.numero}</nDPS>
    
    <!-- Data/Hora Competência -->
    <dCompet>${dataCompetencia}</dCompet>
    
    <!-- Substitui NFSe anterior? -->
    <subst>N</subst>
    
    <!-- DADOS DO PRESTADOR -->
    <prest>
      <CNPJ>${this.limparCNPJ(dados.prestador.cnpj)}</CNPJ>
      <IM>${dados.prestador.inscricaoMunicipal}</IM>
      <xNome>${this.escape(dados.prestador.razaoSocial)}</xNome>
      <xFant>${this.escape(dados.prestador.nomeFantasia)}</xFant>
      <end>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
        <UF>${dados.prestador.endereco.uf}</UF>
        <cMun>3106200</cMun>
        <xMun>${dados.prestador.endereco.cidade}</xMun>
        <CEP>${this.limparCEP(dados.prestador.endereco.cep)}</CEP>
        <xLgr>${this.escape(dados.prestador.endereco.logradouro)}</xLgr>
        <nro>${dados.prestador.endereco.numero}</nro>
        ${dados.prestador.endereco.complemento ? `<xCpl>${this.escape(dados.prestador.endereco.complemento)}</xCpl>` : ""}
        <xBairro>${this.escape(dados.prestador.endereco.bairro)}</xBairro>
      </end>
      ${dados.prestador.telefone ? `<fone>${this.limparTelefone(dados.prestador.telefone)}</fone>` : ""}
      ${dados.prestador.email ? `<email>${dados.prestador.email}</email>` : ""}
      <regimeTrib>${dados.prestador.regimeTributario}</regimeTrib>
    </prest>
    
    <!-- DADOS DO TOMADOR -->
    <tom>
      ${this.gerarCNPJouCPF(dados.tomador.cnpjCpf)}
      ${dados.tomador.inscricaoMunicipal ? `<IM>${dados.tomador.inscricaoMunicipal}</IM>` : ""}
      <xNome>${this.escape(dados.tomador.nome)}</xNome>
      ${dados.tomador.endereco ? this.gerarEnderecoTomador(dados.tomador.endereco) : ""}
      ${dados.tomador.email ? `<email>${dados.tomador.email}</email>` : ""}
    </tom>
    
    <!-- DADOS DO SERVIÇO -->
    <serv>
      <!-- Código Tributação Nacional (LC 116/2003) -->
      <cTribNac>${dados.servico.codigoTributacaoNacional}</cTribNac>
      <xDescServ>${this.escape(dados.servico.descricao)}</xDescServ>
      
      <!-- Código Tributação Municipal (específico BH) -->
      <cTribMun>${dados.servico.codigoTributacaoMunicipal}</cTribMun>
      
      ${dados.servico.codigoNBS ? `<cNBS>${dados.servico.codigoNBS}</cNBS>` : ""}
      
      <!-- Valores -->
      <valores>
        <vServ>${this.formatarValor(dados.servico.valorServico)}</vServ>
        <vDesc>${this.formatarValor(dados.servico.valorDesconto || 0)}</vDesc>
        <vBC>${this.formatarValor(dados.servico.baseCalculo)}</vBC>
        <pAliq>${this.formatarValor(dados.servico.aliquota)}</pAliq>
        <vISS>${this.formatarValor(dados.servico.valorISS)}</vISS>
        <vLiq>${this.formatarValor(dados.servico.valorLiquido)}</vLiq>
      </valores>
      
      <!-- Discriminação do serviço -->
      <xInfComp>${this.escape(dados.servico.discriminacao)}</xInfComp>
    </serv>
  </infDPS>
</DPS>`;
    
    return xml;
  }
  
  /**
   * Gera CNPJ ou CPF no XML
   */
  private static gerarCNPJouCPF(cnpjCpf: string): string {
    const limpo = cnpjCpf.replace(/\D/g, "");
    if (limpo.length === 14) {
      return `<CNPJ>${limpo}</CNPJ>`;
    } else if (limpo.length === 11) {
      return `<CPF>${limpo}</CPF>`;
    }
    throw new Error("CNPJ/CPF inválido");
  }
  
  /**
   * Gera endereço do tomador
   */
  private static gerarEnderecoTomador(endereco: any): string {
    return `<end>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
        <UF>${endereco.uf}</UF>
        <cMun>3106200</cMun>
        <xMun>${endereco.cidade}</xMun>
        <CEP>${this.limparCEP(endereco.cep)}</CEP>
        <xLgr>${this.escape(endereco.logradouro)}</xLgr>
        <nro>${endereco.numero}</nro>
        ${endereco.complemento ? `<xCpl>${this.escape(endereco.complemento)}</xCpl>` : ""}
        <xBairro>${this.escape(endereco.bairro)}</xBairro>
      </end>`;
  }
  
  /**
   * Limpa CNPJ
   */
  private static limparCNPJ(cnpj: string): string {
    return cnpj.replace(/\D/g, "");
  }
  
  /**
   * Limpa CEP
   */
  private static limparCEP(cep: string): string {
    return cep.replace(/\D/g, "");
  }
  
  /**
   * Limpa telefone
   */
  private static limparTelefone(telefone: string): string {
    return telefone.replace(/\D/g, "");
  }
  
  /**
   * Formata valor monetário
   */
  private static formatarValor(valor: number): string {
    return valor.toFixed(2);
  }
  
  /**
   * Escapa caracteres especiais XML
   */
  private static escape(texto: string): string {
    return texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
  
  /**
   * Valida XML gerado (validação básica)
   */
  static validarXML(xml: string): boolean {
    // Validações básicas
    if (!xml.includes('xmlns="http://www.sped.fazenda.gov.br/nfse"')) {
      throw new Error("Namespace inválido");
    }
    if (!xml.includes("<DPS")) {
      throw new Error("Tag DPS não encontrada");
    }
    if (!xml.includes("<infDPS")) {
      throw new Error("Tag infDPS não encontrada");
    }
    return true;
  }
}

export default NFSeXMLGenerator;

