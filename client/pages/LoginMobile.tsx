import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import FacialCameraCapture from "@/components/FacialCameraCapture";
import { 
  Camera, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  Mail, 
  User, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Fingerprint,
  Smartphone,
  ArrowLeft
} from "lucide-react";

// Etapas do cadastro
type Step = 'welcome' | 'facial' | 'personal' | 'security' | 'documents' | 'success';

export default function LoginMobile() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<Step>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register state
  const [showCamera, setShowCamera] = useState(false);
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({
    name: "",
    cpfCnpj: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Formatar CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  // Formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        if (email.includes("admin") || email === "cabecadeefeitocine@gmail.com") {
          navigate("/painel-admin");
        } else {
          navigate("/");
        }
      } else {
        setError("Email ou senha incorretos");
      }
    } catch (err) {
      setError("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  // Próxima etapa do cadastro
  const nextStep = () => {
    const steps: Step[] = ['welcome', 'facial', 'personal', 'security', 'documents', 'success'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  // Etapa anterior
  const prevStep = () => {
    const steps: Step[] = ['welcome', 'facial', 'personal', 'security', 'documents', 'success'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // Finalizar cadastro
  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
    } catch (err) {
      setError("Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar barra de progresso
  const renderProgress = () => {
    const steps: Step[] = ['facial', 'personal', 'security', 'documents'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex === -1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i <= currentIndex 
                ? 'bg-cinema-yellow text-cinema-dark' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {i < currentIndex ? <CheckCircle className="w-5 h-5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-1 mx-1 transition-all ${
                i < currentIndex ? 'bg-cinema-yellow' : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cinema-dark via-gray-900 to-black flex flex-col">
      {/* Header com Logo */}
      <header className="p-4 flex items-center justify-between">
        {(mode === 'register' && step !== 'welcome' && step !== 'success') ? (
          <button onClick={prevStep} className="text-white p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : mode === 'register' ? (
          <button onClick={() => { setMode('login'); setStep('welcome'); }} className="text-white p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <Link to="/" className="text-white p-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        )}
        
        {/* Logo */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cinema-yellow rounded-lg flex items-center justify-center">
              <span className="text-cinema-dark font-black text-xl">B</span>
            </div>
            <span className="text-white font-bold text-lg">Bil's Cinema</span>
          </div>
        </div>
        
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col px-6 pb-8">
        
        {/* ========== MODO LOGIN ========== */}
        {mode === 'login' && (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h1>
              <p className="text-gray-400">Entre na sua conta para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl text-lg"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl text-lg"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(!!c)}
                    className="border-gray-600"
                  />
                  <span className="text-gray-400 text-sm">Lembrar-me</span>
                </label>
                <Link to="#" className="text-cinema-yellow text-sm">Esqueci a senha</Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-cinema-yellow hover:bg-yellow-400 text-cinema-dark font-bold text-lg rounded-xl"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">Ainda não tem conta?</p>
              <Button
                onClick={() => { setMode('register'); setStep('welcome'); }}
                variant="outline"
                className="w-full h-14 border-2 border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark font-bold text-lg rounded-xl"
              >
                Criar Conta
              </Button>
            </div>

            {/* Badge de segurança */}
            <div className="mt-8 flex items-center justify-center gap-2 text-gray-500">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Ambiente 100% seguro</span>
            </div>
          </div>
        )}

        {/* ========== MODO CADASTRO ========== */}
        {mode === 'register' && (
          <>
            {/* Etapa: Boas-vindas */}
            {step === 'welcome' && (
              <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-cinema-yellow to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-cinema-dark" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-3">
                  Cadastro Seguro
                </h1>
                <p className="text-gray-400 mb-8 text-lg">
                  Em poucos passos você terá acesso a equipamentos profissionais de cinema
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 bg-gray-800/30 p-4 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">Reconhecimento Facial</p>
                      <p className="text-gray-500 text-sm">Verificação de identidade</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-800/30 p-4 rounded-xl">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">Documentos Digitais</p>
                      <p className="text-gray-500 text-sm">RG, CNH ou Gov.br</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-800/30 p-4 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">Dados Protegidos</p>
                      <p className="text-gray-500 text-sm">Criptografia de ponta</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={nextStep}
                  className="w-full h-14 bg-cinema-yellow hover:bg-yellow-400 text-cinema-dark font-bold text-lg rounded-xl"
                >
                  Começar Cadastro
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Etapa: Reconhecimento Facial */}
            {step === 'facial' && (
              <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
                {renderProgress()}
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Verificação Facial</h2>
                  <p className="text-gray-400">Tire uma selfie para confirmar sua identidade</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  {facialPhoto ? (
                    <div className="text-center">
                      <div className="relative inline-block mb-4">
                        <img
                          src={facialPhoto}
                          alt="Sua foto"
                          className="w-48 h-48 rounded-full object-cover border-4 border-green-500"
                        />
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <p className="text-green-400 font-semibold mb-2">Foto capturada com sucesso!</p>
                      <button
                        onClick={() => setShowCamera(true)}
                        className="text-cinema-yellow underline"
                      >
                        Tirar outra foto
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-48 h-48 rounded-full border-4 border-dashed border-gray-600 flex items-center justify-center mb-6 mx-auto">
                        <Camera className="w-16 h-16 text-gray-600" />
                      </div>
                      <Button
                        onClick={() => setShowCamera(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold h-14 px-8 rounded-xl"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Abrir Câmera
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  onClick={nextStep}
                  disabled={!facialPhoto}
                  className="w-full h-14 bg-cinema-yellow hover:bg-yellow-400 text-cinema-dark font-bold text-lg rounded-xl disabled:opacity-50 mt-auto"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Etapa: Dados Pessoais */}
            {step === 'personal' && (
              <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
                {renderProgress()}
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Dados Pessoais</h2>
                  <p className="text-gray-400">Preencha suas informações básicas</p>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-gray-300 text-sm font-medium">Nome Completo</label>
                    <div className="relative mt-1">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        value={regForm.name}
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-medium">CPF ou CNPJ</label>
                    <div className="relative mt-1">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        value={regForm.cpfCnpj}
                        onChange={(e) => setRegForm({...regForm, cpfCnpj: formatCpfCnpj(e.target.value)})}
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl"
                        placeholder="000.000.000-00"
                        maxLength={18}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-medium">Celular</label>
                    <div className="relative mt-1">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        value={regForm.phone}
                        onChange={(e) => setRegForm({...regForm, phone: formatPhone(e.target.value)})}
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-medium">Email</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={nextStep}
                  disabled={!regForm.name || !regForm.cpfCnpj || !regForm.email}
                  className="w-full h-14 bg-cinema-yellow hover:bg-yellow-400 text-cinema-dark font-bold text-lg rounded-xl disabled:opacity-50 mt-6"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Etapa: Segurança */}
            {step === 'security' && (
              <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
                {renderProgress()}
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Crie sua Senha</h2>
                  <p className="text-gray-400">Escolha uma senha forte e segura</p>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-gray-300 text-sm font-medium">Senha</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        type={showRegPassword ? "text" : "password"}
                        value={regForm.password}
                        onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                        className="pl-12 pr-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-medium">Confirmar Senha</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        type="password"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white rounded-xl"
                        placeholder="Repita a senha"
                      />
                    </div>
                    {regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">As senhas não coincidem</p>
                    )}
                  </div>

                  {/* Requisitos de senha */}
                  <div className="bg-gray-800/30 p-4 rounded-xl space-y-2">
                    <p className="text-gray-400 text-sm font-medium">Sua senha deve ter:</p>
                    <div className={`flex items-center gap-2 text-sm ${regForm.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                      <CheckCircle className="w-4 h-4" />
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${/[A-Z]/.test(regForm.password) ? 'text-green-400' : 'text-gray-500'}`}>
                      <CheckCircle className="w-4 h-4" />
                      <span>Uma letra maiúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${/[0-9]/.test(regForm.password) ? 'text-green-400' : 'text-gray-500'}`}>
                      <CheckCircle className="w-4 h-4" />
                      <span>Um número</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={nextStep}
                  disabled={regForm.password.length < 8 || regForm.password !== regForm.confirmPassword}
                  className="w-full h-14 bg-cinema-yellow hover:bg-yellow-400 text-cinema-dark font-bold text-lg rounded-xl disabled:opacity-50 mt-6"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Etapa: Documentos */}
            {step === 'documents' && (
              <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
                {renderProgress()}
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Documentos</h2>
                  <p className="text-gray-400">Envie um documento com foto para validação</p>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="bg-gray-800/30 p-4 rounded-xl">
                    <p className="text-white font-semibold mb-3">Escolha uma opção:</p>
                    
                    <div className="space-y-3">
                      <button className="w-full flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-white font-medium">RG Digital</p>
                          <p className="text-gray-500 text-sm">Aplicativo oficial</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </button>

                      <button className="w-full flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-white font-medium">CNH Digital</p>
                          <p className="text-gray-500 text-sm">Carteira de Trânsito</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </button>

                      <button className="w-full flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-white font-medium">Gov.br</p>
                          <p className="text-gray-500 text-sm">Exportar PDF do aplicativo</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Termos */}
                  <label className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-xl cursor-pointer">
                    <Checkbox
                      checked={regForm.agreeToTerms}
                      onCheckedChange={(c) => setRegForm({...regForm, agreeToTerms: !!c})}
                      className="border-gray-600 mt-1"
                    />
                    <span className="text-gray-400 text-sm">
                      Li e concordo com os{" "}
                      <Link to="#" className="text-cinema-yellow">Termos de Uso</Link>
                      {" "}e a{" "}
                      <Link to="#" className="text-cinema-yellow">Política de Privacidade</Link>
                    </span>
                  </label>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={!regForm.agreeToTerms || isLoading}
                  className="w-full h-14 bg-cinema-yellow hover:bg-yellow-400 text-cinema-dark font-bold text-lg rounded-xl disabled:opacity-50 mt-6"
                >
                  {isLoading ? "Criando conta..." : "Finalizar Cadastro"}
                </Button>
              </div>
            )}

            {/* Etapa: Sucesso */}
            {step === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">Conta Criada!</h2>
                <p className="text-gray-400 text-lg mb-8">
                  Seu cadastro foi realizado com sucesso. Você já pode acessar sua conta.
                </p>

                <Button
                  onClick={() => { setMode('login'); setStep('welcome'); }}
                  className="w-full h-14 bg-cinema-yellow hover:bg-yellow-400 text-cinema-dark font-bold text-lg rounded-xl"
                >
                  Fazer Login
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Componente de Câmera */}
      <FacialCameraCapture
        isOpen={showCamera}
        onCapture={(imageData) => {
          setFacialPhoto(imageData);
          setShowCamera(false);
        }}
        onClose={() => setShowCamera(false)}
      />
    </div>
  );
}

