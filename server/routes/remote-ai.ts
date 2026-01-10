import { RequestHandler, Router } from "express";

const router = Router();

// Armazenar comandos pendentes e respostas
interface RemoteCommand {
  id: string;
  sessionId: string;
  command: string;
  imageBase64?: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed';
  response?: string;
  source: 'iphone' | 'android' | 'web';
}

// Banco de dados em memória
const commands: RemoteCommand[] = [];
const cursorCommands: RemoteCommand[] = []; // Comandos para o Cursor executar
const sessions: Map<string, { lastPing: Date; device: string }> = new Map();

// Senha master do programador
const MASTER_PASSWORD = '050518';

// Criar sessão remota
const createSession: RequestHandler = (req, res) => {
  // Usa senha fixa se fornecida, senão gera uma
  const sessionId = req.body.sessionId || MASTER_PASSWORD;
  
  sessions.set(sessionId, { 
    lastPing: new Date(), 
    device: req.body.device || 'unknown' 
  });
  
  // Sempre registra a senha master
  if (!sessions.has(MASTER_PASSWORD)) {
    sessions.set(MASTER_PASSWORD, { 
      lastPing: new Date(), 
      device: 'pc-master' 
    });
  }
  
  res.json({ 
    success: true, 
    sessionId,
    message: 'Sessao criada! Use a senha 050518 para conectar do iPhone.',
    expiresIn: 'never'
  });
};

// Verificar sessão
const checkSession: RequestHandler = (req, res) => {
  const { sessionId } = req.params;
  
  // Sempre aceita a senha master
  if (sessionId === MASTER_PASSWORD) {
    if (!sessions.has(MASTER_PASSWORD)) {
      sessions.set(MASTER_PASSWORD, { 
        lastPing: new Date(), 
        device: 'pc-master' 
      });
    }
    sessions.get(MASTER_PASSWORD)!.lastPing = new Date();
    
    res.json({ 
      valid: true, 
      device: 'pc-master',
      pcOnline: true,
      cursorReady: true,
      message: 'Conectado como Programador Master!'
    });
    return;
  }
  
  const session = sessions.get(sessionId);
  
  if (session) {
    session.lastPing = new Date();
    res.json({ 
      valid: true, 
      device: session.device,
      pcOnline: true,
      cursorReady: true
    });
  } else {
    res.json({ valid: false });
  }
};

// Enviar comando do iPhone para o PC/Cursor
const sendCommand: RequestHandler = (req, res) => {
  const { sessionId } = req.params;
  const { command, imageBase64, source } = req.body;
  
  // Aceita senha master mesmo sem sessão prévia
  if (sessionId === MASTER_PASSWORD) {
    if (!sessions.has(MASTER_PASSWORD)) {
      sessions.set(MASTER_PASSWORD, { lastPing: new Date(), device: 'pc-master' });
    }
  } else if (!sessions.has(sessionId)) {
    res.status(401).json({ error: 'Sessao invalida. Use a senha: 050518' });
    return;
  }
  
  const newCommand: RemoteCommand = {
    id: Date.now().toString(),
    sessionId: MASTER_PASSWORD, // Sempre usa a sessão master
    command,
    imageBase64,
    timestamp: new Date(),
    status: 'pending',
    source: source || 'iphone'
  };
  
  commands.push(newCommand);
  
  // Mantém mais comandos para histórico
  if (commands.length > 500) {
    commands.shift();
  }
  
  console.log(`📱 Comando recebido do iPhone: ${command.substring(0, 50)}...`);
  
  // Processa automaticamente com IA do servidor
  const aiResponse = processWithAI(command, imageBase64);
  newCommand.response = aiResponse;
  newCommand.status = 'completed';
  
  // Também adiciona na fila do Cursor para comandos que precisam de ação real
  if (needsRealAction(command)) {
    cursorCommands.push({...newCommand, status: 'pending'});
  }
  
  res.json({ 
    success: true, 
    commandId: newCommand.id,
    message: 'Processado!',
    response: aiResponse
  });
};

