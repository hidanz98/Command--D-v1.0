import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Save, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function WhatsAppSettingsCard() {
  const [settings, setSettings] = useState({
    enabled: false,
    apiKey: "",
    phoneNumber: "",
    sendOrderConfirmation: true,
    sendBeforeReturn: true,
    sendInvoice: false,
    daysBeforeReturn: 1,
  });
  
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      toast.success("Configurações de WhatsApp salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Configurações de WhatsApp
        </CardTitle>
        <CardDescription>
          Configure integração com WhatsApp Business API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Requer conta WhatsApp Business API. 
            <a 
              href="https://business.whatsapp.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center ml-1 text-blue-600 hover:underline"
            >
              Criar conta <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="whatsappEnabled">Habilitar WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Ativar envio de mensagens via WhatsApp
              </p>
            </div>
            <Switch
              id="whatsappEnabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting("enabled", checked)}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  placeholder="Sua chave de API do WhatsApp Business"
                  value={settings.apiKey}
                  onChange={(e) => updateSetting("apiKey", e.target.value)}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Obtenha sua API Key no painel do WhatsApp Business
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Número do WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+55 11 99999-9999"
                  value={settings.phoneNumber}
                  onChange={(e) => updateSetting("phoneNumber", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Número cadastrado no WhatsApp Business
                </p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-sm">Mensagens Automáticas</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendOrderConfirmation">Confirmação de Pedido</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar quando pedido for criado
                    </p>
                  </div>
                  <Switch
                    id="sendOrderConfirmation"
                    checked={settings.sendOrderConfirmation}
                    onCheckedChange={(checked) => updateSetting("sendOrderConfirmation", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendBeforeReturn">Lembrete de Devolução</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar antes do prazo de devolução
                    </p>
                  </div>
                  <Switch
                    id="sendBeforeReturn"
                    checked={settings.sendBeforeReturn}
                    onCheckedChange={(checked) => updateSetting("sendBeforeReturn", checked)}
                  />
                </div>

                {settings.sendBeforeReturn && (
                  <div className="ml-4 space-y-2">
                    <Label htmlFor="daysBeforeReturn">Dias Antes</Label>
                    <Input
                      id="daysBeforeReturn"
                      type="number"
                      min="1"
                      max="7"
                      value={settings.daysBeforeReturn}
                      onChange={(e) => updateSetting("daysBeforeReturn", parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendInvoice">Enviar Nota Fiscal</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar NFSe por WhatsApp
                    </p>
                  </div>
                  <Switch
                    id="sendInvoice"
                    checked={settings.sendInvoice}
                    onCheckedChange={(checked) => updateSetting("sendInvoice", checked)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : <><Save className="w-4 h-4 mr-2" />Salvar</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

