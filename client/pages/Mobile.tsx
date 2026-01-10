import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  MapPin,
  Calendar,
  Share2,
  Fingerprint,
  Scan,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Sun,
  Moon,
  Volume2,
  Vibrate,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  User,
  Lock,
  Unlock,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Home,
  QrCode,
  Image,
  Video,
  Mic,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Zap,
  Shield,
  Cpu,
  HardDrive,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

// Tipos
interface DeviceCapabilities {
  camera: boolean;
  geolocation: boolean;
  biometrics: boolean;
  notifications: boolean;
  share: boolean;
  vibration: boolean;
  battery: boolean;
  storage: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

interface BatteryInfo {
  level: number;
  charging: boolean;
}

export default function Mobile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    camera: false,
    geolocation: false,
    biometrics: false,
    notifications: false,
    share: false,
    vibration: false,
    battery: false,
    storage: false
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [battery, setBattery] = useState<BatteryInfo | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Biometrics
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Modais
  const [showCamera, setShowCamera] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Detectar capacidades do dispositivo
  useEffect(() => {
    const detectCapabilities = async () => {
      const caps: DeviceCapabilities = {
        camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        geolocation: !!navigator.geolocation,
        biometrics: !!(window.PublicKeyCredential),
        notifications: !!('Notification' in window),
        share: !!navigator.share,
        vibration: !!navigator.vibrate,
        battery: !!('getBattery' in navigator),
        storage: !!('storage' in navigator && 'estimate' in navigator.storage)
      };
      
      setCapabilities(caps);
      
      // Verificar suporte a biometria (WebAuthn)
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricsSupported(available);
        } catch (e) {
          setBiometricsSupported(false);
        }
      }
      
      // Obter info da bateria
      if ('getBattery' in navigator) {
        try {
          const batteryManager = await (navigator as any).getBattery();
          setBattery({
            level: batteryManager.level * 100,
            charging: batteryManager.charging
          });
          
          batteryManager.addEventListener('levelchange', () => {
            setBattery({
              level: batteryManager.level * 100,
              charging: batteryManager.charging
            });
          });
          
          batteryManager.addEventListener('chargingchange', () => {
            setBattery({
              level: batteryManager.level * 100,
              charging: batteryManager.charging
            });
          });
        } catch (e) {
          console.log('Bateria não disponível');
        }
      }
      
      setLoading(false);
    };
    
    detectCapabilities();
    
    // Monitorar conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar ação da URL
    const action = searchParams.get('action');
    if (action === 'scan') {
      setShowCamera(true);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [searchParams]);

