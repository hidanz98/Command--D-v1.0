# 📋 Integração NFSe - Prefeitura de Belo Horizonte

## 🎯 Visão Geral

Este documento descreve a integração do sistema com a API de NFSe (Nota Fiscal de Serviços Eletrônica) da Prefeitura de Belo Horizonte, baseada no **Padrão Nacional SPED - Versão 1.00**.

---

## 📦 Schemas XML Oficiais

### Arquivos Disponíveis:
- `NFSe_v1.00.xsd` - Schema da Nota Fiscal Eletrônica
- `DPS_v1.00.xsd` - Schema da Declaração de Prestação de Serviços
- `CNC_v1.00.xsd` - Schema de Cancelamento
- `evento_v1.00.xsd` - Schema de Eventos
- `pedRegEvento_v1.00.xsd` - Schema de Pedido de Registro de Evento
- `tiposComplexos_v1.00.xsd` - Tipos complexos do XML
- `tiposSimples_v1.00.xsd` - Tipos simples do XML
- `tiposEventos_v1.00.xsd` - Tipos de eventos
- `tiposCnc_v1.00.xsd` - Tipos de cancelamento
- `xmldsig-core-schema.xsd` - Schema de assinatura digital

**Namespace**: `http://www.sped.fazenda.gov.br/nfse`

---

## 🔄 Fluxo de Emissão

### 1. Geração do DPS (Declaração de Prestação de Serviços)

O DPS é o documento que origina a NFSe. Estrutura básica:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
  <infDPS Id="DPS{CNPJ}{Serie}{Numero}">
    <!-- Ambiente: 1=Produção, 2=Homologação -->
    <tpAmb>2</tpAmb>
    
    <!-- Data/Hora Emissão (UTC) -->
    <dhEmi>2025-10-05T14:30:00-03:00</dhEmi>
    
    <!-- Versão do Aplicativo -->
    <verAplic>SistemaCommandD-1.0</verAplic>
    
    <!-- Série do DPS -->
    <serie>1</serie>
    
    <!-- Número do DPS -->
    <nDPS>1</nDPS>
    
    <!-- Data/Hora Competência -->
    <dCompet>2025-10-05</dCompet>
    
    <!-- Substitui NFSe anterior? (S/N) -->
    <subst>N</subst>
    
    <!-- DADOS DO PRESTADOR -->
    <prest>
      <CNPJ>12345678000190</CNPJ>
      <IM>987654</IM> <!-- Inscrição Municipal -->
      <xNome>Bil's Cinema e Vídeo Ltda</xNome>
      <xFant>Bil's Cinema</xFant>
      <!-- Endereço completo -->
      <end>
        <cPais>1058</cPais> <!-- Brasil -->
        <xPais>Brasil</xPais>
        <UF>MG</UF>
        <cMun>3106200</cMun> <!-- Cód. IBGE BH -->
        <xMun>Belo Horizonte</xMun>
        <CEP>30000000</CEP>
        <xLgr>Av. Afonso Pena</xLgr>
        <nro>1234</nro>
        <xCpl>Sala 10</xCpl>
        <xBairro>Centro</xBairro>
      </end>
      <fone>3130001234</fone>
      <email>contato@bilscinema.com.br</email>
      <!-- Regime Tributário: 1=Simples, 2=Excesso, 3=Normal -->
      <regimeTrib>1</regimeTrib>
    </prest>
    
    <!-- DADOS DO TOMADOR -->
    <tom>
      <CNPJ>98765432000156</CNPJ> <!-- ou CPF -->
      <xNome>Cliente Exemplo Ltda</xNome>
      <end>
        <!-- Endereço do tomador -->
      </end>
      <email>cliente@exemplo.com</email>
    </tom>
    
    <!-- DADOS DO SERVIÇO -->
    <serv>
      <!-- Código Tributação Nacional (LC 116/2003) -->
      <cTribNac>01073</cTribNac>
      <xDescServ>Locação de equipamentos de áudio e vídeo</xDescServ>
      
      <!-- Código Tributação Municipal (específico BH) -->
      <cTribMun>631990100</cTribMun>
      
      <!-- Código NBS (Nomenclatura Brasileira de Serviços) -->
      <cNBS>1.0709.00.00</cNBS>
      
      <!-- Valores -->
      <valores>
        <vServ>1000.00</vServ> <!-- Valor total do serviço -->
        <vDesc>0.00</vDesc> <!-- Desconto -->
        <vBC>1000.00</vBC> <!-- Base de cálculo -->
        <pAliq>5.00</pAliq> <!-- Alíquota ISS (5% BH) -->
        <vISS>50.00</vISS> <!-- Valor ISS -->
        <vLiq>950.00</vLiq> <!-- Valor líquido -->
      </valores>
      
      <!-- Discriminação do serviço -->
      <xInfComp>
        Locação de equipamentos de áudio e vídeo profissional para evento.
        Período: 05/10/2025 a 06/10/2025
        Valor: R$ 1.000,00
        ISS: R$ 50,00 (5%)
      </xInfComp>
    </serv>
  </infDPS>
  
  <!-- Assinatura Digital (obrigatório) -->
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <!-- Assinatura XML com certificado digital -->
  </Signature>
</DPS>
```

### 2. Assinatura Digital

O DPS deve ser assinado digitalmente com certificado A1 (.pfx) ou A3:
- **Algoritmo**: SHA-256 com RSA
- **Elemento assinado**: `infDPS`
- **Referência**: URI do elemento (Id)

### 3. Envio à API PBH

**Operação**: `RecepcionarLoteRps`

**Endpoints**:
- **Homologação**: `https://bhisshomologacao.pbh.gov.br/bhiss-ws/nfse`
- **Produção**: `https://bhissdigital.pbh.gov.br/bhiss-ws/nfse`

