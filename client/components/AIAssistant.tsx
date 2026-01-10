import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Palette,
  Settings,
  Brain,
  Zap,
  ChevronRight,
  Minimize2,
  Maximize2,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAI, AIMessage, AIAction } from '@/context/AIContext';
import { useNavigate } from 'react-router-dom';

// Componente de Mensagem
function ChatMessage({ 
  message, 
  onAction,
  onFeedback 
}: { 
  message: AIMessage;
  onAction: (action: AIAction) => void;
  onFeedback: (helpful: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser 
          ? "bg-gradient-to-br from-cyan-500 to-blue-600" 
          : "bg-gradient-to-br from-violet-500 to-purple-600"
      )}>
        {isUser ? (
          <span className="text-xs font-bold text-white">EU</span>
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Conteúdo */}
      <div className={cn(
        "flex-1 max-w-[85%]",
        isUser && "text-right"
      )}>
        <div className={cn(
          "inline-block rounded-2xl px-4 py-2 text-sm",
          isUser 
            ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-md" 
            : "bg-slate-700 text-slate-100 rounded-bl-md"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Ações */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actions.map(action => (
              <Button
                key={action.id}
                size="sm"
                variant="outline"
                className="h-7 text-xs border-violet-500/50 text-violet-400 hover:bg-violet-500/20"
                onClick={() => onAction(action)}
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Sugestões */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-slate-500">Perguntas relacionadas:</p>
            {message.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="block text-left text-xs text-violet-400 hover:text-violet-300 hover:underline"
                onClick={() => {/* Implementar sugestão */}}
              >
                → {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Feedback (apenas para respostas da IA) */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <button 
              className="text-slate-500 hover:text-green-400 transition-colors"
              onClick={() => onFeedback(true)}
              title="Útil"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button 
              className="text-slate-500 hover:text-red-400 transition-colors"
              onClick={() => onFeedback(false)}
              title="Não ajudou"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
            <button 
              className="text-slate-500 hover:text-slate-300 transition-colors"
              onClick={copyToClipboard}
              title="Copiar"
            >
              {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            </button>
            {message.learned && (
              <Badge className="text-[10px] bg-green-500/20 text-green-400">
                <Brain className="h-2 w-2 mr-1" />
                Aprendido
              </Badge>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className={cn(
          "text-[10px] text-slate-500 mt-1",
          isUser && "text-right"
        )}>
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// Quick Actions
const quickActions = [
  { label: 'Novo Pedido', icon: Zap, query: 'Como criar um novo pedido?' },
  { label: 'Emitir Nota', icon: Sparkles, query: 'Como emitir nota fiscal de locação?' },
  { label: 'Ver Estoque', icon: TrendingUp, query: 'Ver disponibilidade de equipamentos' },
  { label: 'Personalizar', icon: Palette, query: 'Como personalizar o visual do sistema?' },
];

export default function AIAssistant() {
  const { 
    messages, 
    isTyping, 
    sendMessage, 
    clearMessages,
    learningStats,
    theme,
    isAssistantOpen,
    toggleAssistant,
    setAssistantOpen
  } = useAI();
  
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input quando abre
  useEffect(() => {
    if (isAssistantOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAssistantOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleAction = (action: AIAction) => {
    if (action.type === 'navigate' && action.route) {
      navigate(action.route);
      setAssistantOpen(false);
    }
  };

  const handleFeedback = (helpful: boolean) => {
    // Implementar feedback
    console.log('Feedback:', helpful);
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
    sendMessage(query);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={toggleAssistant}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500",
          "flex items-center justify-center",
          "hover:scale-110 active:scale-95",
          isAssistantOpen && "scale-0 opacity-0"
        )}
        style={{ boxShadow: `0 0 20px ${theme.primaryColor}40` }}
      >
        <Bot className="h-7 w-7 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
      </button>

      {/* Painel do Assistente */}
      <div className={cn(
        "fixed z-50 transition-all duration-300 ease-out",
        isExpanded 
          ? "inset-4 md:inset-10" 
          : "bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh]",
        isAssistantOpen 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-95 translate-y-4 pointer-events-none"
      )}>
        <div className="w-full h-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 border-b border-slate-700"
            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}20, transparent)` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  Assistente IA
                  <Badge className="bg-green-500/20 text-green-400 text-[10px]">
                    Online
                  </Badge>
                </h3>
                <p className="text-xs text-slate-400">
                  {learningStats.knowledgeItems} conhecimentos • {learningStats.accuracyRate}% precisão
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={clearMessages}
                title="Limpar conversa"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={toggleAssistant}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mensagens */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-10 w-10 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Olá! Sou sua IA assistente 🤖</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-[280px] mx-auto">
                  Posso ajudar com pedidos, relatórios, estoque, e até personalizar o visual do sistema!
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.query)}
                      className="flex items-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors"
                    >
                      <action.icon className="h-4 w-4 text-violet-400" />
                      <span className="text-sm text-slate-300">{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Dica */}
                <div className="mt-6 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <p className="text-xs text-amber-400 flex items-center justify-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Dica: Digite "mudar cor para azul" para personalizar!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map(message => (
                  <ChatMessage 
                    key={message.id} 
                    message={message}
                    onAction={handleAction}
                    onFeedback={handleFeedback}
                  />
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Pergunte algo ou peça uma alteração..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-slate-700 border-slate-600 focus:border-violet-500"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              IA aprende com cada interação • {learningStats.serversConnected} servidor(es) conectado(s)
            </p>
          </div>
        </div>
      </div>

      {/* Overlay quando expandido */}
      {isAssistantOpen && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}

