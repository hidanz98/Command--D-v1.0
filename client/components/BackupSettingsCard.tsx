import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Save, Info, Download, Upload, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BackupSettingsCard() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    autoBackup: true,
    frequency: "daily",
    retention: 7,
    cloudStorage: false,
    storageProvider: "local",
  });
  
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      toast.success("Configurações de backup salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleManualBackup = async () => {
    setBackingUp(true);
    try {
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Backup criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar backup");
    } finally {
      setBackingUp(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Configurações de Backup
        </CardTitle>
        <CardDescription>
          Configure backup e restauração de dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Manter backups regulares é essencial para proteger seus dados.
          </AlertDescription>
        </Alert>

        {/* Backup Automático */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">🔄 Backup Automático</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoBackup">Habilitar Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Criar backups periodicamente
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => updateSetting("autoBackup", checked)}
              />
            </div>

            {settings.autoBackup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select 
                    value={settings.frequency} 
                    onValueChange={(value) => updateSetting("frequency", value)}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="monthly">Mensalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Retenção (dias)</Label>
                  <Select 
                    value={settings.retention.toString()} 
                    onValueChange={(value) => updateSetting("retention", parseInt(value))}
                  >
                    <SelectTrigger id="retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="15">15 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="180">180 dias</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Backups mais antigos serão removidos automaticamente
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Armazenamento */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">☁️ Armazenamento</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cloudStorage">Armazenamento em Nuvem</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar backups para a nuvem
                </p>
              </div>
              <Switch
                id="cloudStorage"
                checked={settings.cloudStorage}
                onCheckedChange={(checked) => updateSetting("cloudStorage", checked)}
              />
            </div>

            {settings.cloudStorage && (
              <div className="space-y-2">
                <Label htmlFor="storageProvider">Provedor</Label>
                <Select 
                  value={settings.storageProvider} 
                  onValueChange={(value) => updateSetting("storageProvider", value)}
                >
                  <SelectTrigger id="storageProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local (servidor)</SelectItem>
                    <SelectItem value="aws-s3">AWS S3</SelectItem>
                    <SelectItem value="google-drive">Google Drive</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                    <SelectItem value="azure">Azure Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Backup Manual */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">💾 Backup Manual</h3>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleManualBackup} 
              disabled={backingUp}
              className="w-full"
            >
              {backingUp ? (
                <>Criando backup...</>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Criar Backup Agora
                </>
              )}
            </Button>

            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Restaurar de Backup
            </Button>
          </div>
        </div>

        {/* Últimos Backups */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold text-base">📋 Últimos Backups</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <p className="font-medium text-sm">backup-2025-11-12.sql</p>
                <p className="text-xs text-muted-foreground">Hoje às 03:00</p>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <p className="font-medium text-sm">backup-2025-11-11.sql</p>
                <p className="text-xs text-muted-foreground">Ontem às 03:00</p>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <p className="font-medium text-sm">backup-2025-11-10.sql</p>
                <p className="text-xs text-muted-foreground">10/11 às 03:00</p>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              variant="link" 
              className="w-full" 
              onClick={() => navigate('/backups')}
            >
              Ver todos os backups
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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

