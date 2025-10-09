# 🔐 COMMAND-D E INTEGRAÇÃO CLEARSALE - EXPLICAÇÃO COMPLETA

## 🎯 O QUE É O SISTEMA COMMAND-D?

O **Command-D** é um **sistema SaaS multi-tenant completo de gestão para locadoras** (equipamentos de cinema, eventos, áudio, etc.) desenvolvido e gerenciado por você, Otávio.

### 📊 Modelo de Negócio

Você **aluga o sistema** para locadoras, que pagam mensalidade e operam com total independência:

```
┌─────────────────────────────────────────┐
│  VOCÊ (OTÁVIO) - DONO DO COMMAND-D      │
│  Desenvolve, mantém e licencia          │
│                                         │
│  💰 Recebe R$ 200 a R$ 1.000/mês        │
│  🔧 Faz atualizações automáticas        │
│  📊 Monitora status (sem ver dados)     │
└─────────────────────────────────────────┘
              │
              │ Licencia para ↓
              │
    ┌─────────┴─────────┬─────────────┐
    │                   │             │
    ▼                   ▼             ▼
┌──────────┐      ┌──────────┐   ┌──────────┐
│ LOCADORA │      │ LOCADORA │   │ LOCADORA │
│    A     │      │    B     │   │    C     │
│          │      │          │   │          │
│ Paga     │      │ Paga     │   │ Paga     │
│ R$ 500   │      │ R$ 500   │   │ R$ 200   │
│ /mês     │      │ /mês     │   │ /mês     │
└──────────┘      └──────────┘   └──────────┘

Cada locadora tem:
✓ Servidor AWS próprio
✓ Banco de dados isolado
✓ Seus próprios clientes
✓ Seus próprios produtos
✓ Gestão independente
```

### 🏢 Arquitetura Multi-Tenant Isolada

**IMPORTANTE:** Cada locadora opera de forma **completamente independente**:

- ✅ **Servidor separado** (AWS EC2 próprio)
- ✅ **Banco de dados isolado** (PostgreSQL próprio)
- ✅ **Domínio próprio** (ex: locadoraA.command-d.com.br)
- ✅ **Dados 100% privados** (você NÃO tem acesso aos dados deles)
- ✅ **Gestão própria** (eles gerenciam seus próprios clientes)

**Você (Otávio) apenas:**
- 💰 Controla licenças (ativa/desativa)
- 📊 Monitora se o sistema está online
- 🔄 Envia atualizações automáticas
- 💳 Gerencia billing (cobranças)

---

## 🔍 SISTEMA DE CADASTRO DE CLIENTES

Cada locadora tem seu próprio sistema de cadastro de clientes:

### 📋 Fluxo Atual (Fase 1)

```
1. CLIENTE final acessa site da locadora
   ↓
2. Preenche formulário de cadastro
   - Nome, CPF/CNPJ, Email, Telefone
   - Endereço completo
   ↓
3. ENVIA DOCUMENTOS EM PDF (oficiais do governo)
   - CPF (Receita Federal)
   - RG Digital ou CNH Digital (com QR Code)
   - Comprovante de Endereço
   ↓
4. SISTEMA VALIDA automaticamente os PDFs
   - Verifica se é PDF oficial
   - Valida QR Code (quando aplicável)
   - Calcula hash SHA-256
   - Verifica origem governamental
   ↓
5. CADASTRO fica PENDENTE de aprovação
   ↓
6. FUNCIONÁRIO da locadora analisa
   - Visualiza documentos
   - Baixa PDFs para verificar
   - Aprova ou rejeita manualmente
   ↓
7. Se APROVADO:
   - Cliente pode fazer locações
   - Status: ATIVO
   
   Se REJEITADO:
   - Cliente é notificado com motivo
   - Pode refazer cadastro
```

### 🔐 Segurança Implementada

**Validação Automática de PDFs:**
- ✅ Verifica assinatura PDF
- ✅ Detecta corrupção
- ✅ Valida origem oficial (gov.br, Receita Federal)
- ✅ Verifica QR Code em documentos digitais
- ✅ Calcula hash SHA-256 para integridade
- ✅ Limita tamanho (máx 10MB)
- ✅ Armazena fora do webroot