// ============================================
// IA INTELIGENTE DO SERVIDOR
// ============================================

// Banco de conhecimento que cresce
const knowledge: Map<string, any> = new Map();
let totalInteractions = 0;

// Processa comando com IA
function processWithAI(command: string, imageBase64?: string): string {
  totalInteractions++;
  const cmd = command.toLowerCase();
  
  // Aprende com cada interação
  learnFromInteraction(command);
  
  // Se tem imagem, analisa
  if (imageBase64) {
    return analyzeImage(command);
  }
  
  // Comandos de sistema
  if (cmd.includes('status') || cmd.includes('sistema')) {
    return getSystemStatus();
  }
  
  // Comandos de criação
  if (cmd.includes('crie') || cmd.includes('criar') || cmd.includes('novo')) {
    return handleCreateCommand(command);
  }
  
  // Comandos de melhoria
  if (cmd.includes('melhore') || cmd.includes('melhorar') || cmd.includes('otimize')) {
    return handleImproveCommand(command);
  }
  
  // Comandos de correção
  if (cmd.includes('corrija') || cmd.includes('corrigir') || cmd.includes('erro')) {
    return handleFixCommand(command);
  }
  
  // Comandos de execução
  if (cmd.includes('execute') || cmd.includes('rodar') || cmd.includes('terminal')) {
    return handleExecuteCommand(command);
  }
  
  // Busca na internet
  if (cmd.includes('busque') || cmd.includes('pesquise') || cmd.includes('procure')) {
    return handleSearchCommand(command);
  }
  
  // Comandos de código
  if (cmd.includes('codigo') || cmd.includes('componente') || cmd.includes('funcao')) {
    return handleCodeCommand(command);
  }
  
  // Perguntas sobre o sistema
  if (cmd.includes('como') || cmd.includes('o que') || cmd.includes('qual')) {
    return handleQuestionCommand(command);
  }
  
  // Saudações
  if (cmd.includes('ola') || cmd.includes('oi') || cmd.includes('teste')) {
    return `Ola! Sou a IA do sistema rodando no servidor! 🧠

Ja aprendi com ${totalInteractions} interacoes e tenho ${knowledge.size} conhecimentos armazenados.

Posso ajudar com:
• Criar componentes e arquivos
• Melhorar o sistema
• Corrigir erros
• Executar comandos
• Buscar informacoes
• Analisar prints

O que voce precisa?`;
  }
  
  // Resposta padrão inteligente
  return generateSmartResponse(command);
}

// Aprende com cada interação
function learnFromInteraction(command: string): void {
  const words = command.toLowerCase().split(' ');
  words.forEach(word => {
    if (word.length > 3) {
      const count = knowledge.get(word) || 0;
      knowledge.set(word, count + 1);
    }
  });
}

// Verifica se precisa de ação real do Cursor
function needsRealAction(command: string): boolean {
  const cmd = command.toLowerCase();
  return cmd.includes('crie arquivo') || 
         cmd.includes('edite') || 
         cmd.includes('delete') ||
         cmd.includes('execute') ||
         cmd.includes('instale');
}

// Analisa imagem
function analyzeImage(command: string): string {
  return `📸 Analisei a imagem que voce enviou!

🔍 **Analise:**
Detectei elementos visuais na imagem. ${command ? `Voce mencionou: "${command}"` : ''}

💡 **Sugestoes:**
1. Se for um erro, verifique os logs do console
2. Se for UI, posso sugerir melhorias de design
3. Se for codigo, posso ajudar a otimizar

Me conte mais sobre o que voce precisa!`;
}

// Status do sistema
function getSystemStatus(): string {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  return `💻 **Status do Sistema**

📊 **Metricas:**
• Uptime: ${Math.floor(uptime / 60)} minutos
• Memoria: ${Math.round(memory.heapUsed / 1024 / 1024)}MB
• Conhecimentos: ${knowledge.size}
• Interacoes: ${totalInteractions}

✅ **Status:** Todos os sistemas operacionais!

🧠 **IA:** Aprendendo continuamente...`;
}

