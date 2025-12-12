# Configurações de Conferência - Sistema Opcional

## 🎯 Visão Geral

O sistema de conferência com QR Code e Código de Barras é **totalmente opcional** e controlado pelo gestor da locadora através de configurações.

Por padrão, o sistema vem **DESABILITADO**. O gestor decide se quer usar ou não.

---

## ⚙️ Configurando o Sistema

### Acessando as Configurações

1. Faça login como **ADMIN** ou **MASTER_ADMIN**
2. Acesse o menu **Configurações** ou vá diretamente para `/configuracoes`
3. Localize o card **"Configurações de Conferência"**

### Opções Disponíveis

#### 1. Conferência na Saída (Checkout)

**Habilitar Conferência na Saída:**
- ☐ Desabilitado (padrão)
- ☑ Habilitado

Quando habilitado, aparece o botão **"Conferir Saída"** na interface.

**Tornar Obrigatório:**
- ☐ Opcional - Pode usar ou não
- ☑ Obrigatório - Sistema exige a conferência

#### 2. Conferência na Devolução (Check-in)

**Habilitar Conferência na Devolução:**
- ☐ Desabilitado (padrão)
- ☑ Habilitado

Quando habilitado, aparece o botão **"Conferir Devolução"** na interface.

**Tornar Obrigatório:**
- ☐ Opcional - Pode usar ou não
- ☑ Obrigatório - Sistema exige a conferência

---

## 🔄 Como Funciona

### Estado: DESABILITADO (Padrão)

```
┌─────────────────────────────────────┐
│  Sistema Funciona Normalmente       │
│  ✓ Criar pedidos                    │
│  ✓ Registrar saídas                 │
│  ✓ Registrar devoluções             │
│  ✗ Sem botão de conferência         │
│  ✗ Sem necessidade de etiquetas     │
└─────────────────────────────────────┘
```

**Quando usar:** 
- Locadoras pequenas
- Poucos produtos
- Controle manual suficiente
- Não quer imprimir etiquetas

### Estado: HABILITADO (Opcional)

```
┌─────────────────────────────────────┐
│  Sistema com Conferência Opcional   │
│  ✓ Criar pedidos                    │
│  ✓ Registrar saídas                 │
│  ✓ Registrar devoluções             │
│  ✓ Botão "Conferir" disponível      │
│  ✓ Pode usar se quiser              │
│  ✓ Pode pular se não quiser         │
└─────────────────────────────────────┘
```

**Quando usar:**
- Quer testar o sistema
- Usa conferência em alguns casos
- Flexibilidade para decidir

### Estado: HABILITADO + OBRIGATÓRIO

```
┌─────────────────────────────────────┐
│  Sistema com Conferência Obrigatória│
│  ✓ Criar pedidos                    │
│  ✓ Registrar saídas (COM scan)      │
│  ✓ Registrar devoluções (COM scan)  │
│  ✓ Botão "Conferir" disponível      │
│  ⚠ DEVE escanear todos produtos     │
│  ✗ Não pode pular conferência       │
└─────────────────────────────────────┘
```

**Quando usar:**
- Muitos produtos
- Controle rigoroso necessário
- Reduzir erros ao máximo
- Rastreabilidade completa

---

## 📊 Cenários de Uso

### Cenário 1: Locadora Pequena (Recomendado: DESABILITADO)

**Situação:**
- 20-50 produtos
- 1-2 funcionários
- Todos conhecem os produtos
- Controle manual funciona bem

**Configuração:**
```
Conferência na Saída: ☐ Desabilitado
Conferência na Devolução: ☐ Desabilitado
```

**Vantagens:**
- Processo mais rápido
- Sem necessidade de equipamento
- Sem custo de etiquetas
- Interface mais limpa

### Cenário 2: Locadora Média (Recomendado: OPCIONAL)

**Situação:**
- 50-200 produtos
- 3-5 funcionários
- Alguns produtos similares
- Erros ocasionais

**Configuração:**
```
Conferência na Saída: ☑ Habilitado (Opcional)
Conferência na Devolução: ☑ Habilitado (Opcional)
```

**Vantagens:**
- Flexibilidade
- Usa quando necessário
- Testa o sistema gradualmente
- Adota aos poucos

### Cenário 3: Locadora Grande (Recomendado: OBRIGATÓRIO)

**Situação:**
- 200+ produtos
- 6+ funcionários
- Muitos produtos similares
- Alto volume de locações
- Erros custosos

**Configuração:**
```
Conferência na Saída: ☑ Habilitado + ☑ Obrigatório
Conferência na Devolução: ☑ Habilitado + ☑ Obrigatório
```

**Vantagens:**
- Controle total
- Erros minimizados
- Rastreabilidade completa
- Profissionalismo

---

## 🛠️ Preparação do Sistema

### Se Decidir USAR o Sistema de Conferência:

1. **Imprimir Etiquetas**
   ```
   ✓ Acesse cada produto
   ✓ Clique em "Imprimir Etiqueta"
   ✓ Escolha o tamanho apropriado
   ✓ Imprima e cole no produto
   ```

2. **Teste Inicial**
   ```
   ✓ Configure como "Opcional" primeiro
   ✓ Teste com alguns produtos
   ✓ Treine a equipe
   ✓ Depois mude para "Obrigatório" se desejar
   ```

3. **Equipamento Necessário**
   - Computador/Tablet com câmera (para escanear)
   - Impressora (para etiquetas)
   - Papel adesivo (para etiquetas)

### Se Decidir NÃO USAR:

1. **Configuração**
   ```
   ✓ Deixe tudo desabilitado (padrão)
   ✓ Sistema funciona normalmente
   ✓ Sem botões de conferência
   ✓ Sem necessidade de etiquetas
   ```

2. **Você Ainda Tem Acesso a:**
   - Gerenciamento de produtos
   - Controle de estoque
   - Pedidos e locações
   - Relatórios
   - Todas funcionalidades principais

---

## 🔑 Permissões

Apenas usuários com permissão de **ADMIN** ou **MASTER_ADMIN** podem:
- Acessar as configurações
- Habilitar/Desabilitar conferência
- Alterar obrigatoriedade
- Configurar o sistema

---

## 💡 Recomendações

### Comece Devagar
1. Deixe desabilitado inicialmente
2. Avalie se sua operação precisa
3. Se decidir usar, habilite como opcional
4. Teste por 1-2 semanas
5. Se funcionar bem, torne obrigatório

### Sinais de que PRECISA do Sistema:
- ✗ Frequentes erros de separação
- ✗ Produtos parecidos confundidos
- ✗ Muitos funcionários
- ✗ Alta rotatividade de funcionários
- ✗ Muitos produtos similares
- ✗ Cliente reclama de erros

### Sinais de que NÃO PRECISA:
- ✓ Poucos produtos
- ✓ Equipe pequena e experiente
- ✓ Produtos muito diferentes
- ✓ Controle manual funciona
- ✓ Sem erros frequentes
- ✓ Operação simples

---

## 📞 Suporte

Se tiver dúvidas sobre qual configuração usar para seu negócio, entre em contato com o suporte.

---

## 🔄 Mudando de Ideia

Você pode mudar as configurações a qualquer momento:
- Habilitar → Desabilitar
- Desabilitar → Habilitar
- Opcional → Obrigatório
- Obrigatório → Opcional

**Não há penalidade ou perda de dados ao mudar as configurações.**

---

**Última atualização:** 12/11/2025
**Versão:** 1.0.0

