/**
 * WebSocket Server para comunicação em tempo real
 * iPhone <-> PC/Cursor instantâneo!
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface Client {
  ws: WebSocket;
  id: string;
  type: 'pc' | 'iphone' | 'unknown';
  sessionId: string;
  lastPing: Date;
}

interface WSMessage {
  type: 'command' | 'response' | 'ping' | 'join' | 'status' | 'typing';
  sessionId: string;
  data: any;
  from?: string;
  timestamp?: number;
}

class RealTimeServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();
  private commandQueue: any[] = [];

  init(server: any) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const client: Client = {
        ws,
        id: clientId,
        type: 'unknown',
        sessionId: '',
        lastPing: new Date()
      };

      this.clients.set(clientId, client);
      console.log(`🔌 WebSocket conectado: ${clientId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (e) {
          console.error('Erro ao processar mensagem WS:', e);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`🔌 WebSocket desconectado: ${clientId}`);
      });

      ws.on('error', (err) => {
        console.error('Erro WebSocket:', err);
        this.clients.delete(clientId);
      });

      // Envia confirmação de conexão
      this.send(ws, {
        type: 'status',
        sessionId: '',
        data: { 
          connected: true, 
          clientId,
          message: 'Conectado ao servidor em tempo real!'
        }
      });
    });

    // Ping para manter conexões vivas
    setInterval(() => {
      this.clients.forEach((client, id) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          this.send(client.ws, { type: 'ping', sessionId: client.sessionId, data: {} });
        }
      });
    }, 30000);

    console.log('🚀 WebSocket Server iniciado em /ws');
  }

  private handleMessage(clientId: string, message: WSMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'join':
        // Cliente se identifica
        client.sessionId = message.sessionId || '050518';
        client.type = message.data?.type || 'unknown';
        console.log(`📱 ${client.type} entrou na sessão ${client.sessionId}`);
        
        // Notifica outros na mesma sessão
        this.broadcastToSession(client.sessionId, {
          type: 'status',
          sessionId: client.sessionId,
          data: { 
            event: 'user_joined',
            clientType: client.type,
            online: this.getSessionClients(client.sessionId).length
          }
        }, clientId);
        break;

      case 'command':
        // Comando do iPhone para o PC
        console.log(`📱 Comando recebido: ${message.data?.command}`);
        
        // Salva na fila
        const cmd = {
          id: Date.now().toString(),
          ...message.data,
          from: client.type,
          timestamp: new Date()
        };
        this.commandQueue.push(cmd);

        // Envia para todos os PCs na sessão
        this.broadcastToSession(client.sessionId, {
          type: 'command',
          sessionId: client.sessionId,
          data: cmd,
          from: client.type,
          timestamp: Date.now()
        }, clientId);

        // Confirma recebimento
        this.send(client.ws, {
          type: 'status',
          sessionId: client.sessionId,
          data: { received: true, commandId: cmd.id }
        });
        break;

      case 'response':
        // Resposta do PC para o iPhone
        console.log(`💻 Resposta enviada`);
        
        // Envia para todos os iPhones na sessão
        this.broadcastToSession(client.sessionId, {
          type: 'response',
          sessionId: client.sessionId,
          data: message.data,
          from: 'pc',
          timestamp: Date.now()
        }, clientId);
        break;

      case 'typing':
        // Indicador de digitação
        this.broadcastToSession(client.sessionId, {
          type: 'typing',
          sessionId: client.sessionId,
          data: { isTyping: message.data?.isTyping, from: client.type }
        }, clientId);
        break;

      case 'ping':
        client.lastPing = new Date();
        break;
    }
  }

  private send(ws: WebSocket, message: WSMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToSession(sessionId: string, message: WSMessage, excludeId?: string) {
    this.clients.forEach((client, id) => {
      if (client.sessionId === sessionId && id !== excludeId) {
        this.send(client.ws, message);
      }
    });
  }

  private getSessionClients(sessionId: string): Client[] {
    return Array.from(this.clients.values()).filter(c => c.sessionId === sessionId);
  }

  // API pública
  getStats() {
    return {
      totalClients: this.clients.size,
      byType: {
        pc: Array.from(this.clients.values()).filter(c => c.type === 'pc').length,
        iphone: Array.from(this.clients.values()).filter(c => c.type === 'iphone').length
      },
      commandQueue: this.commandQueue.length
    };
  }

  getPendingCommands() {
    const pending = this.commandQueue.filter(c => !c.processed);
    return pending;
  }

  markCommandProcessed(commandId: string, response: string) {
    const cmd = this.commandQueue.find(c => c.id === commandId);
    if (cmd) {
      cmd.processed = true;
      cmd.response = response;
    }
  }
}

export const realTimeServer = new RealTimeServer();

