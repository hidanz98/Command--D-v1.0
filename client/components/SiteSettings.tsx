import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings, Palette, Type, Globe, Shield, Zap, Upload, Download,
  Monitor, Smartphone, Search, Bell, Mail, Phone, MapPin, Clock,
  Star, Heart, MessageCircle, Camera, Code, Database, Link,
  Eye, EyeOff, Save, RotateCcw, Copy, CheckCircle
} from 'lucide-react';

interface SiteConfig {
  general: {
    siteName: string;
    tagline: string;
    description: string;
    logo: string;
    favicon: string;
    language: string;
    timezone: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: string;
    darkMode: boolean;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    whatsapp: string;
    workingHours: string;
  };
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
    twitter: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    robotsTxt: string;
    sitemap: boolean;
    analytics: string;
    pixelFacebook: string;
  };
  ecommerce: {
    currency: string;
    taxRate: number;
    shippingEnabled: boolean;
    paymentMethods: string[];
    inventoryTracking: boolean;
    orderNotifications: boolean;
  };
  features: {
    newsletter: boolean;
    reviews: boolean;
    wishlist: boolean;
    compareProducts: boolean;
    multiLanguage: boolean;
    chatSupport: boolean;
  };
}

const DEFAULT_CONFIG: SiteConfig = {
  general: {
    siteName: "Bil's Cinema e Vídeo",
    tagline: "Equipamentos Profissionais para Cinema",
    description: "Aluguel de equipamentos profissionais para cinema, fotografia e produção audiovisual em Belo Horizonte",
    logo: "/placeholder.svg",
    favicon: "/favicon.ico",
    language: "pt-BR",
    timezone: "America/Sao_Paulo"
  },
  branding: {
    primaryColor: "#FFD700",
    secondaryColor: "#1a1a1a",
    accentColor: "#333333",
    fontFamily: "Inter",
    fontSize: "16px",
    darkMode: true
  },
  contact: {
    email: "contato@bilscinema.com",
    phone: "(31) 3568-8485",
    address: "Belo Horizonte, MG",
    whatsapp: "+5531999999999",
    workingHours: "Segunda a Sexta: 8h às 18h"
  },
  social: {
    facebook: "https://facebook.com/bilscinema",
    instagram: "https://instagram.com/bilscinema",
    youtube: "",
    linkedin: "",
    twitter: ""
  },
  seo: {
    metaTitle: "Bil's Cinema - Aluguel de Equipamentos de Cinema",
    metaDescription: "Aluguel de equipamentos profissionais para cinema e audiovisual em BH. Câmeras, lentes, áudio e iluminação.",
    keywords: "aluguel, equipamentos, cinema, camera, lentes, belo horizonte",
    robotsTxt: "User-agent: *\nAllow: /",
    sitemap: true,
    analytics: "",
    pixelFacebook: ""
  },
  ecommerce: {
    currency: "BRL",
    taxRate: 0,
    shippingEnabled: false,
    paymentMethods: ["pix", "cartao", "boleto"],
    inventoryTracking: true,
    orderNotifications: true
  },
  features: {
    newsletter: true,
    reviews: true,
    wishlist: true,
    compareProducts: false,
    multiLanguage: false,
    chatSupport: true
  }
};

const COLOR_PRESETS = [
  { name: "Cinema Gold", primary: "#FFD700", secondary: "#1a1a1a", accent: "#333333" },
  { name: "Ocean Blue", primary: "#0066CC", secondary: "#003d7a", accent: "#66b3ff" },
  { name: "Forest Green", primary: "#228B22", secondary: "#006400", accent: "#90EE90" },
  { name: "Sunset Orange", primary: "#FF6B35", secondary: "#FF4500", accent: "#FFB366" },
  { name: "Royal Purple", primary: "#6A4C93", secondary: "#473080", accent: "#A8869C" },
  { name: "Minimalist Gray", primary: "#6C757D", secondary: "#495057", accent: "#ADB5BD" }
];

const FONT_OPTIONS = [
  "Inter", "Roboto", "Open Sans", "Poppins", "Montserrat", "Playfair Display",
  "Lato", "Source Sans Pro", "Nunito", "Raleway", "Work Sans", "PT Sans"
];

