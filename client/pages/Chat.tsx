import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image,
  Smile,
  Check,
  CheckCheck,
  Clock,
  User,
  Users,
  Star,
  Pin,
  Archive,
  Trash2,
  Bell,
  BellOff,
  ChevronLeft,
  Camera,
  Mic,
  File,
  X,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Tipos
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'client';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'audio';
  fileUrl?: string;
  fileName?: string;
}

interface Conversation {
  id: string;
  clientName: string;
  clientAvatar?: string;
  clientCompany?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  online: boolean;
  pinned: boolean;
  muted: boolean;
  projectName?: string;
  messages: Message[];
}

// Dados mockados
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    clientName: 'Carlos Henrique',
    clientCompany: 'Globo Filmes',
    lastMessage: 'Perfeito! Confirmo a retirada para amanhã às 9h',
    lastMessageTime: new Date(2026, 0, 10, 14, 30),
    unreadCount: 2,
    online: true,
    pinned: true,
    muted: false,
    projectName: 'Novela "Amor e Destino"',
    messages: [
      { id: '1', content: 'Olá! Gostaria de confirmar a reserva dos equipamentos', sender: 'client', timestamp: new Date(2026, 0, 10, 10, 0), status: 'read', type: 'text' },
      { id: '2', content: 'Olá Carlos! Claro, sua reserva está confirmada. Canon C300 Mark III (2x) e Kit ARRI', sender: 'user', timestamp: new Date(2026, 0, 10, 10, 15), status: 'read', type: 'text' },
      { id: '3', content: 'Ótimo! Qual o horário para retirada?', sender: 'client', timestamp: new Date(2026, 0, 10, 10, 20), status: 'read', type: 'text' },
      { id: '4', content: 'Pode ser amanhã a partir das 8h. Estamos na Rua das Câmeras, 123', sender: 'user', timestamp: new Date(2026, 0, 10, 10, 25), status: 'read', type: 'text' },
      { id: '5', content: 'Perfeito! Confirmo a retirada para amanhã às 9h', sender: 'client', timestamp: new Date(2026, 0, 10, 14, 30), status: 'delivered', type: 'text' },
    ]
  },
  {
    id: '2',
    clientName: 'Maria Santos',
    clientCompany: 'MS Produções',
    lastMessage: 'Enviei o comprovante de pagamento',
    lastMessageTime: new Date(2026, 0, 10, 12, 45),
    unreadCount: 1,
    online: true,
    pinned: false,
    muted: false,
    projectName: 'Documentário "BH em Cores"',
    messages: [
      { id: '1', content: 'Bom dia! O pagamento foi aprovado?', sender: 'client', timestamp: new Date(2026, 0, 10, 12, 0), status: 'read', type: 'text' },
      { id: '2', content: 'Bom dia Maria! Ainda não identifiquei, pode enviar o comprovante?', sender: 'user', timestamp: new Date(2026, 0, 10, 12, 30), status: 'read', type: 'text' },
      { id: '3', content: 'Enviei o comprovante de pagamento', sender: 'client', timestamp: new Date(2026, 0, 10, 12, 45), status: 'delivered', type: 'text' },
    ]
  },
  {
    id: '3',
    clientName: 'Roberto Lima',
    clientCompany: 'Produtora XYZ',
    lastMessage: 'Vou verificar e retorno em breve',
    lastMessageTime: new Date(2026, 0, 9, 18, 0),
    unreadCount: 0,
    online: false,
    pinned: false,
    muted: false,
    projectName: 'Comercial Banco Digital',
    messages: [
      { id: '1', content: 'Preciso adicionar mais um dia na locação, é possível?', sender: 'client', timestamp: new Date(2026, 0, 9, 17, 0), status: 'read', type: 'text' },
      { id: '2', content: 'Vou verificar e retorno em breve', sender: 'user', timestamp: new Date(2026, 0, 9, 18, 0), status: 'read', type: 'text' },
    ]
  },
  {
    id: '4',
    clientName: 'Ana Costa',
    clientCompany: 'Freelancer',
    lastMessage: 'Obrigada pelo atendimento! 🙏',
    lastMessageTime: new Date(2026, 0, 8, 16, 30),
    unreadCount: 0,
    online: false,
    pinned: false,
    muted: true,
    projectName: 'Clipe Sertanejo',
    messages: [
      { id: '1', content: 'Obrigada pelo atendimento! 🙏', sender: 'client', timestamp: new Date(2026, 0, 8, 16, 30), status: 'read', type: 'text' },
    ]
  },
  {
    id: '5',
    clientName: 'Festival BH',
    clientCompany: 'Associação Cultural',
    lastMessage: 'Equipamentos devolvidos com sucesso!',
    lastMessageTime: new Date(2026, 0, 6, 10, 0),
    unreadCount: 0,
    online: false,
    pinned: false,
    muted: false,
    messages: [
      { id: '1', content: 'Equipamentos devolvidos com sucesso!', sender: 'user', timestamp: new Date(2026, 0, 6, 10, 0), status: 'read', type: 'text' },
    ]
  },
];

