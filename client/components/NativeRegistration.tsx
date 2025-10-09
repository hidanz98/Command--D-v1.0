import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Loader2,
  Shield,
  FileText,
  Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { useLogo } from '@/context/LogoContext';
import { toast } from 'sonner';
import FacialRecognitionCamera from './FacialRecognitionCamera';

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  password: string;
  confirmPassword: string;
  facialImage?: string;
  agreeToTerms: boolean;
}

interface Step {
  id: number;
  title: string;
  description: string;
  isRequired: boolean;
}

export default function NativeRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cpfCnpj: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const device = useDeviceDetection();
  const { currentLogo } = useLogo();
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      id: 1,
      title: 'Dados Pessoais',
      description: 'Informações básicas para criar sua conta',
      isRequired: true
    },
    {
      id: 2,
      title: 'Segurança',
      description: 'Defina sua senha de acesso',
      isRequired: true
    },
    {
      id: 3,
      title: 'Reconhecimento Facial',
      description: 'Para maior segurança da sua conta',
      isRequired: false
    },
    {
      id: 4,
      title: 'Confirmação',
      description: 'Revise e confirme seus dados',
      isRequired: true
    }
  ];

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFacialImageCapture = async (imageData: string) => {
    setIsProcessingImage(true);
    
    try {
      // Simulate facial recognition processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateFormData('facialImage', imageData);
      setShowCamera(false);
      toast.success('Reconhecimento facial configurado com sucesso!');
      
      // Auto advance to next step
      setTimeout(() => {
        setCurrentStep(4);
      }, 500);
    } catch (error) {
      toast.error('Erro no processamento. Tente novamente.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.phone && formData.cpfCnpj);
      case 2:
        return !!(formData.password && formData.confirmPassword && formData.password === formData.confirmPassword);
      case 3:
        return true; // Optional step
      case 4:
        return formData.agreeToTerms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      toast.error('Preencha todos os campos obrigatórios');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Aceite os termos para continuar');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Conta criada com sucesso!');
      navigate('/area-cliente');
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (showCamera) {
    return (
      <FacialRecognitionCamera
        onCapture={handleFacialImageCapture}
        onClose={() => setShowCamera(false)}
        isProcessing={isProcessingImage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinema-dark via-cinema-dark-lighter to-cinema-dark">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cinema-dark/95 backdrop-blur-sm border-b border-cinema-gray-light">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentStep > 1) {
                handlePrevious();
              } else {
                navigate('/login');
              }
            }}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {currentStep > 1 ? 'Voltar' : 'Login'}
          </Button>

          <div className="flex items-center space-x-2">
            <img
              src={currentLogo}
              alt="Logo"
              className="h-8 w-auto"
            />
          </div>

          <div className="w-16 text-right">
            <span className="text-cinema-yellow text-sm font-medium">
              {currentStep}/{steps.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className={`h-2 rounded-full transition-colors duration-300 ${
                  currentStep > index + 1 ? 'bg-green-500' :
                  currentStep === index + 1 ? 'bg-cinema-yellow' : 'bg-gray-600'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-sm mx-auto">
          {/* Step Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-gray-300 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white font-medium">
                    Nome Completo *
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="pl-12 h-14 text-base bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white font-medium">
                    Email *
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="pl-12 h-14 text-base bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white font-medium">
                    Telefone *
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', formatPhone(e.target.value))}
                      className="pl-12 h-14 text-base bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cpfCnpj" className="text-white font-medium">
                    CPF ou CNPJ *
                  </Label>
                  <div className="relative mt-1">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="cpfCnpj"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpfCnpj}
                      onChange={(e) => updateFormData('cpfCnpj', formatCpfCnpj(e.target.value))}
                      className="pl-12 h-14 text-base bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-white font-medium">
                    Senha *
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha segura"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className="pl-12 pr-12 h-14 text-base bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cinema-yellow"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-white font-medium">
                    Confirmar Senha *
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      className="pl-12 pr-12 h-14 text-base bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cinema-yellow"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-cinema-yellow/10 rounded-lg border border-cinema-yellow/20">
                  <h4 className="text-cinema-yellow font-medium text-sm mb-2">
                    Requisitos da senha:
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        formData.password.length >= 8 ? 'bg-green-400' : 'bg-gray-500'
                      }`} />
                      <span>Mínimo 8 caracteres</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        /[A-Z]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-500'
                      }`} />
                      <span>Uma letra maiúscula</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        /[0-9]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-500'
                      }`} />
                      <span>Um número</span>
                    </li>
                  </ul>
                </div>

                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>As senhas não coincidem</span>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-cinema-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {formData.facialImage ? (
                      <Check className="w-12 h-12 text-green-400" />
                    ) : (
                      <Camera className="w-12 h-12 text-cinema-yellow" />
                    )}
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {formData.facialImage ? 'Configurado!' : 'Configurar Reconhecimento Facial'}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-6">
                    {formData.facialImage 
                      ? 'Seu reconhecimento facial foi configurado com sucesso. Agora você pode fazer login usando seu rosto.'
                      : 'Adicione uma camada extra de segurança à sua conta com reconhecimento facial.'
                    }
                  </p>
                </div>

                {!formData.facialImage ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-400/10 rounded-lg border border-blue-400/20">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="text-blue-400 font-medium text-sm mb-1">
                            Por que usar reconhecimento facial?
                          </h4>
                          <ul className="text-xs text-gray-300 space-y-1">
                            <li>• Login mais rápido e seguro</li>
                            <li>• Proteção contra acesso não autorizado</li>
                            <li>• Experiência mais moderna e conveniente</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowCamera(true)}
                      className="w-full h-14 bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold text-base"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Abrir Câmera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-green-400">
                      <img
                        src={formData.facialImage}
                        alt="Facial recognition"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowCamera(true)}
                      className="w-full h-12 border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Refazer Foto
                    </Button>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-gray-400 text-sm underline hover:text-white"
                  >
                    Pular esta etapa (opcional)
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Tudo Pronto!
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Revise seus dados e confirme o cadastro
                  </p>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <div className="p-4 bg-cinema-gray/50 rounded-lg border border-cinema-gray-light">
                    <h4 className="text-white font-medium mb-3">Resumo do Cadastro</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Nome:</span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Email:</span>
                        <span className="text-white">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Telefone:</span>
                        <span className="text-white">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">CPF/CNPJ:</span>
                        <span className="text-white">{formData.cpfCnpj}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Reconhecimento Facial:</span>
                        <span className={formData.facialImage ? 'text-green-400' : 'text-gray-400'}>
                          {formData.facialImage ? 'Configurado' : 'Não configurado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => updateFormData('agreeToTerms', !!checked)}
                      className="border-cinema-gray-light data-[state=checked]:bg-cinema-yellow data-[state=checked]:border-cinema-yellow mt-1"
                    />
                    <Label htmlFor="terms" className="text-gray-300 text-sm leading-relaxed">
                      Li e concordo com os{" "}
                      <Link to="/termos" className="text-cinema-yellow hover:text-cinema-yellow-dark underline">
                        Termos de Uso
                      </Link>{" "}
                      e a{" "}
                      <Link to="/privacidade" className="text-cinema-yellow hover:text-cinema-yellow-dark underline">
                        Política de Privacidade
                      </Link>
                      .
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 space-y-4">
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="w-full h-14 bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold text-base"
              >
                {currentStep === 3 && formData.facialImage ? 'Finalizar' : 'Continuar'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(4) || isLoading}
                className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-semibold text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando Conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            )}

            {/* Step indicator for mobile */}
            <div className="flex justify-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    currentStep > index + 1 ? 'bg-green-500' :
                    currentStep === index + 1 ? 'bg-cinema-yellow' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
