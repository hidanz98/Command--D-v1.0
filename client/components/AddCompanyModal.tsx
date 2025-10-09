import React, { useState } from "react";
import { useMasterAdmin, RentalCompany } from "../context/MasterAdminContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCompanyModal({ isOpen, onClose }: AddCompanyModalProps) {
  const { addCompany } = useMasterAdmin();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Company Info
    name: "",
    slug: "",
    primaryColor: "#F5D533",
    secondaryColor: "#1a1a1a",
    domain: "",

    // Owner Info
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",

    // Plan & Settings
    plan: "demo" as "demo" | "basic" | "premium",
    isActive: true,
    allowOnlinePayments: false,
    requireApproval: true,
    showPricing: true,
    customDomain: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.name.trim())
        newErrors.name = "Nome da empresa é obrigatório";
      if (!formData.slug.trim()) newErrors.slug = "URL amigável é obrigatória";
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug =
          "URL deve conter apenas letras minúsculas, números e hífen";
      }
    }

    if (stepNumber === 2) {
      if (!formData.ownerName.trim())
        newErrors.ownerName = "Nome do responsável é obrigatório";
      if (!formData.ownerEmail.trim())
        newErrors.ownerEmail = "Email é obrigatório";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
        newErrors.ownerEmail = "Email inválido";
      }
      if (!formData.ownerPhone.trim())
        newErrors.ownerPhone = "Telefone é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setErrors({});
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

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    const newCompany: Omit<RentalCompany, "id" | "createdAt" | "lastActive"> = {
      name: formData.name,
      slug: formData.slug,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      domain: formData.domain || undefined,
      isActive: formData.isActive,
      plan: formData.plan,
      totalRevenue: 0,
      totalOrders: 0,
      owner: {
        name: formData.ownerName,
        email: formData.ownerEmail,
        phone: formData.ownerPhone,
      },
      settings: {
        allowOnlinePayments: formData.allowOnlinePayments,
        requireApproval: formData.requireApproval,
        showPricing: formData.showPricing,
        customDomain: formData.customDomain || undefined,
      },
    };

    addCompany(newCompany);
    onClose();

    // Reset form
    setFormData({
      name: "",
      slug: "",
      primaryColor: "#F5D533",
      secondaryColor: "#1a1a1a",
      domain: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      plan: "demo",
      isActive: true,
      allowOnlinePayments: false,
      requireApproval: true,
      showPricing: true,
      customDomain: "",
    });
    setStep(1);
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setErrors({});
  };

  const plans = [
    {
      id: "demo",
      name: "Demo",
      price: "Grátis",
      duration: "30 dias",
      features: ["Acesso limitado", "Até 10 equipamentos", "Suporte básico"],
      color: "text-yellow-400",
    },
    {
      id: "basic",
      name: "Básico",
      price: "R$ 199",
      duration: "/mês",
      features: [
        "Até 100 equipamentos",
        "Relatórios básicos",
        "Suporte por email",
      ],
      color: "text-blue-400",
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 399",
      duration: "/mês",
      features: [
        "Equipamentos ilimitados",
        "Relatórios avançados",
        "Suporte prioritário",
        "Domínio customizado",
      ],
      color: "text-purple-400",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-cinema-gray border-cinema-gray-light text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cinema-gold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Nova Locadora - Passo {step} de 3
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  stepNumber <= step
                    ? "bg-cinema-gold text-black"
                    : "bg-cinema-gray-light text-gray-400"
                }`}
              >
                {stepNumber < step ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`flex-1 h-1 ${
                    stepNumber < step
                      ? "bg-cinema-gold"
                      : "bg-cinema-gray-light"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Company Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Nome da Empresa *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Bil's Cinema e Vídeo"
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  URL Amigável *
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="bils-cinema"
                  className="bg-cinema-gray-light border-cinema-gray-light text-white"
                />
                {errors.slug && (
                  <p className="text-red-400 text-sm">{errors.slug}</p>
                )}
                <p className="text-gray-400 text-sm">
                  URL: locadoras.com/{formData.slug}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="primaryColor"
                  className="flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Cor Primária
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="w-12 h-10 rounded border border-cinema-gray-light"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="bg-cinema-gray-light border-cinema-gray-light text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secondaryColor: e.target.value,
                      }))
                    }
                    className="w-12 h-10 rounded border border-cinema-gray-light"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secondaryColor: e.target.value,
                      }))
                    }
                    className="bg-cinema-gray-light border-cinema-gray-light text-white"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <Card className="bg-cinema-gray-light border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-sm text-gray-400">
                  Pré-visualização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  <h3
                    className="text-lg font-bold"
                    style={{ color: formData.secondaryColor }}
                  >
                    {formData.name || "Nome da Empresa"}
                  </h3>
                  <p
                    className="text-sm opacity-75"
                    style={{ color: formData.secondaryColor }}
                  >
                    Equipamentos Cinematográficos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Owner Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome do Responsável *
              </Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ownerName: e.target.value,
                  }))
                }
                placeholder="Ex: João Silva"
                className="bg-cinema-gray-light border-cinema-gray-light text-white"
              />
              {errors.ownerName && (
                <p className="text-red-400 text-sm">{errors.ownerName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </Label>
                <Input
                  id="ownerEmail"
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
                {errors.ownerEmail && (
                  <p className="text-red-400 text-sm">{errors.ownerEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone *
                </Label>
                <Input
                  id="ownerPhone"
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
                {errors.ownerPhone && (
                  <p className="text-red-400 text-sm">{errors.ownerPhone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customDomain">
                Domínio Customizado (Opcional)
              </Label>
              <Input
                id="customDomain"
                value={formData.customDomain}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customDomain: e.target.value,
                  }))
                }
                placeholder="www.minhalocadora.com"
                className="bg-cinema-gray-light border-cinema-gray-light text-white"
              />
              <p className="text-gray-400 text-sm">
                Se deixar em branco, será usado: locadoras.com/{formData.slug}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Plan & Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Escolha o Plano
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      formData.plan === plan.id
                        ? "border-cinema-gold bg-cinema-gold/10"
                        : "border-cinema-gray-light bg-cinema-gray-light hover:border-cinema-gold/50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, plan: plan.id as any }))
                    }
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-lg ${plan.color}`}>
                        {plan.name}
                      </CardTitle>
                      <div className="text-2xl font-bold text-white">
                        {plan.price}
                        <span className="text-sm font-normal text-gray-400">
                          {plan.duration}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações Iniciais
              </Label>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowOnlinePayments}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowOnlinePayments: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-cinema-gold"
                  />
                  <span className="text-white">Permitir pagamentos online</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requireApproval}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requireApproval: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-cinema-gold"
                  />
                  <span className="text-white">
                    Exigir aprovação para pedidos
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showPricing}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPricing: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-cinema-gold"
                  />
                  <span className="text-white">Exibir preços publicamente</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-cinema-gold"
                  />
                  <span className="text-white">Ativar imediatamente</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-cinema-gray-light text-white hover:bg-cinema-gray-light"
            >
              Anterior
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              className="bg-cinema-gold text-black hover:bg-yellow-500"
            >
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-cinema-gold text-black hover:bg-yellow-500"
            >
              Criar Locadora
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
