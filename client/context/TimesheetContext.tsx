import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaces
interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  lunchStart?: string;
  lunchEnd?: string;
  totalHours: number;
  overtimeHours: number;
  location?: {
    in?: Location;
    out?: Location;
  };
  isInCompany: boolean;
  isAutomatic: boolean;
  needsApproval: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  managerNotes?: string;
  status: "working" | "break" | "clocked_out" | "pending_approval" | "approved" | "rejected";
  isWeekend?: boolean;
  isHoliday?: boolean;
}

interface TimesheetContextType {
  entries: TimesheetEntry[];
  addEntry: (entry: TimesheetEntry) => void;
  updateEntry: (id: string, updates: Partial<TimesheetEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesByEmployee: (employeeId: string) => TimesheetEntry[];
  getEntriesByDateRange: (start: string, end: string) => TimesheetEntry[];
  approveEntry: (id: string, approvedBy: string, notes?: string) => void;
  rejectEntry: (id: string, rejectedBy: string, notes: string) => void;
}

const TimesheetContext = createContext<TimesheetContextType | undefined>(undefined);

// Função auxiliar para gerar pontos do mês
const generateMonthEntries = (): TimesheetEntry[] => {
  const entries: TimesheetEntry[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Funcionários
  const employees = [
    { id: "1", name: "João Silva Santos" },
    { id: "2", name: "Maria Silva" },
    { id: "3", name: "Pedro Santos" },
  ];

  // Gerar pontos para os últimos 30 dias
  for (let i = 0; i < 30; i++) {
    const date = new Date(currentYear, currentMonth, today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    employees.forEach((employee, empIndex) => {
      // Pular alguns dias aleatoriamente (ausências)
      if (Math.random() > 0.9) return;
      
      // Horários variados
      const baseHour = empIndex === 0 ? 8 : empIndex === 1 ? 9 : 8;
      const entryMinutes = Math.floor(Math.random() * 30); // 0-30 min de variação
      const exitHour = isWeekend ? baseHour + 4 : 17;
      const exitMinutes = Math.floor(Math.random() * 30);
      
      const clockIn = `${baseHour.toString().padStart(2, '0')}:${entryMinutes.toString().padStart(2, '0')}:00`;
      const clockOut = i === 0 && empIndex === 2 ? undefined : `${exitHour.toString().padStart(2, '0')}:${exitMinutes.toString().padStart(2, '0')}:00`;
      
      // Calcular horas
      let totalHours = 0;
      if (clockOut) {
        const inTime = baseHour + entryMinutes / 60;
        const outTime = exitHour + exitMinutes / 60;
        totalHours = outTime - inTime - 1; // -1 para almoço
      }
      
      const overtimeHours = isWeekend ? totalHours : Math.max(0, totalHours - 8);
      
      entries.push({
        id: `${employee.id}-${dateStr}`,
        employeeId: employee.id,
        employeeName: employee.name,
        date: dateStr,
        clockIn,
        clockOut,
        lunchStart: "12:00:00",
        lunchEnd: "13:00:00",
        totalHours,
        overtimeHours,
        isInCompany: Math.random() > 0.1, // 90% na empresa
        isAutomatic: true,
        needsApproval: isWeekend || Math.random() > 0.8,
        approved: !isWeekend && Math.random() > 0.2,
        status: clockOut ? (isWeekend ? "pending_approval" : "approved") : "working",
        isWeekend,
        managerNotes: isWeekend ? "Trabalho em final de semana" : undefined,
      });
    });
  }
  
  return entries.sort((a, b) => b.date.localeCompare(a.date));
};

// Dados de teste
const MOCK_ENTRIES: TimesheetEntry[] = generateMonthEntries();

export const TimesheetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<TimesheetEntry[]>(() => {
    const saved = localStorage.getItem('timesheet_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_ENTRIES;
      }
    }
    return MOCK_ENTRIES;
  });

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('timesheet_entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = (entry: TimesheetEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const updateEntry = (id: string, updates: Partial<TimesheetEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getEntriesByEmployee = (employeeId: string) => {
    return entries.filter(entry => entry.employeeId === employeeId);
  };

  const getEntriesByDateRange = (start: string, end: string) => {
    return entries.filter(entry => entry.date >= start && entry.date <= end);
  };

  const approveEntry = (id: string, approvedBy: string, notes?: string) => {
    updateEntry(id, {
      approved: true,
      approvedBy,
      approvedAt: new Date(),
      status: 'approved',
      managerNotes: notes,
    });
  };

  const rejectEntry = (id: string, rejectedBy: string, notes: string) => {
    updateEntry(id, {
      approved: false,
      approvedBy: rejectedBy,
      approvedAt: new Date(),
      status: 'rejected',
      managerNotes: notes,
    });
  };

  return (
    <TimesheetContext.Provider value={{
      entries,
      addEntry,
      updateEntry,
      deleteEntry,
      getEntriesByEmployee,
      getEntriesByDateRange,
      approveEntry,
      rejectEntry,
    }}>
      {children}
    </TimesheetContext.Provider>
  );
};

export const useTimesheet = () => {
  const context = useContext(TimesheetContext);
  if (!context) {
    throw new Error('useTimesheet must be used within TimesheetProvider');
  }
  return context;
};

