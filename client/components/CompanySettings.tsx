import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Save, RotateCcw, Image as ImageIcon } from "lucide-react";
import { useLogo } from "@/context/LogoContext";
import { useCompanySettings } from "@/context/CompanyContext";
import { toast } from "sonner";

export default function CompanySettings() {
  const { currentLogo, updateLogo } = useLogo();
  const { companySettings, updateCompanySettings } = useCompanySettings();
  
  const [settings, setSettings] = useState({
    companyName: companySettings.name || "Bil's Cinema e Vídeo",
    slogan: companySettings.slogan || "Locação de Equipamentos Profissionais",
    description: companySettings.description || "Especialistas em equipamentos cinematográficos e audiovisuais desde 2010",
    phone: companySettings.phone || "(31) 99990-8485",
    email: companySettings.email || "contato@bilscinema.com.br",
    address: companySettings.address || "Belo Horizonte, MG",
    whatsapp: companySettings.whatsapp || "5531999908485",
  });

  const [logoPreview, setLogoPreview] = useState<string>(currentLogo);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLogoPreview(currentLogo);
  }, [currentLogo]);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleLogoUpload = () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setLogoPreview(result);
            setHasChanges(true);
          };
          reader.onerror = () => {
            console.error("Erro ao ler arquivo");
            toast.error("Erro ao carregar imagem");
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      
      // Limpar o input após uso para evitar problemas de DOM
      setTimeout(() => {
        try {
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        } catch (e) {
          // Ignorar erro se elemento já foi removido
        }
      }, 1000);
    } catch (error) {
      console.error("Erro ao criar input de arquivo:", error);
      toast.error("Erro ao abrir seletor de arquivo");
    }
  };

  const handleUseAttachedImage = () => {
    const attachedImageUrl = "https://cdn.builder.io/api/v1/image/assets%2Fe522824d636c48bb93414fffb4098576%2Fd1ee32a52d384bb6897491cc274244f3?format=webp&width=800";
    setLogoPreview(attachedImageUrl);
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    // Update company settings
    updateCompanySettings({
      name: settings.companyName,
      slogan: settings.slogan,
      description: settings.description,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      whatsapp: settings.whatsapp,
    });

    // Update logo if changed
    if (logoPreview !== currentLogo) {
      updateLogo(logoPreview);
    }

    setHasChanges(false);
    alert("✅ Configurações salvas com sucesso!\n\nAs alterações foram aplicadas em todo o sistema.");
  };

  const handleResetLogo = () => {
    const defaultLogo = "https://cdn.builder.io/api/v1/image/assets%2Fe522824d636c48bb93414fffb4098576%2F294e1180e8d445eabdf19758e28f3c1e?format=webp&width=800";
    setLogoPreview(defaultLogo);
    setHasChanges(true);
  };

  const handleResetToDefaults = () => {
    setSettings({
      companyName: "Bil's Cinema e Vídeo",
      slogan: "Locação de Equipamentos Profissionais",
      description: "Especialistas em equipamentos cinematográficos e audiovisuais desde 2010",
      phone: "(31) 99990-8485",
      email: "contato@bilscinema.com.br",
      address: "Belo Horizonte, MG",
      whatsapp: "5531999908485",
    });
    handleResetLogo();
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">Configurações da Empresa</h3>
          <p className="text-gray-400 mt-1">
            Configure os dados da sua empresa que aparecerão no sistema
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-400"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo/Photo Settings */}
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Logo da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Preview */}
            <div className="bg-cinema-dark-lighter rounded-lg p-6 text-center">
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-3">Preview do Logo</p>
                <div className="inline-block bg-white rounded-lg p-4">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-16 w-auto max-w-[200px] object-contain"
                  />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <p className="text-white font-medium text-lg">{settings.companyName}</p>
                <p className="text-gray-400 text-sm">{settings.slogan}</p>
              </div>
            </div>

            {/* Logo Upload Options */}
            <div className="space-y-3">
              <Button
                onClick={handleLogoUpload}
                className="w-full bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Nova Imagem
              </Button>

              <Button
                onClick={handleUseAttachedImage}
                variant="outline"
                className="w-full text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Usar Imagem do iPhone (Preview)
              </Button>

              <Button
                onClick={handleResetLogo}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Voltar ao Logo Padrão
              </Button>
            </div>

            <div className="text-xs text-gray-500 bg-cinema-dark-lighter p-3 rounded">
              💡 <strong>Dica:</strong> Use imagens em formato PNG ou JPG. 
              Recomendamos dimensões de 200x80 pixels para melhor qualidade.
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardHeader>
            <CardTitle className="text-white">Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName" className="text-white">
                Nome da Empresa *
              </Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1"
                placeholder="Ex: Bil's Cinema e Vídeo"
              />
            </div>

            <div>
              <Label htmlFor="slogan" className="text-white">
                Slogan/Tagline
              </Label>
              <Input
                id="slogan"
                value={settings.slogan}
                onChange={(e) => handleInputChange("slogan", e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1"
                placeholder="Ex: Locação de Equipamentos Profissionais"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Descrição da Empresa
              </Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1 min-h-[80px]"
                placeholder="Breve descrição sobre a empresa..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-cinema-gray border-cinema-gray-light lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-white">
                  Telefone Principal
                </Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1"
                  placeholder="(31) 99990-8485"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-white">
                  WhatsApp (apenas números)
                </Label>
                <Input
                  id="whatsapp"
                  value={settings.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1"
                  placeholder="5531999908485"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white">
                  E-mail de Contato
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1"
                  placeholder="contato@bilscinema.com.br"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-white">
                  Endereço/Cidade
                </Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white mt-1"
                  placeholder="Belo Horizonte, MG"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Preview do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-cinema-dark-lighter rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-4">Como aparecerá no cabeçalho do site:</p>
            <div className="flex items-center space-x-4 bg-cinema-dark p-4 rounded border">
              <img
                src={logoPreview}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <p className="text-white font-semibold">{settings.companyName}</p>
                <p className="text-gray-400 text-sm">{settings.slogan}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm flex items-center">
            <Save className="w-4 h-4 mr-2" />
            <strong>Alterações não salvas:</strong> Clique em "Salvar Alterações" para aplicar as mudanças em todo o sistema.
          </p>
        </div>
      )}
    </div>
  );
}
