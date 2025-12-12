# 🎛️ Sistema de Configurações Completo

## 📋 Visão Geral

A página **Configurações** (`/configuracoes`) agora é um centro de controle completo para gerenciar todas as funcionalidades do sistema. Todas as configurações estão organizadas em cards visuais e intuitivos.

---

## 🎯 Como Acessar

1. **Login como Admin ou Master Admin**
2. **Painel Admin** → Clique em **"Configurações"** no menu lateral
3. Ou acesse diretamente: `/configuracoes`

---

## 🛠️ Configurações Disponíveis

### 1. ⚙️ Configurações Gerais

**O que configura:**
- 📧 Notificações por Email
- 💳 Métodos de Pagamento
- 📝 Regras de Locação
- 🧾 Emissão de NFSe

**Funcionalidades:**
- Ativar/desativar notificações automáticas
- Configurar multa por atraso (% por dia)
- Configurar caução mínima (%)
- Habilitar emissão automática de notas fiscais

---

### 2. 📱 Configurações de Scanner (QR Code/Barcode)

**O que configura:**
- Scanner na saída (checkout)
- Scanner na devolução (check-in)
- Tornar scanner obrigatório ou opcional

**Funcionalidades:**
- ✅ **Habilitar conferência na saída**: Cliente escaneia produtos ao retirar
- ✅ **Habilitar conferência na devolução**: Cliente escaneia produtos ao devolver
- ⚠️ **Tornar obrigatório**: Sem escaneamento = sem finalização

**Uso Prático:**
```
Exemplo: Locadora de equipamentos de filmagem

1. Habilita scanner na saída e devolução
2. Torna obrigatório para evitar erros
3. Cliente escaneia cada câmera ao retirar
4. Sistema valida automaticamente
5. Na devolução, escaneia novamente para confirmar
```

---

### 3. 📧 Configurações de Email (SMTP)

**O que configura:**
- Servidor SMTP para envio de emails
- Credenciais de autenticação
- Nome e email do remetente

**Campos Configuráveis:**
- 🖥️ **Servidor SMTP**: smtp.gmail.com, smtp.office365.com, etc.
- 🔢 **Porta**: 587 (TLS), 465 (SSL)
- 👤 **Usuário**: seu-email@dominio.com
- 🔒 **Senha**: senha do email ou senha de aplicativo
- 📝 **Nome do Remetente**: Nome exibido no email
- 📬 **Email do Remetente**: Email de origem

**Exemplos de Uso:**

**Gmail:**
```
SMTP: smtp.gmail.com
Porta: 587
Usuário: contato@minhalocadora.com
Senha: [senha de aplicativo do Google]
TLS: Ativado
```

**Outlook/Office365:**
```
SMTP: smtp.office365.com
Porta: 587
Usuário: contato@minhalocadora.com
Senha: [sua senha]
TLS: Ativado
```

---

### 4. 💬 Configurações de WhatsApp

**O que configura:**
- Integração com WhatsApp Business API
- Mensagens automáticas para clientes

**Funcionalidades:**
- ✅ **Confirmação de Pedido**: Envia mensagem ao criar locação
- ⏰ **Lembrete de Devolução**: Avisa X dias antes do vencimento
- 🧾 **Enviar NFSe**: Envia nota fiscal por WhatsApp

**Mensagens Automáticas:**
```
📦 Pedido Confirmado
"Olá {cliente}! Seu pedido #{numero} foi confirmado. 
Retirada: {data}. Obrigado!"

⏰ Lembrete de Devolução
"Olá {cliente}! Lembre-se: devolução do pedido #{numero} 
é amanhã às {hora}. Evite multas!"

🧾 Nota Fiscal
"Olá {cliente}! Segue sua nota fiscal referente ao 
pedido #{numero}: [link]"
```

**Requisitos:**
- Conta WhatsApp Business API
- API Key válida
- Número verificado

---

### 5. 🔒 Configurações de Segurança

**O que configura:**
- Políticas de autenticação
- Requisitos de senha
- Controle de acesso

**Funcionalidades:**

#### 🔐 Autenticação
- **2FA (Dois Fatores)**: Código adicional no login
- **Tentativas Máximas**: Bloquear após X tentativas erradas
- **Duração do Bloqueio**: Tempo bloqueado (5-60 min)
- **Timeout de Sessão**: Deslogar após inatividade

#### 🔑 Política de Senhas
- **Senha Forte**: Ativar requisitos
- **Comprimento Mínimo**: 6-32 caracteres
- **Letras Maiúsculas**: Exigir A-Z
- **Números**: Exigir 0-9
- **Caracteres Especiais**: Exigir !@#$%

#### 🌐 Controle de Acesso
- **Whitelist de IPs**: Permitir apenas IPs específicos
- **IPs Permitidos**: Lista separada por vírgula

**Exemplo de Política Forte:**
```
✅ Comprimento: 12+ caracteres
✅ Maiúsculas: Sim
✅ Números: Sim
✅ Especiais: Sim
✅ Tentativas: 3 máximo
✅ Bloqueio: 30 minutos
✅ 2FA: Obrigatório

Senha válida: Loc@dor@2025!
```

