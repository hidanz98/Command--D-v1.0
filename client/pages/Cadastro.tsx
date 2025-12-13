import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  FileText,
  Eye,
  EyeOff,
  Fingerprint,
  Scan,
  AlertCircle,
  Upload,
  X,
  Loader2
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

// Tipos
type Mode = 'choose' | 'login' | 'register';
type PersonType = 'pf' | 'pj' | null;
type Step = 0 | 1 | 2 | 3 | 4 | 5; // 0 = escolha PF/PJ

// Hook para detectar mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      // Verifica se é mobile por user agent ou largura da tela
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileWidth = window.innerWidth <= 768;
      
      setIsMobile(isMobileUA || isMobileWidth);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

export default function Cadastro() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  
  // Estados
  const [mode, setMode] = useState<Mode>('choose');
  const [personType, setPersonType] = useState<PersonType>(null);
  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetchingCNPJ, setIsFetchingCNPJ] = useState(false);
  
  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Handler de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(loginEmail, loginPassword, rememberMe);
      if (success) {
        if (loginEmail.includes("admin") || loginEmail === "cabecadeefeitocine@gmail.com") {
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
  
  // Câmera
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Formulário Pessoa Física
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    documentType: "",
    documentFile: null as File | null,
    addressProof: null as File | null,
    agreeTerms: false,
    agreePrivacy: false
  });

  // Formulário Pessoa Jurídica
  const [formPJ, setFormPJ] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    inscricaoEstadual: "",
    responsavelNome: "",
    responsavelCpf: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    contratoSocial: null as File | null,
    documentoResponsavel: null as File | null,
    addressProof: null as File | null,
    agreeTerms: false,
    agreePrivacy: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validações e Formatações
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .substring(0, 18);
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    if (numbers.length !== 14) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;
    
    let sum = 0;
    let weight = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 12; i++) sum += parseInt(numbers[i]) * weight[i];
    let rest = sum % 11;
    let digit1 = rest < 2 ? 0 : 11 - rest;
    if (parseInt(numbers[12]) !== digit1) return false;
    
    sum = 0;
    weight = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 13; i++) sum += parseInt(numbers[i]) * weight[i];
    rest = sum % 11;
    let digit2 = rest < 2 ? 0 : 11 - rest;
    return parseInt(numbers[13]) === digit2;
  };

  // Estado para validação de CPF
  const [cpfValidation, setCpfValidation] = useState<{
    valid: boolean | null;
    checking: boolean;
    message: string;
  }>({ valid: null, checking: false, message: '' });

  // Estado para validação de CNPJ
  const [cnpjValidation, setCnpjValidation] = useState<{
    valid: boolean | null;
    checking: boolean;
    data: any;
  }>({ valid: null, checking: false, data: null });

  // Estado para verificação de vazamentos
  const [emailBreach, setEmailBreach] = useState<{
    checked: boolean;
    breached: boolean | null;
    count: number;
    message: string;
  }>({ checked: false, breached: null, count: 0, message: '' });

  const [passwordBreach, setPasswordBreach] = useState<{
    checked: boolean;
    breached: boolean | null;
    count: number;
    message: string;
  }>({ checked: false, breached: null, count: 0, message: '' });

  // Validar CPF via API REAL
  const validateCPFAPI = async (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return;

    setCpfValidation({ valid: null, checking: true, message: 'Validando CPF...' });

    try {
      const response = await fetch('/api/identity/validate-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfLimpo, nome: form.name })
      });

      const result = await response.json();
      
      setCpfValidation({
        valid: result.valid,
        checking: false,
        message: result.valid 
          ? `✅ CPF válido (${result.provider})`
          : `❌ CPF inválido`
      });

      console.log('📋 Validação CPF:', result);
    } catch (err) {
      setCpfValidation({ valid: null, checking: false, message: 'Erro na validação' });
    }
  };

  // Buscar dados do CNPJ via API REAL (ReceitaWS)
  const fetchCNPJData = async () => {
    const cnpjLimpo = formPJ.cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14 || !validateCNPJ(formPJ.cnpj)) {
      setError("CNPJ inválido");
      return;
    }

    setIsFetchingCNPJ(true);
    setError("");
    setCnpjValidation({ valid: null, checking: true, data: null });
    
    try {
      const response = await fetch('/api/identity/validate-cnpj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj: cnpjLimpo })
      });

      const result = await response.json();
      
      if (result.success && result.valid && result.data) {
        setFormPJ(prev => ({
          ...prev,
          razaoSocial: result.data.razaoSocial || '',
          nomeFantasia: result.data.nomeFantasia || result.data.razaoSocial || '',
        }));
        
        setCnpjValidation({
          valid: true,
          checking: false,
          data: result.data
        });

        console.log('🏢 Dados CNPJ:', result.data);
      } else {
        setError(result.message || "CNPJ não encontrado");
        setCnpjValidation({ valid: false, checking: false, data: null });
      }
    } catch (err) {
      setError("Erro ao buscar CNPJ. Verifique sua conexão.");
      setCnpjValidation({ valid: false, checking: false, data: null });
    } finally {
      setIsFetchingCNPJ(false);
    }
  };

  // Efeito para validar CPF quando completo
  useEffect(() => {
    if (form.cpf.length === 14 && validateCPF(form.cpf)) {
      validateCPFAPI(form.cpf);
    } else {
      setCpfValidation({ valid: null, checking: false, message: '' });
    }
  }, [form.cpf]);

  // Verificar vazamento de email (com debounce)
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailBreach({ checked: false, breached: null, count: 0, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/identity/check-email-breach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email })
        });
        const result = await response.json();
        
        setEmailBreach({
          checked: true,
          breached: result.breached,
          count: result.count || 0,
          message: result.message || ''
        });

        if (result.breached) {
          console.log('⚠️ Email encontrado em vazamentos:', result.count);
        }
      } catch (err) {
        console.error('Erro ao verificar vazamento de email:', err);
      }
    }, 1500); // Aguarda 1.5s após parar de digitar

    return () => clearTimeout(timer);
  }, [form.email]);

  // Verificar vazamento de senha
  const checkPasswordBreach = async (password: string) => {
    if (password.length < 6) {
      setPasswordBreach({ checked: false, breached: null, count: 0, message: '' });
      return;
    }

    try {
      const response = await fetch('/api/identity/check-password-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const result = await response.json();
      
      setPasswordBreach({
        checked: true,
        breached: result.breached,
        count: result.count || 0,
        message: result.message || ''
      });

      if (result.breached) {
        console.log('⚠️ Senha encontrada em vazamentos:', result.count);
      }
    } catch (err) {
      console.error('Erro ao verificar vazamento de senha:', err);
    }
  };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(numbers[i]) * (10 - i);
    let rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(numbers[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(numbers[i]) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    return rest === parseInt(numbers[10]);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  // Câmera - Iniciar
  const startCamera = async () => {
    console.log('📸 Iniciando câmera...');
    setCameraLoading(true);
    setCameraError(null);
    setCameraReady(false);
    
    try {
      // Verificar se está em HTTPS ou localhost (necessário para câmera no iOS)
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        console.warn('⚠️ Câmera requer HTTPS no iOS');
        throw new Error('No iPhone/iPad, a câmera só funciona em sites HTTPS. Acesse via localhost no computador ou use um serviço de túnel HTTPS.');
      }

      // Verificar se o navegador suporta
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera. Tente usar Safari ou Chrome.');
      }

      // Solicitar permissão e acessar câmera frontal
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false
      });
      
      console.log('✅ Stream obtido:', mediaStream.getVideoTracks().length, 'tracks');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Aguardar o vídeo carregar
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Vídeo carregado');
          videoRef.current?.play()
            .then(() => {
              console.log('✅ Vídeo reproduzindo');
              setCameraReady(true);
              setCameraLoading(false);
            })
            .catch(err => {
              console.error('❌ Erro ao reproduzir:', err);
              setCameraError('Erro ao iniciar vídeo');
              setCameraLoading(false);
            });
        };
        
        videoRef.current.onerror = () => {
          console.error('❌ Erro no elemento de vídeo');
          setCameraError('Erro no elemento de vídeo');
          setCameraLoading(false);
        };
      }
    } catch (err: any) {
      console.error('❌ Erro ao acessar câmera:', err);
      
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de câmera negada. Clique no ícone de câmera na barra de endereço para permitir.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'A câmera está em uso por outro aplicativo.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Câmera não suporta as configurações solicitadas.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setCameraError(errorMessage);
      setCameraLoading(false);
    }
  };

  // Câmera - Parar
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraReady(false);
  };

  // Capturar foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    setIsAnalyzing(true);
    
    // Simular análise facial (em produção, usar API real)
    setTimeout(() => {
      setFacialPhoto(imageData);
      setFaceDetected(true);
      setIsAnalyzing(false);
      stopCamera();
    }, 2000);
  };

  // Efeito para parar câmera ao sair da etapa 2 (NÃO inicia automaticamente)
  useEffect(() => {
    // Não inicia automaticamente - usuário precisa clicar
    return () => {
      if (step !== 2) {
        stopCamera();
      }
    };
  }, [step]);

  // Efeito para bloquear cadastro no desktop
  useEffect(() => {
    if (!isMobile && mode === 'register') {
      // Se não é mobile e está tentando cadastrar, volta para escolha/login
      setMode('choose');
      setStep(0);
      setPersonType(null);
    }
  }, [isMobile, mode]);

  // Próxima etapa
  const nextStep = () => {
    if (step < 5) setStep((step + 1) as Step);
  };

  // Etapa anterior
  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  // Finalizar cadastro
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStep(5);
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar indicador de etapas
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
            transition-all duration-500 
            ${step > s ? 'bg-emerald-500 text-white' : 
              step === s ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' : 
              'bg-zinc-800 text-zinc-500'}
          `}>
            {step > s ? <Check className="w-5 h-5" /> : s}
          </div>
          {s < 4 && (
            <div className={`w-12 h-1 mx-1 rounded transition-all duration-500 ${
              step > s ? 'bg-emerald-500' : 'bg-zinc-800'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background com gradiente */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
      
      {/* Container principal */}
      <div className="relative min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          <button 
            onClick={() => {
              if (mode === 'choose') navigate('/');
              else if (mode === 'login') setMode('choose');
              else if (mode === 'register') {
                if (step > 1) {
                  prevStep();
                } else if (step === 1) {
                  setStep(0);
                } else if (step === 0) {
                  setMode('choose');
                  setPersonType(null);
                }
              }
            }}
            className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center hover:bg-zinc-700/50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="font-black text-black text-lg">B</span>
            </div>
            <div>
              <p className="font-bold text-sm">Bil's Cinema</p>
              <p className="text-xs text-zinc-500">Locação Premium</p>
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 px-6 pb-8 flex flex-col">

          {/* ==================== TELA DE ESCOLHA ==================== */}
          {mode === 'choose' && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full animate-fadeIn">
              {/* Logo grande */}
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/20">
                <span className="font-black text-black text-4xl">B</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">Bil's Cinema</h1>
              <p className="text-zinc-400 text-center mb-10">Locação de equipamentos profissionais para cinema e vídeo</p>

              <div className="w-full space-y-4">
                <button
                  onClick={() => setMode('login')}
                  className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Entrar na conta
                </button>
                
                {/* Botão Criar conta - só aparece no mobile */}
                {isMobile && (
                  <button
                    onClick={() => setMode('register')}
                    className="w-full h-14 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 border border-zinc-700"
                  >
                    <FileText className="w-5 h-5" />
                    Criar conta
                  </button>
                )}
              </div>

              <div className="mt-10 flex items-center gap-4 text-zinc-500 text-xs">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>100% Seguro</span>
                </div>
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span>Dados criptografados</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TELA DE LOGIN ==================== */}
          {mode === 'login' && (
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta!</h1>
                <p className="text-zinc-400">Entre na sua conta para continuar</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 flex-1">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center text-sm">
                    {error}
                  </div>
                )}

                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
                    >
                      {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-sm text-zinc-400">Lembrar-me</span>
                  </label>
                  <button type="button" className="text-sm text-amber-400 hover:underline">
                    Esqueci a senha
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Link para criar conta - só aparece no mobile */}
              {isMobile && (
                <div className="mt-6 text-center">
                  <p className="text-zinc-500 text-sm">Ainda não tem conta?</p>
                  <button
                    onClick={() => setMode('register')}
                    className="text-amber-400 font-medium hover:underline"
                  >
                    Criar conta grátis
                  </button>
                </div>
              )}
            </div>
          )}
          
          {mode === 'register' && step > 0 && step < 5 && <StepIndicator />}

          {/* ==================== ETAPA 0: ESCOLHA PF/PJ ==================== */}
          {mode === 'register' && step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Tipo de Conta</h1>
                <p className="text-zinc-400">Selecione o tipo de cadastro</p>
              </div>

              <div className="w-full space-y-4">
                {/* Pessoa Física */}
                <button
                  onClick={() => { setPersonType('pf'); setStep(1); }}
                  className="w-full p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-amber-400 hover:bg-zinc-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                      <User className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">Pessoa Física</h3>
                      <p className="text-zinc-400 text-sm">Profissional autônomo, freelancer</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition" />
                  </div>
                </button>

                {/* Pessoa Jurídica */}
                <button
                  onClick={() => { setPersonType('pj'); setStep(1); }}
                  className="w-full p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-amber-400 hover:bg-zinc-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">Pessoa Jurídica</h3>
                      <p className="text-zinc-400 text-sm">Empresa, produtora, agência</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition" />
                  </div>
                </button>
              </div>

              <p className="text-zinc-500 text-xs text-center mt-8">
                Escolha de acordo com o tipo de documento que você usará para locação
              </p>
            </div>
          )}

          {/* ==================== ETAPA 1: DADOS PESSOAIS (PF) ==================== */}
          {mode === 'register' && step === 1 && personType === 'pf' && (
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Dados Pessoais</h1>
                <p className="text-zinc-400">Preencha suas informações básicas</p>
              </div>

              <div className="space-y-5 flex-1">
                {/* Nome */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                {/* CPF */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">CPF</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => setForm({...form, cpf: formatCPF(e.target.value)})}
                      className="w-full h-14 pl-12 pr-12 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {cpfValidation.checking && (
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      )}
                      {!cpfValidation.checking && cpfValidation.valid === true && (
                        <Check className="w-5 h-5 text-emerald-400" />
                      )}
                      {!cpfValidation.checking && cpfValidation.valid === false && (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                      {!cpfValidation.checking && cpfValidation.valid === null && form.cpf.length === 14 && !validateCPF(form.cpf) && (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                  {cpfValidation.message && (
                    <p className={`text-xs mt-2 ${cpfValidation.valid ? 'text-emerald-400' : cpfValidation.valid === false ? 'text-red-400' : 'text-amber-400'}`}>
                      {cpfValidation.message}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Celular</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: formatPhone(e.target.value)})}
                      className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full h-14 pl-12 pr-12 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="seu@email.com"
                    />
                    {emailBreach.checked && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {emailBreach.breached === false && <Check className="w-5 h-5 text-emerald-400" />}
                        {emailBreach.breached === true && <AlertCircle className="w-5 h-5 text-amber-400" />}
                      </div>
                    )}
                  </div>
                  {emailBreach.checked && emailBreach.breached && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-amber-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Este email foi encontrado em {emailBreach.count} vazamento(s). Recomendamos usar senhas únicas.</span>
                      </p>
                    </div>
                  )}
                  {emailBreach.checked && emailBreach.breached === false && (
                    <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Email não encontrado em vazamentos
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!form.name || !form.cpf || !form.phone || !form.email || !validateCPF(form.cpf)}
                className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ==================== ETAPA 1: DADOS DA EMPRESA (PJ) ==================== */}
          {mode === 'register' && step === 1 && personType === 'pj' && (
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Dados da Empresa</h1>
                <p className="text-zinc-400">Informe os dados da pessoa jurídica</p>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center text-sm">
                    {error}
                  </div>
                )}

                {/* CNPJ */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">CNPJ</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        value={formPJ.cnpj}
                        onChange={(e) => setFormPJ({...formPJ, cnpj: formatCNPJ(e.target.value)})}
                        className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 transition outline-none"
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={fetchCNPJData}
                      disabled={isFetchingCNPJ || formPJ.cnpj.length < 18}
                      className="h-14 px-4 bg-amber-500 text-black font-medium rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      {isFetchingCNPJ ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
                      Buscar
                    </button>
                  </div>
                  {cnpjValidation.valid && cnpjValidation.data && (
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" /> Empresa encontrada via ReceitaWS
                      </p>
                      <p className="text-zinc-300 text-xs mt-1">
                        {cnpjValidation.data.situacao} • {cnpjValidation.data.porte}
                      </p>
                      {cnpjValidation.data.optanteSimples && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                          Optante Simples Nacional
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Razão Social */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Razão Social</label>
                  <input
                    type="text"
                    value={formPJ.razaoSocial}
                    onChange={(e) => setFormPJ({...formPJ, razaoSocial: e.target.value})}
                    className="w-full h-14 px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 transition outline-none"
                    placeholder="Razão social da empresa"
                  />
                </div>

                {/* Nome Fantasia */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formPJ.nomeFantasia}
                    onChange={(e) => setFormPJ({...formPJ, nomeFantasia: e.target.value})}
                    className="w-full h-14 px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 transition outline-none"
                    placeholder="Nome fantasia (opcional)"
                  />
                </div>

                {/* Divisor */}
                <div className="border-t border-zinc-800 pt-4 mt-4">
                  <p className="text-sm text-amber-400 font-medium mb-4">Representante Legal</p>
                </div>

                {/* Nome do Responsável */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={formPJ.responsavelNome}
                      onChange={(e) => setFormPJ({...formPJ, responsavelNome: e.target.value})}
                      className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 transition outline-none"
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                {/* CPF do Responsável */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">CPF do Responsável</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={formPJ.responsavelCpf}
                      onChange={(e) => setFormPJ({...formPJ, responsavelCpf: formatCPF(e.target.value)})}
                      className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 transition outline-none"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                </div>

                {/* Telefone e Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="text-sm text-zinc-400 mb-2 block">Telefone</label>
                    <input
                      type="text"
                      value={formPJ.phone}
                      onChange={(e) => setFormPJ({...formPJ, phone: formatPhone(e.target.value)})}
                      className="w-full h-14 px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 transition outline-none text-sm"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                  <div className="group">
                    <label className="text-sm text-zinc-400 mb-2 block">Email</label>
                    <input
                      type="email"
                      value={formPJ.email}
                      onChange={(e) => setFormPJ({...formPJ, email: e.target.value})}
                      className="w-full h-14 px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 transition outline-none text-sm"
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!formPJ.cnpj || !formPJ.razaoSocial || !formPJ.responsavelNome || !formPJ.responsavelCpf || !formPJ.email}
                className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ==================== ETAPA 2: RECONHECIMENTO FACIAL ==================== */}
          {mode === 'register' && step === 2 && (personType === 'pf' || personType === 'pj') && (
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Scan className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Verificação Facial</h1>
                <p className="text-zinc-400">Posicione seu rosto na área indicada</p>
              </div>

              {/* Área da câmera */}
              <div className="relative aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden mb-6 border border-zinc-800">
                {!facialPhoto ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    
                    {/* Tela inicial - antes de iniciar câmera */}
                    {!cameraReady && !cameraLoading && !cameraError && (
                      <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                          <Camera className="w-10 h-10 text-purple-400" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">Tirar Selfie</p>
                        <p className="text-zinc-400 text-sm mb-6">
                          Clique no botão para tirar uma foto do seu rosto
                        </p>
                        
                        {/* Usar câmera nativa do celular (funciona em HTTP) */}
                        <label className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition flex items-center gap-3 cursor-pointer">
                          <Camera className="w-6 h-6" />
                          Abrir Câmera
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setFacialPhoto(event.target?.result as string);
                                  setFaceDetected(true);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <p className="text-zinc-500 text-xs mt-4">
                          📸 A câmera frontal será aberta automaticamente
                        </p>
                      </div>
                    )}

                    {/* Loading da câmera */}
                    {cameraLoading && (
                      <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                        <p className="text-zinc-300 font-medium">Iniciando câmera...</p>
                        <p className="text-amber-400 text-sm mt-2">📱 Permita o acesso à câmera</p>
                        <p className="text-zinc-500 text-xs mt-4">Se não aparecer, verifique as configurações do navegador</p>
                      </div>
                    )}

                    {/* Erro da câmera - usa câmera nativa do celular como alternativa */}
                    {cameraError && !cameraLoading && (
                      <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                          <Camera className="w-10 h-10 text-purple-400" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">Tirar Selfie</p>
                        <p className="text-zinc-400 text-sm mb-6">
                          Clique no botão abaixo para abrir a câmera frontal
                        </p>
                        
                        {/* Input com capture="user" abre câmera frontal nativa */}
                        <label className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition flex items-center justify-center gap-3 cursor-pointer">
                          <Camera className="w-6 h-6" />
                          Abrir Câmera
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setFacialPhoto(event.target?.result as string);
                                  setFaceDetected(true);
                                  setCameraError(null);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <p className="text-zinc-500 text-xs mt-4">
                          📸 Será aberta a câmera frontal do seu celular
                        </p>
                      </div>
                    )}

                    {/* Overlay com guia - só mostra se câmera pronta */}
                    {cameraReady && !cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Moldura facial */}
                        <div className={`w-56 h-72 border-4 rounded-full transition-colors duration-300 ${
                          isAnalyzing ? 'border-amber-400 animate-pulse' : 'border-white/30'
                        }`}>
                          {/* Cantos animados */}
                          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />
                        </div>
                      </div>
                    )}

                    {/* Status - câmera pronta */}
                    {cameraReady && !isAnalyzing && !cameraError && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-emerald-500/90 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-white">Câmera pronta</span>
                      </div>
                    )}

                    {/* Analisando */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
                        <p className="text-amber-400 font-medium">Analisando biometria...</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0">
                    <img
                      src={facialPhoto}
                      alt="Foto capturada"
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <div className="bg-emerald-500 rounded-full p-4">
                        <Check className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Botões */}
              {!facialPhoto ? (
                <div className="space-y-3">
                  {/* Só mostra botão de capturar se câmera estiver pronta */}
                  {cameraReady && (
                    <button
                      onClick={capturePhoto}
                      disabled={!cameraReady || isAnalyzing}
                      className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      <Camera className="w-5 h-5" />
                      Tirar Foto
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => { setFacialPhoto(null); setFaceDetected(false); startCamera(); }}
                    className="w-full h-12 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition"
                  >
                    Tirar outra foto
                  </button>
                  <button
                    onClick={nextStep}
                    className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    Continuar
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Info de segurança */}
              <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs mt-4">
                <Shield className="w-4 h-4" />
                <span>Dados criptografados e protegidos</span>
              </div>
            </div>
          )}

          {/* ==================== ETAPA 3: CRIAR SENHA ==================== */}
          {mode === 'register' && step === 3 && (
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Crie sua Senha</h1>
                <p className="text-zinc-400">Uma senha forte protege sua conta</p>
              </div>

              <div className="space-y-5 flex-1">
                {/* Senha */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => {
                        setForm({...form, password: e.target.value});
                        checkPasswordStrength(e.target.value);
                      }}
                      onBlur={(e) => {
                        // Verificar vazamento quando sair do campo
                        if (e.target.value.length >= 6) {
                          checkPasswordBreach(e.target.value);
                        }
                      }}
                      className="w-full h-14 pl-12 pr-12 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Barra de força */}
                  {form.password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              passwordStrength >= level
                                ? passwordStrength <= 2 ? 'bg-red-500'
                                : passwordStrength <= 3 ? 'bg-amber-500'
                                : 'bg-emerald-500'
                                : 'bg-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        passwordStrength <= 2 ? 'text-red-400'
                        : passwordStrength <= 3 ? 'text-amber-400'
                        : 'text-emerald-400'
                      }`}>
                        {passwordStrength <= 2 ? 'Senha fraca' : passwordStrength <= 3 ? 'Senha média' : 'Senha forte'}
                      </p>
                    </div>
                  )}

                  {/* Alerta de vazamento de senha */}
                  {passwordBreach.checked && passwordBreach.breached && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>⚠️ ATENÇÃO:</strong> Esta senha apareceu {passwordBreach.count.toLocaleString('pt-BR')} vezes em vazamentos de dados! 
                          Recomendamos escolher uma senha diferente.
                        </span>
                      </p>
                    </div>
                  )}
                  {passwordBreach.checked && passwordBreach.breached === false && (
                    <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Senha não encontrada em vazamentos conhecidos
                    </p>
                  )}
                </div>

                {/* Confirmar senha */}
                <div className="group">
                  <label className="text-sm text-zinc-400 mb-2 block">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition" />
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                      className="w-full h-14 pl-12 pr-12 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="Repita a senha"
                    />
                    {form.confirmPassword && (
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                        form.password === form.confirmPassword ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {form.password === form.confirmPassword ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Requisitos */}
                <div className="bg-zinc-900/50 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-zinc-400 mb-3">Sua senha deve conter:</p>
                  {[
                    { check: form.password.length >= 8, text: 'Mínimo 8 caracteres' },
                    { check: /[a-z]/.test(form.password), text: 'Uma letra minúscula' },
                    { check: /[A-Z]/.test(form.password), text: 'Uma letra maiúscula' },
                    { check: /[0-9]/.test(form.password), text: 'Um número' },
                    { check: /[^a-zA-Z0-9]/.test(form.password), text: 'Um caractere especial' },
                  ].map((req, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${req.check ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      <Check className={`w-4 h-4 ${req.check ? 'opacity-100' : 'opacity-30'}`} />
                      <span>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={form.password.length < 8 || form.password !== form.confirmPassword || passwordStrength < 3}
                className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ==================== ETAPA 4: DOCUMENTOS E TERMOS ==================== */}
          {mode === 'register' && step === 4 && (
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Documentação</h1>
                <p className="text-zinc-400">Envie seus documentos para validação</p>
              </div>

              <div className="space-y-4 flex-1">
                {/* Upload documento */}
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                  <p className="font-medium mb-3">Documento com foto</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {['RG', 'CNH', 'Gov.br'].map((doc) => (
                      <button
                        key={doc}
                        onClick={() => setForm({...form, documentType: doc})}
                        className={`p-3 rounded-lg border text-sm font-medium transition ${
                          form.documentType === doc
                            ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {doc}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center justify-center gap-2 h-12 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-400 text-sm">
                      {form.documentFile ? form.documentFile.name : 'Enviar arquivo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setForm({...form, documentFile: e.target.files?.[0] || null})}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Comprovante de endereço */}
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                  <p className="font-medium mb-3">Comprovante de endereço</p>
                  <p className="text-zinc-500 text-xs mb-3">Conta de luz, água ou extrato bancário (últimos 3 meses)</p>
                  <label className="flex items-center justify-center gap-2 h-12 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-400 text-sm">
                      {form.addressProof ? form.addressProof.name : 'Enviar arquivo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setForm({...form, addressProof: e.target.files?.[0] || null})}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Termos */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl cursor-pointer border border-zinc-800 hover:border-zinc-700 transition">
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={(e) => setForm({...form, agreeTerms: e.target.checked})}
                      className="mt-1 w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-sm text-zinc-400">
                      Li e aceito os <a href="#" className="text-amber-400 underline">Termos de Uso</a> e{' '}
                      <a href="#" className="text-amber-400 underline">Contrato de Locação</a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl cursor-pointer border border-zinc-800 hover:border-zinc-700 transition">
                    <input
                      type="checkbox"
                      checked={form.agreePrivacy}
                      onChange={(e) => setForm({...form, agreePrivacy: e.target.checked})}
                      className="mt-1 w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-sm text-zinc-400">
                      Concordo com a <a href="#" className="text-amber-400 underline">Política de Privacidade</a> e uso de dados biométricos
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.agreeTerms || !form.agreePrivacy || isLoading}
                className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Finalizar Cadastro
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ==================== ETAPA 5: SUCESSO ==================== */}
          {mode === 'register' && step === 5 && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full animate-fadeIn text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Check className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold mb-3">Conta Criada!</h1>
              <p className="text-zinc-400 text-lg mb-2">Bem-vindo à Bil's Cinema</p>
              <p className="text-zinc-500 text-sm mb-8">
                Seus documentos estão em análise.<br />
                Você receberá um email quando aprovado.
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                >
                  Fazer Login
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full h-12 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer segurança */}
        {(mode === 'register' && step < 5) && (
          <footer className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-600 text-xs">
              <Lock className="w-3 h-3" />
              <span>Conexão segura • Dados criptografados</span>
            </div>
          </footer>
        )}
      </div>

      {/* CSS para animação */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

