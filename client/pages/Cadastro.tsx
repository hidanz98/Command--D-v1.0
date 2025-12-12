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

// Tipos
type Step = 1 | 2 | 3 | 4 | 5;

export default function Cadastro() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Estados
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Câmera
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Formulário
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
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validações
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
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
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

  // Efeito para iniciar câmera na etapa 2
  useEffect(() => {
    if (step === 2 && !facialPhoto) {
      startCamera();
    }
    return () => {
      if (step !== 2) stopCamera();
    };
  }, [step]);

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
            onClick={() => step > 1 ? prevStep() : navigate('/login')}
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
          
          {step < 5 && <StepIndicator />}

          {/* ==================== ETAPA 1: DADOS PESSOAIS ==================== */}
          {step === 1 && (
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
                      className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {form.cpf.length === 14 && (
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${validateCPF(form.cpf) ? 'text-emerald-400' : 'text-red-400'}`}>
                        {validateCPF(form.cpf) ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </div>
                    )}
                  </div>
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
                      className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
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

          {/* ==================== ETAPA 2: RECONHECIMENTO FACIAL ==================== */}
          {step === 2 && (
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
                    
                    {/* Overlay com guia */}
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

                    {/* Status */}
                    {cameraReady && !isAnalyzing && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-emerald-500/90 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Câmera pronta</span>
                      </div>
                    )}

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
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady || isAnalyzing}
                  className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  Capturar Foto
                </button>
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
          {step === 3 && (
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
          {step === 4 && (
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
          {step === 5 && (
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
        {step < 5 && (
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

