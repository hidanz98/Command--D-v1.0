import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Play,
  Pause,
  Square,
  Coffee,
  Utensils,
  MapPin,
  Calendar,
  User,
  Edit,
  Save,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Upload,
  Settings,
  Bell,
  Timer,
  Target,
  TrendingUp,
  Users,
  Activity,
  X,
  Plus,
  BarChart3,
  PieChart,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  MessageSquare,
  Calculator,
} from "lucide-react";
import { triggerTimesheetUpdate } from "@/hooks/use-payroll-integration";
import { useAuth } from "@/context/AuthContext";
import { useTimesheet } from "@/context/TimesheetContext";

// Interfaces
interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  lunchStart?: string;
  lunchEnd?: string;
  totalHours: number;
  overtimeHours: number;
  status: "working" | "break" | "lunch" | "clocked_out" | "absent";
  location?: string;
  notes: string;
  approvedBy?: string;
  isEdited: boolean;
  originalEntry?: TimeEntry;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  workSchedule: {
    monday: { start: string; end: string; workday: boolean };
    tuesday: { start: string; end: string; workday: boolean };
    wednesday: { start: string; end: string; workday: boolean };
    thursday: { start: string; end: string; workday: boolean };
    friday: { start: string; end: string; workday: boolean };
    saturday: { start: string; end: string; workday: boolean };
    sunday: { start: string; end: string; workday: boolean };
  };
  expectedHours: number;
  isActive: boolean;
  currentStatus: "working" | "break" | "lunch" | "offline";
  lastActivity?: string;
}

interface TimesheetAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "late_arrival" | "missed_break" | "overtime_warning" | "lunch_reminder" | "clock_out_reminder";
  message: string;
  priority: "low" | "medium" | "high";
  timestamp: string;
  acknowledged: boolean;
}

interface TimesheetSettings {
  workdayStartHour: number;
  workdayEndHour: number;
  breakDuration: number; // minutes
  lunchDuration: number; // minutes
  overtimeThreshold: number; // hours
  lateThreshold: number; // minutes
  autoClockOut: boolean;
  autoClockOutTime: string;
  requireLocation: boolean;
  allowManualEdit: boolean;
  approvalRequired: boolean;
}

// Mock Data
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "João Silva Santos",
    email: "joao.silva@bilscinema.com",
    position: "Técnico de Equipamentos Senior",
    department: "Operações",
    workSchedule: {
      monday: { start: "08:00", end: "17:00", workday: true },
      tuesday: { start: "08:00", end: "17:00", workday: true },
      wednesday: { start: "08:00", end: "17:00", workday: true },
      thursday: { start: "08:00", end: "17:00", workday: true },
      friday: { start: "08:00", end: "17:00", workday: true },
      saturday: { start: "08:00", end: "12:00", workday: true },
      sunday: { start: "00:00", end: "00:00", workday: false },
    },
    expectedHours: 44,
    isActive: true,
    currentStatus: "working",
    lastActivity: "2025-01-17T09:15:00Z",
  },
  {
    id: "2",
    name: "Maria Santos Oliveira",
    email: "maria.santos@bilscinema.com",
    position: "Assistente Financeiro",
    department: "Financeiro",
    workSchedule: {
      monday: { start: "09:00", end: "18:00", workday: true },
      tuesday: { start: "09:00", end: "18:00", workday: true },
      wednesday: { start: "09:00", end: "18:00", workday: true },
      thursday: { start: "09:00", end: "18:00", workday: true },
      friday: { start: "09:00", end: "18:00", workday: true },
      saturday: { start: "00:00", end: "00:00", workday: false },
      sunday: { start: "00:00", end: "00:00", workday: false },
    },
    expectedHours: 40,
    isActive: true,
    currentStatus: "lunch",
    lastActivity: "2025-01-17T12:00:00Z",
  },
];

const MOCK_TIME_ENTRIES: TimeEntry[] = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "João Silva Santos",
    date: "2025-01-17",
    clockIn: "08:05",
    breakStart: "10:00",
    breakEnd: "10:15",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    totalHours: 8.5,
    overtimeHours: 0.5,
    status: "working",
    location: "Escritório Principal",
    notes: "",
    isEdited: false,
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Maria Santos Oliveira",
    date: "2025-01-17",
    clockIn: "08:58",
    breakStart: "10:30",
    breakEnd: "10:45",
    lunchStart: "12:00",
    totalHours: 4.0,
    overtimeHours: 0,
    status: "lunch",
    location: "Escritório Principal",
    notes: "",
    isEdited: false,
  },
];

const MOCK_ALERTS: TimesheetAlert[] = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "João Silva Santos",
    type: "overtime_warning",
    message: "Funcionário está próximo de atingir hora extra",
    priority: "medium",
    timestamp: "2025-01-17T16:30:00Z",
    acknowledged: false,
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Maria Santos Oliveira",
    type: "lunch_reminder",
    message: "Lembrete: Hora do almoço",
    priority: "low",
    timestamp: "2025-01-17T12:00:00Z",
    acknowledged: true,
  },
];

