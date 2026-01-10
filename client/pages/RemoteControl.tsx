import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Camera,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Copy,
  Zap,
  Brain,
  Terminal,
  Code,
  RefreshCw,
  Clock,
  MessageSquare,
  Link2,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RemoteCommand {
  id: string;
  command: string;
  response?: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed';
  hasImage?: boolean;
}

export default function RemoteControl() {
  const [sessionId, setSessionId] = useState('');
  const [inputSessionId, setInputSessionId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [command, setCommand] = useState('');
  const [commands, setCommands] = useState<RemoteCommand[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [pcStatus, setPcStatus] = useState<'online' | 'offline'>('offline');
  const [wsConnected, setWsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Conectar via WebSocket para tempo real
  const connectWebSocket = useCallback((session: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket conectado!');
        setWsConnected(true);
        // Entrar na sessão
        ws.send(JSON.stringify({
          type: 'join',
          sessionId: session,
          data: { type: 'iphone' }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWSMessage(message);
        } catch (e) {
          console.error('Erro ao processar mensagem:', e);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setWsConnected(false);
        // Tentar reconectar após 3 segundos
        setTimeout(() => {
          if (isConnected) connectWebSocket(session);
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('Erro WebSocket:', err);
        setWsConnected(false);
      };
    } catch (e) {
      console.error('Falha ao conectar WebSocket:', e);
    }
  }, [isConnected]);

  // Processar mensagens do WebSocket
  const handleWSMessage = (message: any) => {
    switch (message.type) {
      case 'response':
        // Resposta do Claude/PC
        setCommands(prev => prev.map(cmd => 
          cmd.id === message.data?.commandId 
            ? { ...cmd, response: message.data?.response, status: 'completed' as const }
            : cmd
        ));
        // Se não encontrou por ID, adiciona a resposta ao último comando pending
        setCommands(prev => {
          const lastPending = prev.findIndex(c => c.status !== 'completed');
          if (lastPending !== -1 && message.data?.response) {
            const updated = [...prev];
            updated[lastPending] = {
              ...updated[lastPending],
              response: message.data.response,
              status: 'completed'
            };
            return updated;
          }
          return prev;
        });
        break;

      case 'status':
        if (message.data?.event === 'user_joined') {
          setPcStatus('online');
        }
        break;

      case 'typing':
        setIsTyping(message.data?.isTyping && message.data?.from === 'pc');
        break;
    }
  };

  // Enviar comando via WebSocket
  const sendViaWebSocket = (cmd: string, imageBase64?: string | null) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        sessionId,
        data: {
          command: cmd,
          imageBase64,
          timestamp: Date.now()
        }
      }));
      return true;
    }
    return false;
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commands]);

  // Verificar conexao e buscar respostas periodicamente
  useEffect(() => {
    if (!isConnected || !sessionId) return;

    const checkConnection = async () => {
      try {
        const res = await fetch(`/api/remote-ai/session/${sessionId}`);
        const data = await res.json();
        if (data.valid) {
          setPcStatus('online');
        } else {
          setPcStatus('offline');
          setIsConnected(false);
        }
      } catch {
        setPcStatus('offline');
      }
    };

    const fetchResponses = async () => {
      try {
        const res = await fetch(`/api/remote-ai/responses/${sessionId}`);
        const data = await res.json();
        
        if (data.responses?.length > 0) {
          setCommands(prev => {
            const updated = [...prev];
            data.responses.forEach((resp: any) => {
              const idx = updated.findIndex(c => c.id === resp.id);
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  response: resp.response,
                  status: 'completed'
                };
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar respostas:', err);
      }
    };

    checkConnection();
    const interval = setInterval(() => {
      checkConnection();
      fetchResponses();
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected, sessionId]);

  // Conectar a sessao
  const connectSession = async () => {
    if (!inputSessionId.trim()) return;
    
    setIsConnecting(true);
    try {
      const res = await fetch(`/api/remote-ai/session/${inputSessionId}`);
      const data = await res.json();
      
      if (data.valid) {
        setSessionId(inputSessionId);
        setIsConnected(true);
        setPcStatus('online');
        
        // Conectar WebSocket para tempo real
        connectWebSocket(inputSessionId);
        
        // Buscar historico
        const histRes = await fetch(`/api/remote-ai/history/${inputSessionId}`);
        const histData = await histRes.json();
        if (histData.history?.length > 0) {
          setCommands(histData.history.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp)
          })));
        }
      } else {
        alert('Codigo de sessao invalido! Verifique o codigo no PC.');
      }
    } catch (err) {
      alert('Erro ao conectar. Verifique se o PC esta online.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Enviar comando
  const sendCommand = async () => {
    if ((!command.trim() && !selectedImage) || isSending) return;
    
    setIsSending(true);
    
    const newCmd: RemoteCommand = {
      id: Date.now().toString(),
      command: command || '[Imagem enviada para analise]',
      timestamp: new Date(),
      status: 'pending',
      hasImage: !!selectedImage
    };
    
    setCommands(prev => [...prev, newCmd]);
    
    // Tentar enviar via WebSocket primeiro (tempo real)
    const sentViaWS = sendViaWebSocket(command, selectedImage);
    
    try {
      const res = await fetch(`/api/remote-ai/command/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: command,
          imageBase64: selectedImage,
          source: 'iphone'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Se a API já retornou resposta (IA automática)
        if (data.response) {
          setCommands(prev => prev.map(c => 
            c.id === newCmd.id ? { 
              ...c, 
              id: data.commandId, 
              status: 'completed',
              response: data.response 
            } : c
          ));
        } else {
          setCommands(prev => prev.map(c => 
            c.id === newCmd.id ? { ...c, id: data.commandId, status: 'processing' } : c
          ));
        }
      }
    } catch (err) {
      setCommands(prev => prev.map(c => 
        c.id === newCmd.id ? { ...c, status: 'completed', response: 'Erro ao enviar comando.' } : c
      ));
    }
    
    setCommand('');
    setSelectedImage(null);
    setIsSending(false);
  };

  // Upload de imagem
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Comandos rapidos
  const quickCommands = [
    { label: '🚀 Melhorar', icon: Zap, cmd: 'Analise o sistema e implemente melhorias' },
    { label: '📝 Criar', icon: Code, cmd: 'Crie um novo componente React para ' },
    { label: '🔧 Corrigir', icon: AlertTriangle, cmd: 'Corrija este erro: ' },
    { label: '⚡ Executar', icon: Terminal, cmd: 'Execute o comando: ' },
    { label: '📊 Status', icon: Monitor, cmd: 'Mostre o status do sistema' },
    { label: '🔍 Buscar', icon: Brain, cmd: 'Busque informações sobre ' },
  ];

  // Tela de conexao
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-violet-500/30 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center mb-4">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Claude AI Remote</CardTitle>
            <CardDescription className="text-slate-400">
              Conecte ao Cursor - IA real com poder total do PC
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Senha de Acesso</label>
              <div className="flex gap-2">
                <Input
                  value={inputSessionId}
                  onChange={(e) => setInputSessionId(e.target.value)}
                  placeholder="Digite a senha..."
                  className="bg-slate-700 border-slate-600 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  type="password"
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Digite sua senha de programador
              </p>
            </div>
            
            <Button
              onClick={connectSession}
              disabled={!inputSessionId.trim() || isConnecting}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 h-12 text-lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5 mr-2" />
                  Conectar ao PC
                </>
              )}
            </Button>
            
            <div className="text-center text-xs text-slate-500">
              <p>Requisitos:</p>
              <ul className="mt-2 space-y-1">
                <li>✅ PC e iPhone no mesmo WiFi</li>
                <li>✅ Sistema rodando no PC</li>
                <li>✅ Cursor aberto com a IA</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900 text-white flex flex-col">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-violet-900/95 via-purple-900/95 to-fuchsia-900/95 backdrop-blur-xl border-b border-white/10 px-4 py-4 shadow-lg shadow-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-purple-500/50 animate-pulse">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg flex items-center gap-2">
                Claude AI
                <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-full font-bold">PRO</span>
              </h1>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-purple-300">Poder total do PC</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              wsConnected 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                : pcStatus === 'online'
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
            )}>
              {wsConnected ? (
                <>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Tempo Real
                </>
              ) : pcStatus === 'online' ? (
                <>
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Offline
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Mensagem inicial */}
          {commands.length === 0 && (
            <div className="text-center py-8 px-4">
              <div className="mx-auto p-4 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl w-24 h-24 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Claude AI Conectado!</h3>
              <p className="text-purple-300 text-sm mb-6">
                IA real com poder total do seu PC
              </p>
              
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-2xl mb-1">💻</p>
                  <p className="text-xs text-white/70">Editar Código</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-2xl mb-1">📁</p>
                  <p className="text-xs text-white/70">Criar Arquivos</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-2xl mb-1">⚡</p>
                  <p className="text-xs text-white/70">Executar</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-2xl mb-1">🧠</p>
                  <p className="text-xs text-white/70">IA Aprende</p>
                </div>
              </div>

              <p className="text-white/40 text-xs">
                Exemplos: "Crie um botão azul" • "Melhore o sistema" • "Execute npm test"
              </p>
            </div>
          )}
          
          {commands.map((cmd) => (
            <div key={cmd.id} className="space-y-2">
              {/* Comando do usuario */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                  {cmd.hasImage && (
                    <div className="flex items-center gap-2 text-cyan-200 text-xs mb-2">
                      <ImageIcon className="w-3 h-3" />
                      <span>Imagem anexada</span>
                    </div>
                  )}
                  <p className="text-white text-sm">{cmd.command}</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="text-[10px] text-cyan-200/70">
                      {cmd.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {cmd.status === 'pending' && <Clock className="w-3 h-3 text-cyan-200/70" />}
                    {cmd.status === 'processing' && <Loader2 className="w-3 h-3 text-cyan-200 animate-spin" />}
                    {cmd.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-cyan-200" />}
                  </div>
                </div>
              </div>
              
              {/* Resposta do Claude */}
              {cmd.response && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[90%]">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl rounded-bl-lg px-5 py-4 border border-white/10 shadow-xl backdrop-blur">
                      <div 
                        className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: cmd.response
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-300">$1</strong>')
                            .replace(/`([^`]+)`/g, '<code class="bg-violet-500/20 px-1.5 py-0.5 rounded-md text-violet-300 text-xs">$1</code>')
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading */}
              {cmd.status === 'processing' && !cmd.response && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        <span className="text-sm text-slate-400">Claude está processando no PC...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Aguardando Claude */}
              {cmd.status === 'pending' && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-amber-500/30">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-amber-300">Aguardando Claude no Cursor...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Acoes rapidas */}
      <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/50">
        <div className="flex gap-2 overflow-x-auto pb-2 max-w-2xl mx-auto">
          {quickCommands.map((qc, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="shrink-0 border-slate-600 hover:border-violet-500 hover:bg-violet-500/10 text-xs"
              onClick={() => setCommand(qc.cmd)}
            >
              <qc.icon className="w-3 h-3 mr-1" />
              {qc.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Premium */}
      <div className="bg-gradient-to-t from-slate-950 via-slate-900 to-transparent border-t border-white/10 p-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Preview imagem */}
          {selectedImage && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl border border-violet-500/30 backdrop-blur">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded-xl border-2 border-white/20"
              />
              <div className="flex-1">
                <p className="text-sm text-violet-200 font-medium">📸 Imagem pronta</p>
                <p className="text-xs text-violet-300/70">Claude vai analisar</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="h-8 w-8 hover:bg-red-500/30 rounded-full"
              >
                <X className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-3 items-end">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
            />
            
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 bg-white/5 hover:bg-white/10 hover:border-violet-400 rounded-xl h-12 w-12"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-5 h-5 text-violet-300" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Peça qualquer coisa ao Claude..."
                className="w-full min-h-[48px] max-h-[120px] bg-white/10 border-white/20 rounded-2xl resize-none pr-14 text-white placeholder:text-white/40 focus:border-violet-400 focus:ring-violet-400/20"
                rows={1}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendCommand();
                  }
                }}
              />
            </div>
            
            <Button
              onClick={sendCommand}
              disabled={(!command.trim() && !selectedImage) || isSending || pcStatus === 'offline'}
              className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 rounded-xl h-12 w-12 shadow-lg shadow-purple-500/30"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-center text-xs text-white/40">
            {pcStatus === 'online' 
              ? '✨ Claude AI pronto para ajudar' 
              : '⚠️ Reconectando ao PC...'}
          </p>
        </div>
      </div>
    </div>
  );
}

