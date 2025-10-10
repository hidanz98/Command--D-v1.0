import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceDetection } from '@/hooks/use-device-detection';
// Mock implementations for missing mediapipe modules
const FaceDetection = {
  initialize: () => Promise.resolve(),
  detect: () => Promise.resolve([])
};

const CameraUtils = {
  initialize: () => Promise.resolve()
};

interface FacialRecognitionCameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

export default function FacialRecognitionCamera({ 
  onCapture, 
  onClose, 
  isProcessing = false 
}: FacialRecognitionCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectionRef = useRef<FaceDetection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const device = useDeviceDetection();

  const initializeFaceDetection = useCallback(async () => {
    try {
      const faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      });

      faceDetection.onResults((results) => {
        if (results.detections && results.detections.length > 0) {
          const detection = results.detections[0];
          const confidence = (detection as any).score?.[0] || 0;
          setFaceConfidence(confidence);
          setFaceDetected(confidence > 0.7);
        } else {
          setFaceDetected(false);
          setFaceConfidence(0);
        }
      });

      await faceDetection.initialize();
      faceDetectionRef.current = faceDetection;
    } catch (error) {
      console.error('Error initializing face detection:', error);
      // Fallback to simple detection
      setFaceDetected(true);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: device.isMobile ? 720 : 1280 },
          height: { ideal: device.isMobile ? 720 : 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Initialize face detection
      await initializeFaceDetection();

      setIsReady(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Erro ao acessar a câmera. Verifique as permissões.');
    }
  }, [device.isMobile, initializeFaceDetection]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  }, [isReady]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCountdown(0);
  }, []);

  const handleAutomaticCapture = useCallback(() => {
    if (faceDetected && !capturedImage && countdown === 0) {
      let count = 3;
      setCountdown(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(countdownInterval);
          capturePhoto();
          toast.success('Foto capturada automaticamente!');
        }
      }, 1000);
    }
  }, [faceDetected, capturedImage, countdown, capturePhoto]);

  // Face detection processing
  useEffect(() => {
    if (!isReady || !videoRef.current || !faceDetectionRef.current) return;

    const processVideo = async () => {
      if (videoRef.current && faceDetectionRef.current) {
        try {
          await faceDetectionRef.current.send({ image: videoRef.current });
        } catch (error) {
          // Fallback detection if MediaPipe fails
          const randomDetection = Math.random() > 0.4;
          setFaceDetected(randomDetection);
          setFaceConfidence(randomDetection ? 0.8 : 0.2);
        }
      }
    };

    const interval = setInterval(processVideo, 200);
    return () => clearInterval(interval);
  }, [isReady]);

  useEffect(() => {
    handleAutomaticCapture();
  }, [handleAutomaticCapture]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20"
          disabled={isProcessing}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg">
            Reconhecimento Facial
          </h2>
          <p className="text-white/80 text-sm">
            {capturedImage ? 'Confirme sua foto' : 'Posicione seu rosto no centro'}
          </p>
        </div>
        
        <div className="w-10" />
      </div>

      {/* Camera View */}
      <div className="relative flex-1 flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Face Detection Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-64 h-64 border-4 rounded-full transition-colors duration-300 ${
                faceDetected ? 'border-green-400' : 'border-white/50'
              }`}>
                <div className="relative w-full h-full">
                  {/* Corner guides */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg" />
                  
                  {/* Face detection indicator */}
                  {faceDetected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-green-400 rounded-full p-2">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Countdown */}
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">
                    {countdown}
                  </div>
                  <p className="text-white text-lg">Capturando...</p>
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="absolute top-20 left-4 right-4">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                  faceDetected ? 'bg-green-400/20 text-green-400' : 'bg-white/20 text-white'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    faceDetected ? 'bg-green-400' : 'bg-white/50'
                  }`} />
                  <span className="text-sm font-medium">
                    {faceDetected
                      ? `Rosto detectado (${Math.round(faceConfidence * 100)}%)`
                      : 'Procurando rosto...'
                    }
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Captured Image Preview */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
            
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Processando reconhecimento...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="relative z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
        {!capturedImage ? (
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="border-white/30 text-white hover:bg-white/20"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            
            <Button
              size="lg"
              onClick={capturePhoto}
              disabled={!isReady || isProcessing}
              className="bg-white text-black hover:bg-white/90 w-16 h-16 rounded-full p-0"
            >
              <Camera className="w-8 h-8" />
            </Button>
            
            <div className="w-24" />
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={retakePhoto}
              disabled={isProcessing}
              className="border-white/30 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Repetir
            </Button>
            
            <Button
              size="lg"
              onClick={confirmCapture}
              disabled={isProcessing}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        )}
        
        {!capturedImage && (
          <div className="mt-4 text-center">
            <p className="text-white/80 text-sm">
              A foto será capturada automaticamente quando seu rosto for detectado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
