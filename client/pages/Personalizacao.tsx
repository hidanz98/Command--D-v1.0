import React, { useState } from "react";
import {
  Palette,
  Sun,
  Moon,
  Type,
  Square,
  Circle,
  Image,
  Upload,
  Eye,
  RotateCcw,
  Save,
  Check,
  Sparkles,
  Sliders,
  Paintbrush,
  Layout,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAI } from "@/context/AIContext";
import { cn } from "@/lib/utils";

// Cores predefinidas
const PRESET_COLORS = [
  { name: 'Âmbar', value: '#f59e0b', preview: 'bg-amber-500' },
  { name: 'Azul', value: '#3b82f6', preview: 'bg-blue-500' },
  { name: 'Verde', value: '#10b981', preview: 'bg-emerald-500' },
  { name: 'Vermelho', value: '#ef4444', preview: 'bg-red-500' },
  { name: 'Roxo', value: '#8b5cf6', preview: 'bg-violet-500' },
  { name: 'Rosa', value: '#ec4899', preview: 'bg-pink-500' },
  { name: 'Ciano', value: '#06b6d4', preview: 'bg-cyan-500' },
  { name: 'Laranja', value: '#f97316', preview: 'bg-orange-500' },
  { name: 'Lima', value: '#84cc16', preview: 'bg-lime-500' },
  { name: 'Índigo', value: '#6366f1', preview: 'bg-indigo-500' },
];