**Request SOAP**:
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <RecepcionarLoteRpsRequest xmlns="http://www.sped.fazenda.gov.br/nfse">
      <LoteRps>
        <NumeroLote>1</NumeroLote>
        <CNPJ>12345678000190</CNPJ>
        <InscricaoMunicipal>987654</InscricaoMunicipal>
        <QuantidadeRps>1</QuantidadeRps>
        <ListaRps>
          <!-- DPS aqui -->
        </ListaRps>
      </LoteRps>
    </RecepcionarLoteRpsRequest>
  </soap:Body>
</soap:Envelope>
```

### 4. Processamento

A PBH processa o lote e retorna:
- **Síncrono**: NFSe gerada imediatamente
- **Assíncrono**: Protocolo para consulta posterior

### 5. Retorno

**Response**:
```xml
<NFSe versao="1.00">
  <infNFSe>
    <nNFSe>123456</nNFSe> <!-- Número da NFSe -->
    <cVerif>A1B2C3D4</cVerif> <!-- Código de verificação -->
    <dEmi>2025-10-05</dEmi>
    <chNFSe>31311234567800019050010000123451123456789</chNFSe>
    <!-- Dados completos da nota -->
  </infNFSe>
  <Signature><!-- Assinatura da PBH --></Signature>
</NFSe>
```

---

## 📊 Códigos e Tabelas

### Códigos de Tributação Nacional (LC 116/2003)

Principais códigos para locadora:

| Código | Descrição |
|--------|-----------|
| 01073 | Locação de bens móveis |
| 03039 | Locação de equipamentos de informática |
| 17089 | Outras locações |

### Código de Município IBGE
- **Belo Horizonte**: `3106200`

### Alíquota ISS BH
- **Padrão**: 5,00%
- **Mínima**: 2,00%
- **Máxima**: 5,00%

### Regime Tributário
- **1**: Simples Nacional
- **2**: Simples Nacional - Excesso
- **3**: Regime Normal

---

## 🔐 Autenticação

### Certificado Digital
- **Tipo**: A1 (arquivo .pfx) ou A3 (cartão/token)
- **Validade**: Mínima 1 ano
- **Emitente**: Autoridade Certificadora credenciada ICP-Brasil

### Credenciais API
- **Login**: Fornecido pela PBH via portal BHISS
- **Senha**: Definida pelo contribuinte
- **Como obter**: 
  1. Acesse https://bhissdigital.pbh.gov.br
  2. Login com certificado digital
  3. Menu "Webservices"
  4. "Solicitar Credenciais"

---

## 🛠️ Operações Disponíveis

### 1. RecepcionarLoteRps
Envia lote de RPS/DPS para emissão de NFSe.

### 2. ConsultarNfse
Consulta NFSe por número, período ou outros filtros.

### 3. ConsultarLoteRps
Verifica o status de processamento de um lote.

### 4. CancelarNfse
Solicita o cancelamento de uma NFSe emitida.

### 5. ConsultarSituacao
Verifica o status do serviço (online/offline).

---

## ⚠️ Validações Importantes

### Campos Obrigatórios:
- ✅ CNPJ do prestador
- ✅ Inscrição Municipal
- ✅ Código de Tributação Nacional
- ✅ Código de Tributação Municipal (específico BH)
- ✅ Valor do serviço
- ✅ Alíquota ISS
- ✅ Discriminação do serviço
- ✅ Assinatura digital

### Regras de Negócio:
- Número de série deve ser único por prestador
- Numeração sequencial (não pode pular números)
- Data de competência não pode ser futura
- Certificado digital deve estar válido
- Inscrição Municipal deve estar ativa

---

## 🧪 Ambiente de Homologação

### Características:
- NFSe **SEM** valor fiscal
- Mesmo formato do ambiente de produção
- Não gera obrigações tributárias
- Ideal para testes

### Dados de Teste:
```
CNPJ Teste: 12345678000190
IM Teste: 987654
Certificado: Usar certificado real (mesmo de produção)
```

---

## 🚀 Migração para Produção

### Checklist:
1. ✅ Testes completos em homologação
2. ✅ Validação de pelo menos 5 NFSe de teste
3. ✅ Certificado digital válido (produção)
4. ✅ Credenciais de produção obtidas
5. ✅ Inscrição Municipal regularizada
6. ✅ CNPJ ativo e regularizado
7. ✅ Alterar endpoint para produção
8. ✅ Alterar `tpAmb` para `1`

---

## 📞 Suporte

- **Portal**: https://bhissdigital.pbh.gov.br
- **Central**: 156 (BH) ou 0800 940 0156
- **Email**: bhissdigital@pbh.gov.br
- **Documentação**: Disponível após login no portal BHISS
- **Schemas**: Fornecidos pela SEFIN Nacional

---

## 📚 Referências

- **Lei Complementar 116/2003**: Lista de serviços ISS
- **Padrão SPED NFSe**: Versão 1.00 (Setembro 2025)
- **Portal SPED**: http://www.sped.fazenda.gov.br
- **ABRASF**: Associação Brasileira das Secretarias de Finanças

---

**Última atualização**: Outubro 2025  
**Versão do Schema**: 1.00  
**Status**: Schemas oficiais da PBH obtidos

