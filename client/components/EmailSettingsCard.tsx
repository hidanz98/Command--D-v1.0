import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Save, Info, Eye, EyeOff, ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EmailSettingsCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    provider: "resend", // Default: Resend (mais fácil)
    
    // SMTP
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    useTLS: true,
    
    // Resend
    resendApiKey: "",
    
    // Geral
    fromName: "Locadora Cinema",
    fromEmail: "",
  });
  
  const [saving, setSaving] = useState(false);

  // Carregar configurações do backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/settings", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({
            enabled: data.emailEnabled || false,
            provider: data.emailProvider || "resend",
            smtpHost: data.smtpHost || "smtp.gmail.com",
            smtpPort: data.smtpPort || 587,
            smtpUser: data.smtpUser || "",
            smtpPassword: data.smtpPassword || "",
            useTLS: data.smtpUseTLS !== false,
            resendApiKey: data.resendApiKey || "",
            fromName: data.emailFromName || "Locadora Cinema",
            fromEmail: data.emailFromAddress || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      // Preparar dados baseado no provedor
      const payload: any = {
        emailEnabled: settings.enabled,
        emailProvider: settings.provider,
        emailFromName: settings.fromName,
        emailFromAddress: settings.fromEmail,
      };

      if (settings.provider === "smtp") {
        payload.smtpHost = settings.smtpHost;
        payload.smtpPort = settings.smtpPort;
        payload.smtpUser = settings.smtpUser;
        payload.smtpPassword = settings.smtpPassword;
        payload.smtpUseTLS = settings.useTLS;
      } else if (settings.provider === "resend") {
        payload.resendApiKey = settings.resendApiKey;
      }

      const response = await fetch("/api/settings/email", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Configurações de email salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          toEmail: settings.fromEmail,
        }),
      });

      if (response.ok) {
        toast.success(`Email de teste enviado para ${settings.fromEmail}!`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao enviar email de teste");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao enviar email de teste");
    } finally {
      setTesting(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Configurações de Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Configurações de Email
        </CardTitle>
        <CardDescription>
          Configure o envio automático de emails para seus clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Habilitar Email */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="emailEnabled" className="text-base font-semibold">Habilitar Sistema de Email</Label>
            <p className="text-sm text-muted-foreground">
              Enviar confirmações, lembretes e notas fiscais automaticamente
            </p>
          </div>
          <Switch
            id="emailEnabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSetting("enabled", checked)}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Escolher Provedor */}
            <div className="space-y-4 border rounded-lg p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
              <h3 className="font-semibold text-base flex items-center gap-2">
                🚀 Escolha o Provedor de Email
              </h3>
              
              <Select value={settings.provider} onValueChange={(value) => updateSetting("provider", value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resend">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-semibold">Resend API (Recomendado) ⭐</div>
                        <div className="text-xs text-muted-foreground">Grátis até 3.000 emails/mês • 99.9% entrega</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="smtp">
                    <div>
                      <div className="font-semibold">SMTP Tradicional</div>
                      <div className="text-xs text-muted-foreground">Gmail, Outlook, Hostinger, etc</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {settings.provider === "resend" && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong className="text-blue-900">Por que Resend?</strong>
                    <ul className="mt-2 space-y-1 text-blue-800">
                      <li>✅ <strong>Grátis</strong> até 3.000 emails/mês</li>
                      <li>✅ <strong>99.9%</strong> de taxa de entrega</li>
                      <li>✅ Configuração em <strong>5 minutos</strong></li>
                      <li>✅ Usa seu <strong>domínio próprio</strong></li>
                      <li>✅ Dashboard com métricas profissionais</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Configuração RESEND */}
            {settings.provider === "resend" && (
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold text-base">📧 Configuração Resend</h3>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Passo a passo rápido:</strong>
                    <ol className="mt-2 space-y-2 text-sm">
                      <li>
                        <strong>1.</strong> Crie conta grátis no Resend:{" "}
                        <a 
                          href="https://resend.com/signup" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          resend.com/signup <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li><strong>2.</strong> Adicione seu domínio (eles ensinam o passo a passo)</li>
                      <li><strong>3.</strong> Copie sua API Key</li>
                      <li><strong>4.</strong> Cole abaixo e clique em Salvar!</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="resendApiKey">API Key do Resend</Label>
                  <div className="relative">
                    <Input
                      id="resendApiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxx"
                      value={settings.resendApiKey}
                      onChange={(e) => updateSetting("resendApiKey", e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Resend Dashboard → API Keys → Create API Key
                  </p>
                </div>
              </div>
            )}

            {/* Configuração SMTP */}
            {settings.provider === "smtp" && (
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold text-base">🔧 Configuração SMTP</h3>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Configure um servidor SMTP válido. Exemplos:
                    <ul className="mt-2 space-y-1 text-sm">
                      <li><strong>Gmail:</strong> smtp.gmail.com (porta 587)</li>
                      <li><strong>Outlook:</strong> smtp.office365.com (porta 587)</li>
                      <li><strong>Hostinger:</strong> smtp.hostinger.com (porta 587)</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting("smtpHost", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Porta SMTP</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting("smtpPort", parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Usuário SMTP</Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    placeholder="seu-email@gmail.com"
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting("smtpUser", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Senha SMTP</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={settings.smtpPassword}
                      onChange={(e) => updateSetting("smtpPassword", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gmail: Use "Senha de App" (não sua senha normal)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="useTLS">Usar TLS/SSL</Label>
                    <p className="text-sm text-muted-foreground">
                      Conexão segura (recomendado)
                    </p>
                  </div>
                  <Switch
                    id="useTLS"
                    checked={settings.useTLS}
                    onCheckedChange={(checked) => updateSetting("useTLS", checked)}
                  />
                </div>
              </div>
            )}

            {/* Informações do Remetente */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-semibold text-base">👤 Informações do Remetente</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fromName">Nome do Remetente</Label>
                <Input
                  id="fromName"
                  placeholder="Locadora Cinema"
                  value={settings.fromName}
                  onChange={(e) => updateSetting("fromName", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Como seu nome aparece nos emails
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">Email do Remetente</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="contato@seudominio.com.br"
                  value={settings.fromEmail}
                  onChange={(e) => updateSetting("fromEmail", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {settings.provider === "resend" 
                    ? "Use o email do domínio configurado no Resend"
                    : "Geralmente o mesmo do usuário SMTP"}
                </p>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  <strong>Exemplo de como aparece:</strong><br />
                  De: <strong>{settings.fromName || "Locadora Cinema"}</strong> &lt;{settings.fromEmail || "contato@seudominio.com.br"}&gt;
                </AlertDescription>
              </Alert>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Salvando..." : <><Save className="w-4 h-4 mr-2" />Salvar Configurações</>}
              </Button>
              
              <Button 
                onClick={handleTestEmail} 
                disabled={testing || !settings.fromEmail}
                variant="outline"
                className="flex-1"
              >
                {testing ? "Enviando..." : <><Send className="w-4 h-4 mr-2" />Testar Email</>}
              </Button>
            </div>

            {!settings.fromEmail && (
              <p className="text-sm text-muted-foreground text-center">
                Configure o email do remetente para testar
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
