import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Save, RotateCcw, Zap, Check, Eye } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { useMasterAdmin } from "@/context/MasterAdminContext";

interface ThemePreset {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  themeId?: string; // Para temas específicos como cabeca-efeito
  isSpecial?: boolean; // Marca temas com CSS customizado
}

const themePresets: ThemePreset[] = [
  {
    name: "Cinema Clássico",
    primaryColor: "#F5D533",
    secondaryColor: "#1a1a1a",
    description: "Dourado e preto",
    themeId: "bils-cinema",
  },
  {
    name: "Cabeça de Efeito",
    primaryColor: "#3698F9",
    secondaryColor: "#1F2937",
    description: "Azul tech e cinza",
    themeId: "cabeca-efeito",
    isSpecial: true,
  },
  {
    name: "Verde Moderno",
    primaryColor: "#10B981",
    secondaryColor: "#1F2937",
    description: "Verde e cinza",
    themeId: "verde-moderno",
  },
  {
    name: "Azul Corporativo",
    primaryColor: "#3B82F6",
    secondaryColor: "#1F2937",
    description: "Azul e cinza",
    themeId: "azul-corporativo",
  },
  {
    name: "Roxo Criativo",
    primaryColor: "#8B5CF6",
    secondaryColor: "#1F2937",
    description: "Roxo e cinza",
    themeId: "roxo-criativo",
  },
  {
    name: "Laranja Energia",
    primaryColor: "#F97316",
    secondaryColor: "#1F2937",
    description: "Laranja e cinza",
    themeId: "laranja-energia",
  },
  {
    name: "Rosa Moderno",
    primaryColor: "#EC4899",
    secondaryColor: "#1F2937",
    description: "Rosa e cinza",
    themeId: "rosa-moderno",
  },
  {
    name: "Ciano Tech",
    primaryColor: "#06B6D4",
    secondaryColor: "#1F2937",
    description: "Ciano e cinza",
    themeId: "ciano-tech",
  },
  {
    name: "Amarelo Vibrante",
    primaryColor: "#EAB308",
    secondaryColor: "#1F2937",
    description: "Amarelo e cinza",
    themeId: "amarelo-vibrante",
  },
];