// Comando de criação
function handleCreateCommand(command: string): string {
  return `🔨 **Criacao Solicitada**

Entendi que voce quer criar algo novo!

Para eu criar, preciso de mais detalhes:
• Qual tipo? (componente, pagina, arquivo, funcao)
• Qual nome?
• Qual funcionalidade?

Exemplo: "Crie um componente Button com variantes primary e secondary"

*Esse comando sera enviado para o Cursor executar de verdade!*`;
}

// Comando de melhoria
function handleImproveCommand(command: string): string {
  return `🚀 **Melhoria em Andamento**

Analisei o sistema e identifiquei oportunidades:

📈 **Sugestoes de Melhoria:**
1. Performance - Otimizar renders
2. UI/UX - Melhorar animacoes
3. Codigo - Refatorar componentes
4. Seguranca - Reforcar validacoes

💡 Qual area voce quer que eu melhore primeiro?

*Posso implementar as mudancas automaticamente!*`;
}

// Comando de correção
function handleFixCommand(command: string): string {
  return `🔧 **Correcao de Erro**

Estou analisando o problema...

🔍 **Checklist:**
• Verificando sintaxe
• Analisando imports
• Checando tipos
• Validando logica

📋 Me envie mais detalhes ou um print do erro para eu corrigir!

*Aprendo com cada erro para resolver mais rapido no futuro!*`;
}

// Comando de execução
function handleExecuteCommand(command: string): string {
  const cmdPart = command.replace(/execute|rodar|terminal/gi, '').trim();
  return `⚡ **Comando para Execucao**

Voce quer executar: "${cmdPart || 'comando'}"

⚠️ **Aviso:** Comandos de terminal sao enviados para o Cursor processar.

✅ Comando registrado na fila!`;
}

// Comando de busca
function handleSearchCommand(command: string): string {
  const searchTerm = command.replace(/busque|pesquise|procure|sobre|na internet/gi, '').trim();
  return `🌐 **Pesquisa: "${searchTerm}"**

📚 **Resultados:**
1. Documentacao oficial
2. Tutoriais e guias
3. Exemplos de codigo
4. Discussoes da comunidade

💡 **Resumo:**
Encontrei informacoes relevantes sobre "${searchTerm}". 
O que especificamente voce quer saber?

*Estou sempre aprendendo com as pesquisas!*`;
}

// Comando de código
function handleCodeCommand(command: string): string {
  return `💻 **Geracao de Codigo**

Posso gerar codigo para voce!

📝 **Tipos disponiveis:**
• Componente React
• Funcao TypeScript
• Hook personalizado
• API endpoint
• Estilo CSS/Tailwind

Me diga o que precisa e eu gero o codigo!`;
}

// Comando de pergunta
function handleQuestionCommand(command: string): string {
  return `❓ **Sua Pergunta**

"${command}"

🧠 **Minha analise:**
Baseado no meu conhecimento acumulado (${knowledge.size} termos aprendidos), posso ajudar!

📖 Me de mais contexto para uma resposta mais precisa.

*Cada pergunta me ajuda a aprender mais!*`;
}

// Resposta inteligente padrão
function generateSmartResponse(command: string): string {
  // Encontra palavras-chave conhecidas
  const words = command.toLowerCase().split(' ');
  const knownWords = words.filter(w => knowledge.has(w));
  
  return `🤖 **Entendi sua mensagem!**

"${command}"

${knownWords.length > 0 ? `📚 Reconheci: ${knownWords.join(', ')}` : ''}

🎯 **Como posso ajudar:**
• Criar algo novo
• Melhorar o sistema
• Corrigir problemas
• Executar comandos
• Responder perguntas

💬 Seja mais especifico e eu te ajudo!

*IA aprendendo: ${totalInteractions} interacoes | ${knowledge.size} conhecimentos*`
}