  // Funções de Câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      
      setCameraStream(stream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      toast({
        title: "Erro ao acessar câmera",
        description: error.message || "Permissão negada ou câmera não disponível",
        variant: "destructive"
      });
    }
  };
  
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        // Vibrar como feedback
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        
        toast({
          title: "Foto capturada!",
          description: "Imagem salva com sucesso",
        });
      }
    }
  };
  
  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 100);
  };

  // Funções de Geolocalização
  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS não disponível",
        description: "Seu dispositivo não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }
    
    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };
        
        // Tentar obter endereço (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`
          );
          const data = await response.json();
          loc.address = data.display_name;
        } catch (e) {
          console.log('Não foi possível obter endereço');
        }
        
        setLocation(loc);
        setLocationLoading(false);
        setShowLocation(true);
        
        toast({
          title: "Localização obtida!",
          description: `Precisão: ${Math.round(loc.accuracy)}m`,
        });
      },
      (error) => {
        setLocationLoading(false);
        toast({
          title: "Erro ao obter localização",
          description: error.message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Funções de Autenticação Biométrica
  const authenticateWithBiometrics = async () => {
    if (!biometricsSupported) {
      toast({
        title: "Biometria não disponível",
        description: "Seu dispositivo não suporta autenticação biométrica",
        variant: "destructive"
      });
      return;
    }
    
    setAuthLoading(true);
    
    try {
      // Criar challenge aleatório
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      // Configuração para autenticação
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname
      };
      
      // Tentar autenticar
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });
      
      if (credential) {
        setAuthenticated(true);
        
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        
        toast({
          title: "Autenticado com sucesso!",
          description: "Biometria verificada",
        });
      }
    } catch (error: any) {
      // Se não há credencial registrada, registrar uma nova
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Autenticação cancelada",
          description: "Tente novamente",
          variant: "destructive"
        });
      } else {
        // Tentar registro simples para demonstração
        try {
          await registerBiometricCredential();
        } catch (regError) {
          toast({
            title: "Erro na biometria",
            description: "Não foi possível autenticar",
            variant: "destructive"
          });
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };
  
  const registerBiometricCredential = async () => {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);
    
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "Bil's Cinema e Vídeo",
        id: window.location.hostname
      },
      user: {
        id: userId,
        name: "felipe@empresa.com",
        displayName: "Felipe"
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "none"
    };
    
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
    
    if (credential) {
      setAuthenticated(true);
      toast({
        title: "Biometria registrada!",
        description: "Você pode usar Face ID/Touch ID agora",
      });
    }
  };

  // Função de Compartilhamento
  const shareContent = async () => {
    if (!navigator.share) {
      toast({
        title: "Compartilhamento não disponível",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await navigator.share({
        title: "Bil's Cinema e Vídeo",
        text: "Confira nossos equipamentos para locação!",
        url: window.location.origin
      });
      
      toast({
        title: "Compartilhado!",
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: "Erro ao compartilhar",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  // Função de Notificações
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notificações não suportadas",
        variant: "destructive"
      });
      return;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      new Notification('Bil\'s Cinema e Vídeo', {
        body: 'Notificações ativadas com sucesso!',
        icon: '/icon-192.png'
      });
      
      toast({
        title: "Notificações ativadas!",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Ative nas configurações do navegador",
        variant: "destructive"
      });
    }
  };

  // Abrir calendário nativo
  const openCalendar = () => {
    const event = {
      title: 'Devolução de Equipamento',
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString()
    };
    
    // Criar URL do calendário (funciona em iOS e Android)
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.replace(/[-:]/g, '').split('.')[0]}Z/${event.end.replace(/[-:]/g, '').split('.')[0]}Z`;
    
    window.open(calendarUrl, '_blank');
    
    toast({
      title: "Abrindo calendário...",
    });
  };

  // Vibrar dispositivo
  const vibrateDevice = (pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto" />
          <p className="text-slate-300">Detectando recursos do dispositivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Acesso Mobile</h1>
                <p className="text-xs text-slate-400">Controle do dispositivo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status de Conexão */}
              {isOnline ? (
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500/50 text-red-400">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
              
              {/* Bateria */}
              {battery && (
                <Badge variant="outline" className={`${battery.level > 20 ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
                  {battery.charging ? (
                    <BatteryCharging className="h-3 w-3 mr-1" />
                  ) : (
                    <Battery className="h-3 w-3 mr-1" />
                  )}
                  {Math.round(battery.level)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Status de Autenticação */}
        <Card className={`${authenticated ? 'bg-green-950/30 border-green-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${authenticated ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                  {authenticated ? (
                    <Unlock className="h-6 w-6 text-green-400" />
                  ) : (
                    <Lock className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {authenticated ? 'Autenticado' : 'Não autenticado'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {authenticated ? 'Acesso completo liberado' : 'Use biometria para desbloquear'}
                  </p>
                </div>
              </div>
              
              {biometricsSupported && !authenticated && (
                <Button
                  onClick={authenticateWithBiometrics}
                  disabled={authLoading}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {authLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Fingerprint className="h-4 w-4 mr-2" />
                  )}
                  {authLoading ? 'Verificando...' : 'Usar Biometria'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grid de Recursos */}
        <div className="grid grid-cols-2 gap-4">
          {/* Câmera */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-[1.02] ${
              capabilities.camera 
                ? 'bg-blue-950/30 border-blue-500/50 hover:bg-blue-950/50' 
                : 'bg-slate-800/30 border-slate-700 opacity-50'
            }`}
            onClick={() => capabilities.camera && setShowCamera(true)}
          >
            <CardContent className="pt-6 text-center">
              <div className={`p-4 rounded-xl mx-auto w-fit mb-3 ${capabilities.camera ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
                <Camera className={`h-8 w-8 ${capabilities.camera ? 'text-blue-400' : 'text-slate-500'}`} />
              </div>
              <p className="font-medium">Câmera</p>
              <p className="text-xs text-slate-400 mt-1">
                {capabilities.camera ? 'Disponível' : 'Não disponível'}
              </p>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-[1.02] ${
              capabilities.geolocation 
                ? 'bg-green-950/30 border-green-500/50 hover:bg-green-950/50' 
                : 'bg-slate-800/30 border-slate-700 opacity-50'
            }`}
            onClick={() => capabilities.geolocation && getLocation()}
          >
            <CardContent className="pt-6 text-center">
              <div className={`p-4 rounded-xl mx-auto w-fit mb-3 ${capabilities.geolocation ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                {locationLoading ? (
                  <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
                ) : (
                  <MapPin className={`h-8 w-8 ${capabilities.geolocation ? 'text-green-400' : 'text-slate-500'}`} />
                )}
              </div>
              <p className="font-medium">Localização</p>
              <p className="text-xs text-slate-400 mt-1">
                {locationLoading ? 'Obtendo...' : capabilities.geolocation ? 'GPS Ativo' : 'Não disponível'}
              </p>
            </CardContent>
          </Card>

          {/* Calendário */}
          <Card 
            className="cursor-pointer transition-all hover:scale-[1.02] bg-purple-950/30 border-purple-500/50 hover:bg-purple-950/50"
            onClick={openCalendar}
          >
            <CardContent className="pt-6 text-center">
              <div className="p-4 rounded-xl mx-auto w-fit mb-3 bg-purple-500/20">
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
              <p className="font-medium">Calendário</p>
              <p className="text-xs text-slate-400 mt-1">Agendar eventos</p>
            </CardContent>
          </Card>

          {/* Compartilhar */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-[1.02] ${
              capabilities.share 
                ? 'bg-cyan-950/30 border-cyan-500/50 hover:bg-cyan-950/50' 
                : 'bg-slate-800/30 border-slate-700 opacity-50'
            }`}
            onClick={() => capabilities.share && shareContent()}
          >
            <CardContent className="pt-6 text-center">
              <div className={`p-4 rounded-xl mx-auto w-fit mb-3 ${capabilities.share ? 'bg-cyan-500/20' : 'bg-slate-700'}`}>
                <Share2 className={`h-8 w-8 ${capabilities.share ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <p className="font-medium">Compartilhar</p>
              <p className="text-xs text-slate-400 mt-1">
                {capabilities.share ? 'Disponível' : 'Não disponível'}
              </p>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-[1.02] ${
              capabilities.notifications 
                ? 'bg-amber-950/30 border-amber-500/50 hover:bg-amber-950/50' 
                : 'bg-slate-800/30 border-slate-700 opacity-50'
            }`}
            onClick={() => capabilities.notifications && requestNotificationPermission()}
          >
            <CardContent className="pt-6 text-center">
              <div className={`p-4 rounded-xl mx-auto w-fit mb-3 ${capabilities.notifications ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                <Bell className={`h-8 w-8 ${capabilities.notifications ? 'text-amber-400' : 'text-slate-500'}`} />
              </div>
              <p className="font-medium">Notificações</p>
              <p className="text-xs text-slate-400 mt-1">
                {capabilities.notifications ? 'Ativar alertas' : 'Não disponível'}
              </p>
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          <Card 
            className="cursor-pointer transition-all hover:scale-[1.02] bg-rose-950/30 border-rose-500/50 hover:bg-rose-950/50"
            onClick={() => navigate('/diagnostico')}
          >
            <CardContent className="pt-6 text-center">
              <div className="p-4 rounded-xl mx-auto w-fit mb-3 bg-rose-500/20">
                <Activity className="h-8 w-8 text-rose-400" />
              </div>
              <p className="font-medium">Diagnóstico</p>
              <p className="text-xs text-slate-400 mt-1">Monitorar sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Capacidades do Dispositivo */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              Capacidades do Dispositivo
            </CardTitle>
            <CardDescription>Recursos disponíveis no seu dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(capabilities).map(([key, available]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-sm capitalize">{key}</span>
                  {available ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-sm">Face ID / Touch ID</span>
                {biometricsSupported ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between border-slate-600 hover:bg-slate-700"
              onClick={() => navigate('/equipamentos')}
            >
              <span className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Ver Equipamentos
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between border-slate-600 hover:bg-slate-700"
              onClick={() => navigate('/pedidos')}
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Meus Pedidos
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between border-slate-600 hover:bg-slate-700"
              onClick={() => vibrateDevice([100, 50, 100, 50, 100])}
            >
              <span className="flex items-center gap-2">
                <Vibrate className="h-4 w-4" />
                Testar Vibração
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Modal da Câmera */}
      <Dialog open={showCamera} onOpenChange={(open) => {
        setShowCamera(open);
        if (!open) stopCamera();
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-400" />
              Câmera
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!cameraActive ? (
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Iniciar Câmera
                </Button>
              </div>
            ) : (
              <>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={switchCamera} className="border-slate-600">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={capturePhoto} 
                    className="bg-blue-600 hover:bg-blue-700 w-16 h-16 rounded-full"
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                  <Button variant="destructive" onClick={stopCamera}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            
            {capturedImage && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Última foto capturada:</p>
                <img 
                  src={capturedImage} 
                  alt="Captura" 
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Localização */}
      <Dialog open={showLocation} onOpenChange={setShowLocation}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-400" />
              Sua Localização
            </DialogTitle>
          </DialogHeader>
          
          {location && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Latitude:</span>
                  <span className="font-mono">{location.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Longitude:</span>
                  <span className="font-mono">{location.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Precisão:</span>
                  <span>{Math.round(location.accuracy)}m</span>
                </div>
              </div>
              
              {location.address && (
                <div className="p-4 bg-green-950/30 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400 mb-1">Endereço aproximado:</p>
                  <p className="text-sm">{location.address}</p>
                </div>
              )}
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Abrir no Google Maps
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 safe-area-inset-bottom">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button 
              onClick={() => navigate('/')}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Início</span>
            </button>
            <button 
              onClick={() => setShowCamera(true)}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Scan className="h-5 w-5" />
              <span className="text-xs">Escanear</span>
            </button>
            <button 
              onClick={() => navigate('/mobile')}
              className="flex flex-col items-center gap-1 text-amber-400"
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Mobile</span>
            </button>
            <button 
              onClick={() => navigate('/area-cliente')}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Conta</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

