# CARTA DE SOLICITAÇÃO DE ACESSO - BIGDATACORP

---

**De:** Felipe Nunes de Andrade  
**Para:** BigDataCorp - Departamento Comercial  
**Assunto:** Solicitação de Acesso ao Ambiente de Sandbox e Proposta Comercial  
**Data:** 12 de Dezembro de 2025  

---

## Prezados,

Meu nome é **Felipe Nunes de Andrade**, desenvolvedor de sistemas e responsável pelo desenvolvimento de uma plataforma de gestão para locadoras de equipamentos audiovisuais.

Venho por meio desta solicitar acesso ao **ambiente de sandbox** da BigDataCorp para testes e validação de integração, bem como informações sobre planos comerciais adequados ao nosso perfil de uso.

---

## 🎯 SOBRE O PROJETO

### Sistema: **Bil's Cinema - Plataforma de Locação de Equipamentos**

Estamos desenvolvendo uma plataforma completa de gestão para locadoras de equipamentos profissionais de cinema e vídeo. O sistema inclui:

- **E-commerce** para locação de equipamentos (câmeras, lentes, iluminação, etc.)
- **Cadastro de clientes** Pessoa Física e Pessoa Jurídica
- **Gestão de contratos** e faturamento
- **Sistema financeiro** integrado (ERP)
- **Aplicativo mobile** para clientes

### Valor dos equipamentos:
Os equipamentos locados possuem alto valor agregado (câmeras profissionais, lentes cinema, iluminação LED), variando de **R$ 5.000 a R$ 150.000** por item. Por isso, a **validação de identidade** dos clientes é fundamental para a segurança das operações.

---

## 🔐 FUNCIONALIDADES NECESSÁRIAS

Preciso integrar as seguintes validações no fluxo de cadastro de clientes:

### Para Pessoa Física (CPF):

| Funcionalidade | Prioridade |
|----------------|------------|
| **Validação de CPF** | Alta |
| Consulta situação cadastral (Regular/Irregular) | Alta |
| Confirmação de nome completo | Alta |
| Confirmação de data de nascimento | Média |
| Nome da mãe | Média |
| **Biometria Facial** (comparação com CNH/TSE) | Alta |
| Liveness Detection (anti-spoofing) | Alta |

### Para Pessoa Jurídica (CNPJ):

| Funcionalidade | Prioridade |
|----------------|------------|
| **Validação de CNPJ** | Alta |
| Razão Social e Nome Fantasia | Alta |
| Situação cadastral | Alta |
| Quadro societário | Média |
| **Validação do representante legal** (CPF + Face) | Alta |

---

## 📊 VOLUME ESTIMADO

### Fase inicial (primeiros 6 meses):
- **50 a 100 cadastros/mês**
- Estimativa: ~100 consultas de CPF + ~100 validações faciais

### Fase de crescimento (após 6 meses):
- **200 a 500 cadastros/mês**
- Possibilidade de expansão para outras locadoras parceiras

---

## 🔧 REQUISITOS TÉCNICOS

Nossa stack tecnológica:

- **Backend:** Node.js / Express / TypeScript
- **Frontend:** React / TypeScript
- **Banco de dados:** PostgreSQL / Prisma ORM
- **Hospedagem:** AWS (planejado)

Precisamos de:
- **API REST** com documentação clara
- **Ambiente de Sandbox** para desenvolvimento e testes
- **Suporte técnico** durante a integração
- **Webhooks** (se disponível) para notificações assíncronas

---

## 💼 SOLICITAÇÕES

1. **Acesso ao Sandbox** por período de teste (7-14 dias)
2. **Documentação técnica** da API
3. **Proposta comercial** com:
   - Tabela de preços por tipo de consulta
   - Pacotes disponíveis
   - Condições para startups/pequenas empresas
4. **Contato técnico** para suporte na integração

---

## 📞 DADOS PARA CONTATO

**Nome:** Felipe Nunes de Andrade  
**Email:** [SEU_EMAIL_AQUI]  
**Telefone:** [SEU_TELEFONE_AQUI]  
**Empresa:** [NOME_DA_SUA_EMPRESA_OU_MEI]  
**CNPJ:** [SEU_CNPJ_SE_TIVER]  

**Endereço:**  
[SEU_ENDEREÇO]  
Belo Horizonte - MG  

---

## 📎 ANEXOS (se necessário)

- Apresentação do sistema (screenshots)
- Fluxo de cadastro planejado
- Diagrama de integração

---

Agradeço a atenção e aguardo retorno para darmos início à parceria.

Atenciosamente,

---

**Felipe Nunes de Andrade**  
Desenvolvedor de Sistemas  
Projeto: Bil's Cinema - Plataforma de Locação  

---

*Esta carta pode ser enviada para:*
- **Email:** comercial@bigdatacorp.com.br
- **Site:** https://bigdatacorp.com.br/contato
- **Formulário:** https://bigdatacorp.com.br (botão "Fale Conosco")

