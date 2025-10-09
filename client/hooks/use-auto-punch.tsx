import { useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

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
  isEdited: boolean;
}

export const useAutoPunch = () => {
  const { isAuthenticated, user } = useAuth();

  const autoPunchIn = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const dateString = now.toISOString().split('T')[0];

    // Check if user has already punched in today
    const existingEntry = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
    
    if (!existingEntry) {
      // Create automatic punch in entry
      const autoPunchEntry: TimeEntry = {
        id: `auto_${Date.now()}`,
        employeeId: user.id,
        employeeName: user.name || user.email,
        date: dateString,
        clockIn: timeString,
        totalHours: 0,
        overtimeHours: 0,
        status: "working",
        location: "Sistema - Login Automático",
        notes: "Entrada automática via login no sistema",
        isEdited: false,
      };

      // Save to localStorage
      localStorage.setItem(`timesheet_${user.id}_${dateString}`, JSON.stringify(autoPunchEntry));

      // Show notification
      if (Notification.permission === "granted") {
        new Notification("Ponto Registrado", {
          body: `Entrada registrada automaticamente às ${timeString}`,
          icon: "/favicon.ico",
        });
      }

      console.log("Auto punch-in registered:", autoPunchEntry);
    }
  }, [isAuthenticated, user]);

  const autoPunchOut = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const dateString = now.toISOString().split('T')[0];

    // Get existing entry
    const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
    
    if (existingEntryData) {
      const existingEntry: TimeEntry = JSON.parse(existingEntryData);
      
      if (existingEntry.clockIn && !existingEntry.clockOut) {
        // Update with clock out
        const updatedEntry = {
          ...existingEntry,
          clockOut: timeString,
          status: "clocked_out" as const,
          notes: existingEntry.notes + " | Saída automática via logout do sistema",
        };

        // Calculate total hours
        if (existingEntry.clockIn) {
          const clockInTime = new Date(`${dateString}T${existingEntry.clockIn}:00`);
          const clockOutTime = new Date(`${dateString}T${timeString}:00`);
          let totalMs = clockOutTime.getTime() - clockInTime.getTime();
          
          // Subtract break time if exists
          if (existingEntry.breakStart && existingEntry.breakEnd) {
            const breakStart = new Date(`${dateString}T${existingEntry.breakStart}:00`);
            const breakEnd = new Date(`${dateString}T${existingEntry.breakEnd}:00`);
            totalMs -= (breakEnd.getTime() - breakStart.getTime());
          }
          
          // Subtract lunch time if exists
          if (existingEntry.lunchStart && existingEntry.lunchEnd) {
            const lunchStart = new Date(`${dateString}T${existingEntry.lunchStart}:00`);
            const lunchEnd = new Date(`${dateString}T${existingEntry.lunchEnd}:00`);
            totalMs -= (lunchEnd.getTime() - lunchStart.getTime());
          }
          
          const totalHours = totalMs / (1000 * 60 * 60);
          updatedEntry.totalHours = Math.round(totalHours * 100) / 100;
          updatedEntry.overtimeHours = Math.max(0, totalHours - 8); // 8 hours standard
        }

        // Save updated entry
        localStorage.setItem(`timesheet_${user.id}_${dateString}`, JSON.stringify(updatedEntry));

        // Show notification
        if (Notification.permission === "granted") {
          new Notification("Ponto Registrado", {
            body: `Saída registrada automaticamente às ${timeString}`,
            icon: "/favicon.ico",
          });
        }

        console.log("Auto punch-out registered:", updatedEntry);
      }
    }
  }, [isAuthenticated, user]);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  // Auto punch in when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      requestNotificationPermission();
      // Delay to ensure UI is ready
      const timer = setTimeout(() => {
        autoPunchIn();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, autoPunchIn, requestNotificationPermission]);

  // Auto punch out when user navigates away or closes tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && user) {
        autoPunchOut();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isAuthenticated && user) {
        // User switched tabs or minimized - could be end of work
        // We'll be conservative and not auto punch out here
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user, autoPunchOut]);

  // Lunch reminder
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkLunchTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check if it's lunch time (12:00 PM)
      if (currentHour === 12 && currentMinute === 0) {
        const dateString = now.toISOString().split('T')[0];
        const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
        
        if (existingEntryData) {
          const existingEntry: TimeEntry = JSON.parse(existingEntryData);
          
          // If user is working and hasn't taken lunch
          if (existingEntry.status === "working" && !existingEntry.lunchStart) {
            if (Notification.permission === "granted") {
              new Notification("Hora do Almoço! 🍽️", {
                body: "Não se esqueça de registrar seu horário de almoço",
                icon: "/favicon.ico",
              });
            }
          }
        }
      }

      // Check for break reminder (every 2 hours)
      if (currentMinute === 0 && currentHour % 2 === 0 && currentHour >= 10 && currentHour <= 16) {
        const dateString = now.toISOString().split('T')[0];
        const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
        
        if (existingEntryData) {
          const existingEntry: TimeEntry = JSON.parse(existingEntryData);
          
          if (existingEntry.status === "working") {
            if (Notification.permission === "granted") {
              new Notification("Hora do Intervalo ☕", {
                body: "Que tal fazer uma pausa? Você merece!",
                icon: "/favicon.ico",
              });
            }
          }
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkLunchTime, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Overtime warning
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkOvertime = () => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
      
      if (existingEntryData) {
        const existingEntry: TimeEntry = JSON.parse(existingEntryData);
        
        if (existingEntry.clockIn && existingEntry.status === "working") {
          const clockInTime = new Date(`${dateString}T${existingEntry.clockIn}:00`);
          const currentTime = new Date();
          const workedMs = currentTime.getTime() - clockInTime.getTime();
          const workedHours = workedMs / (1000 * 60 * 60);
          
          // Warning at 7.5 hours (30 minutes before overtime)
          if (workedHours >= 7.5 && workedHours < 8) {
            if (Notification.permission === "granted") {
              new Notification("Aviso de Hora Extra ⏰", {
                body: "Você está próximo de atingir hora extra (30 min restantes)",
                icon: "/favicon.ico",
              });
            }
          }
          
          // Alert at 8 hours (overtime reached)
          if (workedHours >= 8 && workedHours < 8.1) {
            if (Notification.permission === "granted") {
              new Notification("Hora Extra Iniciada! 💰", {
                body: "Você atingiu o limite de horas e está em hora extra",
                icon: "/favicon.ico",
              });
            }
          }
        }
      }
    };

    // Check every 30 minutes
    const interval = setInterval(checkOvertime, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  return {
    autoPunchIn,
    autoPunchOut,
  };
};
