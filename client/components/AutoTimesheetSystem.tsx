import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Clock,
  User,
  Building,
  Home,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  Settings,
  Calendar,
  Timer,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Edit,
  Save,
  X,
  RefreshCw,
  Trash2,
  Plus,
  Bell,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GPSDiagnostic } from "./GPSDiagnostic";
import { toast } from "sonner";
import { useActivityLogger } from "@/hooks/use-activity-logger";

// Interfaces
interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface WorkSchedule {
  monday: { start: string; end: string; enabled: boolean };
  tuesday: { start: string; end: string; enabled: boolean };
  wednesday: { start: string; end: string; enabled: boolean };
  thursday: { start: string; end: string; enabled: boolean };
  friday: { start: string; end: string; enabled: boolean };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
}

interface AutoTimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  totalHours: number;
  overtimeHours: number;
  location: {
    in?: Location;
    out?: Location;
  };
  isInCompany: boolean;
  isAutomatic: boolean;
  needsApproval: boolean;
  managerNotes?: string;
  activities: ActivityLog[];
  status: "working" | "break" | "clocked_out" | "pending_approval";
}

interface EmployeeSchedule {
  employeeId: string;
  employeeName: string;
  workStart: string;
  workEnd: string;
  lunchStart?: string;
  lunchEnd?: string;
  customSchedule?: WorkSchedule;
}

interface PunchNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "clock_in" | "clock_out" | "weekend_work" | "out_of_hours" | "remote_work";
  timestamp: Date;
  message: string;
  read: boolean;
  data?: any;
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  type: "login" | "logout" | "order_created" | "order_modified" | "product_added" | "settings_changed" | "page_visited";
  description: string;
  location?: Location;
  metadata?: any;
}

interface CompanyLocation {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // metros
  address: string;
  cep?: string;
}

// Configurações da empresa (normalmente viria de API)
const COMPANY_LOCATIONS: CompanyLocation[] = [
  {
    id: "1",
    name: "Bil's Cinema e Vídeo - Sede Principal",
    latitude: -19.841520, // Floramar - BH (ERS Computer)
    longitude: -43.933511,
    radius: 150, // 150 metros de raio
    address: "Rua Joaquim Soares, 125-B - Floramar (Fundo ERS Computer)",
    cep: "31742-083",
  },
];

const DEFAULT_SCHEDULE: WorkSchedule = {
  monday: { start: "08:00", end: "17:00", enabled: true },
  tuesday: { start: "08:00", end: "17:00", enabled: true },
  wednesday: { start: "08:00", end: "17:00", enabled: true },
  thursday: { start: "08:00", end: "17:00", enabled: true },
  friday: { start: "08:00", end: "17:00", enabled: true },
  saturday: { start: "08:00", end: "17:00", enabled: false },
  sunday: { start: "08:00", end: "17:00", enabled: false },
};

// ============================================
// SISTEMA DE SEGURANÇA ANTI-FRAUDE
// ============================================
interface SecurityValidation {
  isValid: boolean;
  trustScore: number; // 0-100
  warnings: string[];
  flags: {
    possibleMockLocation: boolean;
    suspiciousAccuracy: boolean;
    impossibleSpeed: boolean;
    vpnDetected: boolean;
    devToolsOpen: boolean;
    timestampMismatch: boolean;
  };
}

// Detectar ferramentas de desenvolvedor abertas
const detectDevTools = (): boolean => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  // Verificar também se console está aberto via timing
  const start = performance.now();
  console.log('%c', 'font-size:0;');
  console.clear();
  const end = performance.now();
  const consoleOpen = (end - start) > 100;
  
  return widthThreshold || heightThreshold || consoleOpen;
};

// Detectar possível GPS falso/mock
const detectMockLocation = (location: Location): { isMock: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  
  // 1. Precisão muito exata (GPS real raramente é < 3m)
  if (location.accuracy < 3) {
    reasons.push("Precisão suspeita (< 3m)");
  }
  
  // 2. Coordenadas com muitas casas decimais exatas (GPS real tem variação)
  const latStr = location.latitude.toString();
  const lngStr = location.longitude.toString();
  if (latStr.endsWith('000') || lngStr.endsWith('000')) {
    reasons.push("Coordenadas arredondadas suspeitas");
  }
  
  // 3. Verificar se as coordenadas são exatamente iguais a locais conhecidos de teste
  const testLocations = [
    { lat: 0, lng: 0 }, // Null Island
    { lat: 37.4220, lng: -122.0841 }, // Googleplex (comum em testes)
    { lat: 40.7128, lng: -74.0060 }, // NYC padrão
  ];
  
  for (const testLoc of testLocations) {
    if (Math.abs(location.latitude - testLoc.lat) < 0.001 && 
        Math.abs(location.longitude - testLoc.lng) < 0.001) {
      reasons.push("Localização de teste detectada");
    }
  }
  
  return { isMock: reasons.length > 0, reasons };
};

// Calcular velocidade entre duas localizações (km/h)
const calculateSpeed = (loc1: Location, loc2: Location): number => {
  const distance = calculateDistance(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
  const timeDiff = Math.abs(loc2.timestamp.getTime() - loc1.timestamp.getTime()) / 1000 / 3600; // em horas
  if (timeDiff === 0) return 0;
  return distance / 1000 / timeDiff; // km/h
};

// Verificar velocidade impossível (teletransporte)
const checkImpossibleSpeed = (currentLoc: Location, previousLoc: Location | null): { isImpossible: boolean; speed: number } => {
  if (!previousLoc) return { isImpossible: false, speed: 0 };
  
  const speed = calculateSpeed(previousLoc, currentLoc);
  // Velocidade máxima razoável: 200 km/h (avião regional = ~500km/h, mas muito raro)
  const maxSpeed = 200;
  
  return { isImpossible: speed > maxSpeed, speed };
};

// Gerar fingerprint do dispositivo
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 0, 0);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    canvas.toDataURL(),
  ].join('|');
  
  // Hash simples
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