**Controle de Acesso:**
- ✅ Apenas funcionários/admins podem aprovar
- ✅ Histórico de quem aprovou/rejeitou
- ✅ Auditoria completa
- ✅ Documentos protegidos por autenticação

---

## 🚀 POR QUE A INTEGRAÇÃO COM CLEARSALE?

### 🎯 Objetivo da Integração

A **ClearSale** é uma empresa de **análise antifraude** que valida a identidade e o risco de clientes. A integração seria para dar **uma camada extra de segurança** ao cadastro de clientes.

### 💡 Visão do Sistema

Você quer deixar a **API da ClearSale configurada no sistema**, mas:

**✨ VOCÊ NÃO PAGA NADA - SÃO AS LOCADORAS QUE PAGAM!**

### 📋 Como Funcionaria

```
┌─────────────────────────────────────────────────────┐
│  VOCÊ (OTÁVIO) - SISTEMA COMMAND-D                   │
│                                                       │
│  ✓ Deixa a integração ClearSale PRONTA no código    │
│  ✓ Documentação de como usar                         │
│  ✓ Interface configurada                             │
│  ✓ API endpoints preparados                          │
│                                                       │
│  ✗ NÃO paga nada pela ClearSale                      │
│  ✗ NÃO tem conta na ClearSale                        │
└─────────────────────────────────────────────────────┘
              │
              │ Fornece sistema para ↓
              │
┌─────────────────────────────────────────────────────┐
│  LOCADORA A, B, C... (Seus clientes)                 │
│                                                       │
│  1. ✓ Contrata DIRETAMENTE com a ClearSale          │
│  2. ✓ Cria conta na ClearSale                        │
│  3. ✓ Compra créditos na ClearSale                   │
│  4. ✓ Recebe API Key e API Secret da ClearSale      │
│  5. ✓ Configura no painel do Command-D              │
│  6. ✓ Usa a integração                               │
│  7. ✓ PAGA por cada consulta (R$ 0,80 a R$ 2,00)   │
└─────────────────────────────────────────────────────┘
```

### 🔧 Como Você Implementa

No seu sistema, você cria:

#### 1. **Configuração no Painel Admin de cada Locadora**

```typescript
// Tela de Configurações da Locadora
┌──────────────────────────────────────────┐
│  CONFIGURAÇÕES - ANTIFRAUDE              │
│                                          │
│  [ ] Ativar Integração ClearSale         │
│                                          │
│  ClearSale API Key:                      │
│  [_________________________________]     │
│                                          │
│  ClearSale API Secret:                   │
│  [_________________________________]     │
│                                          │
│  Modo:                                   │
│  ( ) Sandbox (Testes)                    │
│  (•) Produção                            │
│                                          │
│  [Salvar Configurações]                  │
└──────────────────────────────────────────┘
```

#### 2. **Banco de Dados - Armazenar Credenciais**

```prisma
// Em schema.prisma (banco de cada locadora)
model TenantConfig {
  id        String   @id @default(uuid())
  tenantId  String   @unique
  
  // ClearSale
  clearSaleEnabled     Boolean  @default(false)
  clearSaleApiKey      String?  // Criptografado
  clearSaleApiSecret   String?  // Criptografado
  clearSaleMode        String?  // "sandbox" | "production"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 3. **Lógica de Integração**

```typescript
// server/lib/clearsale.ts

interface ClearSaleConfig {
  apiKey: string;
  apiSecret: string;
  mode: 'sandbox' | 'production';
}

