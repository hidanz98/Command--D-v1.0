# 📋 Sistema de Cadastro de Clientes com Aprovação Manual

## 🎯 Visão Geral

Sistema completo de cadastro de clientes com **aprovação manual obrigatória** baseada em documentos oficiais do governo em formato PDF, antes da futura integração com ClearSale.

---

## 🏗️ Arquitetura Implementada

### Backend

#### 1. **Middleware de Upload (`server/middleware/documentUpload.ts`)**
```typescript
- Upload seguro de PDFs
- Validação de tipo MIME
- Limite de 10MB por arquivo
- Máximo 5 arquivos simultâneos
- Nome aleatório criptográfico
- Armazenamento fora do webroot
- Cálculo de hash SHA-256
- Proteção contra path traversal
```

**Funções principais:**
- `uploadMultipleDocuments`: Middleware para múltiplos arquivos
- `uploadSingleDocument`: Middleware para arquivo único
- `calculateFileHash()`: Gera hash para verificação de integridade
- `deleteFile()`: Remove arquivo com segurança
- `validateFilePath()`: Previne ataques de path traversal

---

#### 2. **Validador de PDF (`server/lib/pdfValidator.ts`)**
```typescript
- Verifica assinatura PDF (%PDF-)
- Detecta corrupção (%%EOF)
- Extrai metadados
- Verifica origem governamental
- Detecta presença de QR Code
- Validação específica por tipo de documento
```

**Funções principais:**
- `validatePDF()`: Validação geral de PDF
- `validateDocumentType()`: Validação específica (CPF, RG, CNH, CNPJ, etc)
- `checkRequiredDocuments()`: Verifica documentos obrigatórios
- `extractPDFMetadata()`: Extrai informações do PDF
- `checkGovSource()`: Valida se é documento oficial
- `checkForQRCode()`: Detecta QR Code no PDF

**Tipos de documento suportados:**
- ✅ **CPF**: Requer fonte gov.br
- ✅ **RG Digital**: Requer QR Code + fonte oficial
- ✅ **CNH Digital**: Requer QR Code + fonte oficial
- ✅ **CNPJ**: Requer fonte Receita Federal
- ✅ **Comprovante de Endereço**: Apenas PDF válido

---

#### 3. **Rotas de Clientes Atualizadas (`server/routes/clients.ts`)**

##### **GET /api/clients**
- Lista clientes **aprovados** apenas
- Inclui últimos 5 pedidos
- Inclui documentos validados

##### **GET /api/clients/pending** 🔒 (Admin/Employee)
- Lista cadastros **pendentes de aprovação**
- Mostra todos os documentos enviados
- Resultado de validação de cada documento

##### **POST /api/clients/register** 🌐 (Público)
```typescript
Body (FormData):
- name: string
- email: string
- phone?: string
- cpfCnpj: string
- personType: 'fisica' | 'juridica'
- address?: string
- city?: string
- state?: string
- zipCode?: string
- documents: File[] (PDFs)
- documentTypes: string[] (JSON array)

Validações:
✓ Email válido
✓ CPF/CNPJ único
✓ Documentos obrigatórios presentes
✓ PDFs válidos
✓ Tamanho < 10MB
✓ Pessoa Física: CPF + (RG ou CNH) + Comprovante
✓ Pessoa Jurídica: CNPJ + Contrato Social + Comprovante

Response:
{
  "message": "Cadastro enviado com sucesso!",
  "clientId": "uuid",
  "status": "PENDING",
  "documentsUploaded": 3
}
```

##### **POST /api/clients/:id/approve** 🔒 (Admin/Employee)
```typescript
- Valida que todos documentos são válidos
- Atualiza status para APPROVED
- Registra quem aprovou e quando
- Cria notificação para o cliente

Response:
{
  "message": "Cliente aprovado com sucesso!",
  "client": {...}
}
```

##### **POST /api/clients/:id/reject** 🔒 (Admin/Employee)
```typescript
Body:
- reason: string (obrigatório)

- Atualiza status para REJECTED
- Salva motivo da rejeição
- Cria notificação para o cliente
- Mantém documentos para histórico

Response:
{
  "message": "Cadastro rejeitado",
  "client": {...}
}
```

##### **GET /api/clients/:id/documents/:documentId/download** 🔒 (Admin/Employee)
```typescript
- Download seguro de documento
- Validação de path
- Proteção contra acesso não autorizado
- Retorna PDF original
```

##### **POST /api/clients/:id/documents/upload** 🔒 (Autenticado)
```typescript
- Upload adicional de documentos
- Para complementar cadastro
- Mesmas validações de segurança
```

---

### Frontend

#### 1. **Componente de Cadastro (`ClientRegistrationWithDocuments.tsx`)**

**3 Etapas:**

