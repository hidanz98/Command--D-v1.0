import React, { useState, useEffect } from "react";
import {
  CreditCard,
  QrCode,
  Smartphone,
  DollarSign,
  Check,
  X,
  Copy,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Shield,
  Lock,
  Banknote,
  Building2,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  Info,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  amount: number;
  description?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerDocument?: string;
}

type PaymentMethod = 'pix' | 'credit' | 'debit' | 'boleto';
type PaymentStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'expired';

// Simular código PIX
const generatePixCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '00020126580014br.gov.bcb.pix0136';
  for (let i = 0; i < 36; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code + '5204000053039865802BR5925BILS CINEMA E VIDEO LTDA6009SAO PAULO62070503***6304';
};

// Componente de Input formatado para cartão
function CardInput({ 
  value, 
  onChange, 
  placeholder,
  maxLength,
  format 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
  maxLength?: number;
  format?: 'card' | 'expiry' | 'cvv' | 'cpf';
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    
    if (format === 'card') {
      val = val.replace(/(\d{4})/g, '$1 ').trim();
    } else if (format === 'expiry') {
      if (val.length >= 2) {
        val = val.slice(0, 2) + '/' + val.slice(2, 4);
      }
    } else if (format === 'cpf') {
      if (val.length > 11) val = val.slice(0, 11);
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    onChange(val);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="bg-slate-800 border-slate-600 font-mono"
    />
  );
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  description = "Pagamento de locação",
  orderId,
  customerName = "",
  customerEmail = "",
  customerPhone = "",
  customerDocument = "",
}: PaymentModalProps) {
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixExpiry, setPixExpiry] = useState(300); // 5 minutos
  const [copied, setCopied] = useState(false);

  // Dados do cartão
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    cpf: customerDocument,
    installments: '1',
  });

  // Dados do cliente (para boleto)
  const [customerData, setCustomerData] = useState({
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    document: customerDocument,
  });

  // Gerar código PIX ao abrir
  useEffect(() => {
    if (isOpen && method === 'pix') {
      setPixCode(generatePixCode());
      setPixExpiry(300);
      setStatus('pending');
    }
  }, [isOpen, method]);

  // Countdown do PIX
  useEffect(() => {
    if (method === 'pix' && pixExpiry > 0 && status === 'pending') {
      const timer = setInterval(() => {
        setPixExpiry(prev => {
          if (prev <= 1) {
            setStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [method, pixExpiry, status]);

  // Simular verificação de pagamento PIX
  useEffect(() => {
    if (method === 'pix' && status === 'pending' && pixExpiry > 0) {
      const checkPayment = setInterval(() => {
        // Simular: 10% de chance de pagamento a cada verificação
        if (Math.random() < 0.1) {
          setStatus('approved');
          clearInterval(checkPayment);
          setTimeout(() => {
            onSuccess(`PIX-${Date.now()}`);
            toast({
              title: "Pagamento confirmado! ✓",
              description: "PIX recebido com sucesso",
            });
          }, 1500);
        }
      }, 3000);
      return () => clearInterval(checkPayment);
    }
  }, [method, status, pixExpiry, onSuccess, toast]);

  // Copiar código PIX
  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Código copiado!",
      description: "Cole no app do seu banco",
    });
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Processar pagamento com cartão
  const processCardPayment = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos do cartão",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStatus('processing');

    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simular: 90% de chance de aprovação
      if (Math.random() < 0.9) {
        setStatus('approved');
        setTimeout(() => {
          onSuccess(`CARD-${Date.now()}`);
          toast({
            title: "Pagamento aprovado! ✓",
            description: `${parseInt(cardData.installments) > 1 ? `${cardData.installments}x de R$ ${(amount / parseInt(cardData.installments)).toFixed(2)}` : 'Pagamento à vista'}`,
          });
        }, 1500);
      } else {
        setStatus('rejected');
        toast({
          title: "Pagamento recusado",
          description: "Verifique os dados do cartão ou tente outro",
          variant: "destructive"
        });
      }
    } catch (error) {
      setStatus('rejected');
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Gerar boleto
  const generateBoleto = async () => {
    if (!customerData.name || !customerData.email || !customerData.document) {
      toast({
        title: "Dados incompletos",
        description: "Preencha nome, e-mail e CPF/CNPJ",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Boleto gerado!",
        description: "Enviamos para seu e-mail",
      });
      
      // Em produção, abriria o PDF do boleto
      onSuccess(`BOLETO-${Date.now()}`);
    } catch (error) {
      toast({
        title: "Erro ao gerar boleto",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar PIX
  const resetPix = () => {
    setPixCode(generatePixCode());
    setPixExpiry(300);
    setStatus('pending');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Pagamento
          </DialogTitle>
          <DialogDescription>
            {description} • Pedido #{orderId || '---'}
          </DialogDescription>
        </DialogHeader>

        {/* Valor */}
        <div className="p-4 bg-gradient-to-r from-green-950/50 to-emerald-950/50 rounded-lg border border-green-500/30 text-center">
          <p className="text-sm text-slate-400">Valor total</p>
          <p className="text-3xl font-bold text-green-400">
            R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Status de Aprovado */}
        {status === 'approved' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-400">Pagamento Aprovado!</h3>
              <p className="text-slate-400">Seu pagamento foi processado com sucesso</p>
            </div>
          </div>
        )}

        {/* Status de Rejeitado */}
        {status === 'rejected' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="h-12 w-12 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-400">Pagamento Recusado</h3>
              <p className="text-slate-400">Verifique os dados e tente novamente</p>
            </div>
            <Button onClick={() => setStatus('pending')} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Formulário de Pagamento */}
        {status !== 'approved' && status !== 'rejected' && (
          <Tabs value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="mt-4">
            <TabsList className="grid grid-cols-3 bg-slate-800">
              <TabsTrigger value="pix" className="data-[state=active]:bg-green-600">
                <QrCode className="h-4 w-4 mr-2" />
                PIX
              </TabsTrigger>
              <TabsTrigger value="credit" className="data-[state=active]:bg-blue-600">
                <CreditCard className="h-4 w-4 mr-2" />
                Cartão
              </TabsTrigger>
              <TabsTrigger value="boleto" className="data-[state=active]:bg-amber-600">
                <FileText className="h-4 w-4 mr-2" />
                Boleto
              </TabsTrigger>
            </TabsList>

            {/* PIX */}
            <TabsContent value="pix" className="space-y-4 mt-4">
              {status === 'expired' ? (
                <div className="text-center space-y-4 py-6">
                  <AlertTriangle className="h-12 w-12 mx-auto text-amber-400" />
                  <p className="text-slate-400">O código PIX expirou</p>
                  <Button onClick={resetPix} className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Gerar Novo Código
                  </Button>
                </div>
              ) : (
                <>
                  {/* QR Code (simulado) */}
                  <div className="bg-white p-4 rounded-lg mx-auto w-48 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-32 w-32 text-black mx-auto" />
                      <p className="text-xs text-slate-600 mt-2">Escaneie com seu app</p>
                    </div>
                  </div>

                  {/* Tempo restante */}
                  <div className="flex items-center justify-center gap-2 text-amber-400">
                    <Clock className="h-4 w-4" />
                    <span>Expira em {formatTime(pixExpiry)}</span>
                  </div>
                  <Progress value={(pixExpiry / 300) * 100} className="h-1" />

                  {/* Código para copiar */}
                  <div className="space-y-2">
                    <Label>Ou copie o código PIX:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={pixCode.slice(0, 40) + '...'}
                        readOnly
                        className="bg-slate-800 border-slate-600 font-mono text-xs"
                      />
                      <Button onClick={copyPixCode} variant="outline" className="flex-shrink-0">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Status de verificação */}
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Aguardando pagamento...</span>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Cartão de Crédito */}
            <TabsContent value="credit" className="space-y-4 mt-4">
              {status === 'processing' ? (
                <div className="text-center space-y-4 py-6">
                  <Loader2 className="h-12 w-12 mx-auto text-blue-400 animate-spin" />
                  <p className="text-slate-400">Processando pagamento...</p>
                  <p className="text-xs text-slate-500">Não feche esta janela</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Número do Cartão</Label>
                    <CardInput
                      value={cardData.number}
                      onChange={(v) => setCardData({ ...cardData, number: v })}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      format="card"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nome no Cartão</Label>
                    <Input
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      placeholder="NOME COMO NO CARTÃO"
                      className="bg-slate-800 border-slate-600 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Validade</Label>
                      <CardInput
                        value={cardData.expiry}
                        onChange={(v) => setCardData({ ...cardData, expiry: v })}
                        placeholder="MM/AA"
                        maxLength={5}
                        format="expiry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <CardInput
                        value={cardData.cvv}
                        onChange={(v) => setCardData({ ...cardData, cvv: v })}
                        placeholder="123"
                        maxLength={4}
                        format="cvv"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parcelas</Label>
                      <Select
                        value={cardData.installments}
                        onValueChange={(v) => setCardData({ ...cardData, installments: v })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x R$ {amount.toFixed(2)}</SelectItem>
                          <SelectItem value="2">2x R$ {(amount / 2).toFixed(2)}</SelectItem>
                          <SelectItem value="3">3x R$ {(amount / 3).toFixed(2)}</SelectItem>
                          <SelectItem value="6">6x R$ {(amount / 6).toFixed(2)}</SelectItem>
                          <SelectItem value="12">12x R$ {(amount / 12).toFixed(2)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>CPF do Titular</Label>
                    <CardInput
                      value={cardData.cpf}
                      onChange={(v) => setCardData({ ...cardData, cpf: v })}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      format="cpf"
                    />
                  </div>

                  <Button
                    onClick={processCardPayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pagar R$ {amount.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Shield className="h-3 w-3" />
                    <span>Pagamento 100% seguro e criptografado</span>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Boleto */}
            <TabsContent value="boleto" className="space-y-4 mt-4">
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-400 mt-0.5" />
                  <div className="text-sm text-amber-200">
                    <p className="font-medium">Boleto bancário</p>
                    <p className="text-amber-300/80">O pagamento leva até 3 dias úteis para ser confirmado</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="bg-slate-800 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="bg-slate-800 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <CardInput
                  value={customerData.document}
                  onChange={(v) => setCustomerData({ ...customerData, document: v })}
                  placeholder="000.000.000-00"
                  maxLength={18}
                  format="cpf"
                />
              </div>

              <Button
                onClick={generateBoleto}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando boleto...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Boleto
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Métodos de pagamento aceitos */}
        {status !== 'approved' && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-700">
            <img src="https://logospng.org/download/mastercard/logo-mastercard-256.png" alt="Mastercard" className="h-6 opacity-50" />
            <img src="https://logospng.org/download/visa/logo-visa-256.png" alt="Visa" className="h-6 opacity-50" />
            <img src="https://logospng.org/download/pix/logo-pix-256.png" alt="PIX" className="h-6 opacity-50" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

