import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  MapPin,
  Calendar,
  Fingerprint,
  Smartphone,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Share2,
  Download,
  Settings,
  User,
  Lock,
  Unlock,
  Video,
  Image,
  Map,
  Navigation,
  Clock,
  Bell,
  Shield,
  Scan,
  QrCode,
  SwitchCamera,
  X,
  ChevronRight,
  Home,
  Eye,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/use-camera";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useBiometric } from "@/hooks/use-biometric";
import { useCalendar } from "@/hooks/use-calendar";

// Detectar dispositivo
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid;
  
  let deviceName = 'Dispositivo';
  if (isIOS) {
    if (ua.includes('iPhone')) deviceName = 'iPhone';
    else if (ua.includes('iPad')) deviceName = 'iPad';
  } else if (isAndroid) {
    deviceName = 'Android';
  }

  return { isIOS, isAndroid, isMobile, deviceName };
};

export default function MobileAccess() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showCamera, setShowCamera] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userName, setUserName] = useState('Felipe');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const deviceInfo = getDeviceInfo();

  // Hooks de recursos do dispositivo
  const camera = useCamera({ facingMode: 'environment' });
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  const biometric = useBiometric();
  const calendar = useCalendar();

  // Monitorar conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar disponibilidade de biometria
  useEffect(() => {
    biometric.checkAvailability();
  }, []);

  // Carregar eventos salvos
  useEffect(() => {
    calendar.loadEvents();
  }, []);

  // Iniciar câmera
  const handleStartCamera = async () => {
    setShowCamera(true);
    const stream = await camera.startCamera();
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  // Capturar foto
  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const image = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(image);
        camera.stopCamera();
        setShowCamera(false);
        toast({
          title: "Foto capturada!",
          description: "A imagem foi salva com sucesso.",
        });
      }
    }
  };

  // Fechar câmera
  const handleCloseCamera = () => {
    camera.stopCamera();
    setShowCamera(false);
  };

  // Trocar câmera
  const handleSwitchCamera = async () => {
    await camera.switchCamera();
    if (camera.stream && videoRef.current) {
      videoRef.current.srcObject = camera.stream;
    }
  };

  // Obter localização
  const handleGetLocation = async () => {
    const position = await geolocation.getCurrentPosition();
    if (position) {
      toast({
        title: "Localização obtida!",
        description: `Lat: ${position.latitude.toFixed(6)}, Long: ${position.longitude.toFixed(6)}`,
      });
    }
  };

  // Autenticar com biometria
  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    
    // Verificar se tem credenciais salvas
    if (!biometric.hasCredentials(userName)) {
      // Registrar nova credencial
      const result = await biometric.register(userName, userName);
      if (result) {
        setIsLoggedIn(true);
        toast({
          title: "Biometria registrada!",
          description: "Você pode usar sua biometria para entrar.",
        });
      }
    } else {
      // Autenticar
      const success = await biometric.authenticate(userName);
      if (success) {
        setIsLoggedIn(true);
        toast({
          title: "Autenticado!",
          description: "Bem-vindo de volta!",
        });
      }
    }
    
    setIsAuthenticating(false);
  };

  // Adicionar ao calendário
  const handleAddToCalendar = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Amanhã
    startDate.setHours(10, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(18, 0, 0, 0);
    
    calendar.createRentalEvent(
      'Locação de Equipamento',
      startDate,
      endDate,
      'Bil\'s Cinema e Vídeo'
    );
    
    toast({
      title: "Evento criado!",
      description: "O evento foi adicionado ao seu calendário.",
    });
  };

  // Compartilhar aplicativo
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bil's Cinema e Vídeo",
          text: "Confira o sistema de locação de equipamentos",
          url: window.location.origin
        });
      } catch (e) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback: copiar link
      await navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  // Status de cada recurso
  const features = [
    {
      name: 'Câmera',
      icon: Camera,
      available: camera.isSupported,
      status: camera.hasPermission === true ? 'permitido' : camera.hasPermission === false ? 'negado' : 'pendente',
      color: camera.hasPermission ? 'text-green-500' : 'text-yellow-500'
    },
    {
      name: 'Localização',
      icon: MapPin,
      available: geolocation.isSupported,
      status: geolocation.hasPermission === true ? 'permitido' : geolocation.hasPermission === false ? 'negado' : 'pendente',
      color: geolocation.hasPermission ? 'text-green-500' : 'text-yellow-500'
    },
    {
      name: 'Biometria',
      icon: Fingerprint,
      available: biometric.isAvailable,
      status: biometric.isAvailable ? `${biometric.supportedTypes.join(', ')}` : 'não disponível',
      color: biometric.isAvailable ? 'text-green-500' : 'text-gray-500'
    },
    {
      name: 'Calendário',
      icon: Calendar,
      available: true,
      status: 'disponível',
      color: 'text-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 safe-area-top">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Acesso Mobile</h1>
                <p className="text-xs text-slate-400">{deviceInfo.deviceName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Card de Login/Usuário */}
        <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isLoggedIn ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                  {isLoggedIn ? (
                    <Unlock className="h-8 w-8 text-green-400" />
                  ) : (
                    <Lock className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {isLoggedIn ? `Olá, ${userName}!` : 'Não autenticado'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isLoggedIn ? 'Acesso completo liberado' : 'Use biometria para entrar'}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleBiometricAuth}
                disabled={isAuthenticating || !biometric.isAvailable}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {isAuthenticating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Fingerprint className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {biometric.isAvailable && (
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-300">
                <Shield className="h-4 w-4" />
                {biometric.supportedTypes.join(' / ')} disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status dos Recursos */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-cyan-400" />
              Recursos do Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => (
                <div 
                  key={feature.name}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{feature.name}</p>
                    <p className="text-xs text-slate-400 truncate">{feature.status}</p>
                  </div>
                  {feature.available ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Câmera */}
          <Card 
            className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={handleStartCamera}
          >
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-blue-500/20 rounded-full w-fit mx-auto mb-3">
                <Camera className="h-8 w-8 text-blue-400" />
              </div>
              <p className="font-medium">Câmera</p>
              <p className="text-xs text-slate-400">Tirar foto / Escanear</p>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card 
            className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={handleGetLocation}
          >
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-green-500/20 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-green-400" />
              </div>
              <p className="font-medium">Localização</p>
              <p className="text-xs text-slate-400">
                {geolocation.position 
                  ? `${geolocation.position.latitude.toFixed(4)}, ${geolocation.position.longitude.toFixed(4)}`
                  : 'Obter posição GPS'
                }
              </p>
            </CardContent>
          </Card>

          {/* Calendário */}
          <Card 
            className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={handleAddToCalendar}
          >
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-purple-500/20 rounded-full w-fit mx-auto mb-3">
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
              <p className="font-medium">Calendário</p>
              <p className="text-xs text-slate-400">Adicionar evento</p>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card 
            className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={handleStartCamera}
          >
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-amber-500/20 rounded-full w-fit mx-auto mb-3">
                <QrCode className="h-8 w-8 text-amber-400" />
              </div>
              <p className="font-medium">Escanear QR</p>
              <p className="text-xs text-slate-400">Ler código de equipamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Localização */}
        {geolocation.position && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Map className="h-5 w-5 text-green-400" />
                Sua Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Latitude</p>
                    <p className="font-mono">{geolocation.position.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Longitude</p>
                    <p className="font-mono">{geolocation.position.longitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Precisão</p>
                    <p>{Math.round(geolocation.position.accuracy)}m</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Atualizado</p>
                    <p>{new Date(geolocation.position.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => geolocation.openInMaps()}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Abrir no Maps
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Imagem Capturada */}
        {capturedImage && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-blue-400" />
                  Foto Capturada
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCapturedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={capturedImage} 
                alt="Captura" 
                className="w-full rounded-lg"
              />
              <div className="flex gap-2 mt-4">
                <Button className="flex-1" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button className="flex-1" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Dispositivo */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-slate-400" />
              Informações do Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Tipo</span>
                <span>{deviceInfo.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sistema</span>
                <span>{deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Desktop'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tela</span>
                <span>{window.screen.width} x {window.screen.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conexão</span>
                <Badge variant={isOnline ? 'default' : 'destructive'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal de Câmera */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="bg-black border-slate-700 p-0 max-w-lg">
          <div className="relative">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className="w-full aspect-[4/3] object-cover rounded-t-lg"
            />
            
            {/* Overlay com controles */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseCamera}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
                
                <Button
                  onClick={handleTakePhoto}
                  className="h-16 w-16 rounded-full bg-white hover:bg-gray-200"
                >
                  <div className="h-12 w-12 rounded-full border-4 border-black" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSwitchCamera}
                  className="text-white hover:bg-white/20"
                >
                  <SwitchCamera className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            {camera.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center p-4">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-white">{camera.error}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 safe-area-bottom z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <a href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
              <Home className="h-5 w-5" />
              <span className="text-xs">Início</span>
            </a>
            <a href="/equipamentos" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
              <Video className="h-5 w-5" />
              <span className="text-xs">Equipamentos</span>
            </a>
            <a href="/mobile" className="flex flex-col items-center gap-1 text-amber-400">
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Mobile</span>
            </a>
            <a href="/diagnostico" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
              <Settings className="h-5 w-5" />
              <span className="text-xs">Sistema</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

