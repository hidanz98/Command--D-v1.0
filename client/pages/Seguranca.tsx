import React, { useState } from "react";
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  MapPin,
  Monitor,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Fingerprint,
  QrCode,
  History,
  Trash2,
  ChevronRight,
  Info,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import TwoFactorAuth, { TwoFactorSetup } from "@/components/TwoFactorAuth";

// Sessões ativas mockadas
const ACTIVE_SESSIONS = [
  {
    id: '1',
    device: 'Chrome em Windows',
    location: 'São Paulo, SP',
    ip: '192.168.1.10',
    lastActive: 'Agora (esta sessão)',
    isCurrent: true
  },
  {
    id: '2',
    device: 'Safari em iPhone',
    location: 'São Paulo, SP',
    ip: '192.168.1.25',
    lastActive: 'Há 2 horas',
    isCurrent: false
  },
  {
    id: '3',
    device: 'Firefox em MacOS',
    location: 'Rio de Janeiro, RJ',
    ip: '45.67.89.123',
    lastActive: 'Há 3 dias',
    isCurrent: false
  }
];

// Histórico de atividades mockado
const ACTIVITY_HISTORY = [
  { action: 'Login realizado', time: '10 minutos atrás', device: 'Chrome/Windows', success: true },
  { action: 'Senha alterada', time: '2 dias atrás', device: 'Chrome/Windows', success: true },
  { action: 'Tentativa de login', time: '3 dias atrás', device: 'Firefox/MacOS', success: false },
  { action: 'Login realizado', time: '5 dias atrás', device: 'Safari/iPhone', success: true },
  { action: '2FA ativado', time: '1 semana atrás', device: 'Chrome/Windows', success: true },
];

