import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Mail,
  Clock,
  User,
  Bot,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: Date;
  type?: "text" | "quick_reply" | "system";
}

const quickReplies = [
  "Preciso de orçamento",
  "Disponibilidade de equipamento",
  "Como fazer reserva?",
  "Preços e condições",
  "Suporte técnico",
];

const autoResponses = [
  {
    keywords: ["orçamento", "preço", "valor", "custo"],
    response: "Posso ajudar com orçamentos! 💰 Para um orçamento personalizado, me informe:\n• Equipamentos desejados\n• Período de locação\n• Local de entrega\n\nOu use nossa Reserva Rápida ⚡",
  },
  {
    keywords: ["disponibilidade", "disponível", "livre"],
    response: "Vou verificar a disponibilidade! 📅 Me informe:\n• Qual equipamento?\n• Para que data?\n• Por quantos dias?\n\nTemos mais de 800 equipamentos disponíveis!",
  },
  {
    keywords: ["reserva", "reservar", "alugar"],
    response: "Super fácil fazer reserva! 🎬\n\n1️⃣ Use nossa Reserva Rápida ⚡\n2️⃣ Escolha equipamentos no catálogo\n3️⃣ Entre em contato direto\n\nQual você prefere?",
  },
  {
    keywords: ["suporte", "ajuda", "problema"],
    response: "Estou aqui para ajudar! 🛠️\n\nNosso suporte técnico está disponível:\n• Segunda a Sexta: 8h às 18h\n• WhatsApp: (11) 99999-9999\n• Email: suporte@cabecaefeito.com",
  },
];

export function SupportChat() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! 👋 Sou o assistente virtual da Cabeça de Efeito. Como posso ajudar você hoje?",
      sender: "support",
      timestamp: new Date(),
      type: "system",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findAutoResponse = (text: string) => {
    const lowerText = text.toLowerCase();
    return autoResponses.find(response =>
      response.keywords.some(keyword => lowerText.includes(keyword))
    );
  };

  const sendMessage = async (text: string, isQuickReply = false) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
      type: isQuickReply ? "quick_reply" : "text",
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simular delay de digitação
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Procurar resposta automática
    const autoResponse = findAutoResponse(text);
    
    const supportMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: autoResponse ? autoResponse.response : 
        "Recebi sua mensagem! 📩 Um especialista entrará em contato em breve. Enquanto isso, você pode:\n\n• Usar nossa Reserva Rápida ⚡\n• Navegar pelo catálogo\n• Chamar no WhatsApp: (11) 99999-9999",
      sender: "support",
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, supportMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply, true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  // Se não estiver logado, não mostrar o chat
  if (!isAuthenticated) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">1</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 bg-gray-900 border-gray-700 shadow-2xl transition-all duration-300 ${isMinimized ? 'h-16' : 'h-96'}`}>
        <CardHeader className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm text-white">Suporte Cabeça de Efeito</CardTitle>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white p-1"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-orange-500 text-white"
                        : message.type === "system"
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line">{message.text}</div>
                    <div className="text-xs opacity-70 mt-1 flex items-center">
                      {message.sender === "user" ? <User className="w-3 h-3 mr-1" /> : <Bot className="w-3 h-3 mr-1" />}
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <div className="text-xs text-gray-400 mb-2">Respostas rápidas:</div>
                <div className="flex flex-wrap gap-1">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              {/* Contact Options */}
              <div className="flex justify-center space-x-4 mt-3 pt-3 border-t border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-green-300"
                  onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300"
                  onClick={() => window.open("mailto:contato@cabecaefeito.com", "_blank")}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  E-mail
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
