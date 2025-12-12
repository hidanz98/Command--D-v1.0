import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RefreshCw, Check, User, AlertCircle } from 'lucide-react';

interface FacialCameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export const FacialCameraCapture: React.FC<FacialCameraCaptureProps> = ({
  onCapture,
  onClose,
  isOpen
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraReady, setCameraReady] = useState(false);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCameraReady(false);

    try {
      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode, // 'user' = frontal, 'environment' = traseira
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      if (err.name === 'NotAllowedError') {
        setError('Permissão para câmera negada. Habilite nas configurações do navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada no dispositivo.');
      } else if (err.name === 'NotReadableError') {
        setError('Câmera já está em uso por outro aplicativo.');
      } else {
        setError('Erro ao acessar a câmera. Verifique as permissões.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraReady(false);
  }, [stream]);

  // Capturar foto
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Definir tamanho do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  }, []);

  // Confirmar captura
  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  }, [capturedImage, onCapture, stopCamera]);

  // Refazer foto
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Trocar câmera (frontal/traseira)
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Efeito para trocar câmera
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
  }, [facingMode, isOpen]);

  // Iniciar/parar câmera baseado em isOpen
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-md">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-cinema-yellow" />
              <h3 className="text-white font-semibold">Reconhecimento Facial</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stopCamera();
                onClose?.();
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Instruções */}
          <div className="bg-blue-900/30 rounded-lg p-3 mb-4 border border-blue-500/30">
            <p className="text-blue-300 text-sm text-center">
              📸 Posicione seu rosto dentro do círculo e tire uma foto clara
            </p>
          </div>

          {/* Área da câmera */}
          <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden mb-4">
            {/* Erro */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <p className="text-red-400 text-sm">{error}</p>
                <Button
                  onClick={startCamera}
                  className="mt-4 bg-cinema-yellow text-cinema-dark"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            )}

            {/* Loading */}
            {isLoading && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-cinema-yellow border-t-transparent rounded-full mb-3"></div>
                <p className="text-gray-400 text-sm">Acessando câmera...</p>
              </div>
            )}

            {/* Vídeo da câmera */}
            {!capturedImage && !error && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
            )}

            {/* Imagem capturada */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Foto capturada"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
            )}

            {/* Overlay com guia facial */}
            {!error && !capturedImage && cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-60 border-4 border-cinema-yellow/50 rounded-full relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 border-t-4 border-l-4 border-cinema-yellow rounded-tl-lg"></div>
                  <div className="absolute -top-2 right-1/4 w-4 h-4 border-t-4 border-r-4 border-cinema-yellow rounded-tr-lg"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 border-b-4 border-l-4 border-cinema-yellow rounded-bl-lg"></div>
                  <div className="absolute -bottom-2 right-1/4 w-4 h-4 border-b-4 border-r-4 border-cinema-yellow rounded-br-lg"></div>
                </div>
              </div>
            )}

            {/* Indicador de câmera pronta */}
            {cameraReady && !capturedImage && !error && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-green-500/80 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium">REC</span>
              </div>
            )}
          </div>

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Botões de ação */}
          <div className="flex gap-2">
            {!capturedImage ? (
              <>
                {/* Trocar câmera */}
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  disabled={!cameraReady || isLoading}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>

                {/* Capturar foto */}
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-yellow-400"
                  disabled={!cameraReady || isLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Tirar Foto
                </Button>
              </>
            ) : (
              <>
                {/* Refazer */}
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refazer
                </Button>

                {/* Confirmar */}
                <Button
                  onClick={confirmCapture}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </>
            )}
          </div>

          {/* Nota sobre privacidade */}
          <p className="text-gray-500 text-xs text-center mt-3">
            🔒 Sua foto será usada apenas para verificação de identidade
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacialCameraCapture;

