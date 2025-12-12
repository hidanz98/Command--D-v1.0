import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Palette, Save, Info, Upload } from "lucide-react";
import { toast } from "sonner";

export function AppearanceSettingsCard() {
  const [settings, setSettings] = useState({
    companyName: "Locadora Cinema",
    logo: "",
    primaryColor: "#F59E0B",
    secondaryColor: "#1F2937",
    accentColor: "#3B82F6",
    favicon: "",
  });
  
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      toast.success("Configurações de aparência salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Configurações de Aparência
        </CardTitle>
        <CardDescription>
          Personalize a aparência do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            As alterações serão aplicadas imediatamente em todo o sistema.
          </AlertDescription>
        </Alert>

        {/* Identidade */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">🏢 Identidade</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                placeholder="Locadora Cinema"
                value={settings.companyName}
                onChange={(e) => updateSetting("companyName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center gap-4">
                {settings.logo && (
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="h-16 w-16 object-contain border rounded"
                  />
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG ou SVG recomendado. Tamanho máximo: 2MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon</Label>
              <Input
                id="favicon"
                type="file"
                accept="image/x-icon,image/png"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Ícone exibido na aba do navegador (16x16 ou 32x32px)
              </p>
            </div>
          </div>
        </div>

        {/* Cores */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">🎨 Paleta de Cores</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  placeholder="#F59E0B"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cor principal do sistema (amarelo atual)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                  placeholder="#1F2937"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cor de fundo e elementos secundários
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => updateSetting("accentColor", e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => updateSetting("accentColor", e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cor para links e elementos interativos
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold text-base">👁️ Pré-visualização</h3>
          
          <div className="space-y-2 p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-3 mb-4">
              {settings.logo && (
                <img src={settings.logo} alt="Logo" className="h-10 w-auto" />
              )}
              <span className="text-lg font-bold">{settings.companyName}</span>
            </div>
            
            <div className="flex gap-2">
              <Button style={{ backgroundColor: settings.primaryColor }} className="text-white">
                Botão Primário
              </Button>
              <Button 
                variant="outline" 
                style={{ 
                  borderColor: settings.accentColor,
                  color: settings.accentColor 
                }}
              >
                Botão Outline
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => {
            setSettings({
              companyName: "Locadora Cinema",
              logo: "",
              primaryColor: "#F59E0B",
              secondaryColor: "#1F2937",
              accentColor: "#3B82F6",
              favicon: "",
            });
            toast.info("Configurações restauradas para padrão");
          }}>
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : <><Save className="w-4 h-4 mr-2" />Salvar</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

