# 🔍 Como Verificar se um Cliente Está Cadastrado

## Cliente: Eduarda
- **Email**: eduardasasascha37@gmail.com
- **Senha**: Eduarda1998@

## 📋 Métodos de Verificação

### 1. Via API (Recomendado)

#### Buscar por Email
```bash
GET /api/clients/search?email=eduardasasascha37@gmail.com
```

**Resposta se encontrado:**
```json
{
  "found": true,
  "client": {
    "id": "uuid",
    "name": "Eduarda",
    "email": "eduardasasascha37@gmail.com",
    "phone": "...",
    "cpfCnpj": "123***98",
    "status": "PENDING",
    "registrationStatus": "PENDING",
    "createdAt": "2025-01-XX...",
    "documentsCount": 3,
    "documents": [...],
    "ordersCount": 0
  }
}
```

**Resposta se não encontrado:**
```json
{
  "error": "Cliente não encontrado",
  "email": "eduardasasascha37@gmail.com",
  "message": "Nenhum cliente cadastrado com este email"
}
```

#### Listar Todos os Pendentes
```bash
GET /api/clients/pending
Headers: Authorization: Bearer <token>
```

### 2. Via Interface Web

1. **Acesse o Painel Admin**: `/painel-admin`
2. **Vá para a aba "Aprovações"**
3. **Procure por**: "eduardasasascha37@gmail.com" ou "Eduarda"

### 3. Via Banco de Dados (Prisma Studio)

```bash
# Abrir Prisma Studio
npx prisma studio

# Procurar na tabela Client:
# - email: eduardasasascha37@gmail.com
# - status: PENDING
```

## 🔐 Status Possíveis

- **PENDING**: Aguardando aprovação (documentos enviados)
- **DOCUMENTS_PENDING**: Falta enviar documentos
- **UNDER_REVIEW**: Em análise
- **APPROVED**: Aprovado (pode fazer locações)
- **REJECTED**: Rejeitado
- **INCOMPLETE**: Incompleto

## ✅ Verificações a Fazer

1. ✅ Cliente existe no banco?
2. ✅ Documentos foram enviados?
3. ✅ Status atual (PENDING, APPROVED, etc)?
4. ✅ Documentos estão válidos?
5. ✅ Cliente pode fazer login?

## 🚀 Teste Rápido

### Via cURL:
```bash
curl "http://localhost:8080/api/clients/search?email=eduardasasascha37@gmail.com"
```

### Via Navegador:
```
http://localhost:8080/api/clients/search?email=eduardasasascha37@gmail.com
```

### Via JavaScript (Console do Navegador):
```javascript
fetch('/api/clients/search?email=eduardasasascha37@gmail.com')
  .then(r => r.json())
  .then(data => console.log(data));
```

## 📝 Próximos Passos

Se o cliente estiver cadastrado:
1. Verificar documentos enviados
2. Validar documentos
3. Aprovar ou rejeitar cadastro
4. Notificar cliente

Se o cliente NÃO estiver cadastrado:
1. Verificar se houve erro no cadastro
2. Verificar logs do servidor
3. Verificar se documentos foram enviados corretamente