interface ClearSaleClientData {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface ClearSaleResponse {
  approved: boolean;
  score: number;
  status: 'APA' | 'APM' | 'RPM' | 'RPA'; // Aprovado Auto, Aprovado Manual, etc
  message: string;
}

/**
 * Valida cliente na ClearSale
 * 
 * IMPORTANTE: Esta função só funciona se a locadora tiver:
 * 1. Contratado o serviço da ClearSale
 * 2. Configurado as credenciais no sistema
 * 3. Comprado créditos na ClearSale
 */
export async function validateClientWithClearSale(
  config: ClearSaleConfig,
  clientData: ClearSaleClientData
): Promise<ClearSaleResponse> {
  
  // Se não tiver configuração, retorna aprovado (modo manual)
  if (!config.apiKey || !config.apiSecret) {
    return {
      approved: true,
      score: 0,
      status: 'APM',
      message: 'Validação manual (ClearSale não configurado)'
    };
  }

  // URL da API baseado no modo
  const baseUrl = config.mode === 'production'
    ? 'https://api.clearsale.com.br'
    : 'https://sandbox.clearsale.com.br';

  try {
    // Chamar API da ClearSale
    const response = await fetch(`${baseUrl}/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        'X-API-Secret': config.apiSecret
      },
      body: JSON.stringify({
        orderId: crypto.randomUUID(),
        date: new Date().toISOString(),
        customer: {
          id: clientData.cpf,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          birthDate: clientData.birthDate,
          address: clientData.address
        }
      })
    });

    const data = await response.json();

    return {
      approved: data.status === 'APA' || data.status === 'APM',
      score: data.score,
      status: data.status,
      message: data.message || 'Análise concluída'
    };

  } catch (error) {
    console.error('ClearSale API Error:', error);
    
    // Em caso de erro, não bloqueia o cadastro
    // Deixa para aprovação manual
    return {
      approved: true,
      score: 0,
      status: 'APM',
      message: 'Erro ao consultar ClearSale - Aprovação manual necessária'
    };
  }
}
```

#### 4. **Usar na Aprovação de Cadastro**

```typescript
// server/routes/clients.ts

router.post('/:id/approve', 
  authenticateJWT, 
  requireRole(['admin', 'employee']), 
  async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    try {
      // Buscar cliente
      const client = await prisma.client.findUnique({
        where: { id, tenantId },
        include: { documents: true }
      });

      if (!client) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Buscar configuração da ClearSale
      const config = await prisma.tenantConfig.findUnique({
        where: { tenantId }
      });

      let clearSaleResult = null;

      // SE a locadora configurou ClearSale, valida
      if (config?.clearSaleEnabled && config.clearSaleApiKey) {
        clearSaleResult = await validateClientWithClearSale(
          {
            apiKey: decrypt(config.clearSaleApiKey),
            apiSecret: decrypt(config.clearSaleApiSecret),
            mode: config.clearSaleMode
          },
          {
            cpf: client.cpfCnpj,
            name: client.name,
            email: client.email,
            phone: client.phone || '',
            address: {
              street: client.address || '',
              number: '',
              city: client.city || '',
              state: client.state || '',
              zipCode: client.zipCode || ''
            }
          }
        );

        // Se ClearSale REPROVOU, não aprova
        if (!clearSaleResult.approved) {
          return res.status(400).json({
            error: 'Cliente reprovado pela análise antifraude',
            reason: clearSaleResult.message,
            score: clearSaleResult.score
          });
        }
      }

      // Aprovar cliente
      const updated = await prisma.client.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: req.user.id,
          approvedAt: new Date(),
          clearSaleResult: clearSaleResult ? JSON.stringify(clearSaleResult) : null
        }
      });

      res.json({
        message: 'Cliente aprovado com sucesso!',
        client: updated,
        clearSaleValidation: clearSaleResult
      });

    } catch (error) {
      console.error('Approve error:', error);
      res.status(500).json({ error: 'Erro ao aprovar cliente' });
    }
  }
);
```

---

## 💰 MODELO DE CUSTOS

### Para Você (Otávio)
```
✅ Custo ZERO com ClearSale
✅ Apenas desenvolve a integração uma vez
✅ Deixa pronto no sistema
✅ Cobra a mesma mensalidade do sistema
```

### Para as Locadoras (Seus Clientes)
```
💳 Mensalidade do Command-D: R$ 200 a R$ 1.000

+ (OPCIONAL) Se quiser usar ClearSale:
  1. Contrata direto com ClearSale
  2. Cria conta na ClearSale
  3. Compra créditos (prepago ou pós-pago)
  4. Paga por consulta: R$ 0,80 a R$ 2,00
  5. Configura no Command-D
```

### Exemplo Real

**Locadora "Bil's Cinema"** (seu cliente):
- ✅ Paga R$ 500/mês para VOCÊ pelo Command-D
- ✅ Decide usar ClearSale para validar clientes
- ✅ Contrata DIRETAMENTE com ClearSale
- ✅ Compra pacote de 1.000 consultas (R$ 1.200)
- ✅ Configura no painel do Command-D:
  - API Key: `abc123...`
  - API Secret: `xyz789...`
- ✅ Sistema passa a validar automaticamente
- ✅ Cada novo cliente é validado pela ClearSale
- ✅ Pagamento é entre Locadora ↔ ClearSale
- ✅ VOCÊ não paga nada!

---

## 🎯 VANTAGENS DESTE MODELO

### Para Você (Otávio)

✅ **Não gasta nada** - Zero custos com ClearSale
✅ **Agrega valor** - Sistema mais completo e profissional
✅ **Diferencial competitivo** - Poucos sistemas têm antifraude
✅ **Flexibilidade** - Locadora decide se quer ou não usar
✅ **Sem responsabilidade** - Não gerencia conta/créditos da ClearSale
✅ **Feature premium** - Pode cobrar mais por ter integração pronta

### Para as Locadoras (Seus Clientes)

✅ **Segurança extra** - Reduz fraudes e golpes
✅ **Controle total** - Decide se quer usar e quanto gastar
✅ **Gestão própria** - Gerencia créditos direto na ClearSale
✅ **Integração pronta** - Não precisa desenvolver nada
✅ **Fácil configuração** - Apenas insere API keys
✅ **Transparência** - Vê resultado de cada validação

### Para os Clientes Finais

✅ **Cadastro mais rápido** - Validação automática
✅ **Menos burocracia** - Sistema valida automaticamente
✅ **Maior confiança** - Locadora séria com antifraude

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Preparar Sistema ✅ (Já feito)
- [x] Sistema de cadastro com documentos
- [x] Validação automática de PDFs
- [x] Aprovação manual por funcionários
- [x] Upload seguro de documentos

### Fase 2: Integração ClearSale (A fazer)

#### Backend
- [ ] Criar `server/lib/clearsale.ts` com funções de integração
- [ ] Adicionar campos no banco (TenantConfig)
- [ ] Criar criptografia de credenciais
- [ ] Adicionar validação ClearSale no fluxo de aprovação
- [ ] Criar endpoint de teste de configuração
- [ ] Adicionar logs de consultas ClearSale

#### Frontend
- [ ] Criar página de configuração ClearSale
- [ ] Adicionar toggle para ativar/desativar
- [ ] Campos para API Key e Secret (type="password")
- [ ] Botão "Testar Conexão"
- [ ] Dashboard com histórico de consultas
- [ ] Mostrar saldo de créditos (se API fornecer)

#### Documentação
- [ ] Criar `GUIA-CLEARSALE.md` com:
  - Como contratar ClearSale
  - Como obter credenciais
  - Como configurar no Command-D
  - Custos estimados
  - FAQ
- [ ] Vídeo tutorial de configuração
- [ ] Screenshots do processo

#### Testes
- [ ] Testar integração em sandbox
- [ ] Testar com credenciais inválidas
- [ ] Testar com ClearSale desativado
- [ ] Testar aprovação/rejeição automática
- [ ] Testar erro na API

---

## 📚 DOCUMENTAÇÃO PARA LOCADORAS

Você criaria um guia simples para suas locadoras:

```markdown
# 🔐 Como Ativar Validação Antifraude (ClearSale)

## O que é?
A ClearSale é um serviço de análise antifraude que valida
seus clientes automaticamente, reduzindo fraudes e golpes.

## Quanto custa?
- Contratação direta com a ClearSale
- Custo: R$ 0,80 a R$ 2,00 por consulta
- Você controla quantos créditos compra

## Como contratar?

1. Acesse: https://www.clearsale.com.br
2. Clique em "Criar Conta"
3. Preencha dados da sua empresa
4. Escolha o plano (Start é ideal)
5. Compre créditos (sugestão: 500 créditos)

## Como configurar no Command-D?

1. Faça login na ClearSale
2. Vá em "Configurações" → "API"
3. Copie sua "API Key"
4. Copie seu "API Secret"
5. No Command-D:
   - Vá em "Configurações" → "Antifraude"
   - Cole API Key e API Secret
   - Marque "Ativar Integração ClearSale"
   - Clique em "Testar Conexão"
   - Se OK, clique em "Salvar"

## Como funciona?

Quando um cliente se cadastra:
1. Ele envia documentos (como antes)
2. Seu funcionário aprova manualmente (como antes)
3. AO APROVAR, sistema consulta ClearSale automaticamente
4. Se ClearSale aprovar → Cliente ativado ✅
5. Se ClearSale reprovar → Você é alertado ⚠️

## Vale a pena?

✅ Sim, se você tem muitos cadastros
✅ Sim, se já teve problemas com fraude
✅ Sim, se quer locações acima de R$ 5.000

❌ Talvez não, se são poucos clientes (< 10/mês)
❌ Talvez não, se todos são conhecidos

## Precisa de ajuda?
Suporte Command-D: suporte@command-d.com.br
```

---

## 🎉 RESUMO FINAL

### O Sistema Command-D

É um **SaaS de gestão para locadoras** que você (Otávio) desenvolveu e licencia para outras empresas. Cada locadora:
- Paga mensalidade para você
- Opera de forma independente
- Tem servidor e banco próprios
- Gerencia seus próprios clientes

### A Integração ClearSale

É uma **feature opcional** que você implementa no sistema, mas:
- ✅ **VOCÊ NÃO PAGA NADA** - Zero custos
- ✅ **LOCADORAS CONTRATAM** - Direto com ClearSale
- ✅ **LOCADORAS PAGAM** - Por cada consulta
- ✅ **VOCÊ SÓ CONECTA** - API pronta no código
- ✅ **OPCIONAL** - Locadora decide se quer usar

### Fluxo Completo

```
1. Você desenvolve integração ClearSale no Command-D
2. Locadora contrata ClearSale (se quiser)
3. Locadora configura credenciais no Command-D
4. Sistema usa automaticamente na validação
5. Locadora paga ClearSale direto (por consulta)
6. Você não gasta nada, só fornece a integração
```

### Benefício para Você

✅ Sistema mais **completo** e **profissional**
✅ **Diferencial competitivo** perante concorrentes
✅ Pode cobrar **plano premium** com antifraude incluído
✅ **Zero custos** operacionais com ClearSale
✅ **Zero responsabilidade** sobre créditos/billing ClearSale

---

## 💡 DÚVIDAS FREQUENTES

### "Eu preciso ter conta na ClearSale?"
**Não!** Você só implementa a integração. Cada locadora que cria sua própria conta.

### "Eu pago alguma coisa?"
**Não!** Zero custos. As locadoras pagam diretamente à ClearSale.

### "Todas locadoras precisam usar?"
**Não!** É opcional. Se não configurar, funciona só com aprovação manual.

### "Como eu vendo isso?"
**Simples!** Fale: _"Nosso sistema tem integração com ClearSale pronta. Se você quiser usar antifraude, é só contratar com eles e configurar. Não cobramos nada a mais por isso!"_

### "O que eu ganho com isso?"
**Valor agregado!** Seu sistema fica mais completo e profissional, mesmo sem cobrar extra.

### "Posso cobrar extra por isso?"
**Sim!** Você pode criar um plano "Premium" com integração ClearSale incluída e cobrar mais (ex: R$ 700 ao invés de R$ 500).

---

**🚀 Esse é o seu sistema Command-D com estratégia inteligente de integração ClearSale!**

Você fornece a tecnologia. As locadoras decidem se querem o serviço adicional. 
Win-win para todos! 🎯