// Respostas automáticas simuladas
const AUTO_RESPONSES = [
  "Obrigado pela mensagem! Vou verificar e retorno em instantes.",
  "Perfeito, anotado aqui!",
  "Entendido! Algo mais que posso ajudar?",
  "Certo, vou providenciar isso agora.",
  "Ótimo! Qualquer dúvida estou à disposição.",
];

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Filtrar conversas
  const filteredConversations = conversations
    .filter(conv => 
      conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.clientCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    });

  // Enviar mensagem
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: 'text',
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: new Date(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date(),
    } : null);
    setNewMessage('');

    // Simular status de enviado
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: conv.messages.map(m => 
              m.id === message.id ? { ...m, status: 'delivered' as const } : m
            ),
          };
        }
        return conv;
      }));
    }, 1000);

    // Simular resposta automática (apenas para demonstração)
    setTimeout(() => {
      const autoResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)],
        sender: 'client',
        timestamp: new Date(),
        status: 'delivered',
        type: 'text',
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, autoResponse],
            lastMessage: autoResponse.content,
            lastMessageTime: new Date(),
            unreadCount: conv.unreadCount + 1,
          };
        }
        return conv;
      }));

      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, autoResponse],
      } : null);
    }, 2000);
  };

  // Formatar hora
  const formatTime = (date: Date) => {
    const now = new Date(2026, 0, 10, 15, 0);
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Status icon
  const MessageStatus = ({ status }: { status: Message['status'] }) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-slate-500" />;
      case 'sent':
        return <Check className="h-3 w-3 text-slate-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-slate-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Chat</h1>
              <p className="text-xs text-slate-400">
                {conversations.filter(c => c.online).length} online • {conversations.reduce((acc, c) => acc + c.unreadCount, 0)} não lidas
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Conversas */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-slate-700/50 flex flex-col bg-slate-900/50",
          showMobileChat && "hidden md:flex"
        )}>
          {/* Busca */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          {/* Lista */}
          <ScrollArea className="flex-1">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  setShowMobileChat(true);
                  // Marcar como lido
                  setConversations(prev => prev.map(c => 
                    c.id === conv.id ? { ...c, unreadCount: 0 } : c
                  ));
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-slate-800/50 transition-colors border-b border-slate-800/50",
                  selectedConversation?.id === conv.id && "bg-slate-800/70",
                  conv.pinned && "bg-slate-800/30"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                      {conv.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {conv.pinned && <Pin className="h-3 w-3 text-slate-400" />}
                      <span className="font-medium truncate">{conv.clientName}</span>
                    </div>
                    <span className="text-xs text-slate-500">{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  {conv.clientCompany && (
                    <p className="text-xs text-cyan-400 truncate">{conv.clientCompany}</p>
                  )}
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-slate-400 truncate">{conv.lastMessage}</p>
                    <div className="flex items-center gap-1">
                      {conv.muted && <BellOff className="h-3 w-3 text-slate-500" />}
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-green-500 text-white text-xs px-1.5 min-w-[20px] h-5">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Área de Chat */}
        <div className={cn(
          "flex-1 flex flex-col",
          !showMobileChat && "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Header do Chat */}
              <div className="bg-slate-900/70 border-b border-slate-700/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setShowMobileChat(false)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        {selectedConversation.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedConversation.clientName}</span>
                        {selectedConversation.online && (
                          <span className="text-xs text-green-400">online</span>
                        )}
                      </div>
                      {selectedConversation.projectName && (
                        <p className="text-xs text-amber-400">🎬 {selectedConversation.projectName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" /> Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pin className="h-4 w-4 mr-2" /> Fixar conversa
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BellOff className="h-4 w-4 mr-2" /> Silenciar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" /> Apagar conversa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message, idx) => {
                    const isUser = message.sender === 'user';
                    const showAvatar = idx === 0 || selectedConversation.messages[idx - 1].sender !== message.sender;
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isUser && showAvatar && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-slate-700 text-xs">
                              {selectedConversation.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isUser && !showAvatar && <div className="w-8" />}
                        
                        <div className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          isUser 
                            ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-br-md" 
                            : "bg-slate-700 text-slate-100 rounded-bl-md"
                        )}>
                          <p className="text-sm">{message.content}</p>
                          <div className={cn(
                            "flex items-center gap-1 mt-1",
                            isUser ? "justify-end" : "justify-start"
                          )}>
                            <span className="text-[10px] opacity-70">
                              {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isUser && <MessageStatus status={message.status} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input de Mensagem */}
              <div className="bg-slate-900/70 border-t border-slate-700/50 p-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-slate-800 border-slate-700"
                  />
                  
                  {newMessage.trim() ? (
                    <Button 
                      onClick={sendMessage}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Estado vazio */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-12 w-12 text-slate-600" />
                </div>
                <h2 className="text-xl font-medium text-slate-400 mb-2">Suas mensagens</h2>
                <p className="text-slate-500">Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

