import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Save, Info } from "lucide-react";
import { toast } from "sonner";

export function GeneralSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Notificações
    notifyEmail: true,
    notifyWhatsApp: false,
    notifyPush: false,
    
    // Pagamentos
    enablePaymentPix: true,
    enablePaymentCard: false,
    enablePaymentBoleto: false,
    enablePaymentCash: true,
    pixKey: "",
    
    // Locação
    enableLateFee: true,
    lateFeePercentage: 5.0,
    enableDeposit: true,
    depositPercentage: 30.0,
    
    // NFSe
    enableNFSe: false,
    autoIssueNFSe: false,
  });

  // Carregar configurações
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/settings", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({
            notifyEmail: data.notifyEmail ?? true,
            notifyWhatsApp: data.notifyWhatsApp ?? false,
            notifyPush: data.notifyPush ?? false,
            enablePaymentPix: data.enablePaymentPix ?? true,
            enablePaymentCard: data.enablePaymentCard ?? false,
            enablePaymentBoleto: data.enablePaymentBoleto ?? false,
            enablePaymentCash: data.enablePaymentCash ?? true,
            pixKey: data.pixKey || "",
            enableLateFee: data.enableLateFee ?? true,
            lateFeePercentage: data.lateFeePercentage ?? 5.0,
            enableDeposit: data.enableDeposit ?? true,
            depositPercentage: data.depositPercentage ?? 30.0,
            enableNFSe: data.enableNFSe ?? false,
            autoIssueNFSe: data.autoIssueNFSe ?? false,
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
      const response = await fetch("/api/settings/general", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Configurações gerais salvas com sucesso!");
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

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Gerais
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
          <Settings className="w-5 h-5" />
          Configurações Gerais
        </CardTitle>
        <CardDescription>
          Configure notificações, pagamentos e regras de locação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Estas configurações afetam o funcionamento geral do sistema.
          </AlertDescription>
        </Alert>

        {/* Notificações */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">📧 Notificações</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyEmail">Notificar por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar emails para clientes
                </p>
              </div>
              <Switch
                id="notifyEmail"
                checked={settings.notifyEmail}
                onCheckedChange={(checked) => updateSetting("notifyEmail", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyWhatsApp">Notificar por WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar mensagens WhatsApp
                </p>
              </div>
              <Switch
                id="notifyWhatsApp"
                checked={settings.notifyWhatsApp}
                onCheckedChange={(checked) => updateSetting("notifyWhatsApp", checked)}
              />
            </div>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">💳 Métodos de Pagamento</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="enablePaymentPix">PIX</Label>
              <Switch
                id="enablePaymentPix"
                checked={settings.enablePaymentPix}
                onCheckedChange={(checked) => updateSetting("enablePaymentPix", checked)}
              />
            </div>

            {settings.enablePaymentPix && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  placeholder="seu@email.com ou CPF/CNPJ"
                  value={settings.pixKey}
                  onChange={(e) => updateSetting("pixKey", e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="enablePaymentCard">Cartão de Crédito/Débito</Label>
              <Switch
                id="enablePaymentCard"
                checked={settings.enablePaymentCard}
                onCheckedChange={(checked) => updateSetting("enablePaymentCard", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enablePaymentCash">Dinheiro</Label>
              <Switch
                id="enablePaymentCash"
                checked={settings.enablePaymentCash}
                onCheckedChange={(checked) => updateSetting("enablePaymentCash", checked)}
              />
            </div>
          </div>
        </div>

        {/* Regras de Locação */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">📝 Regras de Locação</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableLateFee">Multa por Atraso</Label>
                <p className="text-sm text-muted-foreground">
                  Cobrar multa quando devolver atrasado
                </p>
              </div>
              <Switch
                id="enableLateFee"
                checked={settings.enableLateFee}
                onCheckedChange={(checked) => updateSetting("enableLateFee", checked)}
              />
            </div>

            {settings.enableLateFee && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="lateFeePercentage">Percentual por Dia (%)</Label>
                <Input
                  id="lateFeePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.lateFeePercentage}
                  onChange={(e) => updateSetting("lateFeePercentage", parseFloat(e.target.value))}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableDeposit">Exigir Caução</Label>
                <p className="text-sm text-muted-foreground">
                  Solicitar caução nas locações
                </p>
              </div>
              <Switch
                id="enableDeposit"
                checked={settings.enableDeposit}
                onCheckedChange={(checked) => updateSetting("enableDeposit", checked)}
              />
            </div>

            {settings.enableDeposit && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="depositPercentage">Percentual da Caução (%)</Label>
                <Input
                  id="depositPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.depositPercentage}
                  onChange={(e) => updateSetting("depositPercentage", parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        {/* NFSe */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">🧾 Nota Fiscal (NFSe)</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableNFSe">Habilitar NFSe</Label>
                <p className="text-sm text-muted-foreground">
                  Emitir notas fiscais eletrônicas
                </p>
              </div>
              <Switch
                id="enableNFSe"
                checked={settings.enableNFSe}
                onCheckedChange={(checked) => updateSetting("enableNFSe", checked)}
              />
            </div>

            {settings.enableNFSe && (
              <div className="ml-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoIssueNFSe">Emissão Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Emitir automaticamente ao finalizar locação
                    </p>
                  </div>
                  <Switch
                    id="autoIssueNFSe"
                    checked={settings.autoIssueNFSe}
                    onCheckedChange={(checked) => updateSetting("autoIssueNFSe", checked)}
                  />
                </div>
              </div>
            )}
          </div>
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