---

### 6. 🎨 Configurações de Aparência

**O que configura:**
- Identidade visual do sistema
- Logo e favicon
- Paleta de cores

**Funcionalidades:**

#### 🏢 Identidade
- **Nome da Empresa**: Exibido em todo sistema
- **Logo**: Upload de imagem (PNG/SVG, max 2MB)
- **Favicon**: Ícone da aba do navegador (16x16 ou 32x32px)

#### 🎨 Paleta de Cores
- **Cor Primária**: Cor principal (amarelo padrão: #F59E0B)
- **Cor Secundária**: Fundo e elementos (cinza: #1F2937)
- **Cor de Destaque**: Links e interações (azul: #3B82F6)

**Como Personalizar:**
```
1. Clique no seletor de cor
2. Escolha a cor desejada
3. Ou digite o código HEX (#F59E0B)
4. Veja preview em tempo real
5. Salve as alterações
```

**Exemplo de Personalização:**
```
🎬 Locadora de Cinema:
Primária: #E50914 (vermelho Netflix)
Secundária: #141414 (preto)
Destaque: #FFD700 (dourado)

🎸 Locadora de Instrumentos:
Primária: #9333EA (roxo)
Secundária: #1E293B (cinza escuro)
Destaque: #10B981 (verde)
```

---

### 7. 💾 Configurações de Backup

**O que configura:**
- Backup automático do banco de dados
- Retenção de backups
- Armazenamento em nuvem

**Funcionalidades:**

#### 🔄 Backup Automático
- **Frequência**: Hora/Dia/Semana/Mês
- **Retenção**: Manter por 7-365 dias
- **Auto-limpeza**: Remove backups antigos

#### ☁️ Armazenamento
- **Local**: No próprio servidor
- **AWS S3**: Amazon Web Services
- **Google Drive**: Integração Google
- **Dropbox**: Integração Dropbox
- **Azure**: Microsoft Azure

#### 💾 Backup Manual
- **Criar Agora**: Backup sob demanda
- **Restaurar**: Voltar para backup anterior
- **Últimos Backups**: Lista dos 3 mais recentes

**Estratégia Recomendada:**
```
Pequena Locadora:
- Frequência: Diária (03:00)
- Retenção: 30 dias
- Armazenamento: Local + Google Drive

Grande Locadora:
- Frequência: A cada hora
- Retenção: 90 dias
- Armazenamento: AWS S3 + Azure (redundância)
```

---

## 📊 Resumo das Configurações

| Card | O que faz | Quando usar |
|------|-----------|-------------|
| ⚙️ **Geral** | Regras de negócio | Sempre - configuração base |
| 📱 **Scanner** | QR Code/Barcode | Se tem muitos produtos |
| 📧 **Email** | SMTP | Para notificar clientes |
| 💬 **WhatsApp** | Mensagens automáticas | Marketing e lembretes |
| 🔒 **Segurança** | Proteção do sistema | Recomendado sempre |
| 🎨 **Aparência** | Visual personalizado | Para identidade da marca |
| 💾 **Backup** | Proteção de dados | ESSENCIAL - sempre |

---

## 🎯 Fluxo de Configuração Inicial

### Para uma nova locadora:

```mermaid
1. ⚙️ Configurações Gerais
   ↓ Configure multas e regras básicas
   
2. 🔒 Segurança
   ↓ Ative 2FA e políticas de senha
   
3. 💾 Backup
   ↓ Configure backup diário
   
4. 📧 Email
   ↓ Configure SMTP para notificações
   
5. 🎨 Aparência
   ↓ Personalize com logo e cores
   
6. 📱 Scanner (Opcional)
   ↓ Se tem muitos produtos
   
7. 💬 WhatsApp (Opcional)
   ↓ Para engagement com clientes
```

---

## 💡 Dicas Importantes

### ✅ Configurações Essenciais (faça primeiro)
1. **Backup**: Proteja seus dados
2. **Segurança**: Senhas fortes
3. **Geral**: Defina regras de negócio

### 🎨 Configurações Opcionais (melhoria)
1. **Aparência**: Personalização visual
2. **Email**: Automatizar comunicação
3. **WhatsApp**: Melhor engajamento

### 🔧 Configurações Avançadas (se precisar)
1. **Scanner**: Para conferência rigorosa
2. **Backup em Nuvem**: Redundância extra

---

## 🚀 Próximos Passos

Após configurar tudo:

1. ✅ **Teste cada funcionalidade**
2. 📝 **Documente suas configurações**
3. 👥 **Treine sua equipe**
4. 🔄 **Revise periodicamente**

---

## 📞 Suporte

Todas as configurações têm:
- ℹ️ Alertas informativos
- 💡 Dicas de uso
- 🔄 Botão para restaurar padrões
- 💾 Salvamento individual

**Qualquer dúvida**: Cada card é autoexplicativo com descrições claras!

---

**Sistema criado para locadoras de R$ 220.000/ano** 💰✨

