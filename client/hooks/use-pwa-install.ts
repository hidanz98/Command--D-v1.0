import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar se está em modo standalone no iOS (já instalado)
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    // No iOS, sempre mostrar como instalável (mesmo sem beforeinstallprompt)
    if (isIOS) {
      setIsInstallable(true);
      return;
    }

    // Para Android/Chrome - usar beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      // iOS - mostrar instruções
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        alert(
          'Para instalar este app no iOS:\n\n' +
          '1. Toque no botão de compartilhar (ícone de quadrado com seta)\n' +
          '2. Selecione "Adicionar à Tela de Início"\n' +
          '3. Toque em "Adicionar"'
        );
        return;
      }
      // Android - tentar abrir menu de instalação
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro ao instalar app:', error);
    }
  };

  return {
    isInstallable,
    isInstalled,
    install,
  };
}

