import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Tipos para o sistema de IA
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: string;
  suggestions?: string[];
  actions?: AIAction[];
  learned?: boolean;
}

export interface AIAction {
  id: string;
  type: 'navigate' | 'create' | 'edit' | 'delete' | 'report' | 'settings';
  label: string;
  route?: string;
  data?: Record<string, any>;
}

export interface AIKnowledge {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  useCount: number;
  helpfulCount: number;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'alert' | 'suggestion' | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
  actionable: boolean;
  dismissed: boolean;
  createdAt: Date;
}

export interface TenantTheme {
  id: string;
  tenantId: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logo?: string;
  favicon?: string;
  fontFamily: string;
  borderRadius: string;
  darkMode: boolean;
}

interface AIContextType {
  // Chat e Mensagens
  messages: AIMessage[];
  isTyping: boolean;
  sendMessage: (content: string, context?: string) => Promise<void>;
  clearMessages: () => void;
  
  // Base de Conhecimento
  knowledge: AIKnowledge[];
  addKnowledge: (item: Omit<AIKnowledge, 'id' | 'useCount' | 'helpfulCount' | 'createdAt' | 'updatedAt'>) => void;
  searchKnowledge: (query: string) => AIKnowledge[];
  markHelpful: (id: string, helpful: boolean) => void;
  
  // Insights e Sugestões
  insights: AIInsight[];
  dismissInsight: (id: string) => void;
  generateInsights: () => void;
  
  // Tema e Personalização
  theme: TenantTheme;
  updateTheme: (updates: Partial<TenantTheme>) => void;
  resetTheme: () => void;
  
  // Estatísticas de Aprendizado
  learningStats: {
    totalInteractions: number;
    knowledgeItems: number;
    accuracyRate: number;
    serversConnected: number;
  };
  
  // Modo assistente
  isAssistantOpen: boolean;
  toggleAssistant: () => void;
  setAssistantOpen: (open: boolean) => void;
}

const defaultTheme: TenantTheme = {
  id: 'default',
  tenantId: 'default',
  name: 'Tema Padrão',
  primaryColor: '#f59e0b', // Amber
  secondaryColor: '#3b82f6', // Blue
  accentColor: '#10b981', // Emerald
  backgroundColor: '#0f172a', // Slate 900
  textColor: '#f1f5f9', // Slate 100
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: '0.75rem',
  darkMode: true,
};

