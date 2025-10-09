# 🧪 Teste Completo do Sistema - Todos os Cenários

## 🎯 Servidor Rodando

```
✅ VITE v6.3.5  ready in 1186 ms
✅ Local:   http://localhost:8081/
✅ Sistema de fila NFSe iniciado
✅ Sistema atualizado (v1.00)
```

---

## 📋 Plano de Testes por Perfil

### 1️⃣ **Modo Cliente** 👤

#### Cenário 1.1: Cadastro Novo Cliente
```
URL: http://localhost:8081/cadastro

✅ Testar:
[ ] Formulário carrega
[ ] Progress bar (3 etapas) aparece
[ ] Etapa 1: Dados Pessoais
    [ ] Select tipo pessoa (Física/Jurídica)
    [ ] Input nome funciona
    [ ] Input email valida formato
    [ ] Input telefone aceita máscara
    [ ] Input CPF/CNPJ valida
    [ ] Input endereço funciona
    [ ] Select estado funciona
    [ ] Input CEP busca endereço automático
    [ ] Botão "Próximo" valida campos
    [ ] Validação CPF/CNPJ com API Brasil
    [ ] Mensagens de erro claras

[ ] Etapa 2: Upload Documentos
    [ ] Botões adicionar documento aparecem
    [ ] Input file abre ao clicar
    [ ] Aceita apenas PDF
    [ ] Rejeita arquivos > 10MB
    [ ] Preview do arquivo aparece
    [ ] Nome e tamanho do arquivo mostrados
    [ ] Badge verde "Pronto" aparece
    [ ] Botão remover funciona
    [ ] Múltiplos uploads (até 5)
    [ ] Documentos obrigatórios marcados (*)
    [ ] Validação de documentos obrigatórios
    [ ] Botão "Voltar" funciona
    [ ] Botão "Próximo" valida documentos

[ ] Etapa 3: Revisão
    [ ] Resumo dados pessoais correto
    [ ] Lista documentos anexados
    [ ] Status "Pronto" em cada documento
    [ ] Alerta sobre tempo de análise
    [ ] Botão "Voltar" funciona
    [ ] Botão "Enviar Cadastro" funciona
    [ ] Loading durante envio
    
[ ] Após Envio
    [ ] Tela de confirmação aparece
    [ ] Ícone verde de sucesso
    [ ] Mensagem clara
    [ ] Informação sobre próximos passos
```

#### Cenário 1.2: Login Cliente
```
URL: http://localhost:8081/login

✅ Testar:
[ ] Página de login carrega
[ ] Credenciais demo visíveis
[ ] Tab "Entrar" e "Cadastrar"
[ ] Input email funciona
[ ] Input senha funciona
[ ] Toggle mostrar/ocultar senha
[ ] Checkbox "Lembrar-me"
[ ] Link "Esqueceu senha"
[ ] Botão "Entrar" funciona
[ ] Loading durante login
[ ] Validação de campos vazios
[ ] Mensagem erro credenciais inválidas
[ ] Redirect após login bem-sucedido

Credenciais Cliente:
Email: joao.silva@email.com
Senha: 123456

[ ] Login com credenciais corretas
[ ] Redirect para /area-cliente
```

#### Cenário 1.3: Área do Cliente
```
URL: http://localhost:8081/area-cliente

✅ Testar (após login):
[ ] Página carrega
[ ] Dados do cliente aparecem
[ ] Status do cadastro visível
[ ] Se PENDING: mensagem aguardando aprovação
[ ] Se APPROVED: pode fazer locações
[ ] Se REJECTED: mostra motivo
[ ] Histórico de pedidos
[ ] Documentos enviados listados
[ ] Botão "Editar Perfil"
[ ] Botão "Sair" funciona
[ ] Logout redireciona para home
```

