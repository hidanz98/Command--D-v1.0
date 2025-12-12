import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScanLine, Save, Info } from "lucide-react";
import { toast } from "sonner";

interface ScannerSettings {
  enableCheckoutScanner: boolean;
  enableCheckinScanner: boolean;
  requireScanOnCheckout: boolean;
  requireScanOnCheckin: boolean;
}

export function ScannerSettingsCard() {
  const [settings, setSettings] = useState<ScannerSettings>({
    enableCheckoutScanner: false,
    enableCheckinScanner: false,
    requireScanOnCheckout: false,
    requireScanOnCheckin: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao carregar configurações");

      const data = await response.json();
      setSettings({
        enableCheckoutScanner: data.enableCheckoutScanner || false,
        enableCheckinScanner: data.enableCheckinScanner || false,
        requireScanOnCheckout: data.requireScanOnCheckout || false,
        requireScanOnCheckin: data.requireScanOnCheckin || false,
      });
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings/scanner", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Erro ao salvar configurações");

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof ScannerSettings, value: boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };

      // Se desabilitar o scanner, desabilitar também a obrigatoriedade
      if (key === "enableCheckoutScanner" && !value) {
        newSettings.requireScanOnCheckout = false;
      }
      if (key === "enableCheckinScanner" && !value) {
        newSettings.requireScanOnCheckin = false;
      }

      return newSettings;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            Configurações de Conferência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando configurações...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="w-5 h-5" />
          Configurações de Conferência
        </CardTitle>
        <CardDescription>
          Configure o uso de QR Code e Código de Barras para conferência de equipamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Habilite a conferência por scanner para usar QR Code ou Código de Barras na saída e
            devolução de equipamentos. Isso aumenta a precisão e reduz erros.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Conferência na Saída */}
          <div className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCheckoutScanner" className="text-base font-semibold">
                  Conferência na Saída
                </Label>
                <p className="text-sm text-muted-foreground">
                  Habilita o scanner para conferir equipamentos na saída/locação
                </p>
              </div>
              <Switch
                id="enableCheckoutScanner"
                checked={settings.enableCheckoutScanner}
                onCheckedChange={(checked) => updateSetting("enableCheckoutScanner", checked)}
              />
            </div>

            {settings.enableCheckoutScanner && (
              <div className="ml-4 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireScanOnCheckout" className="text-sm">
                      Tornar Obrigatório
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Exigir que todos os produtos sejam escaneados antes da saída
                    </p>
                  </div>
                  <Switch
                    id="requireScanOnCheckout"
                    checked={settings.requireScanOnCheckout}
                    onCheckedChange={(checked) => updateSetting("requireScanOnCheckout", checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Conferência na Devolução */}
          <div className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCheckinScanner" className="text-base font-semibold">
                  Conferência na Devolução
                </Label>
                <p className="text-sm text-muted-foreground">
                  Habilita o scanner para conferir equipamentos na devolução
                </p>
              </div>
              <Switch
                id="enableCheckinScanner"
                checked={settings.enableCheckinScanner}
                onCheckedChange={(checked) => updateSetting("enableCheckinScanner", checked)}
              />
            </div>

            {settings.enableCheckinScanner && (
              <div className="ml-4 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireScanOnCheckin" className="text-sm">
                      Tornar Obrigatório
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Exigir que todos os produtos sejam escaneados na devolução
                    </p>
                  </div>
                  <Switch
                    id="requireScanOnCheckin"
                    checked={settings.requireScanOnCheckin}
                    onCheckedChange={(checked) => updateSetting("requireScanOnCheckin", checked)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações adicionais */}
        {(settings.enableCheckoutScanner || settings.enableCheckinScanner) && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Como funciona:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              {settings.enableCheckoutScanner && (
                <li>
                  Na saída: Use o botão "Conferir Saída" para escanear os produtos antes de
                  entregar ao cliente
                </li>
              )}
              {settings.enableCheckinScanner && (
                <li>
                  Na devolução: Use o botão "Conferir Devolução" para escanear os produtos que
                  estão sendo devolvidos
                </li>
              )}
              <li>Você pode usar a câmera para escanear ou digitar o código manualmente</li>
              <li>
                Certifique-se de imprimir as etiquetas com QR Code para todos os seus equipamentos
              </li>
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

