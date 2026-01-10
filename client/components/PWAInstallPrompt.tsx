import { useEffect, useState } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/use-device-detection';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const device = useDeviceDetection();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detectar iOS e dispositivos móveis pelo user agent
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobileUserAgent = isIOS || isAndroid || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    // REGRA PRINCIPAL: NÃO mostrar em desktop/PC de forma alguma
    // Desktop = largura >= 1024px E não é dispositivo móvel pelo user agent
    const isDesktopScreen = window.innerWidth >= 1024;
    if (isDesktopScreen && !isMobileUserAgent) {
      // É um PC/Desktop - não mostrar
      return;
    }

    // Não mostrar se já estiver instalado
    if (isInstalled || isStandalone) {
      return;
    }

    // Só mostrar em dispositivos móveis (verificar pelo user agent)
    if (!isMobileUserAgent) {
      return;
    }

    // No iOS, sempre mostrar (mesmo sem beforeinstallprompt)
    // No Android, só mostrar se isInstallable for true
    if (!isIOS && !isInstallable) {
      return;
    }

    // Verificar se já foi dispensado (salvo no localStorage)
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Mostrar novamente após 7 dias
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Mostrar prompt após 3 segundos (para não atrapalhar o carregamento inicial)
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [device, isInstalled, isInstallable]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    await install();
    setShowPrompt(false);
  };

  // iOS - mostrar instruções diferentes
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  // Debug log
  useEffect(() => {
    if (showPrompt) {
      console.log('[PWA Install] Prompt is visible');
    }
  }, [showPrompt]);

  if (!showPrompt || dismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5">
      <div className="bg-cinema-gray border border-cinema-yellow/30 rounded-lg shadow-2xl p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-cinema-yellow/20 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-cinema-yellow" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">
              Instalar App
            </h3>
            <p className="text-gray-300 text-xs mb-3">
              {isIOS
                ? 'Adicione à tela inicial para acesso rápido'
                : 'Instale para usar como app nativo'}
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                {isIOS ? 'Instalar' : 'Instalar App'}
              </Button>
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

