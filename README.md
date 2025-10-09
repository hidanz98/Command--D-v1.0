image.png# 🚀 Sistema Command-D - Plataforma Multi-Tenant Completa

<div align="center">

![Sistema Command-D](https://img.shields.io/badge/Sistema-Command--D-blue?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss)

**Uma plataforma completa de gestão multi-tenant com editor inline robusto, sistema de autenticação e painéis administrativos avançados.**

[![Deploy Status](https://img.shields.io/badge/Status-Produção-brightgreen?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

</div>

---

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Instalação](#-instalação)
- [📖 Como Usar](#-como-usar)
- [🎨 Editor Inline](#-editor-inline)
- [👥 Sistema de Usuários](#-sistema-de-usuários)
- [🏢 Multi-Tenant](#-multi-tenant)
- [📱 Responsividade](#-responsividade)
- [🔧 Desenvolvimento](#-desenvolvimento)
- [📦 Deploy](#-deploy)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## 🎯 Visão Geral

O **Sistema Command-D** é uma plataforma completa de gestão multi-tenant desenvolvida com as mais modernas tecnologias web. Oferece uma experiência única com editor inline robusto, sistema de autenticação avançado, painéis administrativos completos e interface totalmente responsiva.

### 🎨 Destaques Principais

- **Editor Inline Robusto**: Selecione e edite elementos diretamente na página
- **Sistema Multi-Tenant**: Suporte completo para múltiplas empresas
- **Autenticação Avançada**: Login/cadastro com diferentes níveis de acesso
- **Interface Moderna**: Design responsivo com TailwindCSS e Radix UI
- **Persistência Inteligente**: Edições salvas automaticamente no localStorage
- **Performance Otimizada**: Hot Module Replacement e build otimizado

---

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- **Login/Cadastro** com validação completa
- **Diferentes níveis de acesso**: Admin, Cliente, Funcionário
- **Redirecionamento inteligente** baseado no tipo de usuário
- **Sessão persistente** com localStorage
- **Logout seguro** com limpeza de estado

### 🎨 Editor Inline Avançado
- **Seleção visual** de elementos com mouse
- **Edição em tempo real** de texto, cores, fontes
- **Preview instantâneo** das alterações
- **Persistência automática** das edições
- **Interface intuitiva** com painel lateral
- **Suporte completo** a CSS customizado

### 👥 Gestão de Usuários
- **Painel Administrativo** completo
- **Área do Cliente** personalizada
- **Dashboard interativo** com gráficos
- **Sistema de notificações** em tempo real
- **Gestão de empresas** multi-tenant

### 🏢 Multi-Tenant
- **Isolamento de dados** por empresa
- **Configurações personalizadas** por tenant
- **Gestão centralizada** de múltiplas empresas
- **Escalabilidade** para qualquer número de tenants

### 📱 Interface Responsiva
- **Design mobile-first** otimizado
- **Componentes adaptativos** para todos os dispositivos
- **Navegação intuitiva** em desktop e mobile
- **Performance otimizada** em todos os tamanhos de tela

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca principal com hooks modernos
- **TypeScript 5.0** - Tipagem estática e melhor DX
- **Vite 6.3** - Build tool ultra-rápido com HMR
- **React Router 6** - Roteamento SPA avançado
- **TailwindCSS 3** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e customizáveis
- **Lucide React** - Ícones modernos e consistentes
- **Sonner** - Sistema de notificações elegante

### Backend
- **Express.js** - Servidor Node.js integrado
- **TypeScript** - Tipagem compartilhada entre client/server
- **API RESTful** - Endpoints organizados e documentados

### Desenvolvimento
- **Vitest** - Framework de testes moderno
- **ESLint** - Linting e formatação de código
- **PostCSS** - Processamento CSS avançado
- **Hot Module Replacement** - Desenvolvimento em tempo real

### Deploy
- **Netlify** - Deploy automático e CDN global
- **Vercel** - Alternativa de deploy com edge functions
- **Build otimizado** - Bundle minificado e otimizado

---

## 🚀 Instalação

### Pré-requisitos
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Git**

### 1. Clone o Repositório
```bash
git clone https://github.com/hidanz98/Sistema-Command-D.git
cd Sistema-Command-D
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

### 4. Acesse a Aplicação
Abra seu navegador em: **http://localhost:8080**

---

## 📖 Como Usar

### 🔑 Primeiro Acesso

1. **Acesse a aplicação** em `http://localhost:8080`
2. **Clique em "Login"** no header
3. **Use as credenciais de teste**:
   - **Admin**: `admin@test.com` / `admin123`
   - **Cliente**: `cliente@test.com` / `cliente123`
   - **Funcionário**: `func@test.com` / `func123`

### 🎨 Usando o Editor Inline

1. **Faça login como Admin**
2. **Clique em "Editor Inline"** no header
3. **Selecione qualquer elemento** clicando nele
4. **Edite no painel lateral**:
   - Texto, cores, fontes
   - Espaçamento, bordas, sombras
   - Efeitos visuais avançados
5. **Salve as alterações** com o botão "Salvar"
6. **Saia do editor** com "Sair" ou "X"

### 👥 Navegação por Usuários

#### 🔧 Admin
- **Painel Admin**: Gestão completa do sistema
- **Editor Inline**: Edição visual de elementos
- **Área Cliente**: Acesso à área do cliente
- **Logout**: Sair do sistema

#### 👤 Cliente
- **Área Cliente**: Dashboard personalizado
- **Logout**: Sair do sistema

#### 👷 Funcionário
- **Área Cliente**: Acesso limitado
- **Logout**: Sair do sistema

---

## 🎨 Editor Inline

### ✨ Funcionalidades do Editor

O editor inline é uma das funcionalidades mais avançadas do sistema, permitindo edição visual direta dos elementos da página.

#### 🎯 Como Funciona
1. **Ativação**: Clique no botão "Editor Inline"
2. **Seleção**: Clique em qualquer elemento com `data-edit-id`
3. **Edição**: Use o painel lateral para modificar propriedades
4. **Preview**: Veja as alterações em tempo real
5. **Persistência**: Salve as alterações no localStorage

#### 🛠️ Propriedades Editáveis
- **Texto**: Conteúdo textual dos elementos
- **Tipografia**: Fonte, tamanho, peso
- **Cores**: Texto e fundo com seletor de cores
- **Espaçamento**: Padding e margin
- **Efeitos**: Bordas, sombras, transformações
- **Layout**: Posicionamento e dimensões

#### 💾 Persistência
- **Auto-save**: Alterações salvas automaticamente
- **localStorage**: Persistência entre sessões
- **Backup**: Sistema de backup automático
- **Restore**: Restauração de versões anteriores

---

## 👥 Sistema de Usuários

### 🔐 Autenticação

#### Tipos de Usuário
- **Admin**: Acesso total ao sistema
- **Cliente**: Acesso à área do cliente
- **Funcionário**: Acesso limitado

#### Fluxo de Login
1. **Validação**: Credenciais verificadas
2. **Redirecionamento**: Baseado no tipo de usuário
3. **Sessão**: Mantida no localStorage
4. **Contexto**: Estado global gerenciado

### 🏢 Multi-Tenant

#### Isolamento de Dados
- **Empresas separadas**: Dados isolados por tenant
- **Configurações únicas**: Cada empresa tem suas configurações
- **Escalabilidade**: Suporte a qualquer número de empresas

#### Gestão de Tenants
- **Criação**: Novos tenants via interface
- **Configuração**: Personalização por empresa
- **Monitoramento**: Acompanhamento de uso

---

## 📱 Responsividade

### 🎯 Design Mobile-First
- **Breakpoints otimizados**: Mobile, tablet, desktop
- **Componentes adaptativos**: Ajustam-se automaticamente
- **Touch-friendly**: Interface otimizada para toque
- **Performance**: Carregamento rápido em todos os dispositivos

### 📐 Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## 🔧 Desenvolvimento

### 📁 Estrutura do Projeto
```
Sistema-Command-D/
├── client/                 # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Biblioteca de componentes UI
│   │   └── ...            # Componentes específicos
│   ├── context/           # Contextos React
│   ├── hooks/             # Hooks customizados
│   ├── pages/             # Páginas da aplicação
│   ├── lib/               # Utilitários
│   └── global.css         # Estilos globais
├── server/                # Backend Express
│   ├── routes/            # Rotas da API
│   └── index.ts           # Servidor principal
├── shared/                # Tipos compartilhados
└── public/                # Arquivos estáticos
```

### 🚀 Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run typecheck    # Verificação TypeScript
npm test            # Executar testes
```

### 🔧 Configuração

#### Vite Config
- **HMR**: Hot Module Replacement ativo
- **TypeScript**: Suporte completo
- **Aliases**: Paths simplificados (`@/`, `@shared/`)
- **Proxy**: API integrada no dev server

#### Tailwind Config
- **Customização**: Cores e temas personalizados
- **Plugins**: Funcionalidades avançadas
- **Purge**: Otimização de CSS em produção

---

## 📦 Deploy

### 🌐 Netlify (Recomendado)
1. **Conecte o repositório** ao Netlify
2. **Configure o build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy automático** a cada push

### ⚡ Vercel
1. **Importe o projeto** no Vercel
2. **Configure as variáveis** de ambiente
3. **Deploy instantâneo** com edge functions

### 🐳 Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

---

## 🤝 Contribuição

### 🔄 Como Contribuir
1. **Fork** o repositório
2. **Crie uma branch** para sua feature
3. **Commit** suas alterações
4. **Push** para a branch
5. **Abra um Pull Request**

### 📋 Padrões de Código
- **TypeScript**: Tipagem obrigatória
- **ESLint**: Seguir regras configuradas
- **Commits**: Mensagens descritivas
- **Testes**: Cobertura adequada

### 🐛 Reportar Bugs
Use o sistema de Issues do GitHub com:
- **Descrição detalhada** do problema
- **Passos para reproduzir**
- **Screenshots** se aplicável
- **Ambiente** (OS, navegador, versão)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🎉 Agradecimentos

- **React Team** - Pela incrível biblioteca
- **Vite Team** - Pela ferramenta de build moderna
- **TailwindCSS** - Pelo framework CSS utility-first
- **Radix UI** - Pelos componentes acessíveis
- **Comunidade Open Source** - Por todas as contribuições

---

<div align="center">

**Desenvolvido com ❤️ por [Seu Nome]**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hidanz98)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](#)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](#)

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

</div>