**Etapa 1: Dados Pessoais**
- Tipo de pessoa (Física/Jurídica)
- Nome completo / Razão social
- Email
- Telefone
- CPF/CNPJ
- Endereço completo

**Etapa 2: Upload de Documentos**
- Interface intuitiva para adicionar documentos
- Validação de tipo (apenas PDF)
- Validação de tamanho (máx 10MB)
- Preview de arquivos selecionados
- Indicação de documentos obrigatórios

**Etapa 3: Revisão**
- Resumo completo dos dados
- Lista de documentos anexados
- Confirmação antes de enviar

**Após envio:**
- Tela de confirmação com instruções
- Informação sobre tempo de análise
- Status do cadastro

---

#### 2. **Dashboard de Aprovação (`ClientApprovalDashboard.tsx`)**

**Funcionalidades:**

✅ **Listagem de Pendentes**
- Cards com todas informações do cliente
- Dados pessoais completos
- Lista de documentos com status de validação
- Alertas para documentos inválidos

✅ **Visualização de Documentos**
- Download direto do PDF
- Nome original do arquivo
- Tamanho do arquivo
- Status de validação (Válido/Inválido)
- Tipo de documento identificado

✅ **Ações de Aprovação**
- Botão "Aprovar Cadastro"
- Dialog de confirmação
- Validação automática de documentos
- Notificação ao cliente

✅ **Ações de Rejeição**
- Botão "Rejeitar Cadastro"
- Campo obrigatório para motivo
- Dialog de confirmação
- Notificação ao cliente com motivo

✅ **Interface Responsiva**
- Design moderno com Tailwind
- Cards informativos
- Badges de status
- Ícones intuitivos

---

## 🔐 Segurança Implementada

### Upload de Arquivos
- ✅ Apenas PDFs permitidos
- ✅ Validação de tipo MIME
- ✅ Verificação de extensão
- ✅ Limite de tamanho (10MB)
- ✅ Nome aleatório criptográfico
- ✅ Armazenamento fora do webroot
- ✅ Hash SHA-256 para integridade

### Acesso a Documentos
- ✅ Autenticação obrigatória
- ✅ Validação de tenant
- ✅ Role-based access control
- ✅ Proteção contra path traversal
- ✅ Validação de permissões

### Validação de PDFs
- ✅ Verificação de assinatura PDF
- ✅ Detecção de corrupção
- ✅ Validação de origem oficial
- ✅ Verificação de QR Code (quando aplicável)
- ✅ Extração de metadados

---

## 📋 Fluxo Completo

### 1. Cliente Acessa o Site
```
Cliente → Formulário de Cadastro
```

### 2. Preenche Dados
```
Etapa 1: Dados Pessoais
- Nome, email, CPF/CNPJ, endereço
```

### 3. Envia Documentos
```
Etapa 2: Upload de PDFs
- CPF (PDF oficial Receita Federal)
- RG ou CNH (com QR Code)
- Comprovante de Endereço (no nome do titular)
```

### 4. Revisão e Envio
```
Etapa 3: Confirma dados
↓
Sistema valida PDFs automaticamente
↓
Cadastro fica com status PENDING
↓
Notificação enviada para admins/funcionários
```

### 5. Funcionário Analisa
```
Dashboard de Aprovação
↓
Visualiza dados do cliente
↓
Faz download e verifica documentos
↓
Decisão: Aprovar ou Rejeitar
```

### 6. Aprovação
```
Se APROVAR:
- Status → APPROVED
- Cliente pode fazer locações
- Notificação enviada ao cliente

Se REJEITAR:
- Status → REJECTED
- Motivo informado ao cliente
- Cliente pode refazer cadastro
```

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: Client
```prisma
model Client {
  id              String   @id @default(uuid())
  tenantId        String
  name            String
  email           String
  phone           String?
  cpfCnpj         String
  personType      String   // FISICA | JURIDICA
  address         String?
  city            String?
  state           String?
  zipCode         String?
  status          String   // PENDING | APPROVED | REJECTED
  rejectionReason String?
  approvedAt      DateTime?
  approvedBy      String?  // userId do aprovador
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  documents       Document[]
  orders          Order[]
}
```

### Tabela: Document
```prisma
model Document {
  id               String   @id @default(uuid())
  clientId         String
  tenantId         String
  type             String   // CPF | RG | CNH | CNPJ | PROOF_OF_ADDRESS | etc
  fileName         String
  filePath         String
  fileSize         Int
  fileHash         String   // SHA-256
  mimeType         String
  uploadedAt       DateTime @default(now())
  isValid          Boolean
  validationResult Json     // Resultado completo da validação
  validatedAt      DateTime
  
  client           Client   @relation(fields: [clientId], references: [id])
}
```

---

## 📦 Arquivos Criados/Modificados