// Validação completa de segurança
const validateLocationSecurity = (
  location: Location, 
  previousLocation: Location | null,
  storedFingerprint: string | null
): SecurityValidation => {
  const warnings: string[] = [];
  let trustScore = 100;
  
  const flags = {
    possibleMockLocation: false,
    suspiciousAccuracy: false,
    impossibleSpeed: false,
    vpnDetected: false,
    devToolsOpen: false,
    timestampMismatch: false,
  };
  
  // 1. Verificar GPS mock
  const mockCheck = detectMockLocation(location);
  if (mockCheck.isMock) {
    flags.possibleMockLocation = true;
    warnings.push(...mockCheck.reasons);
    trustScore -= 30;
  }
  
  // 2. Verificar precisão suspeita
  if (location.accuracy < 5) {
    flags.suspiciousAccuracy = true;
    warnings.push("Precisão muito alta pode indicar GPS simulado");
    trustScore -= 15;
  }
  
  // 3. Verificar velocidade impossível
  const speedCheck = checkImpossibleSpeed(location, previousLocation);
  if (speedCheck.isImpossible) {
    flags.impossibleSpeed = true;
    warnings.push(`Velocidade impossível detectada: ${speedCheck.speed.toFixed(0)} km/h`);
    trustScore -= 40;
  }
  
  // 4. Verificar DevTools
  if (detectDevTools()) {
    flags.devToolsOpen = true;
    warnings.push("Ferramentas de desenvolvedor detectadas");
    trustScore -= 10;
  }
  
  // 5. Verificar fingerprint do dispositivo
  const currentFingerprint = generateDeviceFingerprint();
  if (storedFingerprint && storedFingerprint !== currentFingerprint) {
    warnings.push("Dispositivo diferente do cadastrado");
    trustScore -= 20;
  }
  
  // 6. Verificar timestamp
  const now = new Date();
  const timeDiff = Math.abs(now.getTime() - location.timestamp.getTime());
  if (timeDiff > 60000) { // Mais de 1 minuto de diferença
    flags.timestampMismatch = true;
    warnings.push("Timestamp inconsistente");
    trustScore -= 15;
  }
  
  return {
    isValid: trustScore >= 50,
    trustScore: Math.max(0, trustScore),
    warnings,
    flags,
  };
};