// Base de conhecimento inicial
const initialKnowledge: AIKnowledge[] = [
  {
    id: '1',
    category: 'pedidos',
    question: 'Como criar um novo pedido?',
    answer: 'Para criar um novo pedido, vá em Pedidos > Novo Pedido, selecione o cliente, adicione os equipamentos desejados, defina as datas de locação e confirme.',
    keywords: ['pedido', 'novo', 'criar', 'locação'],
    useCount: 45,
    helpfulCount: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    category: 'financeiro',
    question: 'Como emitir uma nota fiscal de locação?',
    answer: 'Acesse Relatórios, selecione o pedido desejado e clique no ícone de Nota Fiscal (amarelo). O documento será gerado com todos os dados corretos para locação de bens em BH, sem retenção de ISS.',
    keywords: ['nota', 'fiscal', 'emitir', 'locação', 'bens'],
    useCount: 38,
    helpfulCount: 35,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    category: 'estoque',
    question: 'Como verificar disponibilidade de equipamento?',
    answer: 'Vá em Estoque ou Calendário. No Estoque você vê o status atual (Disponível, Locado, Manutenção). No Calendário você visualiza as reservas por data.',
    keywords: ['disponibilidade', 'equipamento', 'estoque', 'calendário'],
    useCount: 52,
    helpfulCount: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    category: 'clientes',
    question: 'Como cadastrar um novo cliente?',
    answer: 'Acesse Clientes > Novo Cliente. Preencha os dados obrigatórios (Nome, CPF/CNPJ, Contato). Para produções, adicione também Direção de Produção e Nome do Projeto.',
    keywords: ['cliente', 'cadastrar', 'novo', 'produção'],
    useCount: 33,
    helpfulCount: 31,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    category: 'sistema',
    question: 'Como personalizar as cores do sistema?',
    answer: 'Vá em Configurações > Personalização ou peça para a IA "mudar cor principal para azul". Você pode alterar cores, fontes, logo e outros elementos visuais.',
    keywords: ['personalizar', 'cores', 'tema', 'aparência'],
    useCount: 28,
    helpfulCount: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [knowledge, setKnowledge] = useState<AIKnowledge[]>(initialKnowledge);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [theme, setTheme] = useState<TenantTheme>(defaultTheme);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [learningStats, setLearningStats] = useState({
    totalInteractions: 156,
    knowledgeItems: initialKnowledge.length,
    accuracyRate: 94.5,
    serversConnected: 1,
  });

  // Carregar tema do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('tenant_theme');
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Erro ao carregar tema:', e);
      }
    }
  }, []);

  // Aplicar tema no CSS
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--bg-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.setProperty('--border-radius', theme.borderRadius);
  }, [theme]);

  // Buscar na base de conhecimento
  const searchKnowledge = useCallback((query: string): AIKnowledge[] => {
    const queryLower = query.toLowerCase();
    const words = queryLower.split(' ').filter(w => w.length > 2);
    
    return knowledge
      .map(item => {
        let score = 0;
        words.forEach(word => {
          if (item.keywords.some(k => k.includes(word))) score += 3;
          if (item.question.toLowerCase().includes(word)) score += 2;
          if (item.answer.toLowerCase().includes(word)) score += 1;
        });
        return { ...item, score };
      })
      .filter(item => (item as any).score > 0)
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, 5);
  }, [knowledge]);

  // Processar comandos de personalização
  const processThemeCommand = (content: string): Partial<TenantTheme> | null => {
    const lowerContent = content.toLowerCase();
    const updates: Partial<TenantTheme> = {};
    
    // Detectar mudança de cor
    const colorPatterns = [
      { pattern: /cor (principal|primária).*?(azul|blue)/i, key: 'primaryColor', value: '#3b82f6' },
      { pattern: /cor (principal|primária).*?(verde|green)/i, key: 'primaryColor', value: '#10b981' },
      { pattern: /cor (principal|primária).*?(vermelho|red)/i, key: 'primaryColor', value: '#ef4444' },
      { pattern: /cor (principal|primária).*?(roxo|purple)/i, key: 'primaryColor', value: '#8b5cf6' },
      { pattern: /cor (principal|primária).*?(rosa|pink)/i, key: 'primaryColor', value: '#ec4899' },
      { pattern: /cor (principal|primária).*?(laranja|orange)/i, key: 'primaryColor', value: '#f97316' },
      { pattern: /cor (principal|primária).*?(amarelo|yellow)/i, key: 'primaryColor', value: '#eab308' },
      { pattern: /cor (principal|primária).*?(ciano|cyan)/i, key: 'primaryColor', value: '#06b6d4' },
      { pattern: /modo (claro|light)/i, key: 'darkMode', value: false },
      { pattern: /modo (escuro|dark)/i, key: 'darkMode', value: true },
      { pattern: /fonte.*?(roboto)/i, key: 'fontFamily', value: 'Roboto, sans-serif' },
      { pattern: /fonte.*?(poppins)/i, key: 'fontFamily', value: 'Poppins, sans-serif' },
      { pattern: /fonte.*?(inter)/i, key: 'fontFamily', value: 'Inter, sans-serif' },
      { pattern: /borda.*?(arredondada|rounded)/i, key: 'borderRadius', value: '1rem' },
      { pattern: /borda.*?(quadrada|square)/i, key: 'borderRadius', value: '0.25rem' },
    ];
    
    for (const { pattern, key, value } of colorPatterns) {
      if (pattern.test(lowerContent)) {
        (updates as any)[key] = value;
      }
    }
    
    // Detectar cor hexadecimal
    const hexMatch = lowerContent.match(/#([0-9a-f]{6}|[0-9a-f]{3})/i);
    if (hexMatch && lowerContent.includes('cor')) {
      updates.primaryColor = hexMatch[0];
    }
    
    return Object.keys(updates).length > 0 ? updates : null;
  };

  // Gerar resposta da IA
  const generateAIResponse = async (userMessage: string): Promise<AIMessage> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Verificar comandos de personalização
    const themeUpdates = processThemeCommand(userMessage);
    if (themeUpdates) {
      updateTheme(themeUpdates);
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Tema atualizado! ${
          themeUpdates.primaryColor ? `Cor principal alterada para ${themeUpdates.primaryColor}.` : ''
        }${
          themeUpdates.darkMode !== undefined ? `Modo ${themeUpdates.darkMode ? 'escuro' : 'claro'} ativado.` : ''
        }${
          themeUpdates.fontFamily ? `Fonte alterada para ${themeUpdates.fontFamily}.` : ''
        } As alterações foram aplicadas em todo o sistema.`,
        timestamp: new Date(),
        learned: true,
        actions: [
          { id: '1', type: 'settings', label: 'Ver Configurações', route: '/configuracoes' }
        ]
      };
    }
    
    // Buscar na base de conhecimento
    const relevantKnowledge = searchKnowledge(userMessage);
    
    if (relevantKnowledge.length > 0) {
      // Incrementar uso
      setKnowledge(prev => prev.map(k => 
        k.id === relevantKnowledge[0].id 
          ? { ...k, useCount: k.useCount + 1, updatedAt: new Date() }
          : k
      ));
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: relevantKnowledge[0].answer,
        timestamp: new Date(),
        context: relevantKnowledge[0].category,
        suggestions: relevantKnowledge.slice(1, 4).map(k => k.question),
        learned: false,
      };
    }
    
    // Detectar intenções comuns
    const intents: { pattern: RegExp; response: string; actions?: AIAction[] }[] = [
      {
        pattern: /criar|novo|adicionar.*pedido/i,
        response: 'Para criar um novo pedido, vou te direcionar para a página de pedidos. Lá você pode selecionar o cliente, adicionar equipamentos e definir as datas.',
        actions: [{ id: '1', type: 'navigate', label: 'Ir para Pedidos', route: '/pedidos' }]
      },
      {
        pattern: /relat[óo]rio|nota|fiscal|contrato/i,
        response: 'Você pode gerar relatórios, contratos e notas fiscais de locação na página de Relatórios. Todos os documentos seguem o padrão de BH para locação de bens móveis.',
        actions: [{ id: '1', type: 'navigate', label: 'Ir para Relatórios', route: '/relatorios' }]
      },
      {
        pattern: /calend[áa]rio|agenda|reserva|disponibilidade/i,
        response: 'No Calendário você visualiza todas as reservas e disponibilidade dos equipamentos por data. É ideal para evitar conflitos de agenda.',
        actions: [{ id: '1', type: 'navigate', label: 'Abrir Calendário', route: '/calendario' }]
      },
      {
        pattern: /estoque|equipamento|invent[áa]rio/i,
        response: 'No controle de Estoque você gerencia todos os equipamentos, vê status, condição, histórico e pode gerar QR Codes para identificação.',
        actions: [{ id: '1', type: 'navigate', label: 'Ver Estoque', route: '/estoque' }]
      },
      {
        pattern: /financeiro|caixa|dinheiro|pagamento|receb/i,
        response: 'O Fluxo de Caixa mostra todas as entradas e saídas, saldo atual, inadimplência e projeções financeiras.',
        actions: [{ id: '1', type: 'navigate', label: 'Ver Financeiro', route: '/fluxo-caixa' }]
      },
      {
        pattern: /analytics|bi|intelig[êe]ncia|an[áa]lise|tend[êe]ncia/i,
        response: 'O módulo de Analytics oferece análises avançadas, previsões, rentabilidade por equipamento e comportamento de clientes.',
        actions: [{ id: '1', type: 'navigate', label: 'Abrir Analytics', route: '/analytics' }]
      },
      {
        pattern: /avalia[çc][ãa]o|review|feedback|estrela/i,
        response: 'Na página de Avaliações você vê o feedback dos clientes, NPS, e pode responder aos comentários para melhorar o relacionamento.',
        actions: [{ id: '1', type: 'navigate', label: 'Ver Avaliações', route: '/avaliacoes' }]
      },
      {
        pattern: /ajuda|tutorial|como (usar|funciona)/i,
        response: 'Posso te ajudar com qualquer dúvida! Pergunte sobre pedidos, clientes, estoque, financeiro, relatórios ou qualquer funcionalidade. Também posso personalizar o visual do sistema para você.',
        actions: []
      },
    ];
    
    for (const intent of intents) {
      if (intent.pattern.test(lowerMessage)) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: intent.response,
          timestamp: new Date(),
          actions: intent.actions,
        };
      }
    }
    
    // Resposta padrão com aprendizado
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Entendi sua pergunta sobre "${userMessage}". Ainda estou aprendendo sobre esse assunto! 📚\n\nPosso te ajudar com:\n• Criar e gerenciar pedidos\n• Emitir notas e relatórios\n• Controlar estoque e calendário\n• Análises financeiras\n• Personalizar o visual do sistema\n\nDigite sua dúvida de forma específica ou peça para eu "mudar a cor" do sistema!`,
      timestamp: new Date(),
      suggestions: [
        'Como criar um pedido?',
        'Emitir nota fiscal',
        'Ver calendário de reservas',
        'Mudar cor para azul'
      ],
    };
  };

  // Enviar mensagem
  const sendMessage = async (content: string, context?: string) => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      context,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    const aiResponse = await generateAIResponse(content);
    
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
    
    // Atualizar estatísticas
    setLearningStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
    }));
  };

  const clearMessages = () => setMessages([]);

  const addKnowledge = (item: Omit<AIKnowledge, 'id' | 'useCount' | 'helpfulCount' | 'createdAt' | 'updatedAt'>) => {
    const newItem: AIKnowledge = {
      ...item,
      id: Date.now().toString(),
      useCount: 0,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setKnowledge(prev => [...prev, newItem]);
    setLearningStats(prev => ({
      ...prev,
      knowledgeItems: prev.knowledgeItems + 1,
    }));
  };

  const markHelpful = (id: string, helpful: boolean) => {
    setKnowledge(prev => prev.map(k => 
      k.id === id 
        ? { ...k, helpfulCount: helpful ? k.helpfulCount + 1 : k.helpfulCount }
        : k
    ));
  };

  const dismissInsight = (id: string) => {
    setInsights(prev => prev.map(i => 
      i.id === id ? { ...i, dismissed: true } : i
    ));
  };

  const generateInsights = () => {
    // Gerar insights baseados em padrões
    const newInsights: AIInsight[] = [
      {
        id: Date.now().toString(),
        type: 'trend',
        title: 'Aumento na demanda de câmeras',
        description: 'Câmeras Canon C300 tiveram 40% mais locações este mês. Considere expandir o estoque.',
        priority: 'medium',
        actionable: true,
        dismissed: false,
        createdAt: new Date(),
      },
    ];
    setInsights(prev => [...prev, ...newInsights]);
  };

  const updateTheme = (updates: Partial<TenantTheme>) => {
    const newTheme = { ...theme, ...updates, updatedAt: new Date() };
    setTheme(newTheme);
    localStorage.setItem('tenant_theme', JSON.stringify(newTheme));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('tenant_theme');
  };

  const toggleAssistant = () => setIsAssistantOpen(prev => !prev);

  return (
    <AIContext.Provider value={{
      messages,
      isTyping,
      sendMessage,
      clearMessages,
      knowledge,
      addKnowledge,
      searchKnowledge,
      markHelpful,
      insights,
      dismissInsight,
      generateInsights,
      theme,
      updateTheme,
      resetTheme,
      learningStats,
      isAssistantOpen,
      toggleAssistant,
      setAssistantOpen: setIsAssistantOpen,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

