import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  Package,
  Eye,
  Star,
  Heart,
  ExternalLink,
  Gift,
  Crown,
  Sparkles,
  Layout,
  Zap,
  Brush,
} from "lucide-react";
import { useCompanySettings } from "@/context/CompanyContext";
import { useLogo } from "@/context/LogoContext";
import { toast } from "@/hooks/use-toast";
import { useTenant } from "@/context/TenantContext";
import { useMasterAdmin } from "@/context/MasterAdminContext";

interface Template {
  id: string;
  slug?: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  downloads: number;
  rating: number;
  totalRatings: number;
  featured?: boolean;
  new?: boolean;
  trending?: boolean;
  fileSize?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  primaryColor?: string;
  secondaryColor?: string;
  background?: string; // CSS background or image url
  customCss?: string; // custom CSS to inject when applied
}

const TemplateManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [testingTemplate, setTestingTemplate] = useState<Template | null>(null);

  const { companySettings, updateCompanySettings } = useCompanySettings();
  const { currentLogo, updateLogo } = useLogo();

  const templates: Template[] = useMemo(
    () => [
      {
        id: "1",
        slug: "cinemalux",
        name: "CinemaLux Pro",
        description:
          "Template premium para locadoras de equipamentos de cinema profissional",
        category: "E-commerce",
        previewImage: "/placeholder.svg",
        downloads: 2543,
        rating: 4.8,
        totalRatings: 127,
        featured: true,
        trending: true,
        fileSize: "45.2 MB",
        difficulty: "intermediate",
        primaryColor: "#F5D533",
        secondaryColor: "#1a1a1a",
        background:
          "linear-gradient(135deg, rgba(245,213,51,0.1), rgba(26,26,26,0.95))",
        customCss: `
        html[data-tenant='cinemalux'] body {
          background: linear-gradient(135deg, rgba(245,213,51,0.08), rgba(26,26,26,0.95)) !important;
          font-family: 'Georgia', 'Times New Roman', serif !important;
        }
        html[data-tenant='cinemalux'] header {
          background: rgba(26, 26, 26, 0.9) !important;
          border-bottom: 2px solid #F5D533 !important;
        }
        html[data-tenant='cinemalux'] section[class*='min-h-screen'] {
          background: radial-gradient(ellipse at center, rgba(245, 213, 51, 0.15) 0%, rgba(26, 26, 26, 0.95) 70%) !important;
        }
        html[data-tenant='cinemalux'] h1,
        html[data-tenant='cinemalux'] h2,
        html[data-tenant='cinemalux'] h3 {
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-weight: 700 !important;
        }
        html[data-tenant='cinemalux'] h1 .gradient-text {
          background: linear-gradient(135deg, #F5D533 0%, #FFD700 50%, #FFA500 100%) !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          text-shadow: 0 4px 8px rgba(245, 213, 51, 0.3) !important;
        }
        html[data-tenant='cinemalux'] .bg-cinema-yellow {
          background: linear-gradient(135deg, #F5D533 0%, #FFD700 100%) !important;
          box-shadow: 0 4px 15px rgba(245, 213, 51, 0.4) !important;
        }
        html[data-tenant='cinemalux'] .stats-card {
          background: rgba(245, 213, 51, 0.08) !important;
          border: 1px solid rgba(245, 213, 51, 0.3) !important;
          backdrop-filter: blur(10px) !important;
        }
        html[data-tenant='cinemalux'] input,
        html[data-tenant='cinemalux'] .bg-cinema-dark,
        html[data-tenant='cinemalux'] .bg-cinema-gray {
          background: rgba(26, 26, 26, 0.8) !important;
          border-color: #F5D533 !important;
        }
      `,
      },
      {
        id: "2",
        slug: "mov-theme",
        name: "MOV Professional",
        description: "Template profissional estilo MOV com design moderno",
        category: "E-commerce",
        previewImage:
          "https://cdn.builder.io/api/v1/image/assets%2Fe522824d636c48bb93414fffb4098576%2F84254cc4d58345d48c80b6aad1422269?format=webp&width=800",
        downloads: 1876,
        rating: 4.3,
        totalRatings: 89,
        new: true,
        fileSize: "12.8 MB",
        difficulty: "beginner",
        primaryColor: "#7C3AED",
        secondaryColor: "#1F1B24",
        background:
          "linear-gradient(135deg, #7C3AED 0%, #3B1F75 50%, #1F1B24 100%)",
        customCss: `
        html[data-tenant='mov-theme'] body {
          background: linear-gradient(135deg, #7C3AED 0%, #3B1F75 50%, #1F1B24 100%) !important;
          font-family: 'Inter', 'Arial', sans-serif !important;
        }
        html[data-tenant='mov-theme'] header {
          background: rgba(31, 27, 36, 0.95) !important;
          border-bottom: 2px solid #7C3AED !important;
        }
        html[data-tenant='mov-theme'] section[class*='min-h-screen'] {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(31, 27, 36, 0.95) 100%) !important;
        }
        html[data-tenant='mov-theme'] h1 .gradient-text {
          background: linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%) !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          font-weight: 900 !important;
          letter-spacing: -0.05em !important;
        }
        html[data-tenant='mov-theme'] .bg-cinema-yellow {
          background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%) !important;
        }
        html[data-tenant='mov-theme'] .text-cinema-yellow {
          color: #7C3AED !important;
        }
        html[data-tenant='mov-theme'] .stats-card {
          background: rgba(124, 58, 237, 0.1) !important;
          border: 1px solid rgba(124, 58, 237, 0.3) !important;
          backdrop-filter: blur(10px) !important;
        }
        html[data-tenant='mov-theme'] input,
        html[data-tenant='mov-theme'] .bg-cinema-dark,
        html[data-tenant='mov-theme'] .bg-cinema-gray {
          background: rgba(31, 27, 36, 0.8) !important;
          border-color: #7C3AED !important;
        }
        html[data-tenant='mov-theme'] * {
          transition: all 0.3s ease !important;
        }
        html[data-tenant='mov-theme'] .bg-cinema-gray\/20,
        html[data-tenant='mov-theme'] .bg-cinema-gray\/80 {
          background: rgba(124, 58, 237, 0.1) !important;
          border: 1px solid rgba(124, 58, 237, 0.2) !important;
        }
      `,
      },
      {
        id: "3",
        slug: "monstercam",
        name: "MonsterCam Nature",
        description: "Template natural com tons verdes e design orgânico",
        category: "E-commerce",
        previewImage:
          "https://cdn.builder.io/api/v1/image/assets%2Fe522824d636c48bb93414fffb4098576%2F12254b7477884c2daddf125a7590371c?format=webp&width=800",
        downloads: 3721,
        rating: 4.9,
        totalRatings: 203,
        featured: true,
        trending: true,
        fileSize: "67.4 MB",
        difficulty: "advanced",
        primaryColor: "#10B981",
        secondaryColor: "#064E3B",
        background:
          "linear-gradient(135deg, #10B981 0%, #059669 50%, #064E3B 100%)",
        customCss: `
        html[data-tenant='monstercam'] body {
          background: linear-gradient(135deg, #10B981 0%, #059669 50%, #064E3B 100%) !important;
          font-family: 'Roboto', 'Arial', sans-serif !important;
        }
        html[data-tenant='monstercam'] header {
          background: rgba(6, 78, 59, 0.95) !important;
          border-bottom: 2px solid #10B981 !important;
        }
        html[data-tenant='monstercam'] section[class*='min-h-screen'] {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.95) 100%) !important;
          position: relative !important;
        }
        html[data-tenant='monstercam'] section[class*='min-h-screen']::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%2310B981" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2310B981" opacity="0.2"/><circle cx="60" cy="80" r="1" fill="%2310B981" opacity="0.4"/></svg>') !important;
          z-index: -1 !important;
        }
        html[data-tenant='monstercam'] h1 .gradient-text {
          background: linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%) !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
        }
        html[data-tenant='monstercam'] .bg-cinema-yellow {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
        }
        html[data-tenant='monstercam'] .text-cinema-yellow {
          color: #10B981 !important;
        }
        html[data-tenant='monstercam'] .stats-card {
          background: rgba(16, 185, 129, 0.1) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          backdrop-filter: blur(10px) !important;
        }
        html[data-tenant='monstercam'] input,
        html[data-tenant='monstercam'] .bg-cinema-dark,
        html[data-tenant='monstercam'] .bg-cinema-gray {
          background: rgba(6, 78, 59, 0.8) !important;
          border-color: #10B981 !important;
        }
        html[data-tenant='monstercam'] .text-6xl {
          text-shadow: 0 4px 8px rgba(16, 185, 129, 0.3) !important;
        }
        html[data-tenant='monstercam'] * {
          transition: all 0.3s ease !important;
        }
        html[data-tenant='monstercam'] .bg-cinema-gray\/20,
        html[data-tenant='monstercam'] .bg-cinema-gray\/80 {
          background: rgba(16, 185, 129, 0.1) !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
        }
      `,
      },
      {
        id: "4",
        slug: "minimal-tech",
        name: "Minimal Tech",
        description: "Template clean e minimalista com foco em tecnologia",
        category: "Minimal",
        previewImage: "/placeholder.svg",
        downloads: 1234,
        rating: 4.6,
        totalRatings: 89,
        new: true,
        fileSize: "8.5 MB",
        difficulty: "beginner",
        primaryColor: "#6366F1",
        secondaryColor: "#F8FAFC",
        background:
          "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)",
        customCss: `
        html[data-tenant='minimal-tech'] body {
          background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%) !important;
          font-family: 'Inter', 'Helvetica Neue', sans-serif !important;
          color: #1E293B !important;
        }
        html[data-tenant='minimal-tech'] header {
          background: rgba(248, 250, 252, 0.95) !important;
          border-bottom: 1px solid #E2E8F0 !important;
          backdrop-filter: blur(20px) !important;
        }
        html[data-tenant='minimal-tech'] section[class*='min-h-screen'] {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(248, 250, 252, 0.95) 100%) !important;
        }
        html[data-tenant='minimal-tech'] h1,
        html[data-tenant='minimal-tech'] h2,
        html[data-tenant='minimal-tech'] h3 {
          color: #1E293B !important;
          font-weight: 600 !important;
        }
        html[data-tenant='minimal-tech'] h1 .gradient-text {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%) !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }
        html[data-tenant='minimal-tech'] .bg-cinema-yellow {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%) !important;
        }
        html[data-tenant='minimal-tech'] .text-cinema-yellow {
          color: #6366F1 !important;
        }
        html[data-tenant='minimal-tech'] .stats-card {
          background: rgba(255, 255, 255, 0.8) !important;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        html[data-tenant='minimal-tech'] input,
        html[data-tenant='minimal-tech'] .bg-cinema-dark,
        html[data-tenant='minimal-tech'] .bg-cinema-gray {
          background: rgba(255, 255, 255, 0.9) !important;
          border-color: #E2E8F0 !important;
          color: #1E293B !important;
        }
        html[data-tenant='minimal-tech'] p,
        html[data-tenant='minimal-tech'] span,
        html[data-tenant='minimal-tech'] div {
          color: #64748B !important;
        }
        html[data-tenant='minimal-tech'] .text-white {
          color: #1E293B !important;
        }
        html[data-tenant='minimal-tech'] .text-gray-400 {
          color: #94A3B8 !important;
        }
      `,
      },
    ],
    [],
  );

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400 bg-green-400/20";
      case "intermediate":
        return "text-yellow-400 bg-yellow-400/20";
      case "advanced":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
      />
    ));
  };

  const downloadTemplate = (t: Template) => {
    const data = {
      template: t,
      exportedAt: new Date().toISOString(),
      company: companySettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.name.replace(/\s+/g, "_").toLowerCase()}.template.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Download iniciado",
      description: `${t.name} será baixado em breve.`,
    });
  };

  const { currentTenant } = useTenant();
  const { updateCompany } = useMasterAdmin();

  const setCssTheme = (primary?: string, secondary?: string) => {
    const root = document.documentElement;
    const hexToRgb = (hex?: string | null) => {
      if (!hex || typeof hex !== "string") return [245, 213, 51];
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [245, 213, 51];
    };
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);
    root.style.setProperty(
      "--cinema-gold",
      `${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}`,
    );
    root.style.setProperty(
      "--cinema-dark",
      `${secondaryRgb[0]}, ${secondaryRgb[1]}, ${secondaryRgb[2]}`,
    );
  };

  const injectCustomCss = (css?: string) => {
    const id = "applied-template-css";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.innerHTML = css || "";
  };

  const applyTemplate = (t: Template) => {
    // Persist selections only; public site applies on load via TenantRouter
    if (t.primaryColor)
      localStorage.setItem("tenant_primary_color", t.primaryColor);
    if (t.secondaryColor)
      localStorage.setItem("tenant_secondary_color", t.secondaryColor);
    if (t.background) localStorage.setItem("tenant_background", t.background);
    if (t.previewImage) updateLogo(t.previewImage);

    if (t.customCss) localStorage.setItem("tenant_custom_css", t.customCss);
    if (t.slug) localStorage.setItem("tenant_current_slug", t.slug);

    // Keep a style tag synced (harmless without data-tenant on system pages)
    injectCustomCss(t.customCss);

    if (currentTenant && updateCompany) {
      updateCompany(currentTenant.id, {
        primaryColor: t.primaryColor || currentTenant.primaryColor,
        secondaryColor: t.secondaryColor || currentTenant.secondaryColor,
      });
    }

    toast({
      title: "✅ Template aplicado com sucesso!",
      description: `${t.name} salvo. A aparência será aplicada apenas na página inicial pública.`,
    });
  };

  const testTemplate = (t: Template) => {
    setTestingTemplate(t);
    toast({
      title: "🎨 Modo de teste",
      description: `${t.name} pronto para prévia. Abra a página inicial (Início) para ver a aparência.`,
    });
  };

  const clearTest = () => {
    setTestingTemplate(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Package className="w-6 h-6 mr-2 text-cinema-yellow" />
            Templates Gratuitos
          </h2>
          <p className="text-gray-400">
            Baixe, aplique e teste templates prontos para sua locadora.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
            <Gift className="w-4 h-4 mr-2" /> Contribuir Template
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-cinema-gray-light text-gray-400"
          >
            Categoria
          </Button>
          <Button
            variant="outline"
            className="border-cinema-gray-light text-gray-400"
          >
            Dificuldade
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="border-cinema-yellow text-cinema-yellow"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {filtered.length} templates encontrados
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((template) => (
          <Card
            key={template.id}
            className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors group"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={template.previewImage}
                alt={template.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {template.featured && (
                  <Badge className="bg-yellow-500 text-black text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                {template.new && (
                  <Badge className="bg-green-500 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Novo
                  </Badge>
                )}
                {template.trending && (
                  <Badge className="bg-red-500 text-white text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-medium text-sm line-clamp-1">
                  {template.name}
                </h3>
                <div className="flex items-center space-x-1">
                  {renderStars(template.rating)}
                  <span className="text-xs text-gray-400 ml-1">
                    ({template.totalRatings})
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Download className="w-3 h-3 mr-1" />
                    {template.downloads.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Badge
                  className={`text-xs ${getDifficultyColor(template.difficulty)}`}
                >
                  {template.difficulty === "beginner"
                    ? "Iniciante"
                    : template.difficulty === "intermediate"
                      ? "Intermediário"
                      : "Avançado"}
                </Badge>
                <span className="text-xs text-gray-400">
                  {template.fileSize}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => downloadTemplate(template)}
                >
                  <Download className="w-3 h-3 mr-2" />
                  Baixar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cinema-gray-light text-gray-400 hover:text-white"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="w-3 h-3 mr-2" />
                  Pré-visualizar
                </Button>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    testTemplate(template);
                  }}
                >
                  Testar
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => applyTemplate(template)}
                >
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Layout className="w-12 h-12 text-cinema-yellow mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">Template Clássico</h4>
            <p className="text-gray-400 text-sm mb-4">
              Design elegante e profissional para locadoras tradicionais
            </p>
            <Button
              size="sm"
              className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              onClick={() =>
                toast({
                  title: "Baixar",
                  description: "Iniciando download do Template Clássico",
                })
              }
            >
              <Download className="w-3 h-3 mr-2" />
              Baixar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">Template Moderno</h4>
            <p className="text-gray-400 text-sm mb-4">
              Interface moderna com animações e gradientes
            </p>
            <Button
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() =>
                toast({
                  title: "Baixar",
                  description: "Iniciando download do Template Moderno",
                })
              }
            >
              <Download className="w-3 h-3 mr-2" />
              Baixar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Brush className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">Template Criativo</h4>
            <p className="text-gray-400 text-sm mb-4">
              Design arrojado para empresas inovadoras
            </p>
            <Button
              size="sm"
              className="bg-purple-500 text-white hover:bg-purple-600"
              onClick={() =>
                toast({
                  title: "Baixar",
                  description: "Iniciando download do Template Criativo",
                })
              }
            >
              <Download className="w-3 h-3 mr-2" />
              Baixar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal / Panel */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-4xl w-full bg-cinema-gray border border-cinema-gray-light rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Pré-visualizando: {previewTemplate.name}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-cinema-gray-light text-gray-400"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-b from-black/20 to-transparent">
              <div className="flex gap-6">
                <div className="w-1/3">
                  <img
                    src={previewTemplate.previewImage}
                    alt={previewTemplate.name}
                    className="w-full h-48 object-cover rounded"
                  />
                  <h4 className="text-white font-semibold mt-3">
                    {previewTemplate.name}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {previewTemplate.description}
                  </p>
                </div>
                <div className="flex-1 bg-white/5 p-4 rounded">
                  <div
                    style={{
                      background: previewTemplate.primaryColor || "#111827",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <img src={currentLogo} alt="logo" style={{ height: 48 }} />
                  </div>
                  <div className="mt-4">
                    <h5 className="text-white font-semibold">
                      Exemplo de header / hero
                    </h5>
                    <div className="mt-2 text-gray-300">
                      Aqui você pode ver como o template poderia ficar com seu
                      logotipo e cores principais.
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => {
                          testTemplate(previewTemplate);
                          setPreviewTemplate(null);
                        }}
                        className="bg-green-600 text-white"
                      >
                        Testar
                      </Button>
                      <Button
                        onClick={() => {
                          applyTemplate(previewTemplate);
                          setPreviewTemplate(null);
                        }}
                        className="bg-blue-600 text-white"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testing banner */}
      {testingTemplate && (
        <div className="fixed bottom-6 right-6 z-50 bg-cinema-gray border border-cinema-gray-light rounded-lg p-3 flex items-center gap-4">
          <div className="flex flex-col">
            <strong className="text-white">
              Visualizando: {testingTemplate.name} (teste)
            </strong>
            <span className="text-gray-400 text-sm">
              Abra a página inicial para ver a prévia. O sistema não será
              alterado.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => applyTemplate(testingTemplate)}
              className="bg-blue-600 text-white"
            >
              Salvar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearTest}
              className="border-cinema-gray-light text-gray-400"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