// Fontes disponíveis
const FONTS = [
  { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Nunito', value: 'Nunito, sans-serif' },
  { name: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
];

// Temas predefinidos
const PRESET_THEMES = [
  {
    name: 'Cinema Clássico',
    description: 'Dourado elegante',
    primaryColor: '#f59e0b',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    darkMode: true,
  },
  {
    name: 'Tech Moderno',
    description: 'Azul corporativo',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    darkMode: true,
  },
  {
    name: 'Natureza',
    description: 'Verde sustentável',
    primaryColor: '#10b981',
    secondaryColor: '#84cc16',
    accentColor: '#06b6d4',
    darkMode: true,
  },
  {
    name: 'Energia',
    description: 'Laranja vibrante',
    primaryColor: '#f97316',
    secondaryColor: '#ef4444',
    accentColor: '#eab308',
    darkMode: true,
  },
  {
    name: 'Criativo',
    description: 'Roxo artístico',
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    accentColor: '#06b6d4',
    darkMode: true,
  },
  {
    name: 'Minimalista Light',
    description: 'Claro e limpo',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981',
    darkMode: false,
  },
];

export default function Personalizacao() {
  const { theme, updateTheme, resetTheme } = useAI();
  const [saved, setSaved] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyPresetTheme = (preset: typeof PRESET_THEMES[0]) => {
    updateTheme({
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      darkMode: preset.darkMode,
    });
  };

  return (
    <div 
      className="min-h-screen text-slate-100 transition-colors duration-300"
      style={{ 
        background: theme.darkMode 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
        color: theme.darkMode ? '#f1f5f9' : '#1e293b'
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ 
        backgroundColor: theme.darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(248, 250, 252, 0.9)',
        borderColor: theme.darkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.5)'
      }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-2 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
              >
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Personalização</h1>
                <p className="text-sm opacity-70">Customize a aparência do seu sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={resetTheme}
                style={{ borderColor: theme.darkMode ? '#475569' : '#cbd5e1' }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button 
                onClick={handleSave}
                style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Temas Predefinidos */}
        <Card style={{ 
          backgroundColor: theme.darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: theme.darkMode ? '#334155' : '#e2e8f0'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: theme.primaryColor }} />
              Temas Predefinidos
            </CardTitle>
            <CardDescription>Escolha um tema pronto ou personalize</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {PRESET_THEMES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPresetTheme(preset)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all hover:scale-105",
                    theme.primaryColor === preset.primaryColor 
                      ? "border-white shadow-lg" 
                      : "border-transparent"
                  )}
                  style={{ 
                    background: `linear-gradient(135deg, ${preset.primaryColor}20, ${preset.secondaryColor}20)`,
                    borderColor: theme.primaryColor === preset.primaryColor ? preset.primaryColor : 'transparent'
                  }}
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondaryColor }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                  </div>
                  <p className="text-sm font-medium">{preset.name}</p>
                  <p className="text-xs opacity-60">{preset.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cores */}
          <Card style={{ 
            backgroundColor: theme.darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: theme.darkMode ? '#334155' : '#e2e8f0'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5" style={{ color: theme.primaryColor }} />
                Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cor Principal */}
              <div>
                <Label className="mb-2 block">Cor Principal</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateTheme({ primaryColor: color.value })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform hover:scale-110",
                        theme.primaryColor === color.value && "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="flex-1"
                    style={{ 
                      backgroundColor: theme.darkMode ? '#1e293b' : '#f1f5f9',
                      borderColor: theme.darkMode ? '#475569' : '#cbd5e1'
                    }}
                  />
                </div>
              </div>

              {/* Cor Secundária */}
              <div>
                <Label className="mb-2 block">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="flex-1"
                    style={{ 
                      backgroundColor: theme.darkMode ? '#1e293b' : '#f1f5f9',
                      borderColor: theme.darkMode ? '#475569' : '#cbd5e1'
                    }}
                  />
                </div>
              </div>

              {/* Cor de Destaque */}
              <div>
                <Label className="mb-2 block">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="flex-1"
                    style={{ 
                      backgroundColor: theme.darkMode ? '#1e293b' : '#f1f5f9',
                      borderColor: theme.darkMode ? '#475569' : '#cbd5e1'
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tipografia e Layout */}
          <Card style={{ 
            backgroundColor: theme.darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: theme.darkMode ? '#334155' : '#e2e8f0'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" style={{ color: theme.primaryColor }} />
                Tipografia e Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modo Escuro/Claro */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <Label>Modo {theme.darkMode ? 'Escuro' : 'Claro'}</Label>
                </div>
                <Switch
                  checked={theme.darkMode}
                  onCheckedChange={(checked) => updateTheme({ darkMode: checked })}
                />
              </div>

              {/* Fonte */}
              <div>
                <Label className="mb-2 block">Fonte</Label>
                <Select 
                  value={theme.fontFamily} 
                  onValueChange={(value) => updateTheme({ fontFamily: value })}
                >
                  <SelectTrigger style={{ 
                    backgroundColor: theme.darkMode ? '#1e293b' : '#f1f5f9',
                    borderColor: theme.darkMode ? '#475569' : '#cbd5e1'
                  }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map(font => (
                      <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bordas */}
              <div>
                <Label className="mb-2 block">Estilo de Bordas</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTheme({ borderRadius: '0.25rem' })}
                    className={cn(
                      "flex-1 p-3 border rounded transition-all",
                      theme.borderRadius === '0.25rem' && "ring-2"
                    )}
                    style={{ 
                      borderRadius: '0.25rem',
                      borderColor: theme.darkMode ? '#475569' : '#cbd5e1',
                      ringColor: theme.primaryColor
                    }}
                  >
                    <Square className="h-4 w-4 mx-auto" />
                    <p className="text-xs mt-1">Quadrada</p>
                  </button>
                  <button
                    onClick={() => updateTheme({ borderRadius: '0.75rem' })}
                    className={cn(
                      "flex-1 p-3 border transition-all",
                      theme.borderRadius === '0.75rem' && "ring-2"
                    )}
                    style={{ 
                      borderRadius: '0.75rem',
                      borderColor: theme.darkMode ? '#475569' : '#cbd5e1',
                      ringColor: theme.primaryColor
                    }}
                  >
                    <div className="w-4 h-4 mx-auto rounded-lg border-2" style={{ borderColor: 'currentColor' }} />
                    <p className="text-xs mt-1">Arredondada</p>
                  </button>
                  <button
                    onClick={() => updateTheme({ borderRadius: '9999px' })}
                    className={cn(
                      "flex-1 p-3 border transition-all",
                      theme.borderRadius === '9999px' && "ring-2"
                    )}
                    style={{ 
                      borderRadius: '0.75rem',
                      borderColor: theme.darkMode ? '#475569' : '#cbd5e1',
                      ringColor: theme.primaryColor
                    }}
                  >
                    <Circle className="h-4 w-4 mx-auto" />
                    <p className="text-xs mt-1">Pílula</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card style={{ 
            backgroundColor: theme.darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: theme.darkMode ? '#334155' : '#e2e8f0'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" style={{ color: theme.primaryColor }} />
                Preview
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={cn(
                  "mx-auto rounded-lg overflow-hidden border transition-all",
                  previewDevice === 'desktop' && "w-full",
                  previewDevice === 'tablet' && "w-64",
                  previewDevice === 'mobile' && "w-40"
                )}
                style={{ 
                  backgroundColor: theme.darkMode ? '#0f172a' : '#f8fafc',
                  borderColor: theme.darkMode ? '#334155' : '#e2e8f0'
                }}
              >
                {/* Mini Header */}
                <div 
                  className="p-2 border-b flex items-center gap-2"
                  style={{ 
                    borderColor: theme.darkMode ? '#334155' : '#e2e8f0',
                    background: `linear-gradient(135deg, ${theme.primaryColor}20, transparent)`
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                  >
                    <span className="text-[8px] text-white font-bold">🎬</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded w-16" style={{ backgroundColor: theme.primaryColor + '40' }} />
                  </div>
                </div>

                {/* Mini Content */}
                <div className="p-3 space-y-2">
                  {/* Cards */}
                  <div className="flex gap-2">
                    <div 
                      className="flex-1 p-2 rounded"
                      style={{ 
                        backgroundColor: theme.primaryColor + '20',
                        borderRadius: theme.borderRadius
                      }}
                    >
                      <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: theme.primaryColor }} />
                      <div className="h-1.5 rounded w-full" style={{ backgroundColor: theme.darkMode ? '#475569' : '#cbd5e1' }} />
                    </div>
                    <div 
                      className="flex-1 p-2 rounded"
                      style={{ 
                        backgroundColor: theme.secondaryColor + '20',
                        borderRadius: theme.borderRadius
                      }}
                    >
                      <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: theme.secondaryColor }} />
                      <div className="h-1.5 rounded w-full" style={{ backgroundColor: theme.darkMode ? '#475569' : '#cbd5e1' }} />
                    </div>
                  </div>

                  {/* Button */}
                  <button 
                    className="w-full py-1.5 text-white text-xs font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                      borderRadius: theme.borderRadius
                    }}
                  >
                    Botão Exemplo
                  </button>

                  {/* Text */}
                  <div className="space-y-1">
                    <div className="h-1.5 rounded w-full" style={{ backgroundColor: theme.darkMode ? '#334155' : '#e2e8f0' }} />
                    <div className="h-1.5 rounded w-3/4" style={{ backgroundColor: theme.darkMode ? '#334155' : '#e2e8f0' }} />
                    <div className="h-1.5 rounded w-1/2" style={{ backgroundColor: theme.darkMode ? '#334155' : '#e2e8f0' }} />
                  </div>
                </div>
              </div>

              <p 
                className="text-xs text-center mt-4 opacity-60"
                style={{ fontFamily: theme.fontFamily }}
              >
                Fonte: {FONTS.find(f => f.value === theme.fontFamily)?.name || 'Inter'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logo e Identidade */}
        <Card style={{ 
          backgroundColor: theme.darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: theme.darkMode ? '#334155' : '#e2e8f0'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" style={{ color: theme.primaryColor }} />
              Logo e Identidade Visual
            </CardTitle>
            <CardDescription>Adicione o logo e ícones da sua locadora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Principal */}
              <div className="text-center">
                <Label className="mb-2 block">Logo Principal</Label>
                <div 
                  className="w-32 h-32 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-solid transition-all"
                  style={{ borderColor: theme.primaryColor }}
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto opacity-50" />
                    <p className="text-xs mt-2 opacity-50">Clique para upload</p>
                  </div>
                </div>
                <p className="text-xs opacity-50 mt-2">PNG ou SVG, max 2MB</p>
              </div>

              {/* Favicon */}
              <div className="text-center">
                <Label className="mb-2 block">Favicon</Label>
                <div 
                  className="w-16 h-16 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-solid transition-all"
                  style={{ borderColor: theme.primaryColor }}
                >
                  <Upload className="h-6 w-6 opacity-50" />
                </div>
                <p className="text-xs opacity-50 mt-2">ICO ou PNG 32x32</p>
              </div>

              {/* Nome da Empresa */}
              <div>
                <Label className="mb-2 block">Nome da Locadora</Label>
                <Input 
                  defaultValue="Bil's Cinema e Vídeo"
                  className="mb-2"
                  style={{ 
                    backgroundColor: theme.darkMode ? '#1e293b' : '#f1f5f9',
                    borderColor: theme.darkMode ? '#475569' : '#cbd5e1'
                  }}
                />
                <Input 
                  placeholder="Slogan (opcional)"
                  defaultValue="Locação de Equipamentos Audiovisuais"
                  style={{ 
                    backgroundColor: theme.darkMode ? '#1e293b' : '#f1f5f9',
                    borderColor: theme.darkMode ? '#475569' : '#cbd5e1'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