#### Cenário 1.4: Navegação e Locação
```
✅ Testar:
[ ] Home carrega (http://localhost:8081/)
[ ] Header com logo e menu
[ ] Links de navegação funcionam
[ ] Seção hero aparece
[ ] Produtos em destaque

URL: http://localhost:8081/equipamentos
[ ] Lista de produtos carrega
[ ] Cards de produtos aparecem
[ ] Imagens carregam
[ ] Preços visíveis
[ ] Botão "Ver Detalhes" funciona
[ ] Filtros por categoria
[ ] Busca por nome
[ ] Grid responsivo

URL: http://localhost:8081/produto/:id
[ ] Detalhes do produto
[ ] Galeria de imagens
[ ] Preços (diário/semanal/mensal)
[ ] Especificações
[ ] Disponibilidade
[ ] Seletor de quantidade
[ ] Seletor de datas
[ ] Botão "Adicionar ao Carrinho"
[ ] Produtos relacionados

URL: http://localhost:8081/carrinho
[ ] Carrinho vazio (mensagem)
[ ] Itens no carrinho listados
[ ] Subtotal por item
[ ] Total geral
[ ] Alterar quantidade
[ ] Remover item
[ ] Selecionar datas
[ ] Aplicar cupom
[ ] Botão "Finalizar Pedido"
[ ] Botão "Continuar Comprando"
```

---

### 2️⃣ **Modo Funcionário** 👨‍💼

#### Cenário 2.1: Login Funcionário
```
URL: http://localhost:8081/login

Credenciais Funcionário:
Email: funcionario@empresa.com
Senha: func123 (ou admin123)

✅ Testar:
[ ] Login com credenciais funcionário
[ ] Redirect para /painel-admin
[ ] Acesso ao painel administrativo
```

#### Cenário 2.2: Dashboard Funcionário
```
URL: http://localhost:8081/painel-admin

✅ Testar Tab "Dashboard":
[ ] Cards com métricas
[ ] Equipamentos disponíveis
[ ] Pedidos ativos
[ ] Faturamento mensal
[ ] Clientes cadastrados
[ ] Gráficos aparecem
[ ] Dados atualizados

✅ Testar Tab "Pedidos":
[ ] Lista de pedidos
[ ] Filtro por status
[ ] Busca por cliente/número
[ ] Botão "Novo Pedido"
[ ] Modal de novo pedido abre
[ ] Ver detalhes pedido
[ ] Atualizar status
[ ] Imprimir pedido

✅ Testar Tab "Estoque":
[ ] Lista de produtos
[ ] Quantidade disponível
[ ] Status (Disponível/Locado/Manutenção)
[ ] Buscar produto
[ ] Filtrar por categoria
[ ] Botão "Novo Produto" (se tiver permissão)
[ ] Editar produto (se tiver permissão)

✅ Testar Tab "Clientes":
[ ] Lista clientes aprovados
[ ] Buscar cliente
[ ] Ver detalhes cliente
[ ] Histórico de locações
[ ] CPF/CNPJ
[ ] Contato
[ ] Tipo (Cliente/Fornecedor)

✅ Testar Tab "Aprovações" ⭐ NOVO:
[ ] Lista cadastros pendentes
[ ] Cards informativos
[ ] Dados completos do cliente
[ ] Lista de documentos
[ ] Badge de validação (Válido/Inválido)
[ ] Botão download documento
[ ] PDF baixa corretamente
[ ] Alertas documentos inválidos
[ ] Botão "Aprovar Cadastro"
[ ] Dialog de confirmação
[ ] Aprovação funciona
[ ] Toast de sucesso
[ ] Lista atualiza
[ ] Cliente notificado
[ ] Botão "Rejeitar Cadastro"
[ ] Dialog com campo motivo
[ ] Motivo obrigatório
[ ] Rejeição funciona
[ ] Cliente notificado com motivo
[ ] Se não há pendentes: mensagem "Nenhum cadastro pendente"

✅ Testar Tab "Documentos":
[ ] Lista de documentos
[ ] Filtros
[ ] Busca
[ ] Upload novo documento
[ ] Download documento
[ ] Categorias

✅ Testar Tab "Configurações":
[ ] Acesso permitido ou negado (depende da role)
```

---

### 3️⃣ **Modo Admin da Locadora** 👨‍💼⭐

#### Cenário 3.1: Login Admin
```
URL: http://localhost:8081/login

Credenciais Admin:
Email: cabecadeefeitocine@gmail.com
Senha: admin123

OU

Email: admin@locadora.com
Senha: admin123

✅ Testar:
[ ] Login com credenciais admin
[ ] Redirect para /painel-admin
[ ] Acesso completo ao painel
```