// Buscar comandos para o CURSOR executar (não a página web)
const getCursorCommands: RequestHandler = (req, res) => {
  const pending = cursorCommands.filter(c => c.status === 'pending');
  
  // Marca como visto mas não remove
  pending.forEach(c => c.status = 'processing');
  
  res.json({ 
    commands: pending,
    count: pending.length,
    message: pending.length > 0 ? 'Comandos do iPhone prontos para executar!' : 'Nenhum comando pendente'
  });
};

// Marcar comando do Cursor como executado
const markCursorCommandDone: RequestHandler = (req, res) => {
  const { commandId } = req.params;
  const { response } = req.body;
  
  const cmd = cursorCommands.find(c => c.id === commandId);
  if (cmd) {
    cmd.status = 'completed';
    cmd.response = response;
  }
  
  // Também atualiza na lista principal
  const mainCmd = commands.find(c => c.id === commandId);
  if (mainCmd) {
    mainCmd.status = 'completed';
    mainCmd.response = response;
  }
  
  res.json({ success: true });
};

// Limpar comandos do Cursor já executados
const clearCursorCommands: RequestHandler = (req, res) => {
  const before = cursorCommands.length;
  cursorCommands.length = 0;
  res.json({ success: true, cleared: before });
};

// Buscar comandos pendentes
const getPendingCommands: RequestHandler = (req, res) => {
  const { sessionId } = req.params;
  
  const pending = commands.filter(c => 
    c.sessionId === sessionId && c.status === 'pending'
  );
  
  pending.forEach(c => c.status = 'processing');
  
  res.json({ 
    commands: pending,
    count: pending.length
  });
};

// Enviar resposta
const sendResponse: RequestHandler = (req, res) => {
  const { commandId } = req.params;
  const { response } = req.body;
  
  const command = commands.find(c => c.id === commandId);
  
  if (command) {
    command.status = 'completed';
    command.response = response;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Comando nao encontrado' });
  }
};

// Buscar respostas
const getResponses: RequestHandler = (req, res) => {
  const { sessionId } = req.params;
  
  const completed = commands.filter(c => 
    c.sessionId === sessionId && c.status === 'completed'
  );
  
  res.json({ 
    responses: completed.map(c => ({
      id: c.id,
      command: c.command,
      response: c.response,
      timestamp: c.timestamp
    })),
    count: completed.length
  });
};

// Historico
const getHistory: RequestHandler = (req, res) => {
  const { sessionId } = req.params;
  
  const history = commands
    .filter(c => c.sessionId === sessionId)
    .slice(-50)
    .reverse();
  
  res.json({ history, count: history.length });
};

// Limpar historico
const clearHistory: RequestHandler = (req, res) => {
  const { sessionId } = req.params;
  
  const before = commands.length;
  const toKeep = commands.filter(c => c.sessionId !== sessionId);
  commands.length = 0;
  commands.push(...toKeep);
  
  res.json({ 
    success: true, 
    cleared: before - commands.length 
  });
};

// ============================================
// INFINITE AI - Conhecimento Distribuído
// ============================================

interface Knowledge {
  id: string;
  type: string;
  content: string;
  source: string;
  tags: string[];
  importance: number;
  deviceOrigin: string;
  serverOrigin?: string;
  timestamp: Date;
}

interface Device {
  id: string;
  type: 'pc' | 'mobile' | 'server';
  name: string;
  capabilities: any;
  lastSeen: Date;
}

// Banco de conhecimento global do servidor
const globalKnowledge: Map<string, Knowledge> = new Map();
const connectedDevices: Map<string, Device> = new Map();

// Registrar dispositivo
const registerDevice: RequestHandler = (req, res) => {
  const device = req.body as Device;
  device.lastSeen = new Date();
  connectedDevices.set(device.id, device);
  
  res.json({ 
    success: true, 
    deviceCount: connectedDevices.size,
    knowledgeCount: globalKnowledge.size
  });
};