export default function ColorSettings() {
  const { currentTenant } = useTenant();
  const { updateCompany } = useMasterAdmin();

  const [colors, setColors] = useState({
    primaryColor: currentTenant?.primaryColor || "#F5D533",
    secondaryColor: currentTenant?.secondaryColor || "#1a1a1a",
  });

  const [originalColors, setOriginalColors] = useState({
    primaryColor: currentTenant?.primaryColor || "#F5D533",
    secondaryColor: currentTenant?.secondaryColor || "#1a1a1a",
  });

  const [currentTheme, setCurrentTheme] = useState<string>(
    currentTenant?.slug || "bils-cinema",
  );
  const [originalTheme, setOriginalTheme] = useState<string>(
    currentTenant?.slug || "bils-cinema",
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      const newColors = {
        primaryColor: currentTenant.primaryColor,
        secondaryColor: currentTenant.secondaryColor,
      };
      setColors(newColors);
      setOriginalColors(newColors);
      setCurrentTheme(currentTenant.slug);
      setOriginalTheme(currentTenant.slug);
    }
  }, [currentTenant]);

  const applyPreviewColors = (
    previewColors: typeof colors,
    themeId?: string,
  ) => {
    try {
      const root = document.documentElement;
      if (!root) return;

      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
            ]
          : [245, 213, 51];
      };

      const primaryRgb = hexToRgb(previewColors.primaryColor);
      const secondaryRgb = hexToRgb(previewColors.secondaryColor);

      // Aplicar as cores com verificação de segurança
      if (root.style) {
        root.style.setProperty(
          "--cinema-gold",
          `${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}`,
        );
        root.style.setProperty(
          "--cinema-dark",
          `${secondaryRgb[0]}, ${secondaryRgb[1]}, ${secondaryRgb[2]}`,
        );
      }

      // Aplicar o tema completo se especificado
      if (themeId && root.setAttribute && document.body?.setAttribute) {
        root.setAttribute("data-tenant", themeId);
        document.body.setAttribute("data-tenant", themeId);

        // Force reflow para aplicar os estilos CSS (com verificação)
        if (root.offsetHeight !== undefined) {
          root.offsetHeight;
        }
      }
    } catch (error) {
      console.error("Erro ao aplicar cores:", error);
      // Não quebrar a aplicação se houver erro de DOM
    }
  };

  const handleColorChange = (
    colorType: "primaryColor" | "secondaryColor",
    value: string,
  ) => {
    const newColors = { ...colors, [colorType]: value };
    setColors(newColors);
    setHasChanges(true);

    // Apply preview automatically - mantém o tema atual
    applyPreviewColors(newColors, currentTheme);
  };

  const handlePresetSelect = (preset: ThemePreset) => {
    const newColors = {
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
    };
    setColors(newColors);
    setCurrentTheme(preset.themeId || "bils-cinema");
    setHasChanges(true);

    // Apply complete theme preview
    applyPreviewColors(newColors, preset.themeId || "bils-cinema");
  };

  const handleSaveColors = () => {
    if (!currentTenant) return;

    // Update tenant in context with new colors and theme
    updateCompany(currentTenant.id, {
      primaryColor: colors.primaryColor,
      secondaryColor: colors.secondaryColor,
      slug: currentTheme, // Update the theme/slug too
    });

    // Update original values for comparison
    setOriginalColors(colors);
    setOriginalTheme(currentTheme);
    setHasChanges(false);

    alert(
      "✅ Tema salvo com sucesso!\n\nAs alterações foram aplicadas em todo o sistema.",
    );
  };

  const handleResetColors = () => {
    setColors(originalColors);
    setCurrentTheme(originalTheme);
    setHasChanges(false);

    // Reset to original theme and colors
    applyPreviewColors(originalColors, originalTheme);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">Trocar Tema</h3>
          <p className="text-gray-400 mt-1">
            Escolha um tema completo ou personalize as cores manualmente
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetColors}
              className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-400"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSaveColors}
              className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Tema
            </Button>
          </div>
        )}
      </div>

      {/* Quick Theme Presets */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Escolha Rápida - Temas Prontos
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Clique em um tema para aplicar instantaneamente
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {themePresets.map((preset, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                  currentTheme === preset.themeId
                    ? "border-cinema-yellow bg-cinema-yellow/10"
                    : "border-cinema-gray-light hover:border-cinema-yellow/50"
                }`}
                onClick={() => handlePresetSelect(preset)}
              >
                {/* Color circles */}
                <div className="flex justify-center space-x-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: preset.secondaryColor }}
                  />
                </div>

                {/* Selected indicator */}
                {currentTheme === preset.themeId && (
                  <div className="flex justify-center mb-2">
                    <Check className="w-5 h-5 text-cinema-yellow" />
                  </div>
                )}

                {/* Special badge for custom themes */}
                {preset.isSpecial && (
                  <div className="flex justify-center mb-2">
                    <span className="bg-cinema-yellow/20 text-cinema-yellow text-xs px-2 py-1 rounded-full">
                      Tema Especial
                    </span>
                  </div>
                )}

                {/* Name */}
                <h4 className="text-white font-medium text-center text-sm leading-tight">
                  {preset.name}
                </h4>
                <p className="text-gray-400 text-xs text-center mt-1">
                  {preset.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Color Customization */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Personalização Manual
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Ajuste as cores exatamente como quiser
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Color */}
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-white text-lg font-semibold">
                  Cor Principal
                </Label>
                <p className="text-gray-400 text-sm">Botões e destaques</p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg"
                  style={{ backgroundColor: colors.primaryColor }}
                />

                <Input
                  type="color"
                  value={colors.primaryColor}
                  onChange={(e) =>
                    handleColorChange("primaryColor", e.target.value)
                  }
                  className="w-full h-14 p-2 bg-cinema-dark-lighter border-cinema-gray-light cursor-pointer rounded-xl"
                />

                <Input
                  type="text"
                  value={colors.primaryColor}
                  onChange={(e) =>
                    handleColorChange("primaryColor", e.target.value)
                  }
                  className="w-full bg-cinema-dark-lighter border-cinema-gray-light text-white text-center font-mono"
                  placeholder="#F5D533"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-white text-lg font-semibold">
                  Cor Secundária
                </Label>
                <p className="text-gray-400 text-sm">Fundos e containers</p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg"
                  style={{ backgroundColor: colors.secondaryColor }}
                />

                <Input
                  type="color"
                  value={colors.secondaryColor}
                  onChange={(e) =>
                    handleColorChange("secondaryColor", e.target.value)
                  }
                  className="w-full h-14 p-2 bg-cinema-dark-lighter border-cinema-gray-light cursor-pointer rounded-xl"
                />

                <Input
                  type="text"
                  value={colors.secondaryColor}
                  onChange={(e) =>
                    handleColorChange("secondaryColor", e.target.value)
                  }
                  className="w-full bg-cinema-dark-lighter border-cinema-gray-light text-white text-center font-mono"
                  placeholder="#1a1a1a"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Info */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-cinema-yellow" />
            <div>
              <h4 className="text-white font-medium">Preview em Tempo Real</h4>
              <p className="text-gray-400 text-sm">
                O tema é aplicado automaticamente enquanto você escolhe. Clique
                em "Salvar Tema" para confirmar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Preview */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white">Preview das Cores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="h-12"
              style={{
                backgroundColor: colors.primaryColor,
                color: colors.secondaryColor,
                border: "none",
              }}
            >
              Botão Principal
            </Button>
            <div
              className="h-12 rounded-md flex items-center justify-center font-medium"
              style={{
                backgroundColor: colors.secondaryColor,
                borderColor: colors.primaryColor,
                color: colors.primaryColor,
                border: `2px solid ${colors.primaryColor}`,
              }}
            >
              Container com Borda
            </div>
            <div
              className="h-12 rounded-md flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: colors.secondaryColor }}
            >
              Fundo Secundário
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm flex items-center">
            <Save className="w-4 h-4 mr-2" />
            <strong>Alterações não salvas:</strong> Clique em "Salvar Tema" para
            aplicar definitivamente.
          </p>
        </div>
      )}
    </div>
  );
}