#### Cenário 3.2: Todos os Recursos Admin
```
URL: http://localhost:8081/painel-admin

✅ Testar TODAS as Tabs:

[ ] Tab "Dashboard"
    [ ] Métricas completas
    [ ] Gráficos interativos
    [ ] Pedidos recentes
    [ ] Alertas importantes
    [ ] Estoque crítico
    [ ] Performance

[ ] Tab "Pedidos"
    [ ] Listar todos
    [ ] Criar novo pedido
    [ ] Editar pedido
    [ ] Atualizar status
    [ ] Cancelar pedido
    [ ] Processar devolução
    [ ] Calcular multas
    [ ] Imprimir/exportar

[ ] Tab "Estoque"
    [ ] Listar produtos
    [ ] Criar produto
    [ ] Editar produto
    [ ] Deletar produto
    [ ] Upload imagens
    [ ] Definir preços
    [ ] Controlar quantidade
    [ ] Status do produto

[ ] Tab "Categorias"
    [ ] Listar categorias
    [ ] Criar categoria
    [ ] Editar categoria
    [ ] Deletar categoria
    [ ] Associar produtos

[ ] Tab "Clientes"
    [ ] Listar todos
    [ ] Buscar/filtrar
    [ ] Ver detalhes
    [ ] Editar cliente
    [ ] Histórico completo
    [ ] Exportar lista

[ ] Tab "Aprovações" ⭐
    [ ] Dashboard completo
    [ ] Aprovar cadastros
    [ ] Rejeitar cadastros
    [ ] Download documentos
    [ ] Validações visuais
    [ ] Notificações

[ ] Tab "Serviços"
    [ ] Listar serviços
    [ ] Criar serviço
    [ ] Editar serviço
    [ ] Deletar serviço
    [ ] Preços e duração

[ ] Tab "Documentos"
    [ ] Sistema de arquivos
    [ ] Upload
    [ ] Download
    [ ] Organização

[ ] Tab "Financeiro"
    [ ] Relatórios
    [ ] Pagamentos
    [ ] Inadimplência
    [ ] Gráficos financeiros
    [ ] Exportar relatórios

[ ] Tab "Importar"
    [ ] Importar clientes
    [ ] Importar produtos
    [ ] Importar pedidos
    [ ] Validação de dados

[ ] Tab "E-commerce"
    [ ] Configurações loja
    [ ] Produtos online
    [ ] Pedidos online
    [ ] Integrações

[ ] Tab "Área Cliente"
    [ ] Gerenciar área
    [ ] Personalizações
    [ ] Comunicações

[ ] Tab "Multi-Tenant"
    [ ] Configurações tenant
    [ ] Dados isolados
    [ ] Licença

[ ] Tab "Templates"
    [ ] Templates disponíveis
    [ ] Aplicar template
    [ ] Personalizar

[ ] Tab "Auto Ponto"
    [ ] Registros de ponto
    [ ] Funcionários
    [ ] Relatórios

[ ] Tab "Funcionários"
    [ ] Listar funcionários
    [ ] Adicionar funcionário
    [ ] Editar funcionário
    [ ] Definir permissões
    [ ] Ativar/desativar

[ ] Tab "Configurações"
    [ ] Upload logo
    [ ] Cores personalizadas
    [ ] Preview em tempo real
    [ ] Salvar configurações
    [ ] Dados da empresa
    [ ] Integrações
    [ ] NFSe
```

---

### 4️⃣ **Modo Dono do Sistema (Otávio)** 👑

#### Cenário 4.1: Login Master Admin
```
URL: http://localhost:8081/login

Credenciais Master:
Email: otavio@commandd.com (criar se necessário)
Senha: master123

OU usar admin com role MASTER_ADMIN

✅ Testar:
[ ] Login com credenciais master
[ ] Redirect para /master-admin
[ ] Dashboard master carrega
```

