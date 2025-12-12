import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Save, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function SecuritySettingsCard() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    require2FA: false,
    requireStrongPassword: true,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableIPWhitelist: false,
    allowedIPs: "",
  });
  
  const [saving, setSaving] = useState(false);

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
            require2FA: data.require2FA ?? false,
            requireStrongPassword: data.requireStrongPassword ?? true,
            passwordMinLength: data.passwordMinLength ?? 8,
            requireUppercase: data.requireUppercase ?? true,
            requireNumbers: data.requireNumbers ?? true,
            requireSpecialChars: data.requireSpecialChars ?? false,
            sessionTimeout: data.sessionTimeoutMinutes ?? 30,
            maxLoginAttempts: data.maxLoginAttempts ?? 5,
            lockoutDuration: data.lockoutDurationMinutes ?? 15,
            enableIPWhitelist: data.enableIPWhitelist ?? false,
            allowedIPs: data.allowedIPs || "",
          });
        }
      } catch (error) {
        console.error(error);
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
      const response = await fetch("/api/settings/security", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          require2FA: settings.require2FA,
          requireStrongPassword: settings.requireStrongPassword,
          passwordMinLength: settings.passwordMinLength,
          requireUppercase: settings.requireUppercase,
          requireNumbers: settings.requireNumbers,
          requireSpecialChars: settings.requireSpecialChars,
          sessionTimeoutMinutes: settings.sessionTimeout,
          maxLoginAttempts: settings.maxLoginAttempts,
          lockoutDurationMinutes: settings.lockoutDuration,
          enableIPWhitelist: settings.enableIPWhitelist,
          allowedIPs: settings.allowedIPs,
        }),
      });

      if (response.ok) {
        toast.success("Configurações de segurança salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error(error);
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
            <Shield className="w-5 h-5" />
            Configurações de Segurança
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
          <Shield className="w-5 h-5" />
          Configurações de Segurança
        </CardTitle>
        <CardDescription>
          Configure políticas de segurança do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Alterações nas configurações de segurança podem afetar o acesso ao sistema.
          </AlertDescription>
        </Alert>

        {/* Autenticação */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">🔐 Autenticação</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require2FA">Autenticação de 2 Fatores (2FA)</Label>
                <p className="text-sm text-muted-foreground">
                  Exigir código adicional no login
                </p>
              </div>
              <Switch
                id="require2FA"
                checked={settings.require2FA}
                onCheckedChange={(checked) => updateSetting("require2FA", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Tentativas Máximas de Login</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                min="3"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting("maxLoginAttempts", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Duração do Bloqueio (minutos)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                min="5"
                max="60"
                value={settings.lockoutDuration}
                onChange={(e) => updateSetting("lockoutDuration", parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Tempo que o usuário fica bloqueado após exceder tentativas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="1440"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting("sessionTimeout", parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Tempo de inatividade antes de deslogar automaticamente
              </p>
            </div>
          </div>
        </div>

        {/* Política de Senhas */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">🔑 Política de Senhas</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireStrongPassword">Exigir Senha Forte</Label>
                <p className="text-sm text-muted-foreground">
                  Aplicar regras de complexidade
                </p>
              </div>
              <Switch
                id="requireStrongPassword"
                checked={settings.requireStrongPassword}
                onCheckedChange={(checked) => updateSetting("requireStrongPassword", checked)}
              />
            </div>

            {settings.requireStrongPassword && (
              <>
                <div className="space-y-2 ml-4">
                  <Label htmlFor="passwordMinLength">Comprimento Mínimo</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting("passwordMinLength", parseInt(e.target.value))}
                  />
                </div>

                <div className="ml-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireUppercase">Letras Maiúsculas</Label>
                    <Switch
                      id="requireUppercase"
                      checked={settings.requireUppercase}
                      onCheckedChange={(checked) => updateSetting("requireUppercase", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireNumbers">Números</Label>
                    <Switch
                      id="requireNumbers"
                      checked={settings.requireNumbers}
                      onCheckedChange={(checked) => updateSetting("requireNumbers", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireSpecialChars">Caracteres Especiais</Label>
                    <Switch
                      id="requireSpecialChars"
                      checked={settings.requireSpecialChars}
                      onCheckedChange={(checked) => updateSetting("requireSpecialChars", checked)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controle de Acesso */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">🌐 Controle de Acesso</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableIPWhitelist">Whitelist de IPs</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir acesso apenas de IPs específicos
                </p>
              </div>
              <Switch
                id="enableIPWhitelist"
                checked={settings.enableIPWhitelist}
                onCheckedChange={(checked) => updateSetting("enableIPWhitelist", checked)}
              />
            </div>

            {settings.enableIPWhitelist && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="allowedIPs">IPs Permitidos</Label>
                <Input
                  id="allowedIPs"
                  placeholder="192.168.1.1, 192.168.1.2"
                  value={settings.allowedIPs}
                  onChange={(e) => updateSetting("allowedIPs", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separar múltiplos IPs por vírgula
                </p>
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

