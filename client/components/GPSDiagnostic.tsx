import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  Smartphone,
  Globe,
  Wifi,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface GPSStatus {
  supported: boolean;
  permission: string;
  accuracy: number | null;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isHTTPS: boolean;
}

export function GPSDiagnostic() {
  const [status, setStatus] = useState<GPSStatus>({
    supported: false,
    permission: 'unknown',
    accuracy: null,
    latitude: null,
    longitude: null,
    error: null,
    isHTTPS: window.location.protocol === 'https:',
  });
  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostic = async () => {
    setIsChecking(true);
    
    const newStatus: GPSStatus = {
      supported: !!navigator.geolocation,
      permission: 'unknown',
      accuracy: null,
      latitude: null,
      longitude: null,
      error: null,
      isHTTPS: window.location.protocol === 'https:',
    };

    console.log("🔍 Iniciando diagnóstico GPS...");
    console.log("📡 Protocolo:", window.location.protocol);
    console.log("🌐 Hostname:", window.location.hostname);

    if (!navigator.geolocation) {
      newStatus.error = "Geolocalização não suportada pelo navegador";
      setStatus(newStatus);
      setIsChecking(false);
      return;
    }

    // Verificar se é localhost (desenvolvimento) - permite HTTP
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname.startsWith('192.168.') ||
                       window.location.hostname.startsWith('10.');

    if (!newStatus.isHTTPS && !isLocalhost) {
      newStatus.error = "GPS requer HTTPS em produção. Use HTTPS ou localhost para desenvolvimento.";
      setStatus(newStatus);
      setIsChecking(false);
      return;
    }

    // Verificar permissão
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        newStatus.permission = permission.state;
        console.log("🔐 Permissão GPS:", permission.state);
      }
    } catch (e) {
      console.log("⚠️ Não foi possível verificar permissões:", e);
    }

    // Tentar obter localização com configurações otimizadas
    console.log("📍 Tentando obter localização...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Localização obtida com sucesso:", position.coords);
        newStatus.latitude = position.coords.latitude;
        newStatus.longitude = position.coords.longitude;
        newStatus.accuracy = position.coords.accuracy;
        newStatus.permission = 'granted';
        newStatus.error = null;
        setStatus(newStatus);
        setIsChecking(false);
        
        toast.success("🎉 GPS funcionando perfeitamente!", {
          description: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`,
        });
      },
      (error) => {
        console.error("❌ Erro ao obter localização:", error);
        let errorMessage = "Erro desconhecido";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão negada. Clique no ícone de localização na barra de endereços.";
            newStatus.permission = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível. Verifique se o GPS está ativo.";
            break;
          case error.TIMEOUT:
            errorMessage = "Timeout. Tente novamente em alguns segundos.";
            break;
        }
        
        newStatus.error = errorMessage;
        setStatus(newStatus);
        setIsChecking(false);
        
        toast.error("❌ Erro no GPS", {
          description: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15 segundos para dar mais tempo
        maximumAge: 30000, // Aceita dados de até 30 segundos
      }
    );
  };

  const getStatusIcon = (check: boolean) => {
    return check ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-400" />
    );
  };

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-600">Permitido</Badge>;
      case 'denied':
        return <Badge className="bg-red-600">Negado</Badge>;
      case 'prompt':
        return <Badge className="bg-yellow-600">Aguardando</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Diagnóstico GPS
          </span>
          <Button
            size="sm"
            onClick={runDiagnostic}
            disabled={isChecking}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isChecking ? 'Verificando...' : 'Executar Teste'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Checks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.supported)}
              <span className="text-white text-sm">Suporte do Navegador</span>
            </div>
            <Badge variant={status.supported ? "default" : "destructive"}>
              {status.supported ? "Suportado" : "Não Suportado"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-white text-sm">Permissão</span>
            </div>
            {getPermissionBadge(status.permission)}
          </div>

          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.isHTTPS || window.location.hostname === 'localhost')}
              <span className="text-white text-sm">Conexão Segura (HTTPS)</span>
            </div>
            <Badge variant={status.isHTTPS || window.location.hostname === 'localhost' ? "default" : "destructive"}>
              {status.isHTTPS ? "HTTPS" : window.location.hostname === 'localhost' ? "Localhost" : "HTTP"}
            </Badge>
          </div>

          {status.latitude && status.longitude && (
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm">Coordenadas</span>
              </div>
              <div className="text-right">
                <div className="text-white text-xs">
                  {status.latitude.toFixed(6)}, {status.longitude.toFixed(6)}
                </div>
                <div className="text-gray-400 text-xs">
                  Precisão: {status.accuracy?.toFixed(0)}m
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="bg-blue-900/20 border border-blue-500/50 p-3 rounded">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <div className="text-blue-400 font-medium text-sm mb-1">Como Habilitar GPS:</div>
              <ol className="text-blue-300 text-xs space-y-1 list-decimal list-inside">
                <li>Clique no ícone de localização na barra de endereços</li>
                <li>Selecione "Sempre permitir neste site"</li>
                <li>Recarregue a página</li>
                <li>Execute o teste novamente</li>
              </ol>
              {!status.isHTTPS && window.location.hostname !== 'localhost' && (
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/50 rounded">
                  <div className="text-yellow-400 text-xs font-medium">⚠️ Aviso HTTPS:</div>
                  <div className="text-yellow-300 text-xs mt-1">
                    Para usar GPS em produção, o site deve usar HTTPS. 
                    Em desenvolvimento local (localhost), HTTP é aceito.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Atual */}
        {(status.latitude || status.error) && (
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-white font-medium text-sm mb-2">Status Atual:</div>
            {status.error ? (
              <div className="text-red-300 text-sm">{status.error}</div>
            ) : (
              <div className="text-green-300 text-sm">
                ✅ GPS funcionando - Localização obtida com sucesso
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
