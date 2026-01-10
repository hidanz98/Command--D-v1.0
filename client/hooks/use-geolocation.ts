import { useState, useCallback, useEffect, useRef } from 'react';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface GeolocationState {
  isSupported: boolean;
  isLoading: boolean;
  hasPermission: boolean | null;
  position: GeolocationPosition | null;
  error: string | null;
  isWatching: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    isSupported: typeof navigator !== 'undefined' && !!navigator.geolocation,
    isLoading: false,
    hasPermission: null,
    position: null,
    error: null,
    isWatching: false
  });

  const watchIdRef = useRef<number | null>(null);

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    timeout: options.timeout ?? 10000,
    maximumAge: options.maximumAge ?? 0
  };

  // Converter posição do navegador para nosso formato
  const parsePosition = (pos: globalThis.GeolocationPosition): GeolocationPosition => ({
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    altitude: pos.coords.altitude,
    altitudeAccuracy: pos.coords.altitudeAccuracy,
    heading: pos.coords.heading,
    speed: pos.coords.speed,
    timestamp: pos.timestamp
  });

  // Tratar erros
  const handleError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setState(prev => ({ ...prev, hasPermission: false }));
        return 'Permissão de localização negada. Habilite nas configurações.';
      case error.POSITION_UNAVAILABLE:
        return 'Localização indisponível. Verifique o GPS.';
      case error.TIMEOUT:
        return 'Tempo esgotado ao obter localização.';
      default:
        return 'Erro desconhecido ao obter localização.';
    }
  };

  // Obter posição atual
  const getCurrentPosition = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada' }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = parsePosition(pos);
          setState(prev => ({
            ...prev,
            isLoading: false,
            hasPermission: true,
            position,
            error: null
          }));
          resolve(position);
        },
        (error) => {
          const errorMessage = handleError(error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage
          }));
          resolve(null);
        },
        defaultOptions
      );
    });
  }, [state.isSupported, defaultOptions]);

  // Iniciar monitoramento contínuo
  const startWatching = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada' }));
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Já está monitorando
    }

    setState(prev => ({ ...prev, isWatching: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const position = parsePosition(pos);
        setState(prev => ({
          ...prev,
          hasPermission: true,
          position,
          error: null
        }));
      },
      (error) => {
        const errorMessage = handleError(error);
        setState(prev => ({
          ...prev,
          error: errorMessage
        }));
      },
      defaultOptions
    );
  }, [state.isSupported, defaultOptions]);

  // Parar monitoramento
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState(prev => ({ ...prev, isWatching: false }));
  }, []);

  // Verificar permissão
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const hasPermission = result.state === 'granted';
      setState(prev => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch {
      // Fallback: assumir que não sabemos
      return true;
    }
  }, []);

  // Calcular distância entre duas coordenadas (em metros)
  const calculateDistance = useCallback((
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Obter endereço a partir das coordenadas (geocodificação reversa)
  const getAddress = useCallback(async (lat?: number, lon?: number): Promise<string | null> => {
    const latitude = lat ?? state.position?.latitude;
    const longitude = lon ?? state.position?.longitude;

    if (!latitude || !longitude) return null;

    try {
      // Usando API gratuita do Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  }, [state.position]);

  // Abrir no Google Maps
  const openInMaps = useCallback((lat?: number, lon?: number) => {
    const latitude = lat ?? state.position?.latitude;
    const longitude = lon ?? state.position?.longitude;

    if (!latitude || !longitude) return;

    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  }, [state.position]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    checkPermission,
    calculateDistance,
    getAddress,
    openInMaps
  };
}

export default useGeolocation;