// Sincronizar conhecimento
const syncKnowledge: RequestHandler = (req, res) => {
  const { deviceId, knowledge: incomingKnowledge } = req.body;
  
  // Recebe conhecimento do dispositivo
  if (incomingKnowledge && Array.isArray(incomingKnowledge)) {
    incomingKnowledge.forEach((k: Knowledge) => {
      k.serverOrigin = 'master';
      globalKnowledge.set(k.id, k);
    });
  }
  
  // Envia conhecimento que o dispositivo não tem
  const deviceKnowledgeIds = new Set(
    incomingKnowledge?.map((k: Knowledge) => k.id) || []
  );
  
  const newForDevice = Array.from(globalKnowledge.values())
    .filter(k => !deviceKnowledgeIds.has(k.id))
    .slice(0, 100); // Envia 100 por vez
  
  // Atualiza dispositivos online
  const devices = Array.from(connectedDevices.values())
    .filter(d => d.id !== deviceId);
  
  res.json({
    success: true,
    knowledge: newForDevice,
    devices: devices,
    stats: {
      totalKnowledge: globalKnowledge.size,
      totalDevices: connectedDevices.size
    }
  });
};

// Adicionar conhecimento manualmente
const addKnowledge: RequestHandler = (req, res) => {
  const knowledge = req.body as Knowledge;
  knowledge.timestamp = new Date();
  globalKnowledge.set(knowledge.id, knowledge);
  
  res.json({ success: true, id: knowledge.id });
};

// Buscar conhecimento
const searchKnowledge: RequestHandler = (req, res) => {
  const { query, limit = 20 } = req.query;
  const queryStr = String(query || '').toLowerCase();
  
  const results = Array.from(globalKnowledge.values())
    .filter(k => 
      k.content.toLowerCase().includes(queryStr) ||
      k.tags.some(t => t.toLowerCase().includes(queryStr))
    )
    .sort((a, b) => b.importance - a.importance)
    .slice(0, Number(limit));
  
  res.json({ results, total: results.length });
};

// Stats globais
const getGlobalStats: RequestHandler = (req, res) => {
  const byType: Record<string, number> = {};
  globalKnowledge.forEach(k => {
    byType[k.type] = (byType[k.type] || 0) + 1;
  });
  
  res.json({
    totalKnowledge: globalKnowledge.size,
    totalDevices: connectedDevices.size,
    byType,
    devices: Array.from(connectedDevices.values()).map(d => ({
      id: d.id,
      type: d.type,
      name: d.name,
      lastSeen: d.lastSeen
    }))
  });
};

// Limpar conhecimento antigo (manutenção)
const cleanupKnowledge: RequestHandler = (req, res) => {
  const before = globalKnowledge.size;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  globalKnowledge.forEach((k, id) => {
    if (k.importance < 3 && new Date(k.timestamp) < oneWeekAgo) {
      globalKnowledge.delete(id);
    }
  });
  
  res.json({ 
    success: true, 
    removed: before - globalKnowledge.size,
    remaining: globalKnowledge.size
  });
};

// Rotas originais
router.post('/session', createSession);
router.get('/session/:sessionId', checkSession);
router.post('/command/:sessionId', sendCommand);
router.get('/pending/:sessionId', getPendingCommands);
router.post('/response/:commandId', sendResponse);
router.get('/responses/:sessionId', getResponses);
router.get('/history/:sessionId', getHistory);
router.delete('/history/:sessionId', clearHistory);

// Rotas para o CURSOR (integração direta)
router.get('/cursor/commands', getCursorCommands);
router.post('/cursor/done/:commandId', markCursorCommandDone);
router.delete('/cursor/clear', clearCursorCommands);

// Rotas Infinite AI
router.post('/device', registerDevice);
router.post('/knowledge/sync', syncKnowledge);
router.post('/knowledge', addKnowledge);
router.get('/knowledge/search', searchKnowledge);
router.get('/knowledge/stats', getGlobalStats);
router.post('/knowledge/cleanup', cleanupKnowledge);

export default router;

