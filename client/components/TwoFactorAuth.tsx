import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Key,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Fingerprint,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  userEmail?: string;
  userPhone?: string;
  method?: '2fa' | 'email' | 'sms' | 'whatsapp';
}

// Componente de Input de Código OTP
function OTPInput({ 
  length = 6, 
  value, 
  onChange,
  disabled = false
}: { 
  length?: number; 
  value: string; 
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    
    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('').slice(0, length);
    onChange(result);
    
    // Auto-avançar para próximo input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);
    
    // Focar no último input preenchido
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-2xl font-bold rounded-lg border-2
            bg-slate-800 text-white
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${value[index] ? 'border-amber-500/50' : 'border-slate-600'}
          `}
        />
      ))}
    </div>
  );
}

export default function TwoFactorAuth({
  isOpen,
  onClose,
  onVerified,
  userEmail = "f***@email.com",
  userPhone = "(11) 9****-**89",
  method = 'email'
}: TwoFactorAuthProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'verify'>('select');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | 'whatsapp'>(method === '2fa' ? 'email' : method);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset quando abrir
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setCode('');
      setAttempts(0);
    }
  }, [isOpen]);

  // Enviar código
  const sendCode = async () => {
    setSending(true);
    
    try {
      // Simular envio de código
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em produção, chamar API real
      // await fetch('/api/auth/send-2fa', { method: 'POST', body: JSON.stringify({ method: selectedMethod }) });
      
      setStep('verify');
      setCountdown(60); // 60 segundos para reenvio
      
      toast({
        title: "Código enviado!",
        description: selectedMethod === 'email' 
          ? `Verifique sua caixa de entrada (${userEmail})`
          : `Código enviado para ${userPhone}`,
      });
      
    } catch (error) {
      toast({
        title: "Erro ao enviar código",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Verificar código
  const verifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Código incompleto",
        description: "Digite os 6 dígitos do código",
        variant: "destructive"
      });
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde alguns minutos e tente novamente",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAttempts(prev => prev + 1);

    try {
      // Simular verificação (em produção, validar no backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Código de teste: 123456 ou qualquer código de 6 dígitos
      const isValid = code === '123456' || code.length === 6;
      
      if (isValid) {
        toast({
          title: "Verificado com sucesso!",
          description: "Autenticação de dois fatores concluída",
        });
        onVerified();
        onClose();
      } else {
        throw new Error('Código inválido');
      }
      
    } catch (error) {
      toast({
        title: "Código inválido",
        description: `Tentativa ${attempts + 1} de ${MAX_ATTEMPTS}. Verifique e tente novamente.`,
        variant: "destructive"
      });
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const resendCode = async () => {
    if (countdown > 0) return;
    setCode('');
    await sendCode();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            Autenticação em Duas Etapas
          </DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? 'Escolha como deseja receber o código de verificação'
              : 'Digite o código de 6 dígitos que enviamos'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Etapa 1: Selecionar método */}
        {step === 'select' && (
          <div className="space-y-4 py-4">
            {/* Email */}
            <button
              onClick={() => setSelectedMethod('email')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'email'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className={`p-3 rounded-xl ${selectedMethod === 'email' ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                <Mail className={`h-6 w-6 ${selectedMethod === 'email' ? 'text-amber-400' : 'text-slate-400'}`} />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">E-mail</p>
                <p className="text-sm text-slate-400">{userEmail}</p>
              </div>
              {selectedMethod === 'email' && (
                <CheckCircle2 className="h-5 w-5 text-amber-400" />
              )}
            </button>

            {/* SMS */}
            <button
              onClick={() => setSelectedMethod('sms')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'sms'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className={`p-3 rounded-xl ${selectedMethod === 'sms' ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                <Smartphone className={`h-6 w-6 ${selectedMethod === 'sms' ? 'text-green-400' : 'text-slate-400'}`} />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">SMS</p>
                <p className="text-sm text-slate-400">{userPhone}</p>
              </div>
              {selectedMethod === 'sms' && (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              )}
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => setSelectedMethod('whatsapp')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'whatsapp'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className={`p-3 rounded-xl ${selectedMethod === 'whatsapp' ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                <MessageSquare className={`h-6 w-6 ${selectedMethod === 'whatsapp' ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-slate-400">{userPhone}</p>
              </div>
              {selectedMethod === 'whatsapp' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}
            </button>

            <Button
              onClick={sendCode}
              disabled={sending}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Código
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Etapa 2: Verificar código */}
        {step === 'verify' && (
          <div className="space-y-6 py-4">
            {/* Indicador de método */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              {selectedMethod === 'email' && <Mail className="h-4 w-4" />}
              {selectedMethod === 'sms' && <Smartphone className="h-4 w-4" />}
              {selectedMethod === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
              <span>
                Código enviado para {selectedMethod === 'email' ? userEmail : userPhone}
              </span>
            </div>

            {/* Input OTP */}
            <div className="space-y-4">
              <OTPInput
                value={code}
                onChange={setCode}
                disabled={loading}
              />
              
              {/* Tentativas restantes */}
              {attempts > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-400">
                    {MAX_ATTEMPTS - attempts} tentativa(s) restante(s)
                  </span>
                </div>
              )}
            </div>

            {/* Botão Verificar */}
            <Button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Verificar Código
                </>
              )}
            </Button>

            {/* Reenviar */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-slate-400">
                  Reenviar código em <span className="text-amber-400 font-mono">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={resendCode}
                  disabled={sending}
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className={`h-4 w-4 ${sending ? 'animate-spin' : ''}`} />
                  Reenviar código
                </button>
              )}
            </div>

            {/* Voltar */}
            <button
              onClick={() => {
                setStep('select');
                setCode('');
              }}
              className="text-sm text-slate-400 hover:text-slate-300 mx-auto block"
            >
              ← Escolher outro método
            </button>
          </div>
        )}

        {/* Dica de segurança */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="text-xs text-slate-400">
              <p className="font-medium text-slate-300 mb-1">Dica de segurança</p>
              <p>Nunca compartilhe seu código de verificação com ninguém. Nossa equipe nunca pedirá seu código.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente de Configuração 2FA
export function TwoFactorSetup() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [method, setMethod] = useState<'email' | 'sms' | 'app'>('email');

  const handleToggle = () => {
    if (enabled) {
      // Desativar 2FA
      setEnabled(false);
      toast({
        title: "2FA Desativado",
        description: "Autenticação em duas etapas foi desativada",
      });
    } else {
      // Ativar 2FA
      setShowSetup(true);
    }
  };

  const handleSetupComplete = () => {
    setEnabled(true);
    setShowSetup(false);
    toast({
      title: "2FA Ativado! ✓",
      description: "Sua conta agora está mais segura",
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-green-500/20' : 'bg-slate-700'}`}>
              <Shield className={`h-5 w-5 ${enabled ? 'text-green-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <CardTitle className="text-base">Autenticação em Duas Etapas</CardTitle>
              <CardDescription>
                {enabled ? 'Sua conta está protegida' : 'Adicione uma camada extra de segurança'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={enabled ? 'default' : 'outline'} className={enabled ? 'bg-green-500' : ''}>
            {enabled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled && (
          <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verificação via {method === 'email' ? 'E-mail' : method === 'sms' ? 'SMS' : 'Aplicativo'}</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleToggle}
          variant={enabled ? 'outline' : 'default'}
          className={enabled ? 'border-red-500/50 text-red-400 hover:bg-red-950/30' : 'bg-gradient-to-r from-amber-500 to-orange-600'}
        >
          {enabled ? (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Desativar 2FA
            </>
          ) : (
            <>
              <Key className="h-4 w-4 mr-2" />
              Ativar 2FA
            </>
          )}
        </Button>
      </CardContent>

      {/* Modal de Setup */}
      <TwoFactorAuth
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        onVerified={handleSetupComplete}
        method="2fa"
      />
    </Card>
  );
}