### Backend
```
✅ server/middleware/documentUpload.ts (NOVO)
✅ server/lib/pdfValidator.ts (NOVO)
✅ server/routes/clients.ts (ATUALIZADO)
✅ prisma/schema.prisma (ATUALIZADO - ver SCHEMA.md)
```

### Frontend
```
✅ client/components/ClientRegistrationWithDocuments.tsx (NOVO)
✅ client/components/ClientApprovalDashboard.tsx (NOVO)
```

### Dependências
```
✅ multer (para upload)
✅ @types/multer (tipos TypeScript)
```

---

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install multer @types/multer
```

### 2. Rodar Migrations
```bash
npx prisma migrate dev --name add_documents_and_approval
```

### 3. Configurar Rotas (server/index.ts)
```typescript
import clientsRouter from "./routes/clients";

app.use("/api/clients", clientsRouter);
```

### 4. Adicionar Componentes no Painel Admin
```typescript
// Em PainelAdmin.tsx
import ClientApprovalDashboard from '@/components/ClientApprovalDashboard';

// Nova aba:
<TabsContent value="aprovacoes">
  <ClientApprovalDashboard />
</TabsContent>
```

### 5. Adicionar Rota Pública de Cadastro
```typescript
// Em App.tsx
import ClientRegistrationWithDocuments from '@/components/ClientRegistrationWithDocuments';

<Route path="/cadastro" element={<ClientRegistrationWithDocuments />} />
```

---

## 🔄 Integração Futura com ClearSale

O sistema atual serve como **ponte para o ClearSale**:

### Fase 1 (Atual): Aprovação Manual
```
Cliente envia documentos
→ Funcionário valida manualmente
→ Aprova ou rejeita
```

### Fase 2 (Futura): Integração ClearSale
```typescript
// Após aprovação manual, enviar para ClearSale
async function sendToClearSale(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { documents: true }
  });

  // Enviar para API do ClearSale
  const clearSaleResult = await clearsaleAPI.validateClient({
    cpf: client.cpfCnpj,
    name: client.name,
    email: client.email,
    // ... documentos
  });

  // Atualizar status baseado na resposta
  if (clearSaleResult.approved) {
    // Manter aprovado
  } else {
    // Suspender ou solicitar revisão
  }
}
```

---

## ✅ Vantagens do Sistema

1. **Segurança**: Validação rigorosa de PDFs e documentos oficiais
2. **Controle**: Aprovação manual garante qualidade dos cadastros
3. **Rastreabilidade**: Histórico completo de quem aprovou/rejeitou
4. **Compliance**: Apenas documentos oficiais do governo
5. **Escalável**: Preparado para integração com ClearSale
6. **User-friendly**: Interface intuitiva para cliente e funcionário
7. **Auditável**: Todos documentos com hash e metadados salvos

---

## 📊 Status dos Cadastros

### PENDING (Amarelo)
- Aguardando análise
- Documentos já validados automaticamente
- Aparece no dashboard de aprovação

### APPROVED (Verde)
- Cliente validado e ativo
- Pode fazer locações
- Recebeu notificação de aprovação

### REJECTED (Vermelho)
- Cadastro rejeitado com motivo
- Cliente notificado
- Pode refazer cadastro

---

## 🎨 Interface

### Cadastro de Cliente
- ✅ Wizard de 3 etapas
- ✅ Progress bar visual
- ✅ Validação em tempo real
- ✅ Preview de arquivos
- ✅ Indicação de campos obrigatórios
- ✅ Tela de confirmação após envio

### Dashboard de Aprovação
- ✅ Cards informativos por cliente
- ✅ Badge de status
- ✅ Lista de documentos com ícones
- ✅ Botões de ação destacados
- ✅ Dialogs de confirmação
- ✅ Download direto de PDFs
- ✅ Alertas para documentos inválidos

---

## 🔍 Próximos Passos

1. ✅ **Testar fluxo completo**
2. ✅ **Ajustar validações conforme necessidade**
3. ⏳ **Integrar ClearSale (fase 2)**
4. ⏳ **Adicionar OCR para extrair dados dos PDFs**
5. ⏳ **Implementar verificação automática de QR Codes**
6. ⏳ **Dashboard com estatísticas de aprovações**

---

## 📝 Documentos Relacionados

- `SCHEMA.md` - Schema atualizado do banco de dados
- `ARQUITETURA-SAAS-FINAL.md` - Arquitetura multi-tenant
- `CORRECOES-LOCACOES.md` - Sistema de locações corrigido

---

## 🎯 Conclusão

Sistema **completo e funcional** de cadastro de clientes com:
- ✅ Validação automática de PDFs
- ✅ Aprovação manual por funcionários
- ✅ Interface moderna e intuitiva
- ✅ Segurança robusta
- ✅ Preparado para integração com ClearSale

**O sistema está pronto para uso imediato!** 🚀