#### Cenário 4.2: Dashboard Master (Otávio)
```
URL: http://localhost:8081/master-admin

✅ Testar Tab "Visão Geral":
[ ] Total de locadoras
[ ] Licenças ativas
[ ] Licenças suspensas
[ ] Receita mensal total
[ ] Gráficos consolidados
[ ] Métricas globais
[ ] Crescimento

✅ Testar Tab "Locadoras":
[ ] Lista todas locadoras
[ ] Status de cada licença
[ ] Tipo de plano
[ ] Último heartbeat
[ ] Indicador verde/amarelo/vermelho
[ ] Próximo pagamento
[ ] Status pagamento
[ ] Botão "Nova Licença"
[ ] Modal criar licença
[ ] Formulário completo
[ ] Gerar license key
[ ] Botão "Editar" por locadora
[ ] Modal editar
[ ] Atualizar dados
[ ] Botão "Suspender"
[ ] Confirmação
[ ] Suspensão funciona
[ ] Botão "Ativar"
[ ] Ativação funciona
[ ] Ver detalhes completos
[ ] Histórico de pagamentos

✅ Testar Tab "Heartbeats":
[ ] Lista todos heartbeats
[ ] Status em tempo real
[ ] Verde: online (< 5 min)
[ ] Amarelo: delay (5-15 min)
[ ] Vermelho: offline (> 15 min)
[ ] Último ping timestamp
[ ] Uso de recursos
[ ] Alertas automáticos
[ ] Filtro por status

✅ Testar Tab "Financeiro":
[ ] Faturas geradas
[ ] Histórico pagamentos
[ ] Receita por locadora
[ ] Inadimplentes destacados
[ ] Calendário pagamentos
[ ] Exportar relatórios
[ ] Gráficos financeiros
[ ] MRR (Monthly Recurring Revenue)
[ ] ARR (Annual Recurring Revenue)
[ ] Churn rate

✅ Testar Funcionalidades Master:
[ ] NÃO tem acesso aos dados das locadoras
[ ] NÃO vê produtos das locadoras
[ ] NÃO vê clientes das locadoras
[ ] NÃO vê pedidos das locadoras
[ ] SÓ vê dados de licenciamento
[ ] SÓ gerencia licenças
[ ] SÓ recebe pagamentos
[ ] SÓ monitora heartbeats
```

---

## 🔄 Testes de Integração

### Fluxo Completo 1: Cliente → Aprovação → Locação
```
1. [ ] Cliente acessa /cadastro
2. [ ] Preenche dados completos
3. [ ] Faz upload documentos (CPF, RG, Comprovante)
4. [ ] Envia cadastro
5. [ ] Vê tela confirmação
6. [ ] Admin recebe notificação
7. [ ] Admin acessa tab "Aprovações"
8. [ ] Admin vê cadastro pendente
9. [ ] Admin baixa documentos
10. [ ] Admin aprova cadastro
11. [ ] Cliente recebe notificação
12. [ ] Cliente faz login
13. [ ] Cliente pode navegar produtos
14. [ ] Cliente adiciona ao carrinho
15. [ ] Cliente finaliza pedido
16. [ ] Admin vê pedido no painel
17. [ ] Admin processa locação
18. [ ] Inventário atualiza
19. [ ] Cliente acompanha status
20. [ ] Admin processa devolução
21. [ ] Calcula multas (se houver)
22. [ ] Inventário volta ao estoque
```

### Fluxo Completo 2: Admin Gerencia Tudo
```
1. [ ] Admin faz login
2. [ ] Acessa dashboard
3. [ ] Vê métricas atualizadas
4. [ ] Cria novo produto
5. [ ] Define preços
6. [ ] Upload imagens
7. [ ] Produto aparece na loja
8. [ ] Aprova cadastro cliente
9. [ ] Cria locação manual
10. [ ] Seleciona cliente
11. [ ] Adiciona produtos
12. [ ] Define datas
13. [ ] Preço calcula automaticamente
14. [ ] Confirma pedido
15. [ ] Inventário atualiza
16. [ ] Registra pagamento
17. [ ] Processa devolução
18. [ ] Multas calculadas
19. [ ] Relatório gerado
20. [ ] Tudo funciona perfeitamente
```

