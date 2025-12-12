import { useNavigate } from "react-router-dom";
import { Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScannerSettingsCard } from "@/components/ScannerSettingsCard";
import { GeneralSettingsCard } from "@/components/GeneralSettingsCard";
import { EmailSettingsCard } from "@/components/EmailSettingsCard";
import { WhatsAppSettingsCard } from "@/components/WhatsAppSettingsCard";
import { SecuritySettingsCard } from "@/components/SecuritySettingsCard";
import { AppearanceSettingsCard } from "@/components/AppearanceSettingsCard";
import { BackupSettingsCard } from "@/components/BackupSettingsCard";

export default function Configuracoes() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/painel-admin')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure as funcionalidades do sistema
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Configurações Gerais */}
        <GeneralSettingsCard />
        
        {/* Configurações de Scanner/QR Code */}
        <ScannerSettingsCard />
        
        {/* Configurações de Email */}
        <EmailSettingsCard />
        
        {/* Configurações de WhatsApp */}
        <WhatsAppSettingsCard />
        
        {/* Configurações de Segurança */}
        <SecuritySettingsCard />
        
        {/* Configurações de Aparência */}
        <AppearanceSettingsCard />
        
        {/* Configurações de Backup */}
        <BackupSettingsCard />
      </div>
    </div>
  );
}