export const SiteSettings: React.FC<{
  onSave: (config: SiteConfig) => void;
  onClose?: () => void;
}> = ({ onSave, onClose }) => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sections = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'branding', label: 'Marca & Cores', icon: Palette },
    { id: 'contact', label: 'Contato', icon: Phone },
    { id: 'social', label: 'Redes Sociais', icon: Heart },
    { id: 'seo', label: 'SEO & Analytics', icon: Search },
    { id: 'ecommerce', label: 'E-commerce', icon: Monitor },
    { id: 'features', label: 'Recursos', icon: Zap }
  ];

  const updateConfig = (section: keyof SiteConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setConfig(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        accentColor: preset.accent
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(config);
      // Show success message
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-sm font-medium">Informações Básicas</Label>
        <div className="mt-3 space-y-4">
          <div>
            <Label className="text-gray-400 text-xs">Nome do Site</Label>
            <Input
              value={config.general.siteName}
              onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Slogan/Tagline</Label>
            <Input
              value={config.general.tagline}
              onChange={(e) => updateConfig('general', 'tagline', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="Ex: Equipamentos Profissionais para Cinema"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Descrição</Label>
            <textarea
              value={config.general.description}
              onChange={(e) => updateConfig('general', 'description', e.target.value)}
              className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2 h-20 resize-none text-sm"
              placeholder="Descrição breve do negócio..."
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-white text-sm font-medium">Identidade Visual</Label>
        <div className="mt-3 space-y-4">
          <div>
            <Label className="text-gray-400 text-xs">Logo</Label>
            <div className="mt-1 p-3 border-2 border-dashed border-cinema-gray-light rounded-lg text-center">
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-gray-400 text-xs">Clique para enviar logo</p>
              <Button size="sm" className="mt-2 bg-cinema-yellow text-cinema-dark">
                Upload
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Idioma</Label>
              <select
                value={config.general.language}
                onChange={(e) => updateConfig('general', 'language', e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Fuso Horário</Label>
              <select
                value={config.general.timezone}
                onChange={(e) => updateConfig('general', 'timezone', e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/London">London (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrandingSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-sm font-medium">Paleta de Cores</Label>
        <div className="mt-3 space-y-4">
          {/* Color Presets */}
          <div>
            <Label className="text-gray-400 text-xs">Presets de Cores</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className="p-3 bg-cinema-dark border border-cinema-gray-light rounded-lg hover:border-cinema-yellow transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }}></div>
                  </div>
                  <p className="text-white text-xs text-left">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Cor Primária</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={config.branding.primaryColor}
                  onChange={(e) => updateConfig('branding', 'primaryColor', e.target.value)}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
                <Input
                  value={config.branding.primaryColor}
                  onChange={(e) => updateConfig('branding', 'primaryColor', e.target.value)}
                  className="flex-1 bg-cinema-dark border-cinema-gray-light text-white text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Cor Secundária</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={config.branding.secondaryColor}
                  onChange={(e) => updateConfig('branding', 'secondaryColor', e.target.value)}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
                <Input
                  value={config.branding.secondaryColor}
                  onChange={(e) => updateConfig('branding', 'secondaryColor', e.target.value)}
                  className="flex-1 bg-cinema-dark border-cinema-gray-light text-white text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Cor de Destaque</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={config.branding.accentColor}
                  onChange={(e) => updateConfig('branding', 'accentColor', e.target.value)}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
                <Input
                  value={config.branding.accentColor}
                  onChange={(e) => updateConfig('branding', 'accentColor', e.target.value)}
                  className="flex-1 bg-cinema-dark border-cinema-gray-light text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-white text-sm font-medium">Tipografia</Label>
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Família da Fonte</Label>
              <select
                value={config.branding.fontFamily}
                onChange={(e) => updateConfig('branding', 'fontFamily', e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Tamanho Base</Label>
              <select
                value={config.branding.fontSize}
                onChange={(e) => updateConfig('branding', 'fontSize', e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="14px">14px (Pequeno)</option>
                <option value="16px">16px (Padrão)</option>
                <option value="18px">18px (Grande)</option>
                <option value="20px">20px (Extra Grande)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-white text-sm font-medium">Tema</Label>
        <div className="mt-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.branding.darkMode}
              onChange={(e) => updateConfig('branding', 'darkMode', e.target.checked)}
              className="rounded"
            />
            <Label className="text-white text-sm">Modo Escuro</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-sm font-medium">Informações de Contato</Label>
        <div className="mt-3 space-y-4">
          <div>
            <Label className="text-gray-400 text-xs">E-mail</Label>
            <Input
              type="email"
              value={config.contact.email}
              onChange={(e) => updateConfig('contact', 'email', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="contato@seusite.com"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Telefone</Label>
            <Input
              value={config.contact.phone}
              onChange={(e) => updateConfig('contact', 'phone', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">WhatsApp</Label>
            <Input
              value={config.contact.whatsapp}
              onChange={(e) => updateConfig('contact', 'whatsapp', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="+5511999999999"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Endereço</Label>
            <Input
              value={config.contact.address}
              onChange={(e) => updateConfig('contact', 'address', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="Cidade, Estado"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Horário de Funcionamento</Label>
            <Input
              value={config.contact.workingHours}
              onChange={(e) => updateConfig('contact', 'workingHours', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="Segunda a Sexta: 8h às 18h"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocialSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-sm font-medium">Redes Sociais</Label>
        <div className="mt-3 space-y-4">
          <div>
            <Label className="text-gray-400 text-xs">Facebook</Label>
            <Input
              value={config.social.facebook}
              onChange={(e) => updateConfig('social', 'facebook', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="https://facebook.com/seuperfil"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Instagram</Label>
            <Input
              value={config.social.instagram}
              onChange={(e) => updateConfig('social', 'instagram', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="https://instagram.com/seuperfil"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">YouTube</Label>
            <Input
              value={config.social.youtube}
              onChange={(e) => updateConfig('social', 'youtube', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="https://youtube.com/seucanal"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">LinkedIn</Label>
            <Input
              value={config.social.linkedin}
              onChange={(e) => updateConfig('social', 'linkedin', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="https://linkedin.com/in/seuperfil"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-sm font-medium">SEO Básico</Label>
        <div className="mt-3 space-y-4">
          <div>
            <Label className="text-gray-400 text-xs">Título (Meta Title)</Label>
            <Input
              value={config.seo.metaTitle}
              onChange={(e) => updateConfig('seo', 'metaTitle', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              maxLength={60}
            />
            <p className="text-gray-500 text-xs mt-1">{config.seo.metaTitle.length}/60 caracteres</p>
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Descrição (Meta Description)</Label>
            <textarea
              value={config.seo.metaDescription}
              onChange={(e) => updateConfig('seo', 'metaDescription', e.target.value)}
              className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2 h-16 resize-none text-sm"
              maxLength={160}
            />
            <p className="text-gray-500 text-xs mt-1">{config.seo.metaDescription.length}/160 caracteres</p>
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Palavras-chave</Label>
            <Input
              value={config.seo.keywords}
              onChange={(e) => updateConfig('seo', 'keywords', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="palavra1, palavra2, palavra3"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-white text-sm font-medium">Analytics</Label>
        <div className="mt-3 space-y-4">
          <div>
            <Label className="text-gray-400 text-xs">Google Analytics ID</Label>
            <Input
              value={config.seo.analytics}
              onChange={(e) => updateConfig('seo', 'analytics', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="GA4-XXXXXXXXX"
            />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Facebook Pixel ID</Label>
            <Input
              value={config.seo.pixelFacebook}
              onChange={(e) => updateConfig('seo', 'pixelFacebook', e.target.value)}
              className="bg-cinema-dark border-cinema-gray-light text-white"
              placeholder="1234567890123456"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg w-full max-w-5xl mx-4 h-[90vh] flex">
        {/* Sidebar */}
        <div className="w-64 bg-cinema-dark-lighter border-r border-cinema-gray-light">
          <div className="p-6 border-b border-cinema-gray-light">
            <h2 className="text-xl font-bold text-white">Configurações</h2>
            <p className="text-gray-400 text-sm">Personalize seu site</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-cinema-yellow text-cinema-dark'
                      : 'text-gray-400 hover:text-white hover:bg-cinema-dark'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-cinema-gray-light flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {sections.find(s => s.id === activeSection)?.label}
            </h3>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setConfig(DEFAULT_CONFIG)}
                className="text-gray-400 border-gray-400"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                {isSaving ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  Fechar
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'branding' && renderBrandingSettings()}
            {activeSection === 'contact' && renderContactSettings()}
            {activeSection === 'social' && renderSocialSettings()}
            {activeSection === 'seo' && renderSEOSettings()}
            
            {activeSection === 'ecommerce' && (
              <div className="text-center py-12">
                <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">E-commerce Settings</h3>
                <p className="text-gray-500">Configurações de loja em desenvolvimento</p>
              </div>
            )}
            
            {activeSection === 'features' && (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">Features Settings</h3>
                <p className="text-gray-500">Configurações de recursos em desenvolvimento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