export default function Seguranca() {
  const { toast } = useToast();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  
  // Estados de configuração
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    passwordExpiry: false,
    sessionTimeout: 30,
    biometricLogin: false,
    rememberDevices: true,
  });
  
  // Estados do formulário de senha
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Calcular força da senha
  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    
    if (score < 30) return { score, label: 'Fraca', color: 'bg-red-500' };
    if (score < 60) return { score, label: 'Média', color: 'bg-amber-500' };
    if (score < 80) return { score, label: 'Boa', color: 'bg-green-500' };
    return { score: 100, label: 'Forte', color: 'bg-emerald-500' };
  };

  const passwordStrength = calculatePasswordStrength(passwords.new);

  // Alterar senha
  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordStrength.score < 60) {
      toast({
        title: "Senha muito fraca",
        description: "Escolha uma senha mais forte",
        variant: "destructive"
      });
      return;
    }
    
    // Simular alteração
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso",
    });
    setShowPasswordDialog(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  // Revogar sessão
  const handleRevokeSession = (sessionId: string) => {
    toast({
      title: "Sessão encerrada",
      description: "O dispositivo foi desconectado com sucesso",
    });
    setShowRevokeDialog(false);
    setSessionToRevoke(null);
  };

  // Revogar todas as sessões
  const handleRevokeAllSessions = () => {
    toast({
      title: "Todas as sessões encerradas",
      description: "Todos os dispositivos foram desconectados (exceto este)",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Segurança da Conta</h1>
              <p className="text-sm text-slate-400">Proteja sua conta e gerencie acessos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Alerta de Segurança */}
        {!settings.twoFactorEnabled && (
          <Alert className="bg-amber-950/30 border-amber-500/50">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <AlertTitle className="text-amber-400">Aumente sua segurança</AlertTitle>
            <AlertDescription className="text-slate-300">
              Ative a autenticação em duas etapas para proteger melhor sua conta.
              <Button 
                variant="link" 
                className="text-amber-400 p-0 h-auto ml-2"
                onClick={() => setShow2FA(true)}
              >
                Ativar agora →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Autenticação em Duas Etapas */}
          <TwoFactorSetup />

          {/* Alterar Senha */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <Key className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Senha</CardTitle>
                  <CardDescription>Última alteração há 30 dias</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPasswordDialog(true)}
                variant="outline"
                className="w-full border-slate-600"
              >
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configurações de Segurança */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-400" />
              Configurações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notificações de Login */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  Notificações de Login
                </p>
                <p className="text-sm text-slate-400">
                  Receba um aviso quando houver login em novo dispositivo
                </p>
              </div>
              <Switch
                checked={settings.loginNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, loginNotifications: checked })}
              />
            </div>

            <Separator className="bg-slate-700" />

            {/* Alertas de Atividade Suspeita */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                  Alertas de Atividade Suspeita
                </p>
                <p className="text-sm text-slate-400">
                  Seja notificado sobre tentativas de acesso não autorizadas
                </p>
              </div>
              <Switch
                checked={settings.suspiciousActivityAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, suspiciousActivityAlerts: checked })}
              />
            </div>

            <Separator className="bg-slate-700" />

            {/* Lembrar Dispositivos */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-slate-400" />
                  Lembrar Dispositivos Confiáveis
                </p>
                <p className="text-sm text-slate-400">
                  Não pedir 2FA em dispositivos já verificados
                </p>
              </div>
              <Switch
                checked={settings.rememberDevices}
                onCheckedChange={(checked) => setSettings({ ...settings, rememberDevices: checked })}
              />
            </div>

            <Separator className="bg-slate-700" />

            {/* Login Biométrico */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-slate-400" />
                  Login Biométrico
                </p>
                <p className="text-sm text-slate-400">
                  Use Face ID ou impressão digital para entrar
                </p>
              </div>
              <Switch
                checked={settings.biometricLogin}
                onCheckedChange={(checked) => setSettings({ ...settings, biometricLogin: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sessões Ativas */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-400" />
                Sessões Ativas ({ACTIVE_SESSIONS.length})
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRevokeAllSessions}
                className="border-red-500/50 text-red-400 hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Encerrar Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ACTIVE_SESSIONS.map(session => (
                <div 
                  key={session.id}
                  className={`p-4 rounded-lg border ${
                    session.isCurrent 
                      ? 'bg-green-950/20 border-green-500/30' 
                      : 'bg-slate-700/30 border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                        <Monitor className={`h-5 w-5 ${session.isCurrent ? 'text-green-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {session.device}
                          {session.isCurrent && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              Esta sessão
                            </Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                          <span>IP: {session.ip}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{session.lastActive}</p>
                      </div>
                    </div>
                    
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSessionToRevoke(session.id);
                          setShowRevokeDialog(true);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Atividades */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-400" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {ACTIVITY_HISTORY.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className={`p-2 rounded-lg ${activity.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {activity.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-slate-400">{activity.device}</p>
                    </div>
                    <span className="text-sm text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Dialog: Alterar Senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Escolha uma senha forte com letras, números e símbolos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Senha Atual */}
            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="bg-slate-800 border-slate-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="bg-slate-800 border-slate-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Força da Senha */}
              {passwords.new && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Força da senha</span>
                    <span className={`font-medium ${
                      passwordStrength.label === 'Forte' ? 'text-emerald-400' :
                      passwordStrength.label === 'Boa' ? 'text-green-400' :
                      passwordStrength.label === 'Média' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress value={passwordStrength.score} className="h-1" />
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="bg-slate-800 border-slate-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="text-sm text-red-400">As senhas não coincidem</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Revogar Sessão */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>Encerrar Sessão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja encerrar esta sessão? O dispositivo será desconectado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => sessionToRevoke && handleRevokeSession(sessionToRevoke)}
            >
              Encerrar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Modal */}
      <TwoFactorAuth
        isOpen={show2FA}
        onClose={() => setShow2FA(false)}
        onVerified={() => {
          setSettings({ ...settings, twoFactorEnabled: true });
          setShow2FA(false);
        }}
        method="2fa"
      />
    </div>
  );
}

