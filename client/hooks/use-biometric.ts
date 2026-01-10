import { useState, useCallback } from 'react';

export interface BiometricState {
  isSupported: boolean;
  isAvailable: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authenticatorType: 'platform' | 'cross-platform' | null;
  supportedTypes: string[];
}

export interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  type: string;
  response: {
    clientDataJSON: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
  };
}

// Converter ArrayBuffer para Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Converter Base64 para ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Gerar challenge aleatório
function generateChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function useBiometric() {
  const [state, setState] = useState<BiometricState>({
    isSupported: typeof window !== 'undefined' && 
                 !!window.PublicKeyCredential &&
                 typeof window.PublicKeyCredential === 'function',
    isAvailable: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    authenticatorType: null,
    supportedTypes: []
  });

  // Verificar disponibilidade de autenticação biométrica
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        isAvailable: false,
        error: 'WebAuthn não é suportado neste navegador'
      }));
      return false;
    }

    try {
      // Verificar se há autenticador de plataforma (Touch ID, Face ID, Windows Hello)
      const isPlatformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      const supportedTypes: string[] = [];
      
      if (isPlatformAvailable) {
        supportedTypes.push('platform');
        // Detectar tipo específico baseado no dispositivo
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('iphone') || ua.includes('ipad')) {
          supportedTypes.push('Face ID', 'Touch ID');
        } else if (ua.includes('mac')) {
          supportedTypes.push('Touch ID');
        } else if (ua.includes('windows')) {
          supportedTypes.push('Windows Hello');
        } else if (ua.includes('android')) {
          supportedTypes.push('Fingerprint', 'Face Unlock');
        }
      }

      setState(prev => ({
        ...prev,
        isAvailable: isPlatformAvailable,
        authenticatorType: isPlatformAvailable ? 'platform' : null,
        supportedTypes
      }));

      return isPlatformAvailable;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isAvailable: false,
        error: error.message
      }));
      return false;
    }
  }, [state.isSupported]);

  // Registrar credencial biométrica
  const register = useCallback(async (userId: string, userName: string): Promise<BiometricCredential | null> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'WebAuthn não suportado' }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const challenge = generateChallenge();
      
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Bil's Cinema e Vídeo",
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Usar autenticador do dispositivo
          userVerification: 'required',        // Exigir verificação biométrica
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Falha ao criar credencial');
      }

      const attestationResponse = credential.response as AuthenticatorAttestationResponse;

      const result: BiometricCredential = {
        id: credential.id,
        rawId: credential.rawId,
        type: credential.type,
        response: {
          clientDataJSON: attestationResponse.clientDataJSON,
          authenticatorData: attestationResponse.getAuthenticatorData?.()
        }
      };

      // Salvar credencial no localStorage
      const credentials = JSON.parse(localStorage.getItem('biometric_credentials') || '[]');
      credentials.push({
        id: credential.id,
        rawId: bufferToBase64(credential.rawId),
        userId,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('biometric_credentials', JSON.stringify(credentials));

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        error: null
      }));

      return result;
    } catch (error: any) {
      let errorMessage = 'Erro ao registrar biometria';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Autenticação cancelada ou não autorizada';
      } else if (error.name === 'InvalidStateError') {
        errorMessage = 'Este dispositivo já está registrado';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Autenticação biométrica não suportada';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return null;
    }
  }, [state.isSupported]);

  // Autenticar com biometria
  const authenticate = useCallback(async (userId?: string): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'WebAuthn não suportado' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Recuperar credenciais salvas
      const savedCredentials = JSON.parse(localStorage.getItem('biometric_credentials') || '[]');
      
      const allowCredentials = savedCredentials
        .filter((c: any) => !userId || c.userId === userId)
        .map((c: any) => ({
          id: base64ToBuffer(c.rawId),
          type: 'public-key' as const,
          transports: ['internal'] as AuthenticatorTransport[]
        }));

      const challenge = generateChallenge();

      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Falha na autenticação');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        error: null
      }));

      return true;
    } catch (error: any) {
      let errorMessage = 'Erro na autenticação biométrica';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Autenticação cancelada ou não autorizada';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Erro de segurança. Verifique se está usando HTTPS.';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage
      }));

      return false;
    }
  }, [state.isSupported]);

  // Verificar se tem credenciais salvas
  const hasCredentials = useCallback((userId?: string): boolean => {
    const savedCredentials = JSON.parse(localStorage.getItem('biometric_credentials') || '[]');
    if (userId) {
      return savedCredentials.some((c: any) => c.userId === userId);
    }
    return savedCredentials.length > 0;
  }, []);

  // Remover credenciais
  const removeCredentials = useCallback((userId?: string) => {
    if (userId) {
      const savedCredentials = JSON.parse(localStorage.getItem('biometric_credentials') || '[]');
      const filtered = savedCredentials.filter((c: any) => c.userId !== userId);
      localStorage.setItem('biometric_credentials', JSON.stringify(filtered));
    } else {
      localStorage.removeItem('biometric_credentials');
    }
    setState(prev => ({ ...prev, isAuthenticated: false }));
  }, []);

  // Logout
  const logout = useCallback(() => {
    setState(prev => ({ ...prev, isAuthenticated: false }));
  }, []);

  return {
    ...state,
    checkAvailability,
    register,
    authenticate,
    hasCredentials,
    removeCredentials,
    logout
  };
}

export default useBiometric;