const DEFAULT_SETTINGS: TimesheetSettings = {
  workdayStartHour: 8,
  workdayEndHour: 18,
  breakDuration: 15,
  lunchDuration: 60,
  overtimeThreshold: 8,
  lateThreshold: 15,
  autoClockOut: true,
  autoClockOutTime: "18:00",
  requireLocation: false,
  allowManualEdit: true,
  approvalRequired: false,
};

interface Props {
  currentUserId?: string;
  isAdmin?: boolean;
}

export const TimesheetSystem: React.FC<Props> = ({ 
  currentUserId = "1", 
  isAdmin = false 
}) => {
  const [activeTab, setActiveTab] = useState<string>("punch_clock");
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const { entries: contextEntries, updateEntry: updateContextEntry } = useTimesheet();
  
  // Converter entradas do contexto para o formato local
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    return contextEntries.map(entry => ({
      id: entry.id,
      employeeId: entry.employeeId,
      employeeName: entry.employeeName,
      date: entry.date,
      clockIn: entry.clockIn,
      clockOut: entry.clockOut,
      breakStart: undefined,
      breakEnd: undefined,
      lunchStart: entry.lunchStart,
      lunchEnd: entry.lunchEnd,
      totalHours: entry.totalHours,
      overtimeHours: entry.overtimeHours,
      status: entry.status as any || "clocked_out",
      location: entry.isInCompany ? "Empresa" : "Remoto",
      notes: entry.managerNotes || "",
      approvedBy: entry.approvedBy,
      isEdited: false,
    }));
  });
  
  const [alerts, setAlerts] = useState<TimesheetAlert[]>(MOCK_ALERTS);
  const [settings, setSettings] = useState<TimesheetSettings>(DEFAULT_SETTINGS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("month"); // Padrão: mês inteiro
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Sincronizar com contexto quando ele muda
  useEffect(() => {
    setTimeEntries(contextEntries.map(entry => ({
      id: entry.id,
      employeeId: entry.employeeId,
      employeeName: entry.employeeName,
      date: entry.date,
      clockIn: entry.clockIn,
      clockOut: entry.clockOut,
      breakStart: undefined,
      breakEnd: undefined,
      lunchStart: entry.lunchStart,
      lunchEnd: entry.lunchEnd,
      totalHours: entry.totalHours,
      overtimeHours: entry.overtimeHours,
      status: entry.status as any || "clocked_out",
      location: entry.isInCompany ? "Empresa" : "Remoto",
      notes: entry.managerNotes || "",
      approvedBy: entry.approvedBy,
      isEdited: false,
    })));
  }, [contextEntries]);

  // Current user and employee data
  const currentEmployee = employees.find(emp => emp.id === currentUserId);
  const currentTimeEntry = timeEntries.find(entry => 
    entry.employeeId === currentUserId && entry.date === filterDate
  );

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-generate alerts
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      employees.forEach(employee => {
        if (!employee.isActive) return;

        const todayEntry = timeEntries.find(entry => 
          entry.employeeId === employee.id && 
          entry.date === now.toISOString().split('T')[0]
        );

        // Check for lunch reminder
        if (currentHour === 12 && currentMinute === 0 && employee.currentStatus === "working") {
          const existingAlert = alerts.find(alert => 
            alert.employeeId === employee.id && 
            alert.type === "lunch_reminder" && 
            alert.timestamp.startsWith(now.toISOString().split('T')[0])
          );
          
          if (!existingAlert) {
            const newAlert: TimesheetAlert = {
              id: `alert_${Date.now()}_${employee.id}`,
              employeeId: employee.id,
              employeeName: employee.name,
              type: "lunch_reminder",
              message: "Lembrete: Hora do almoço",
              priority: "low",
              timestamp: now.toISOString(),
              acknowledged: false,
            };
            setAlerts(prev => [...prev, newAlert]);
          }
        }

        // Check for overtime warning
        if (todayEntry && todayEntry.totalHours >= settings.overtimeThreshold - 0.5) {
          const existingAlert = alerts.find(alert => 
            alert.employeeId === employee.id && 
            alert.type === "overtime_warning" && 
            alert.timestamp.startsWith(now.toISOString().split('T')[0])
          );
          
          if (!existingAlert) {
            const newAlert: TimesheetAlert = {
              id: `alert_${Date.now()}_${employee.id}`,
              employeeId: employee.id,
              employeeName: employee.name,
              type: "overtime_warning",
              message: "Funcionário está próximo de atingir hora extra",
              priority: "medium",
              timestamp: now.toISOString(),
              acknowledged: false,
            };
            setAlerts(prev => [...prev, newAlert]);
          }
        }
      });
    };

    const alertTimer = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(alertTimer);
  }, [employees, timeEntries, alerts, settings]);

  // Clock actions
  const handleClockAction = (action: string) => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const dateString = now.toISOString().split('T')[0];

    let updatedEntry = timeEntries.find(entry => 
      entry.employeeId === currentUserId && entry.date === dateString
    );

    if (!updatedEntry) {
      // Create new entry for today
      updatedEntry = {
        id: `entry_${Date.now()}`,
        employeeId: currentUserId,
        employeeName: currentEmployee?.name || "",
        date: dateString,
        totalHours: 0,
        overtimeHours: 0,
        status: "clocked_out",
        notes: "",
        isEdited: false,
      };
    }

    const newEntry = { ...updatedEntry };

    switch (action) {
      case "clock_in":
        newEntry.clockIn = timeString;
        newEntry.status = "working";
        break;
      case "clock_out":
        newEntry.clockOut = timeString;
        newEntry.status = "clocked_out";
        // Calculate total hours
        if (newEntry.clockIn) {
          const clockInTime = new Date(`${dateString}T${newEntry.clockIn}:00`);
          const clockOutTime = new Date(`${dateString}T${timeString}:00`);
          let totalMs = clockOutTime.getTime() - clockInTime.getTime();
          
          // Subtract break time
          if (newEntry.breakStart && newEntry.breakEnd) {
            const breakStart = new Date(`${dateString}T${newEntry.breakStart}:00`);
            const breakEnd = new Date(`${dateString}T${newEntry.breakEnd}:00`);
            totalMs -= (breakEnd.getTime() - breakStart.getTime());
          }
          
          // Subtract lunch time
          if (newEntry.lunchStart && newEntry.lunchEnd) {
            const lunchStart = new Date(`${dateString}T${newEntry.lunchStart}:00`);
            const lunchEnd = new Date(`${dateString}T${newEntry.lunchEnd}:00`);
            totalMs -= (lunchEnd.getTime() - lunchStart.getTime());
          }
          
          const totalHours = totalMs / (1000 * 60 * 60);
          newEntry.totalHours = Math.round(totalHours * 100) / 100;
          newEntry.overtimeHours = Math.max(0, totalHours - settings.overtimeThreshold);
        }
        break;
      case "break_start":
        newEntry.breakStart = timeString;
        newEntry.status = "break";
        break;
      case "break_end":
        newEntry.breakEnd = timeString;
        newEntry.status = "working";
        break;
      case "lunch_start":
        newEntry.lunchStart = timeString;
        newEntry.status = "lunch";
        break;
      case "lunch_end":
        newEntry.lunchEnd = timeString;
        newEntry.status = "working";
        break;
    }

    // Save to localStorage for persistence
    localStorage.setItem(`timesheet_${currentUserId}_${dateString}`, JSON.stringify(newEntry));

    // Update or add entry
    const entryIndex = timeEntries.findIndex(entry => entry.id === newEntry.id);
    if (entryIndex >= 0) {
      const updatedEntries = [...timeEntries];
      updatedEntries[entryIndex] = newEntry;
      setTimeEntries(updatedEntries);
    } else {
      setTimeEntries([...timeEntries, newEntry]);
    }

    // Update employee status
    const updatedEmployees = employees.map(emp =>
      emp.id === currentUserId
        ? { ...emp, currentStatus: newEntry.status as Employee['currentStatus'], lastActivity: now.toISOString() }
        : emp
    );

    // Trigger payroll system update
    triggerTimesheetUpdate();
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400 bg-red-400/20";
      case "medium": return "text-yellow-400 bg-yellow-400/20";
      case "low": return "text-green-400 bg-green-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working": return "text-green-400 bg-green-400/20";
      case "break": return "text-yellow-400 bg-yellow-400/20";
      case "lunch": return "text-blue-400 bg-blue-400/20";
      case "clocked_out": return "text-gray-400 bg-gray-400/20";
      case "absent": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const filteredTimeEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de período
    let matchesPeriod = true;
    if (filterStatus === "today") {
      matchesPeriod = entry.date === new Date().toISOString().split('T')[0];
    } else if (filterStatus === "week") {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const entryDate = new Date(entry.date);
      matchesPeriod = entryDate >= weekAgo && entryDate <= today;
    } else if (filterStatus === "month") {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      const entryDate = new Date(entry.date);
      matchesPeriod = entryDate >= monthAgo && entryDate <= today;
    }
    
    return matchesSearch && matchesPeriod;
  });

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="h-full bg-cinema-dark-lighter">
      {/* Header */}
      <div className="p-4 border-b border-cinema-gray-light">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-cinema-yellow" />
              Sistema de Folha de Ponto
            </h2>
            <p className="text-gray-400 text-sm">
              Controle de horas e presença integrado
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-lg font-mono text-cinema-yellow">
                {currentTime.toLocaleTimeString('pt-BR')}
              </div>
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unacknowledgedAlerts.length > 0 && (
              <Button
                variant="outline"
                className="text-red-400 border-red-400 relative"
                onClick={() => setActiveTab("alerts")}
              >
                <Bell className="w-4 h-4 mr-2" />
                Alertas
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unacknowledgedAlerts.length}
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
            >
              <Download className="w-4 h-4 mr-2" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "punch_clock", name: "Bater Ponto", icon: Clock },
            { id: "timesheet", name: "Folha de Ponto", icon: FileText },
            { id: "employees", name: "Funcionários", icon: Users },
            { id: "alerts", name: "Alertas", icon: Bell },
            { id: "reports", name: "Relatórios", icon: BarChart3 },
            { id: "auto_point_config", name: "Config. Auto Ponto", icon: Settings },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "bg-cinema-yellow text-cinema-dark"
                  : "text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow"
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
              {tab.id === "alerts" && unacknowledgedAlerts.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ height: "calc(100% - 140px)" }}>
        {/* Punch Clock Tab */}
        {activeTab === "punch_clock" && (
          <div className="space-y-6">
            {/* Current Status */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {currentEmployee?.name} - Status Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${getStatusColor(currentEmployee?.currentStatus || "offline")}`}>
                      {currentEmployee?.currentStatus === "working" && <Play className="w-4 h-4 mr-2" />}
                      {currentEmployee?.currentStatus === "break" && <Coffee className="w-4 h-4 mr-2" />}
                      {currentEmployee?.currentStatus === "lunch" && <Utensils className="w-4 h-4 mr-2" />}
                      {currentEmployee?.currentStatus === "offline" && <Square className="w-4 h-4 mr-2" />}
                      <span className="capitalize">
                        {currentEmployee?.currentStatus === "working" ? "Trabalhando" :
                         currentEmployee?.currentStatus === "break" ? "Intervalo" :
                         currentEmployee?.currentStatus === "lunch" ? "Almoço" : "Offline"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Status Atual</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cinema-yellow">
                      {currentTimeEntry?.totalHours.toFixed(1) || "0.0"}h
                    </p>
                    <p className="text-gray-400 text-sm">Horas Trabalhadas Hoje</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {currentTimeEntry?.clockIn || "--:--"}
                    </p>
                    <p className="text-gray-400 text-sm">Entrada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Punch Clock Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => handleClockAction("clock_in")}
                disabled={currentTimeEntry?.clockIn && !!!currentTimeEntry?.clockOut}
                className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white disabled:opacity-50"
              >
                <div className="text-center">
                  <Play className="w-8 h-8 mx-auto mb-1" />
                  <div className="font-semibold">Entrada</div>
                  <div className="text-xs opacity-90">Bater ponto</div>
                </div>
              </Button>

              <Button
                onClick={() => handleClockAction("clock_out")}
                disabled={!currentTimeEntry?.clockIn || !!currentTimeEntry?.clockOut}
                className="h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50"
              >
                <div className="text-center">
                  <Square className="w-8 h-8 mx-auto mb-1" />
                  <div className="font-semibold">Saída</div>
                  <div className="text-xs opacity-90">Finalizar dia</div>
                </div>
              </Button>

              <Button
                onClick={() => handleClockAction(currentTimeEntry?.breakStart && !currentTimeEntry?.breakEnd ? "break_end" : "break_start")}
                disabled={!currentTimeEntry?.clockIn || !!currentTimeEntry?.clockOut}
                className="h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white disabled:opacity-50"
              >
                <div className="text-center">
                  <Coffee className="w-8 h-8 mx-auto mb-1" />
                  <div className="font-semibold">
                    {currentTimeEntry?.breakStart && !currentTimeEntry?.breakEnd ? "Voltar" : "Intervalo"}
                  </div>
                  <div className="text-xs opacity-90">Pausa rápida</div>
                </div>
              </Button>

              <Button
                onClick={() => handleClockAction(currentTimeEntry?.lunchStart && !currentTimeEntry?.lunchEnd ? "lunch_end" : "lunch_start")}
                disabled={!currentTimeEntry?.clockIn || !!currentTimeEntry?.clockOut}
                className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50"
              >
                <div className="text-center">
                  <Utensils className="w-8 h-8 mx-auto mb-1" />
                  <div className="font-semibold">
                    {currentTimeEntry?.lunchStart && !currentTimeEntry?.lunchEnd ? "Voltar" : "Almoço"}
                  </div>
                  <div className="text-xs opacity-90">Refeição</div>
                </div>
              </Button>
            </div>

            {/* Today's Timeline */}
            {currentTimeEntry && (
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white">Timeline do Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentTimeEntry.clockIn && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-white">Entrada: {currentTimeEntry.clockIn}</span>
                      </div>
                    )}
                    {currentTimeEntry.breakStart && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-white">
                          Intervalo: {currentTimeEntry.breakStart}
                          {currentTimeEntry.breakEnd && ` - ${currentTimeEntry.breakEnd}`}
                        </span>
                      </div>
                    )}
                    {currentTimeEntry.lunchStart && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-white">
                          Almoço: {currentTimeEntry.lunchStart}
                          {currentTimeEntry.lunchEnd && ` - ${currentTimeEntry.lunchEnd}`}
                        </span>
                      </div>
                    )}
                    {currentTimeEntry.clockOut && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-white">Saída: {currentTimeEntry.clockOut}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Timesheet Tab */}
        {activeTab === "timesheet" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Folha de Ponto</h3>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-cinema-dark border-cinema-gray-light text-white"
                />
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="text-cinema-yellow border-cinema-yellow"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                )}
              </div>
            </div>

            {/* Filters */}
            {isAdmin && (
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar funcionário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
                  />
                </div>
                
                <Select value={searchTerm || "todos"} onValueChange={(value) => setSearchTerm(value === "todos" ? "" : value)}>
                  <SelectTrigger className="w-[200px] bg-cinema-dark border-cinema-gray-light text-white">
                    <SelectValue placeholder="Todos os funcionários" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinema-dark border-cinema-gray-light">
                    <SelectItem value="todos" className="text-white">Todos os funcionários</SelectItem>
                    <SelectItem value="João Silva Santos" className="text-white">João Silva Santos</SelectItem>
                    <SelectItem value="Maria Silva" className="text-white">Maria Silva</SelectItem>
                    <SelectItem value="Pedro Santos" className="text-white">Pedro Santos</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] bg-cinema-dark border-cinema-gray-light text-white">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinema-dark border-cinema-gray-light">
                    <SelectItem value="today" className="text-white">Hoje</SelectItem>
                    <SelectItem value="week" className="text-white">Esta Semana</SelectItem>
                    <SelectItem value="month" className="text-white">Este Mês</SelectItem>
                    <SelectItem value="all" className="text-white">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-cinema-dark border border-cinema-gray-light text-white rounded-md px-3 py-2"
                >
                  <option value="all">Todos os Status</option>
                  <option value="working">Trabalhando</option>
                  <option value="break">Intervalo</option>
                  <option value="lunch">Almoço</option>
                  <option value="clocked_out">Saída</option>
                  <option value="absent">Ausente</option>
                </select>
              </div>
            )}

            {/* Timesheet Table */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cinema-gray-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Funcionário</th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Entrada</th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Saída</th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Almoço</th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Horas</th>
                        <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Status</th>
                        {isAdmin && (
                          <th className="px-4 py-3 text-left text-cinema-yellow font-medium">Ações</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTimeEntries.map((entry) => (
                        <tr key={entry.id} className={`border-b border-cinema-gray-light hover:bg-cinema-dark-lighter ${entry.isEdited ? 'bg-orange-400/5' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-white">{entry.employeeName}</span>
                              {entry.isEdited && (
                                <div className="flex items-center space-x-1">
                                  <Edit className="w-3 h-3 text-orange-400" />
                                  <span className="text-xs text-orange-400">Editado</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {entry.clockIn || "--:--"}
                            {entry.isEdited && entry.originalEntry?.clockIn && entry.clockIn !== entry.originalEntry.clockIn && (
                              <div className="text-xs text-orange-400">
                                (orig: {entry.originalEntry.clockIn})
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {entry.clockOut || "--:--"}
                            {entry.isEdited && entry.originalEntry?.clockOut && entry.clockOut !== entry.originalEntry.clockOut && (
                              <div className="text-xs text-orange-400">
                                (orig: {entry.originalEntry.clockOut})
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {entry.lunchStart && entry.lunchEnd
                              ? `${entry.lunchStart} - ${entry.lunchEnd}`
                              : entry.lunchStart
                                ? `${entry.lunchStart} - Em andamento`
                                : "--:--"}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="text-white font-medium">{entry.totalHours.toFixed(1)}h</span>
                              {entry.isEdited && entry.originalEntry && entry.totalHours !== entry.originalEntry.totalHours && (
                                <div className="text-xs text-orange-400">
                                  (orig: {entry.originalEntry.totalHours.toFixed(1)}h)
                                </div>
                              )}
                              {entry.overtimeHours > 0 && (
                                <div className="text-orange-400 text-xs">
                                  +{entry.overtimeHours.toFixed(1)}h extra
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                              <span className="capitalize">
                                {entry.status === "working" ? "Trabalhando" :
                                 entry.status === "break" ? "Intervalo" :
                                 entry.status === "lunch" ? "Almoço" :
                                 entry.status === "clocked_out" ? "Saída" : "Ausente"}
                              </span>
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow"
                                  onClick={() => setShowEditModal(entry.id)}
                                  title="Editar registro"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-400 border-blue-400"
                                  onClick={() => {
                                    alert(`Observações: ${entry.notes || 'Nenhuma observação'}\nLocal: ${entry.location || 'Não informado'}`);
                                  }}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                {entry.notes && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-purple-400 border-purple-400"
                                    title={entry.notes}
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && isAdmin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Status dos Funcionários</h3>
              <Button
                variant="outline"
                className="text-cinema-yellow border-cinema-yellow"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Employee Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <Card key={employee.id} className="bg-cinema-dark border-cinema-gray-light">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{employee.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(employee.currentStatus)}`}>
                        {employee.currentStatus === "working" ? "Trabalhando" :
                         employee.currentStatus === "break" ? "Intervalo" :
                         employee.currentStatus === "lunch" ? "Almoço" : "Offline"}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cargo:</span>
                        <span className="text-white">{employee.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Departamento:</span>
                        <span className="text-white">{employee.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Horas Esperadas:</span>
                        <span className="text-white">{employee.expectedHours}h/semana</span>
                      </div>
                      {employee.lastActivity && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Última Atividade:</span>
                          <span className="text-white text-xs">
                            {new Date(employee.lastActivity).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Alertas do Sistema</h3>
              <Button
                variant="outline"
                className="text-cinema-yellow border-cinema-yellow"
                onClick={() => setAlerts(alerts.map(alert => ({ ...alert, acknowledged: true })))}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar Todos como Lidos
              </Button>
            </div>

            {/* Alerts List */}
            <Card className="bg-cinema-dark border-cinema-gray-light">
              <CardContent className="p-0">
                <div className="space-y-0">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-b border-cinema-gray-light hover:bg-cinema-dark-lighter ${
                        !alert.acknowledged ? 'bg-cinema-yellow/5 border-l-4 border-l-cinema-yellow' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(alert.priority)}`}>
                            {alert.type === "late_arrival" && <Clock className="w-4 h-4" />}
                            {alert.type === "missed_break" && <Coffee className="w-4 h-4" />}
                            {alert.type === "overtime_warning" && <AlertTriangle className="w-4 h-4" />}
                            {alert.type === "lunch_reminder" && <Utensils className="w-4 h-4" />}
                            {alert.type === "clock_out_reminder" && <Timer className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium ${!alert.acknowledged ? 'text-white' : 'text-gray-300'}`}>
                                {alert.employeeName}
                              </h4>
                              {!alert.acknowledged && (
                                <div className="w-2 h-2 bg-cinema-yellow rounded-full"></div>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(alert.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(alert.priority)}`}>
                            {alert.priority === "high" ? "Alta" : 
                             alert.priority === "medium" ? "Média" : "Baixa"}
                          </span>
                          {!alert.acknowledged && (
                            <Button 
                              size="sm" 
                              className="bg-cinema-yellow text-cinema-dark"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              OK
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && isAdmin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Relatórios de Ponto</h3>
              <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
                <Plus className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>

            {/* Quick Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <div className="text-center">
                  <FileText className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Ponto Diário</div>
                  <div className="text-xs opacity-90">Hoje</div>
                </div>
              </Button>

              <Button className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Ponto Semanal</div>
                  <div className="text-xs opacity-90">Esta semana</div>
                </div>
              </Button>

              <Button className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Horas Extras</div>
                  <div className="text-xs opacity-90">Mês atual</div>
                </div>
              </Button>

              <Button className="h-20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                <div className="text-center">
                  <Target className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Produtividade</div>
                  <div className="text-xs opacity-90">Análise</div>
                </div>
              </Button>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-blue-400">
                    {employees.filter(emp => emp.isActive).length}
                  </p>
                  <p className="text-gray-400 text-sm">Funcionários Ativos</p>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-400">
                    {timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0).toFixed(1)}h
                  </p>
                  <p className="text-gray-400 text-sm">Horas Trabalhadas</p>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-orange-400">
                    {timeEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0).toFixed(1)}h
                  </p>
                  <p className="text-gray-400 text-sm">Horas Extras</p>
                </CardContent>
              </Card>

              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-purple-400">
                    {employees.filter(emp => emp.currentStatus === "working").length}
                  </p>
                  <p className="text-gray-400 text-sm">Trabalhando Agora</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Auto Point Configuration Tab */}
        {activeTab === "auto_point_config" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Configurações do Auto Ponto</h3>
              <Button
                onClick={() => setActiveTab("punch_clock")}
                className="bg-cinema-yellow text-cinema-dark"
              >
                <Settings className="w-4 h-4 mr-2" />
                Testar Auto Ponto
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configurações de Localização */}
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-cinema-yellow" />
                    Configurações de Localização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Endereço Principal</Label>
                    <Input
                      placeholder="Ex: Rua das Flores, 123 - Centro, BH - MG"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Raio de Tolerância (metros)</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Endereços Adicionais</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Endereço alternativo"
                          className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        />
                        <Button size="sm" variant="outline" className="text-cinema-yellow border-cinema-yellow">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-400">
                        Adicione endereços onde o funcionário pode bater ponto
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Horário */}
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-cinema-yellow" />
                    Configurações de Horário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Horário de Entrada</Label>
                      <Input
                        type="time"
                        defaultValue="08:00"
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Horário de Saída</Label>
                      <Input
                        type="time"
                        defaultValue="18:00"
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Início do Almoço</Label>
                      <Input
                        type="time"
                        defaultValue="12:00"
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Fim do Almoço</Label>
                      <Input
                        type="time"
                        defaultValue="13:00"
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Tolerância de Atraso (minutos)</Label>
                    <Input
                      type="number"
                      placeholder="15"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Notificação */}
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-cinema-yellow" />
                    Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Lembrete de Entrada</Label>
                      <p className="text-sm text-gray-400">Notificar 15 min antes do horário</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-green-400 border-green-400">
                      Ativo
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Lembrete de Saída</Label>
                      <p className="text-sm text-gray-400">Notificar no horário de saída</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-green-400 border-green-400">
                      Ativo
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Alerta de Atraso</Label>
                      <p className="text-sm text-gray-400">Notificar quando atrasar</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-green-400 border-green-400">
                      Ativo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Status do Sistema */}
              <Card className="bg-cinema-dark border-cinema-gray-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-cinema-yellow" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-white">GPS Ativo</span>
                    </div>
                    <span className="text-green-400 text-sm">Funcionando</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-white">Localização</span>
                    </div>
                    <span className="text-green-400 text-sm">Detectada</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                      <span className="text-white">Precisão</span>
                    </div>
                    <span className="text-yellow-400 text-sm">15 metros</span>
                  </div>

                  <div className="pt-4 border-t border-cinema-gray-light">
                    <Button className="w-full bg-cinema-yellow text-cinema-dark">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Edit Time Entry Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Editar Registro de Ponto
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const entryToEdit = timeEntries.find(entry => entry.id === showEditModal);
                  if (!entryToEdit) return null;

                  return (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);

                      const updatedEntry: TimeEntry = {
                        ...entryToEdit,
                        clockIn: formData.get('clockIn') as string || undefined,
                        clockOut: formData.get('clockOut') as string || undefined,
                        breakStart: formData.get('breakStart') as string || undefined,
                        breakEnd: formData.get('breakEnd') as string || undefined,
                        lunchStart: formData.get('lunchStart') as string || undefined,
                        lunchEnd: formData.get('lunchEnd') as string || undefined,
                        totalHours: parseFloat(formData.get('totalHours') as string) || 0,
                        overtimeHours: parseFloat(formData.get('overtimeHours') as string) || 0,
                        notes: formData.get('notes') as string || '',
                        location: formData.get('location') as string || '',
                        isEdited: true,
                        originalEntry: entryToEdit.isEdited ? entryToEdit.originalEntry : { ...entryToEdit }
                      };

                      // Update the entry in the state
                      setTimeEntries(timeEntries.map(entry =>
                        entry.id === showEditModal ? updatedEntry : entry
                      ));

                      // Atualizar no contexto compartilhado
                      updateContextEntry(updatedEntry.id, {
                        clockIn: updatedEntry.clockIn,
                        clockOut: updatedEntry.clockOut,
                        lunchStart: updatedEntry.lunchStart,
                        lunchEnd: updatedEntry.lunchEnd,
                        totalHours: updatedEntry.totalHours,
                        overtimeHours: updatedEntry.overtimeHours,
                        managerNotes: updatedEntry.notes,
                      });

                      // Trigger payroll update
                      triggerTimesheetUpdate();

                      setShowEditModal(null);
                    }} className="space-y-6">

                      {/* Employee Info */}
                      <div className="bg-cinema-dark-lighter p-4 rounded-lg">
                        <h4 className="text-cinema-yellow font-medium mb-2">Informações do Funcionário</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Nome:</span>
                            <span className="text-white ml-2">{entryToEdit.employeeName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Data:</span>
                            <span className="text-white ml-2">
                              {new Date(entryToEdit.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Entrada</Label>
                          <Input
                            name="clockIn"
                            type="time"
                            defaultValue={entryToEdit.clockIn || ''}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white">Saída</Label>
                          <Input
                            name="clockOut"
                            type="time"
                            defaultValue={entryToEdit.clockOut || ''}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white">Início do Intervalo</Label>
                          <Input
                            name="breakStart"
                            type="time"
                            defaultValue={entryToEdit.breakStart || ''}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white">Fim do Intervalo</Label>
                          <Input
                            name="breakEnd"
                            type="time"
                            defaultValue={entryToEdit.breakEnd || ''}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white">Início do Almoço</Label>
                          <Input
                            name="lunchStart"
                            type="time"
                            defaultValue={entryToEdit.lunchStart || ''}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white">Fim do Almoço</Label>
                          <Input
                            name="lunchEnd"
                            type="time"
                            defaultValue={entryToEdit.lunchEnd || ''}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>

                      {/* Manual Hour Adjustment */}
                      <div className="border-t border-cinema-gray-light pt-4">
                        <h4 className="text-cinema-yellow font-medium mb-4 flex items-center">
                          <Calculator className="w-4 h-4 mr-2" />
                          Ajuste Manual de Horas
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Total de Horas Trabalhadas</Label>
                            <Input
                              name="totalHours"
                              type="number"
                              step="0.25"
                              min="0"
                              max="24"
                              defaultValue={entryToEdit.totalHours}
                              className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                              placeholder="Ex: 8.5"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Deixe em branco para cálculo automático
                            </p>
                          </div>

                          <div>
                            <Label className="text-white">Horas Extras</Label>
                            <Input
                              name="overtimeHours"
                              type="number"
                              step="0.25"
                              min="0"
                              max="12"
                              defaultValue={entryToEdit.overtimeHours}
                              className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                              placeholder="Ex: 1.5"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Horas trabalhadas além do expediente normal
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location and Notes */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Local de Trabalho</Label>
                          <Input
                            name="location"
                            type="text"
                            defaultValue={entryToEdit.location || ''}
                            placeholder="Ex: Escritório Principal, Home Office, Cliente X..."
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white">Observações Administrativas</Label>
                          <Textarea
                            name="notes"
                            defaultValue={entryToEdit.notes || ''}
                            placeholder="Digite observações sobre este registro de ponto..."
                            rows={4}
                            className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Motivo da edição, ajustes especiais, compensações, etc.
                          </p>
                        </div>
                      </div>

                      {/* Edit History */}
                      {entryToEdit.isEdited && entryToEdit.originalEntry && (
                        <div className="bg-orange-400/10 border border-orange-400/20 p-4 rounded-lg">
                          <h4 className="text-orange-400 font-medium mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Histórico de Edições
                          </h4>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-300">
                              <span className="text-gray-400">Registro Original:</span>
                              {entryToEdit.originalEntry.clockIn && ` Entrada: ${entryToEdit.originalEntry.clockIn}`}
                              {entryToEdit.originalEntry.clockOut && ` | Saída: ${entryToEdit.originalEntry.clockOut}`}
                              {` | Horas: ${entryToEdit.originalEntry.totalHours}h`}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400">Observação Original:</span>
                              {entryToEdit.originalEntry.notes || 'Nenhuma observação'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t border-cinema-gray-light">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowEditModal(null)}
                          className="text-gray-400 border-gray-600"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-dark border-cinema-gray-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Configurações do Sistema</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettingsModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Início do Expediente</Label>
                    <Input
                      type="time"
                      value={`${settings.workdayStartHour.toString().padStart(2, '0')}:00`}
                      onChange={(e) => setSettings({...settings, workdayStartHour: parseInt(e.target.value.split(':')[0])})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Fim do Expediente</Label>
                    <Input
                      type="time"
                      value={`${settings.workdayEndHour.toString().padStart(2, '0')}:00`}
                      onChange={(e) => setSettings({...settings, workdayEndHour: parseInt(e.target.value.split(':')[0])})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Duração do Intervalo (min)</Label>
                    <Input
                      type="number"
                      value={settings.breakDuration}
                      onChange={(e) => setSettings({...settings, breakDuration: parseInt(e.target.value) || 15})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Duração do Almoço (min)</Label>
                    <Input
                      type="number"
                      value={settings.lunchDuration}
                      onChange={(e) => setSettings({...settings, lunchDuration: parseInt(e.target.value) || 60})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Limite para Hora Extra (h)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={settings.overtimeThreshold}
                      onChange={(e) => setSettings({...settings, overtimeThreshold: parseFloat(e.target.value) || 8})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Tolerância de Atraso (min)</Label>
                    <Input
                      type="number"
                      value={settings.lateThreshold}
                      onChange={(e) => setSettings({...settings, lateThreshold: parseInt(e.target.value) || 15})}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoClockOut"
                      checked={settings.autoClockOut}
                      onChange={(e) => setSettings({...settings, autoClockOut: e.target.checked})}
                      className="w-4 h-4 text-cinema-yellow bg-cinema-dark border-cinema-gray-light rounded focus:ring-cinema-yellow"
                    />
                    <Label htmlFor="autoClockOut" className="text-white">
                      Saída automática no final do expediente
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requireLocation"
                      checked={settings.requireLocation}
                      onChange={(e) => setSettings({...settings, requireLocation: e.target.checked})}
                      className="w-4 h-4 text-cinema-yellow bg-cinema-dark border-cinema-gray-light rounded focus:ring-cinema-yellow"
                    />
                    <Label htmlFor="requireLocation" className="text-white">
                      Exigir localização para bater ponto
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowManualEdit"
                      checked={settings.allowManualEdit}
                      onChange={(e) => setSettings({...settings, allowManualEdit: e.target.checked})}
                      className="w-4 h-4 text-cinema-yellow bg-cinema-dark border-cinema-gray-light rounded focus:ring-cinema-yellow"
                    />
                    <Label htmlFor="allowManualEdit" className="text-white">
                      Permitir edição manual de pontos
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="approvalRequired"
                      checked={settings.approvalRequired}
                      onChange={(e) => setSettings({...settings, approvalRequired: e.target.checked})}
                      className="w-4 h-4 text-cinema-yellow bg-cinema-dark border-cinema-gray-light rounded focus:ring-cinema-yellow"
                    />
                    <Label htmlFor="approvalRequired" className="text-white">
                      Exigir aprovação para edições
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettingsModal(false)}
                    className="text-gray-400 border-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => setShowSettingsModal(false)}
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetSystem;