export function AutoTimesheetSystem() {
  const { user, isAdmin } = useAuth();
  const { logActivity } = useActivityLogger();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isInCompany, setIsInCompany] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<AutoTimesheetEntry | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(DEFAULT_SCHEDULE);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [allEntries, setAllEntries] = useState<AutoTimesheetEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddressConfig, setShowAddressConfig] = useState(false);
  const [companyAddresses, setCompanyAddresses] = useState(COMPANY_LOCATIONS);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    radius: 150,
    address: '',
    cep: ''
  });
  const [punchNotifications, setPunchNotifications] = useState<PunchNotification[]>([]);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  
  // Estados de Segurança Anti-Fraude
  const [securityValidation, setSecurityValidation] = useState<SecurityValidation | null>(null);
  const [previousLocation, setPreviousLocation] = useState<Location | null>(null);
  const [deviceFingerprint] = useState<string>(() => generateDeviceFingerprint());
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  
  const [employeeSchedules, setEmployeeSchedules] = useState<EmployeeSchedule[]>([
    {
      employeeId: "1",
      employeeName: "Felipe Nunes de Andrade",
      workStart: "08:00",
      workEnd: "18:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
    {
      employeeId: "2",
      employeeName: "Otavio Almeida de Souza",
      workStart: "08:00",
      workEnd: "18:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
    },
  ]);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EmployeeSchedule | null>(null);

  // Função para obter endereço a partir das coordenadas (Geocodificação Reversa)
  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'pt-BR',
            'User-Agent': 'BilsCinema/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const addr = data.address;
        
        // Montar endereço legível
        const parts = [];
        if (addr.road) parts.push(addr.road);
        if (addr.house_number) parts[0] = `${parts[0]}, ${addr.house_number}`;
        if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.state) parts.push(addr.state);
        
        const formattedAddress = parts.join(' - ') || data.display_name;
        setCurrentAddress(formattedAddress);
        return formattedAddress;
      }
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
    }
    return null;
  }, []);

  // Verificar se está dentro da empresa
  const checkIfInCompany = useCallback((location: Location): boolean => {
    return companyAddresses.some(companyLoc => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        companyLoc.latitude,
        companyLoc.longitude
      );
      return distance <= companyLoc.radius;
    });
  }, [companyAddresses]);

  // Funções para gerenciar endereços da empresa
  const addCompanyAddress = () => {
    if (!newAddress.name || !newAddress.address || newAddress.latitude === 0 || newAddress.longitude === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const address = {
      id: Date.now().toString(),
      name: newAddress.name,
      latitude: newAddress.latitude,
      longitude: newAddress.longitude,
      radius: newAddress.radius,
      address: newAddress.address,
      cep: newAddress.cep
    };

    setCompanyAddresses([...companyAddresses, address]);
    setNewAddress({ name: '', latitude: 0, longitude: 0, radius: 150, address: '', cep: '' });
    toast.success("Endereço adicionado com sucesso!");
    logActivity('settings_changed', `Endereço "${address.name}" adicionado`);
  };

  const editCompanyAddress = (address: any) => {
    setEditingAddress(address);
    setNewAddress({
      name: address.name,
      latitude: address.latitude,
      longitude: address.longitude,
      radius: address.radius,
      address: address.address,
      cep: address.cep || ''
    });
  };

  const updateCompanyAddress = () => {
    if (!editingAddress || !newAddress.name || !newAddress.address) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const updatedAddresses = companyAddresses.map(addr => 
      addr.id === editingAddress.id 
        ? { ...addr, ...newAddress }
        : addr
    );

    setCompanyAddresses(updatedAddresses);
    setEditingAddress(null);
    setNewAddress({ name: '', latitude: 0, longitude: 0, radius: 150, address: '', cep: '' });
    toast.success("Endereço atualizado com sucesso!");
    logActivity('settings_changed', `Endereço "${newAddress.name}" atualizado`);
  };

  const deleteCompanyAddress = (addressId: string) => {
    const address = companyAddresses.find(addr => addr.id === addressId);
    setCompanyAddresses(companyAddresses.filter(addr => addr.id !== addressId));
    toast.success("Endereço removido com sucesso!");
    if (address) {
      logActivity('settings_changed', `Endereço "${address.name}" removido`);
    }
  };

  const cancelEdit = () => {
    setEditingAddress(null);
    setNewAddress({ name: '', latitude: 0, longitude: 0, radius: 150, address: '', cep: '' });
  };

  // Adicionar notificação silenciosa (apenas para admin ver depois)
  const addPunchNotification = (
    type: PunchNotification['type'],
    message: string,
    data?: any
  ) => {
    const notification: PunchNotification = {
      id: Date.now().toString(),
      employeeId: user?.id || '',
      employeeName: user?.name || '',
      type,
      timestamp: new Date(),
      message,
      read: false,
      data,
    };

    setPunchNotifications(prev => [notification, ...prev]);
    
    // Salvar no localStorage
    const saved = JSON.parse(localStorage.getItem('punch_notifications') || '[]');
    localStorage.setItem('punch_notifications', JSON.stringify([notification, ...saved].slice(0, 100)));
  };

  // Gerenciar horários dos funcionários
  const saveEmployeeSchedule = (schedule: EmployeeSchedule) => {
    const existing = employeeSchedules.findIndex(s => s.employeeId === schedule.employeeId);
    if (existing >= 0) {
      const updated = [...employeeSchedules];
      updated[existing] = schedule;
      setEmployeeSchedules(updated);
    } else {
      setEmployeeSchedules([...employeeSchedules, schedule]);
    }
    
    localStorage.setItem('employee_schedules', JSON.stringify(employeeSchedules));
    toast.success("Horário do funcionário salvo com sucesso!");
    logActivity('settings_changed', `Horário de ${schedule.employeeName} atualizado`);
  };

  // Calcular distância entre duas coordenadas (fórmula Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calcular distância da empresa mais próxima
  const calculateDistanceFromCompany = (location: Location): number => {
    let minDistance = Infinity;
    COMPANY_LOCATIONS.forEach(companyLoc => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        companyLoc.latitude,
        companyLoc.longitude
      );
      minDistance = Math.min(minDistance, distance);
    });
    return Math.round(minDistance);
  };

  // Verificar se está no horário de trabalho
  const isWorkingHours = useCallback((): boolean => {
    const now = new Date();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()] as keyof WorkSchedule;
    const todaySchedule = workSchedule[dayOfWeek];
    
    if (!todaySchedule.enabled) return false;
    
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= todaySchedule.start && currentTime <= todaySchedule.end;
  }, [workSchedule]);

  // Obter localização atual com melhorias
  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada pelo navegador"));
        return;
      }

      // Verificar HTTPS/localhost
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' || 
                         window.location.hostname.startsWith('192.168.') ||
                         window.location.hostname.startsWith('10.');

      if (!window.location.protocol.startsWith('https:') && !isLocalhost) {
        reject(new Error("GPS requer HTTPS em produção. Use HTTPS ou localhost para desenvolvimento."));
        return;
      }

      console.log("🔍 Iniciando busca por GPS...");
      console.log("📡 Protocolo:", window.location.protocol);
      console.log("🌐 Hostname:", window.location.hostname);

      // Verificar permissões primeiro
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
          console.log("🔐 Status da permissão:", result.state);
          if (result.state === 'denied') {
            reject(new Error("Permissão de localização negada. Clique no ícone de localização na barra de endereços."));
            return;
          }
        }).catch((e) => {
          console.log("⚠️ Não foi possível verificar permissões:", e);
        });
      }

      // Primeiro tentar com alta precisão
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ GPS obtido com sucesso:", position.coords);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          });
        },
        (error) => {
          console.warn("⚠️ Erro com alta precisão, tentando com baixa precisão:", error);
          
          // Se falhar, tentar com baixa precisão
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("✅ GPS obtido com baixa precisão:", position.coords);
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date(),
              });
            },
            (fallbackError) => {
              console.error("❌ Falha total do GPS:", fallbackError);
              console.error("Código do erro:", fallbackError.code);
              console.error("Mensagem do erro:", fallbackError.message);
              
              let errorMessage = "Erro ao obter localização GPS";
              let errorDetails = "";
              
              switch (fallbackError.code) {
                case 1: // PERMISSION_DENIED
                  errorMessage = "Permissão de localização negada";
                  errorDetails = "Clique no ícone de cadeado/localização na barra de endereços e permita o acesso.";
                  break;
                case 2: // POSITION_UNAVAILABLE
                  errorMessage = "Localização indisponível";
                  errorDetails = "Verifique se o GPS está ativo no seu dispositivo e se você tem conexão com a internet.";
                  break;
                case 3: // TIMEOUT
                  errorMessage = "Tempo esgotado ao buscar localização";
                  errorDetails = "A busca demorou muito. Tente novamente em alguns segundos.";
                  break;
                default:
                  errorMessage = "Erro desconhecido ao obter GPS";
                  errorDetails = `Código: ${fallbackError.code} - ${fallbackError.message}`;
              }
              
              console.log("📋 Mensagem de erro:", errorMessage);
              console.log("📋 Detalhes:", errorDetails);
              
              reject(new Error(`${errorMessage}. ${errorDetails}`));
            },
            {
              enableHighAccuracy: false, // Baixa precisão como fallback
              timeout: 25000, // 25 segundos para fallback
              maximumAge: 300000, // Cache de 5 minutos
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // 20 segundos para alta precisão
          maximumAge: 60000, // Cache de 1 minuto
        }
      );
    });
  }, []);

  // Registrar atividade local (para exibição no componente)
  const logLocalActivity = useCallback((type: ActivityLog['type'], description: string, metadata?: any) => {
    const activity: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      description,
      location: currentLocation || undefined,
      metadata,
    };

    setActivities(prev => [activity, ...prev].slice(0, 100)); // Manter últimas 100 atividades
    
    // Também registrar globalmente
    logActivity(type, description, metadata);
  }, [currentLocation, logActivity]);

  // Verificar se é final de semana
  const isWeekend = (): boolean => {
    const now = new Date();
    const day = now.getDay();
    return day === 0 || day === 6; // 0 = domingo, 6 = sábado
  };

  // Bater ponto automaticamente
  const autoClockIn = useCallback(async () => {
    if (!user || currentEntry?.status === 'working') return;

    try {
      const location = await getCurrentLocation();
      const inCompany = checkIfInCompany(location);
      const isWorkTime = isWorkingHours();
      const isWeekendDay = isWeekend();
      
      const entry: AutoTimesheetEntry = {
        id: Date.now().toString(),
        employeeId: user.id,
        employeeName: user.name,
        date: new Date().toISOString().split('T')[0],
        clockIn: new Date().toTimeString().slice(0, 8),
        totalHours: 0,
        overtimeHours: 0,
        location: { in: location },
        isInCompany: inCompany,
        isAutomatic: true,
        needsApproval: !inCompany || !isWorkTime || isWeekendDay, // Final de semana sempre precisa aprovação
        activities: [],
        status: 'working',
      };

      setCurrentEntry(entry);
      logActivity('login', `Login automático ${inCompany ? 'na empresa' : 'remoto'}${isWeekendDay ? ' (final de semana)' : ''}`, { location, inCompany, isWeekend: isWeekendDay });

      // Adicionar notificação silenciosa para o admin
      if (isWeekendDay) {
        addPunchNotification('weekend_work', `Trabalho em final de semana - ${user.name}`, { location, inCompany });
        // Mostrar toast apenas para funcionário
        if (!isAdmin) {
          toast.warning("⚠️ Ponto registrado - HORA EXTRA", {
            description: "Trabalho em final de semana/feriado será contabilizado como hora extra",
          });
        }
      } else if (!inCompany) {
        addPunchNotification('remote_work', `Trabalho remoto - ${user.name}`, { location });
        if (!isAdmin) {
          toast.warning("⚠️ Ponto registrado para aprovação", {
            description: "Localização fora da empresa",
          });
        }
      } else if (!isWorkTime) {
        addPunchNotification('out_of_hours', `Fora do horário - ${user.name}`, { location, clockIn: entry.clockIn });
        if (!isAdmin) {
          toast.warning("⚠️ Ponto registrado para aprovação", {
            description: "Fora do horário de trabalho",
          });
        }
      } else {
        addPunchNotification('clock_in', `Entrada registrada - ${user.name}`, { location, clockIn: entry.clockIn });
        toast.success("✅ Ponto registrado automaticamente", {
          description: "Você está na empresa no horário correto",
        });
      }

    } catch (error) {
      setLocationError((error as Error).message);
      logActivity('login', 'Login sem localização (erro GPS)', { error: (error as Error).message });
      
      toast.error("❌ Erro ao obter localização", {
        description: "Ponto será registrado para aprovação manual",
      });
    }
  }, [user, currentEntry, getCurrentLocation, checkIfInCompany, isWorkingHours, logActivity]);

  // Bater ponto de saída
  const autoClockOut = useCallback(async () => {
    if (!currentEntry || currentEntry.status !== 'working') return;

    try {
      const location = await getCurrentLocation();
      const now = new Date();
      const clockInTime = new Date(`${currentEntry.date}T${currentEntry.clockIn}`);
      const totalMinutes = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60));
      const totalHours = totalMinutes / 60;
      
      // Verificar se é final de semana para calcular horas extras
      const isWeekendDay = isWeekend();
      const overtimeHours = isWeekendDay 
        ? totalHours // TODO o tempo em final de semana é hora extra
        : Math.max(0, totalHours - 8); // Em dias úteis, hora extra após 8h
      
      const updatedEntry: AutoTimesheetEntry = {
        ...currentEntry,
        clockOut: now.toTimeString().slice(0, 8),
        totalHours,
        overtimeHours,
        location: { ...currentEntry.location, out: location },
        status: 'clocked_out',
      };

      setCurrentEntry(updatedEntry);
      logActivity('logout', `Logout automático ${checkIfInCompany(location) ? 'na empresa' : 'remoto'}${isWeekendDay ? ' (final de semana)' : ''}`, { location, isWeekend: isWeekendDay });

      // Adicionar notificação silenciosa para o admin
      addPunchNotification('clock_out', `Saída registrada - ${user?.name}${isWeekendDay ? ' (Final de Semana)' : ''}`, { 
        location, 
        totalHours, 
        overtimeHours, 
        isWeekend: isWeekendDay 
      });

      if (isWeekendDay) {
        if (!isAdmin) {
          toast.success("✅ Saída registrada - HORA EXTRA", {
            description: `Total: ${totalHours.toFixed(2)}h (100% hora extra em final de semana)`,
          });
        }
      } else {
        toast.success("✅ Saída registrada automaticamente", {
          description: `Total: ${totalHours.toFixed(2)}h trabalhadas${overtimeHours > 0 ? ` (${overtimeHours.toFixed(2)}h extras)` : ''}`,
        });
      }

    } catch (error) {
      logActivity('logout', 'Logout sem localização (erro GPS)', { error: (error as Error).message });
      
      toast.error("❌ Erro ao registrar saída", {
        description: "Saída será registrada para aprovação manual",
      });
    }
  }, [currentEntry, getCurrentLocation, checkIfInCompany, logActivity]);

  // Monitorar localização periodicamente e bater ponto automaticamente
  useEffect(() => {
    if (!user || !isLocationEnabled) return;

    const interval = setInterval(async () => {
      try {
        console.log("🔄 Verificando localização...");
        const location = await getCurrentLocation();
        
        // 🔒 VALIDAÇÃO DE SEGURANÇA
        const storedFingerprint = localStorage.getItem(`device_fp_${user.id}`);
        const validation = validateLocationSecurity(location, previousLocation, storedFingerprint);
        setSecurityValidation(validation);
        
        // Salvar fingerprint se for a primeira vez
        if (!storedFingerprint) {
          localStorage.setItem(`device_fp_${user.id}`, deviceFingerprint);
        }
        
        // Atualizar histórico de localização
        setPreviousLocation(currentLocation);
        setLocationHistory(prev => [...prev.slice(-10), location]);
        
        // Log de segurança
        if (!validation.isValid) {
          console.warn("⚠️ ALERTA DE SEGURANÇA:", validation.warnings);
          toast.warning("⚠️ Localização com alertas de segurança", {
            description: `Confiança: ${validation.trustScore}%`,
          });
        }
        
        setCurrentLocation(location);
        getAddressFromCoordinates(location.latitude, location.longitude);
        const inCompany = checkIfInCompany(location);
        setIsInCompany(inCompany);
        setLocationError(null);
        
        console.log("📍 Na empresa:", inCompany);
        console.log("⏰ Horário de trabalho:", isWorkingHours());
        console.log("📋 Registro atual:", currentEntry?.status);
        console.log("🔒 Segurança - Confiança:", validation.trustScore + "%");
        
        // Bater ponto automaticamente quando entrar na empresa (APENAS SE SEGURO)
        if (inCompany && isWorkingHours() && !currentEntry && validation.isValid) {
          console.log("✅ Batendo ponto automático (entrada na empresa)");
          toast.info("📍 Você entrou na área da empresa", {
            description: "Registrando ponto automático...",
            duration: 3000,
          });
          await autoClockIn();
        } else if (inCompany && isWorkingHours() && !currentEntry && !validation.isValid) {
          toast.error("🔒 Ponto não registrado - Localização suspeita", {
            description: "Aguardando aprovação manual do gestor",
          });
        }
        
        // Registrar saída automaticamente quando sair da empresa
        if (!inCompany && currentEntry?.status === 'working' && currentEntry.isInCompany) {
          console.log("👋 Batendo ponto automático (saída da empresa)");
          toast.info("📍 Você saiu da área da empresa", {
            description: "Registrando saída automática...",
            duration: 3000,
          });
          await autoClockOut();
        }
        
      } catch (error) {
        console.error("❌ Erro no monitoramento:", error);
        setLocationError((error as Error).message);
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [user, isLocationEnabled, getCurrentLocation, checkIfInCompany, isWorkingHours, currentEntry, autoClockIn, autoClockOut]);

  // Auto clock-in quando login
  useEffect(() => {
    if (user && isLocationEnabled && !currentEntry) {
      autoClockIn();
    }
  }, [user, isLocationEnabled, currentEntry, autoClockIn]);

  // Solicitar permissão de localização
  const requestLocationPermission = async () => {
    setLocationError(null);
    
    try {
      // Mostrar toast de carregamento
      toast.loading("📍 Ativando GPS...", {
        description: "Obtendo sua localização atual",
        id: "location-loading",
      });

      console.log("🚀 Iniciando processo de localização...");
      
      const location = await getCurrentLocation();
      console.log("📍 Localização obtida:", location);

      // 🔒 VALIDAÇÃO DE SEGURANÇA INICIAL
      const storedFingerprint = localStorage.getItem(`device_fp_${user?.id}`);
      const validation = validateLocationSecurity(location, null, storedFingerprint);
      setSecurityValidation(validation);
      
      // Salvar fingerprint do dispositivo
      if (user && !storedFingerprint) {
        localStorage.setItem(`device_fp_${user.id}`, deviceFingerprint);
        console.log("🔒 Fingerprint do dispositivo salvo");
      }
      
      // Iniciar histórico de localização
      setLocationHistory([location]);
      
      console.log("🔒 Validação de segurança:", {
        trustScore: validation.trustScore,
        isValid: validation.isValid,
        warnings: validation.warnings
      });

      setCurrentLocation(location);
      getAddressFromCoordinates(location.latitude, location.longitude);
      setIsLocationEnabled(true);
      setLocationError(null);
      
      // Verificar se está na empresa
      const inCompany = checkIfInCompany(location);
      const distance = calculateDistanceFromCompany(location);
      
      console.log(`🏢 Está na empresa: ${inCompany}, Distância: ${distance}m`);
      
      toast.success("📍 GPS Ativado com Sucesso!", {
        description: `${inCompany ? '🏢 Você está na empresa' : '🏠 Trabalho remoto detectado'} (${distance}m)`,
        id: "location-loading",
        duration: 4000,
      });

      // Auto clock-in se ainda não tiver batido ponto
      if (!currentEntry) {
        setTimeout(() => autoClockIn(), 1000);
      }
      
    } catch (error) {
      console.error("❌ Erro na localização:", error);
      const errorMsg = (error as Error).message;
      setLocationError(errorMsg);
      
      toast.error("❌ Erro ao Ativar GPS", {
        description: errorMsg,
        id: "location-loading",
        duration: 6000,
        action: {
          label: "Tentar Novamente",
          onClick: () => requestLocationPermission(),
        },
      });
    }
  };

  // Carregar dados salvos
  useEffect(() => {
    if (user) {
      const savedActivities = JSON.parse(localStorage.getItem(`activities_${user.id}`) || '[]');
      setActivities(savedActivities);
      
      const savedEntry = JSON.parse(localStorage.getItem(`current_entry_${user.id}`) || 'null');
      if (savedEntry && savedEntry.date === new Date().toISOString().split('T')[0]) {
        setCurrentEntry(savedEntry);
      }

      // Carregar notificações e horários de funcionários (apenas admin)
      if (isAdmin) {
        const savedNotifications = JSON.parse(localStorage.getItem('punch_notifications') || '[]');
        // Converter timestamps de volta para Date
        const notifications = savedNotifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setPunchNotifications(notifications);

        const savedSchedules = JSON.parse(localStorage.getItem('employee_schedules') || '[]');
        if (savedSchedules.length > 0) {
          setEmployeeSchedules(savedSchedules);
        }
      }
    }
  }, [user, isAdmin]);

  // Salvar entrada atual
  useEffect(() => {
    if (user && currentEntry) {
      localStorage.setItem(`current_entry_${user.id}`, JSON.stringify(currentEntry));
    }
  }, [user, currentEntry]);

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLocationStatus = () => {
    if (!currentLocation) return { icon: WifiOff, text: "Localização indisponível", color: "text-red-400" };
    if (isInCompany) return { icon: Building, text: "Na empresa", color: "text-green-400" };
    return { icon: Home, text: "Trabalho remoto", color: "text-yellow-400" };
  };

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'login': return <User className="w-4 h-4 text-green-400" />;
      case 'logout': return <User className="w-4 h-4 text-red-400" />;
      case 'order_created': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'order_modified': return <Edit className="w-4 h-4 text-yellow-400" />;
      case 'product_added': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'settings_changed': return <Settings className="w-4 h-4 text-purple-400" />;
      case 'page_visited': return <Eye className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Status do Ponto Automático */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Clock className="w-5 h-5 mr-2" />
            Ponto Automático
            {currentEntry?.status === 'working' && (
              <Badge className="ml-2 bg-green-600">Trabalhando</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Localização */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {(() => {
                const status = getLocationStatus();
                const IconComponent = status.icon;
                return (
                  <>
                    <IconComponent className={`w-5 h-5 ${status.color}`} />
                    <div>
                      <div className="text-white font-medium flex items-center">
                        {status.text}
                        {isLocationEnabled && (
                          <span className="ml-2 flex items-center">
                            <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            <span className="text-xs text-green-400">Monitorando</span>
                          </span>
                        )}
                      </div>
                      {currentAddress && (
                        <div className="text-white text-sm mt-1">
                          📌 {currentAddress}
                        </div>
                      )}
                      {currentLocation && (
                        <div className="text-gray-400 text-sm">
                          Precisão: {currentLocation.accuracy.toFixed(0)}m • {calculateDistanceFromCompany(currentLocation)}m da empresa
                        </div>
                      )}
                      {isLocationEnabled && !currentEntry && isInCompany && isWorkingHours() && (
                        <div className="text-green-400 text-xs mt-1">
                          ✅ Ponto será registrado automaticamente a cada 30s
                        </div>
                      )}
                      {isLocationEnabled && currentEntry?.status === 'working' && !isInCompany && (
                        <div className="text-yellow-400 text-xs mt-1">
                          ⚠️ Você está fora da empresa - Saída será registrada automaticamente
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            
            {!isLocationEnabled ? (
              <Button
                onClick={requestLocationPermission}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ativar GPS
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  GPS Ativo
                </Badge>
                {/* Indicador de Segurança */}
                {securityValidation && (
                  <Badge 
                    variant="outline" 
                    className={`${
                      securityValidation.trustScore >= 80 
                        ? 'text-green-400 border-green-400' 
                        : securityValidation.trustScore >= 50 
                          ? 'text-yellow-400 border-yellow-400' 
                          : 'text-red-400 border-red-400'
                    }`}
                    title={securityValidation.warnings.join(', ') || 'Localização verificada'}
                  >
                    {securityValidation.trustScore >= 80 ? (
                      <><ShieldCheck className="w-3 h-3 mr-1" /> {securityValidation.trustScore}%</>
                    ) : securityValidation.trustScore >= 50 ? (
                      <><Shield className="w-3 h-3 mr-1" /> {securityValidation.trustScore}%</>
                    ) : (
                      <><ShieldAlert className="w-3 h-3 mr-1" /> {securityValidation.trustScore}%</>
                    )}
                  </Badge>
                )}
                <Button
                  onClick={requestLocationPermission}
                  size="sm"
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Entrada Atual */}
          {currentEntry && (
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Registro de Hoje</h3>
                {currentEntry.needsApproval && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    Aguardando Aprovação
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Entrada</div>
                  <div className="text-white font-medium">
                    {currentEntry.clockIn ? formatTime(currentEntry.clockIn) : '--:--'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Saída</div>
                  <div className="text-white font-medium">
                    {currentEntry.clockOut ? formatTime(currentEntry.clockOut) : '--:--'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Horas Trabalhadas</div>
                  <div className="text-white font-medium">
                    {currentEntry.totalHours.toFixed(2)}h
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Horas Extras</div>
                  <div className={`font-medium ${currentEntry.overtimeHours > 0 ? 'text-yellow-400' : 'text-white'}`}>
                    {currentEntry.overtimeHours.toFixed(2)}h
                  </div>
                </div>
              </div>

              {/* Localização da Entrada */}
              {currentEntry.location.in && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-gray-400 text-sm mb-1">Local da Entrada</div>
                  <div className="flex items-center space-x-2">
                    {currentEntry.isInCompany ? (
                      <Building className="w-4 h-4 text-green-400" />
                    ) : (
                      <Home className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-white text-sm">
                      {currentEntry.isInCompany ? "Sede da Empresa" : "Trabalho Remoto"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ações Manuais */}
          <div className="flex space-x-2">
            {currentEntry?.status === 'working' ? (
              <Button
                onClick={autoClockOut}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Registrar Saída
              </Button>
            ) : (
              <Button
                onClick={autoClockIn}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Registrar Entrada
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* Botões de Admin */}
            <Button
              variant="outline"
              onClick={() => setShowAddressConfig(!showAddressConfig)}
              className="border-blue-600 text-blue-400 hover:bg-blue-700"
              title="Configurar Endereços da Empresa"
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowScheduleEditor(!showScheduleEditor)}
              className="border-purple-600 text-purple-400 hover:bg-purple-700"
              title="Gerenciar Horários dos Funcionários"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico GPS */}
      {locationError && (
        <GPSDiagnostic />
      )}

      {/* Log de Atividades */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Activity className="w-5 h-5 mr-2" />
            Atividades Recentes
            <Badge className="ml-2">{activities.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="text-white text-sm">{activity.description}</div>
                  <div className="text-gray-400 text-xs">
                    {activity.timestamp.toLocaleString('pt-BR')}
                    {activity.location && (
                      <span className="ml-2">
                        📍 {checkIfInCompany(activity.location) ? 'Empresa' : 'Remoto'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                Nenhuma atividade registrada hoje
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Ponto - Apenas para Admin */}
      {isAdmin && punchNotifications.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-yellow-400" />
                Notificações de Ponto
                <Badge className="ml-2 bg-yellow-600">{punchNotifications.filter(n => !n.read).length}</Badge>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updated = punchNotifications.map(n => ({ ...n, read: true }));
                  setPunchNotifications(updated);
                  localStorage.setItem('punch_notifications', JSON.stringify(updated));
                  toast.success("Todas as notificações marcadas como lidas");
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                Marcar todas como lidas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {punchNotifications.slice(0, 20).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded border ${
                    notification.read 
                      ? 'bg-gray-700/50 border-gray-600' 
                      : 'bg-yellow-900/20 border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {notification.type === 'weekend_work' && <Calendar className="w-4 h-4 text-purple-400" />}
                        {notification.type === 'out_of_hours' && <Clock className="w-4 h-4 text-yellow-400" />}
                        {notification.type === 'remote_work' && <Home className="w-4 h-4 text-blue-400" />}
                        {notification.type === 'clock_in' && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {notification.type === 'clock_out' && <CheckCircle className="w-4 h-4 text-red-400" />}
                        <span className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.message}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {notification.timestamp.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = punchNotifications.map(n => 
                            n.id === notification.id ? { ...n, read: true } : n
                          );
                          setPunchNotifications(updated);
                          localStorage.setItem('punch_notifications', JSON.stringify(updated));
                        }}
                        className="text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        Marcar lida
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {punchNotifications.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  Nenhuma notificação de ponto
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor de Horários - Modal Flutuante */}
      {showScheduleEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4" onClick={() => setShowScheduleEditor(false)}>
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Gerenciar Horários dos Funcionários
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowScheduleEditor(false);
                  setEditingSchedule(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de Funcionários */}
            <div>
              <Label className="text-white font-medium mb-3 block">Funcionários Cadastrados</Label>
              <div className="space-y-2">
                {employeeSchedules.map((schedule) => (
                  <div key={schedule.employeeId} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{schedule.employeeName}</div>
                        <div className="text-gray-400 text-sm">
                          Entrada: {schedule.workStart} | Saída: {schedule.workEnd}
                          {schedule.lunchStart && ` | Almoço: ${schedule.lunchStart}-${schedule.lunchEnd}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSchedule(schedule)}
                        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário de Edição */}
            {editingSchedule && (
              <div className="border-t border-gray-600 pt-4">
                <Label className="text-white font-medium mb-3 block">
                  Editar Horário - {editingSchedule.employeeName}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white text-sm">Horário de Entrada</Label>
                    <Input
                      type="time"
                      value={editingSchedule.workStart}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, workStart: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Horário de Saída</Label>
                    <Input
                      type="time"
                      value={editingSchedule.workEnd}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, workEnd: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Início do Almoço (opcional)</Label>
                    <Input
                      type="time"
                      value={editingSchedule.lunchStart || ''}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, lunchStart: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Fim do Almoço (opcional)</Label>
                    <Input
                      type="time"
                      value={editingSchedule.lunchEnd || ''}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, lunchEnd: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    onClick={() => {
                      saveEmployeeSchedule(editingSchedule);
                      setEditingSchedule(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingSchedule(null)}
                    className="border-gray-600 text-white hover:bg-gray-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      )}

      {/* Configurações - Modal Flutuante */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4" onClick={() => setShowSettings(false)}>
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configurações do Ponto
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Configurações Pessoais */}
            <div>
              <Label className="text-white">Minhas Configurações</Label>
              <div className="space-y-3 mt-2">
                <div className="p-3 bg-gray-700 rounded">
                  <div className="text-white font-medium mb-2">Status do Ponto</div>
                  <div className="text-gray-400 text-sm">
                    Status atual: {currentEntry?.status === 'working' ? 'Trabalhando' : 'Offline'}
                  </div>
                  {currentEntry && (
                    <div className="text-gray-400 text-xs mt-1">
                      Entrada: {currentEntry.clockIn || 'Não registrada'}
                      {currentEntry.clockOut && ` | Saída: ${currentEntry.clockOut}`}
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-gray-700 rounded">
                  <div className="text-white font-medium mb-2">Localização Atual</div>
                  {currentLocation ? (
                    <div className="text-gray-400 text-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className={isInCompany ? 'text-green-400' : 'text-yellow-400'}>
                            {isInCompany ? '✅ Na empresa' : '📍 Trabalho remoto'}
                          </div>
                          {currentAddress && (
                            <div className="text-white text-sm mt-1">
                              📌 {currentAddress}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs border-t border-gray-600 pt-2 mt-2">
                        <div>Coordenadas: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</div>
                        <div>Precisão: {currentLocation.accuracy.toFixed(0)}m</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Localização não disponível
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-700 rounded">
                  <div className="text-white font-medium mb-2">Opções</div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          toast.loading("Atualizando localização...", { id: "update-location" });
                          const location = await getCurrentLocation();
                          setCurrentLocation(location);
                          getAddressFromCoordinates(location.latitude, location.longitude);
                          setIsInCompany(checkIfInCompany(location));
                          setLocationError(null);
                          toast.success("Localização atualizada!", { id: "update-location" });
                        } catch (error) {
                          toast.error("Erro ao atualizar localização", { 
                            id: "update-location",
                            description: (error as Error).message 
                          });
                        }
                      }}
                      className="w-full border-gray-600 text-white hover:bg-gray-600"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Atualizar Localização
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Histórico de pontos será implementado em breve")}
                      className="w-full border-gray-600 text-white hover:bg-gray-600"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Ver Histórico
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔒 Status de Segurança */}
            <div className="p-3 bg-gray-700 rounded border-l-4 border-blue-500">
              <div className="text-white font-medium mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-400" />
                Segurança da Localização
              </div>
              {securityValidation ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Nível de Confiança:</span>
                    <Badge 
                      className={`${
                        securityValidation.trustScore >= 80 
                          ? 'bg-green-600' 
                          : securityValidation.trustScore >= 50 
                            ? 'bg-yellow-600' 
                            : 'bg-red-600'
                      }`}
                    >
                      {securityValidation.trustScore}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded ${securityValidation.flags.possibleMockLocation ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                      {securityValidation.flags.possibleMockLocation ? '❌' : '✅'} GPS Real
                    </div>
                    <div className={`p-2 rounded ${securityValidation.flags.suspiciousAccuracy ? 'bg-yellow-900/50' : 'bg-green-900/50'}`}>
                      {securityValidation.flags.suspiciousAccuracy ? '⚠️' : '✅'} Precisão OK
                    </div>
                    <div className={`p-2 rounded ${securityValidation.flags.impossibleSpeed ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                      {securityValidation.flags.impossibleSpeed ? '❌' : '✅'} Velocidade OK
                    </div>
                    <div className={`p-2 rounded ${securityValidation.flags.devToolsOpen ? 'bg-yellow-900/50' : 'bg-green-900/50'}`}>
                      {securityValidation.flags.devToolsOpen ? '⚠️' : '✅'} Navegador OK
                    </div>
                  </div>
                  
                  {securityValidation.warnings.length > 0 && (
                    <div className="mt-2 p-2 bg-red-900/30 rounded">
                      <div className="text-red-400 text-xs font-medium mb-1">⚠️ Alertas:</div>
                      {securityValidation.warnings.map((warning, idx) => (
                        <div key={idx} className="text-red-300 text-xs">• {warning}</div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-gray-500 text-xs mt-2 border-t border-gray-600 pt-2">
                    🔐 Dispositivo: {deviceFingerprint.slice(0, 8)}...
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  Aguardando localização para verificar segurança...
                </div>
              )}
            </div>

            {/* Configurações Administrativas (apenas para admins) */}
            {isAdmin && (
              <div>
                <Label className="text-white">Configurações Administrativas</Label>
                <div className="space-y-2 mt-2">
                  <div className="p-3 bg-gray-700 rounded">
                    <div className="text-white font-medium mb-2">Localizações da Empresa</div>
                    {COMPANY_LOCATIONS.map((loc, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-600 rounded">
                        <div className="text-white font-medium text-sm">{loc.name}</div>
                        <div className="text-gray-400 text-xs">{loc.address}</div>
                        <div className="text-gray-400 text-xs">
                          Raio: {loc.radius}m | {loc.latitude}, {loc.longitude}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-gray-700 rounded">
                    <div className="text-white font-medium mb-2">Funcionários Online</div>
                    <div className="p-2 bg-gray-600 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium text-sm">{user.name}</div>
                          <div className="text-gray-400 text-xs">
                            Status: {currentEntry?.status === 'working' ? 'Trabalhando' : 'Offline'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">
                            {currentEntry?.totalHours.toFixed(2) || '0.00'}h
                          </div>
                          <div className={`text-xs ${isInCompany ? 'text-green-400' : 'text-yellow-400'}`}>
                            {isInCompany ? 'Na empresa' : 'Remoto'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      )}

      {/* Erro de Localização */}
      {locationError && (
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-red-400 font-medium">Erro de Localização</div>
                  <div className="text-red-300 text-sm">{locationError}</div>
                </div>
              </div>
              
              {/* Soluções sugeridas */}
              <div className="bg-red-900/30 p-3 rounded">
                <div className="text-red-200 text-sm font-medium mb-2">💡 Soluções:</div>
                <ul className="text-red-300 text-xs space-y-1">
                  <li>• Clique no ícone 🔒 na barra de endereços</li>
                  <li>• Selecione "Permitir" para localização</li>
                  <li>• Recarregue a página após permitir</li>
                  <li>• Verifique se o GPS do dispositivo está ativo</li>
                  <li>• Tente usar HTTPS ao invés de HTTP</li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestLocationPermission}
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  🔄 Tentar Novamente
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Registrar ponto manual sem GPS
                    const entry: AutoTimesheetEntry = {
                      id: Date.now().toString(),
                      employeeId: user?.id || '',
                      employeeName: user?.name || '',
                      date: new Date().toISOString().split('T')[0],
                      clockIn: new Date().toTimeString().slice(0, 8),
                      totalHours: 0,
                      overtimeHours: 0,
                      location: {},
                      isInCompany: false,
                      isAutomatic: false,
                      needsApproval: true,
                      activities: [],
                      status: 'working',
                    };
                    
                    setCurrentEntry(entry);
                    logActivity('login', 'Login manual (sem GPS)');
                    
                    toast.warning("⚠️ Ponto registrado manualmente", {
                      description: "Sem localização - aguarda aprovação do gestor",
                    });
                  }}
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  📝 Registrar Manualmente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração de Endereços da Empresa - Modal Flutuante */}
      {showAddressConfig && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4" onClick={() => setShowAddressConfig(false)}>
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                  Configuração de Endereços da Empresa
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddressConfig(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lista de Endereços Atuais */}
            <div>
              <Label className="text-white font-medium mb-3 block">Endereços Configurados</Label>
              <div className="space-y-3">
                {companyAddresses.map((address, index) => (
                  <div key={address.id || index} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{address.name}</div>
                        <div className="text-gray-400 text-sm">{address.address}</div>
                        {address.cep && (
                          <div className="text-gray-400 text-sm">CEP: {address.cep}</div>
                        )}
                        <div className="text-gray-500 text-xs">
                          Lat: {address.latitude.toFixed(6)}, Lng: {address.longitude.toFixed(6)} | 
                          Raio: {address.radius}m
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editCompanyAddress(address)}
                          className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCompanyAddress(address.id || index.toString())}
                          className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário para Adicionar/Editar Endereço */}
            <div className="border-t border-gray-600 pt-6">
              <Label className="text-white font-medium mb-3 block">
                {editingAddress ? 'Editar Endereço' : 'Adicionar Novo Endereço'}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-sm">Nome do Local</Label>
                  <Input
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    placeholder="Ex: Matriz, Filial Centro, etc."
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">CEP</Label>
                  <Input
                    value={newAddress.cep}
                    onChange={(e) => setNewAddress({ ...newAddress, cep: e.target.value })}
                    placeholder="Ex: 30112-021"
                    maxLength={9}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-white text-sm">Endereço Completo</Label>
                  <Input
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    placeholder="Ex: Av. Getúlio Vargas, 1500 - Savassi, Belo Horizonte - MG"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm flex items-center justify-between">
                    Latitude
                    {currentLocation && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setNewAddress({ ...newAddress, latitude: currentLocation.latitude })}
                        className="text-xs text-blue-400 hover:text-blue-300 h-auto p-1"
                      >
                        Usar localização atual
                      </Button>
                    )}
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={newAddress.latitude === 0 ? '' : newAddress.latitude}
                    onChange={(e) => setNewAddress({ ...newAddress, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="Ex: -23.5505"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm flex items-center justify-between">
                    Longitude
                    {currentLocation && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setNewAddress({ ...newAddress, longitude: currentLocation.longitude })}
                        className="text-xs text-blue-400 hover:text-blue-300 h-auto p-1"
                      >
                        Usar localização atual
                      </Button>
                    )}
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={newAddress.longitude === 0 ? '' : newAddress.longitude}
                    onChange={(e) => setNewAddress({ ...newAddress, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="Ex: -46.6333"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-white text-sm">Raio de Tolerância (metros)</Label>
                  <Input
                    type="number"
                    value={newAddress.radius}
                    onChange={(e) => setNewAddress({ ...newAddress, radius: parseInt(e.target.value) || 150 })}
                    placeholder="150"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <div className="text-gray-400 text-xs mt-1">
                    Distância máxima em metros para considerar que o funcionário está na empresa
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {currentLocation && !editingAddress && (
                  <Button
                    variant="outline"
                    onClick={() => setNewAddress({
                      ...newAddress,
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude
                    })}
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Usar Minha Localização
                  </Button>
                )}
                
                {editingAddress ? (
                  <>
                    <Button
                      onClick={updateCompanyAddress}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Atualizar Endereço
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-gray-600 text-white hover:bg-gray-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={addCompanyAddress}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Endereço
                  </Button>
                )}
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-blue-900/20 border border-blue-500/50 p-3 rounded">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="w-full">
                  <div className="text-blue-400 font-medium text-sm mb-1">Como obter coordenadas:</div>
                  <ol className="text-blue-300 text-xs space-y-1 list-decimal list-inside mb-3">
                    <li>Abra o Google Maps</li>
                    <li>Digite o endereço da empresa</li>
                    <li>Clique com o botão direito no local exato</li>
                    <li>Selecione "Coordenadas" e copie os valores</li>
                    <li>Cole aqui as coordenadas (latitude e longitude)</li>
                  </ol>
                  
                  <div className="text-green-400 font-medium text-sm mb-1 mt-3">📍 Dados de Exemplo para Testes:</div>
                  <div className="bg-green-900/30 p-2 rounded text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-green-200">
                      <div>
                        <div className="font-semibold mb-1">🏢 Sede Savassi (BH)</div>
                        <div>CEP: 30112-021</div>
                        <div>Lat: -19.9311</div>
                        <div>Lng: -43.9380</div>
                        <div>Raio: 100m</div>
                      </div>
                      <div>
                        <div className="font-semibold mb-1">🏢 Filial Centro (BH)</div>
                        <div>CEP: 30160-011</div>
                        <div>Lat: -19.9208</div>
                        <div>Lng: -43.9378</div>
                        <div>Raio: 150m</div>
                      </div>
                      <div>
                        <div className="font-semibold mb-1">📦 Depósito</div>
                        <div>CEP: 32040-000</div>
                        <div>Lat: -19.9537</div>
                        <div>Lng: -43.9633</div>
                        <div>Raio: 200m</div>
                      </div>
                    </div>
                    <div className="text-green-300 text-xs mt-2 pt-2 border-t border-green-700">
                      💡 <strong>Dica:</strong> Clique em "Editar" ao lado de qualquer endereço para testar a funcionalidade de edição!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