### Fluxo Completo 3: Otávio Gerencia Licenças
```
1. [ ] Otávio faz login master
2. [ ] Acessa dashboard master
3. [ ] Vê todas locadoras
4. [ ] Cria nova licença
5. [ ] Define plano e limites
6. [ ] Gera license key
7. [ ] Locadora ativa licença
8. [ ] Heartbeat começa
9. [ ] Otávio monitora status
10. [ ] Locadora usa sistema
11. [ ] Chega data pagamento
12. [ ] Otávio registra pagamento
13. [ ] OU: sistema suspende auto
14. [ ] Otávio vê receita atualizada
15. [ ] Relatórios consolidados
16. [ ] Tudo isolado e seguro
```

---

## 🎨 Testes de UI/UX

### Responsividade
```
[ ] Desktop 1920x1080 - Tudo OK
[ ] Laptop 1366x768 - Tudo OK
[ ] Tablet 768x1024 - Tudo OK
[ ] Mobile 375x667 - Tudo OK
[ ] Menu hamburger (mobile)
[ ] Cards empilham corretamente
[ ] Formulários usáveis
[ ] Tabelas scrollam horizontal
[ ] Modais centralizados
[ ] Botões acessíveis
```

### Performance
```
[ ] Carregamento inicial < 3s
[ ] Navegação entre páginas fluida
[ ] Upload de arquivos rápido
[ ] Buscas respondem rápido
[ ] Sem travamentos
[ ] Sem memory leaks
[ ] Lazy loading funciona
```

### Feedback Visual
```
[ ] Loading states visíveis
[ ] Toast notifications funcionam
[ ] Mensagens de erro claras
[ ] Mensagens de sucesso claras
[ ] Progress bars funcionam
[ ] Badges coloridos corretos
[ ] Ícones intuitivos
[ ] Estados disabled visíveis
[ ] Focus visível
[ ] Hover effects funcionam
```

---

## 🐛 Bugs para Verificar e Corrigir

### Prioridade Alta
```
[ ] Login funciona com todas credenciais
[ ] Redirect após login correto
[ ] Logout funciona
[ ] Upload de arquivo funciona
[ ] Validação CPF/CNPJ funciona
[ ] API Brasil responde
[ ] Aprovação de cadastro funciona
[ ] Criação de pedido funciona
[ ] Devolução funciona
[ ] Cálculo de multas correto
```

### Prioridade Média
```
[ ] Busca de produtos funciona
[ ] Filtros funcionam
[ ] Paginação funciona
[ ] Ordenação funciona
[ ] Exportação funciona
[ ] Importação funciona
[ ] Notificações chegam
[ ] Email notifications
```

### Prioridade Baixa
```
[ ] Animações suaves
[ ] Transições bonitas
[ ] Cores consistentes
[ ] Espaçamentos corretos
[ ] Tipografia correta
[ ] Ícones alinhados
```

---

## ✅ Checklist Final

### Backend
- [ ] Todos endpoints funcionando
- [ ] Middlewares aplicados
- [ ] Validações corretas
- [ ] Erros tratados
- [ ] Logs adequados
- [ ] Segurança OK
- [ ] RBAC funcionando
- [ ] Multi-tenant isolado

### Frontend
- [ ] Todas páginas carregam
- [ ] Todos botões funcionam
- [ ] Todos forms validam
- [ ] Todos links funcionam
- [ ] Componentes renderizam
- [ ] Estados gerenciados
- [ ] Rotas protegidas
- [ ] Redirects corretos

### Integração
- [ ] Frontend ↔ Backend OK
- [ ] API Brasil OK
- [ ] Upload OK
- [ ] Download OK
- [ ] Notificações OK
- [ ] Autenticação OK
- [ ] Autorização OK

---

## 🚀 Resultado Esperado

```
✅ 100% dos cenários funcionando
✅ Zero bugs críticos
✅ Performance excelente
✅ UX impecável
✅ Código limpo
✅ Documentação completa
✅ Pronto para produção
```

---

**Próximo passo:** Executar cada teste e corrigir problemas encontrados!

**Servidor rodando em:** http://localhost:8081/

**Vamos começar os testes! 🎯**

