import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Building2,
  User,
  Mail,
  Phone,
  Palette,
  Globe,
  CreditCard,
  Settings,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  Camera,
  Monitor,
  Mic,
  Lightbulb,
  PlayCircle,
  ShoppingCart,
  Users,
  BarChart3,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (companyData: any) => void;
}

export function CompanyOnboardingFlow({
  isOpen,
  onClose,
  onComplete,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Company Basic Info
    companyName: "",
    slug: "",
    description: "",
    primaryColor: "#F5D533",
    secondaryColor: "#1a1a1a",
    logo: "",

    // Owner Information
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerCpf: "",

    // Business Details
    cnpj: "",
    address: {
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      zipCode: "",
    },
    businessType: "audiovisual",
    employeeCount: "1-5",
    monthlyRevenue: "up-to-10k",

    // Equipment Categories
    equipmentCategories: [] as string[],
    initialInventorySize: "10-50",

    // Plan Selection
    selectedPlan: "basic",

    // Features & Settings
    features: {
      onlinePayments: true,
      automaticApproval: false,
      inventoryTracking: true,
      customerPortal: true,
      mobileApp: false,
      customDomain: false,
    },

    // Initial Setup Preferences
    setupPreferences: {
      importExistingData: false,
      scheduleTraining: true,
      marketingSupport: true,
      prioritySupport: false,
    },
  });

  const totalSteps = 6;

  const equipmentOptions = [
    { id: "cameras", label: "Câmeras", icon: <Camera className="w-5 h-5" /> },
    {
      id: "audio",
      label: "Equipamentos de Áudio",
      icon: <Mic className="w-5 h-5" />,
    },
    {
      id: "lighting",
      label: "Iluminação",
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      id: "monitors",
      label: "Monitores e Telas",
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      id: "accessories",
      label: "Acessórios",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: "postproduction",
      label: "Pós-Produção",
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "R$ 199",
      description: "Ideal para pequenas locadoras",
      features: [
        "Até 100 equipamentos",
        "Relatórios básicos",
        "Suporte por email",
      ],
      recommended: false,
    },
    {
      id: "professional",
      name: "Profissional",
      price: "R$ 399",
      description: "Para locadoras em crescimento",
      features: [
        "Equipamentos ilimitados",
        "Relatórios avançados",
        "Suporte prioritário",
        "App mobile",
      ],
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "R$ 699",
      description: "Para grandes operações",
      features: [
        "Tudo do Profissional",
        "White label",
        "API customizada",
        "Suporte 24/7",
      ],
      recommended: false,
    },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      equipmentCategories: prev.equipmentCategories.includes(categoryId)
        ? prev.equipmentCategories.filter((id) => id !== categoryId)
        : [...prev.equipmentCategories, categoryId],
    }));
  };

  const handleFeatureToggle = (featureKey: string) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey as keyof typeof prev.features],
      },
    }));
  };

  const handleComplete = () => {
    onComplete(formData);
    onClose();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Bem-vindo à Plataforma!
              </h2>
              <p className="text-gray-400">
                Vamos configurar sua locadora em alguns passos simples
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Nome da Empresa *</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      companyName: name,
                      slug: generateSlug(name),
                    }));
                  }}
                  placeholder="Ex: Bil's Cinema e Vídeo"
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
              </div>

              <div>
                <Label className="text-white">URL da sua locadora</Label>
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-2">
                    locadoras.com/
                  </span>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="url-amigavel"
                    className="bg-cinema-gray-light border-cinema-gray-light text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Descrição da empresa</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descreva sua locadora..."
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Informações do Responsável
              </h2>
              <p className="text-gray-400">
                Dados da pessoa responsável pela conta
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Nome Completo *</Label>
                <Input
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownerName: e.target.value,
                    }))
                  }
                  placeholder="João Silva"
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
              </div>

              <div>
                <Label className="text-white">Email *</Label>
                <Input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownerEmail: e.target.value,
                    }))
                  }
                  placeholder="joao@empresa.com"
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
              </div>

              <div>
                <Label className="text-white">Telefone *</Label>
                <Input
                  value={formData.ownerPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownerPhone: e.target.value,
                    }))
                  }
                  placeholder="(31) 99999-9999"
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
              </div>

              <div>
                <Label className="text-white">CPF</Label>
                <Input
                  value={formData.ownerCpf}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownerCpf: e.target.value,
                    }))
                  }
                  placeholder="000.000.000-00"
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ShoppingCart className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Tipos de Equipamentos
              </h2>
              <p className="text-gray-400">
                Selecione as categorias que sua locadora oferece
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipmentOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    formData.equipmentCategories.includes(option.id)
                      ? "border-cinema-gold bg-cinema-gold/10"
                      : "border-cinema-gray-light bg-cinema-gray hover:border-cinema-gold/50"
                  }`}
                  onClick={() => handleCategoryToggle(option.id)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-cinema-gold">{option.icon}</div>
                    <span className="text-white font-medium">
                      {option.label}
                    </span>
                    {formData.equipmentCategories.includes(option.id) && (
                      <Check className="w-5 h-5 text-cinema-gold ml-auto" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Label className="text-white">
                Tamanho inicial do inventário
              </Label>
              <select
                value={formData.initialInventorySize}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    initialInventorySize: e.target.value,
                  }))
                }
                className="w-full p-2 bg-cinema-gray-light border border-cinema-gray-light rounded-md text-white mt-2"
              >
                <option value="1-10">1-10 equipamentos</option>
                <option value="10-50">10-50 equipamentos</option>
                <option value="50-100">50-100 equipamentos</option>
                <option value="100+">Mais de 100 equipamentos</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CreditCard className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Escolha seu Plano
              </h2>
              <p className="text-gray-400">
                Selecione o plano ideal para sua locadora
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all relative ${
                    formData.selectedPlan === plan.id
                      ? "border-cinema-gold bg-cinema-gold/10 scale-105"
                      : "border-cinema-gray-light bg-cinema-gray hover:border-cinema-gold/50"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, selectedPlan: plan.id }))
                  }
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cinema-gold text-black">
                      Recomendado
                    </Badge>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-white text-xl">
                      {plan.name}
                    </CardTitle>
                    <div className="text-3xl font-bold text-cinema-gold">
                      {plan.price}
                    </div>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Configurações Iniciais
              </h2>
              <p className="text-gray-400">
                Personalize as funcionalidades da sua plataforma
              </p>
            </div>

            <div className="space-y-4">
              <Card className="bg-cinema-gray border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Funcionalidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    onlinePayments: "Pagamentos Online",
                    automaticApproval: "Aprovação Automática de Pedidos",
                    inventoryTracking: "Rastreamento de Inventário",
                    customerPortal: "Portal do Cliente",
                    mobileApp: "App Mobile",
                    customDomain: "Domínio Personalizado",
                  }).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.features[
                            key as keyof typeof formData.features
                          ]
                        }
                        onChange={() => handleFeatureToggle(key)}
                        className="w-4 h-4 text-cinema-gold"
                      />
                      <span className="text-white">{label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Cores da Marca</Label>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <label className="text-sm text-gray-400">Primária</label>
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            primaryColor: e.target.value,
                          }))
                        }
                        className="w-full h-10 rounded border border-cinema-gray-light"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">
                        Secundária
                      </label>
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            secondaryColor: e.target.value,
                          }))
                        }
                        className="w-full h-10 rounded border border-cinema-gray-light"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <PlayCircle className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Tudo Pronto!
              </h2>
              <p className="text-gray-400">
                Sua locadora está configurada e pronta para usar
              </p>
            </div>

            <Card className="bg-cinema-gray border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white">
                  Resumo da Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Empresa:</span>
                    <span className="text-white ml-2">
                      {formData.companyName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">URL:</span>
                    <span className="text-white ml-2">
                      locadoras.com/{formData.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white ml-2">
                      {formData.ownerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">
                      {formData.ownerEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Plano:</span>
                    <span className="text-white ml-2">
                      {plans.find((p) => p.id === formData.selectedPlan)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Categorias:</span>
                    <span className="text-white ml-2">
                      {formData.equipmentCategories.length} selecionadas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-cinema-gold/10 border border-cinema-gold rounded-lg p-4">
              <h4 className="font-semibold text-cinema-gold mb-2">
                Próximos Passos:
              </h4>
              <ul className="space-y-1 text-white text-sm">
                <li>• Acesse seu painel administrativo</li>
                <li>• Configure seus primeiros equipamentos</li>
                <li>• Personalize as páginas do seu site</li>
                <li>• Convide seus primeiros clientes</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cinema-gray border-cinema-gray-light text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cinema-gold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Configuração da Locadora - Passo {currentStep} de {totalSteps}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={index}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index + 1 <= currentStep
                    ? "bg-cinema-gold text-black"
                    : "bg-cinema-gray-light text-gray-400"
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 ${
                    index + 1 < currentStep
                      ? "bg-cinema-gold"
                      : "bg-cinema-gray-light"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex justify-between gap-4 pt-6 border-t border-cinema-gray-light">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-cinema-gray-light text-white hover:bg-cinema-gray-light"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleComplete}
              className="bg-cinema-gold text-black hover:bg-yellow-500"
            >
              Finalizar Configuração
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-cinema-gold text-black hover:bg-yellow-500"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
