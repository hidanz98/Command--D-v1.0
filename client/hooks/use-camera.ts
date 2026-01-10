import { useState, useCallback, useRef, useEffect } from 'react';

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  audio?: boolean;
}

export interface CameraState {
  isSupported: boolean;
  isActive: boolean;
  hasPermission: boolean | null;
  error: string | null;
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
}

export function useCamera(options: CameraOptions = {}) {
  const [state, setState] = useState<CameraState>({
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    isActive: false,
    hasPermission: null,
    error: null,
    stream: null,
    devices: []
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Listar dispositivos de câmera
  const listDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setState(prev => ({ ...prev, devices: videoDevices }));
      return videoDevices;
    } catch (error: any) {
      console.error('Erro ao listar dispositivos:', error);
      return [];
    }
  }, []);

  // Iniciar câmera
  const startCamera = useCallback(async (deviceId?: string) => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Câmera não suportada neste dispositivo' }));
      return null;
    }

    try {
      // Parar stream existente
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facingMode || 'environment',
          width: { ideal: options.width || 1920 },
          height: { ideal: options.height || 1080 },
          ...(deviceId && { deviceId: { exact: deviceId } })
        },
        audio: options.audio || false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setState(prev => ({
        ...prev,
        isActive: true,
        hasPermission: true,
        error: null,
        stream
      }));

      // Atualizar lista de dispositivos
      await listDevices();

      return stream;
    } catch (error: any) {
      let errorMessage = 'Erro ao acessar a câmera';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de câmera negada. Habilite nas configurações do navegador.';
        setState(prev => ({ ...prev, hasPermission: false }));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Câmera em uso por outro aplicativo.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Configurações de câmera não suportadas.';
      }

      setState(prev => ({
        ...prev,
        isActive: false,
        error: errorMessage,
        stream: null
      }));

      return null;
    }
  }, [state.isSupported, state.stream, options, listDevices]);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }
    setState(prev => ({
      ...prev,
      isActive: false,
      stream: null
    }));
  }, [state.stream]);

  // Trocar câmera (frontal/traseira)
  const switchCamera = useCallback(async () => {
    const newFacingMode = options.facingMode === 'user' ? 'environment' : 'user';
    options.facingMode = newFacingMode;
    return startCamera();
  }, [options, startCamera]);

  // Capturar foto
  const takePhoto = useCallback((): string | null => {
    if (!videoRef.current || !state.isActive) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }, [state.isActive]);

  // Capturar foto como Blob
  const takePhotoBlob = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !state.isActive) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    });
  }, [state.isActive]);

  // Conectar vídeo ao elemento
  const connectVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && state.stream) {
      element.srcObject = state.stream;
      element.play().catch(console.error);
    }
  }, [state.stream]);

  // Conectar canvas
  const connectCanvas = useCallback((element: HTMLCanvasElement | null) => {
    canvasRef.current = element;
  }, []);

  // Verificar permissão
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const hasPermission = result.state === 'granted';
      setState(prev => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch {
      // Fallback: tentar acessar câmera brevemente
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setState(prev => ({ ...prev, hasPermission: true }));
        return true;
      } catch {
        setState(prev => ({ ...prev, hasPermission: false }));
        return false;
      }
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    ...state,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
    takePhotoBlob,
    connectVideo,
    connectCanvas,
    checkPermission,
    listDevices
  };
}

export default useCamera;

