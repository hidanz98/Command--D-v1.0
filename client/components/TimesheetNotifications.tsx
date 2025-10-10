import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  Clock,
  Coffee,
  Utensils,
  Bell,
  X,
  Play,
  Square,
  Timer,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface TimesheetNotification {
  id: string;
  type: "lunch_reminder" | "break_reminder" | "overtime_warning" | "clock_out_reminder" | "auto_punch_in";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  timestamp: Date;
  autoHide?: boolean;
  duration?: number; // in milliseconds
}

interface Props {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export const TimesheetNotifications: React.FC<Props> = ({ 
  position = "top-right" 
}) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<TimesheetNotification[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Don't show timesheet notifications for admin users
  if (isAdmin) {
    return null;
  }

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Add notification
  const addNotification = (notification: Omit<TimesheetNotification, "id" | "timestamp">) => {
    const newNotification: TimesheetNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide if specified
    if (newNotification.autoHide && newNotification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Check for time-based notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkTimeBasedNotifications = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Lunch reminder at 12:00 PM
      if (currentHour === 12 && currentMinute === 0) {
        const dateString = now.toISOString().split('T')[0];
        const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
        
        if (existingEntryData) {
          const existingEntry = JSON.parse(existingEntryData);
          
          if (existingEntry.status === "working" && !existingEntry.lunchStart) {
            addNotification({
              type: "lunch_reminder",
              title: "Hora do Almoço! 🍽️",
              message: "Não se esqueça de registrar seu horário de almoço no sistema",
              priority: "medium",
              autoHide: true,
              duration: 30000, // 30 seconds
            });
          }
        }
      }

      // Break reminders every 2 hours during work hours
      if (currentMinute === 0 && currentHour % 2 === 0 && currentHour >= 10 && currentHour <= 16) {
        const dateString = now.toISOString().split('T')[0];
        const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
        
        if (existingEntryData) {
          const existingEntry = JSON.parse(existingEntryData);
          
          if (existingEntry.status === "working") {
            addNotification({
              type: "break_reminder",
              title: "Hora do Intervalo ☕",
              message: "Que tal fazer uma pausa? Você merece descansar um pouco!",
              priority: "low",
              autoHide: true,
              duration: 20000, // 20 seconds
            });
          }
        }
      }

      // Clock out reminder at 6 PM
      if (currentHour === 18 && currentMinute === 0) {
        const dateString = now.toISOString().split('T')[0];
        const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
        
        if (existingEntryData) {
          const existingEntry = JSON.parse(existingEntryData);
          
          if (existingEntry.status === "working" && !existingEntry.clockOut) {
            addNotification({
              type: "clock_out_reminder",
              title: "Fim do Expediente ⏰",
              message: "Lembre-se de bater o ponto de saída no sistema",
              priority: "high",
              autoHide: false,
            });
          }
        }
      }
    };

    // Check immediately and then every minute
    checkTimeBasedNotifications();
    const interval = setInterval(checkTimeBasedNotifications, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, currentTime]);

  // Check for overtime warnings
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkOvertime = () => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
      
      if (existingEntryData) {
        const existingEntry = JSON.parse(existingEntryData);
        
        if (existingEntry.clockIn && existingEntry.status === "working") {
          const clockInTime = new Date(`${dateString}T${existingEntry.clockIn}:00`);
          const currentTime = new Date();
          const workedMs = currentTime.getTime() - clockInTime.getTime();
          const workedHours = workedMs / (1000 * 60 * 60);
          
          // Warning at 7.5 hours (30 minutes before overtime)
          if (workedHours >= 7.5 && workedHours < 7.6) {
            addNotification({
              type: "overtime_warning",
              title: "Aviso de Hora Extra ⏰",
              message: "Você está próximo de atingir hora extra (30 min restantes)",
              priority: "medium",
              autoHide: true,
              duration: 25000,
            });
          }
          
          // Alert at 8 hours (overtime reached)
          if (workedHours >= 8 && workedHours < 8.1) {
            addNotification({
              type: "overtime_warning",
              title: "Hora Extra Iniciada! 💰",
              message: "Você atingiu o limite de horas e está em hora extra",
              priority: "high",
              autoHide: true,
              duration: 30000,
            });
          }

          // Alert at 10 hours (excessive overtime)
          if (workedHours >= 10 && workedHours < 10.1) {
            addNotification({
              type: "overtime_warning",
              title: "Hora Extra Excessiva! 🚨",
              message: "Você já trabalhou 10 horas hoje. Considere encerrar o expediente.",
              priority: "high",
              autoHide: false,
            });
          }
        }
      }
    };

    // Check every 5 minutes for overtime
    const interval = setInterval(checkOvertime, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Auto punch-in notification when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const existingEntryData = localStorage.getItem(`timesheet_${user.id}_${dateString}`);
      
      if (!existingEntryData) {
        // Show auto punch-in notification
        setTimeout(() => {
          addNotification({
            type: "auto_punch_in",
            title: "Ponto Registrado Automaticamente! ✅",
            message: "Sua entrada foi registrada automaticamente no sistema",
            priority: "medium",
            autoHide: true,
            duration: 15000,
          });
        }, 2000); // 2 second delay after login
      }
    }
  }, [isAuthenticated, user]);

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      default:
        return "top-4 right-4";
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-400 bg-red-400/10";
      case "medium":
        return "border-l-yellow-400 bg-yellow-400/10";
      case "low":
        return "border-l-green-400 bg-green-400/10";
      default:
        return "border-l-blue-400 bg-blue-400/10";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "lunch_reminder":
        return <Utensils className="w-5 h-5 text-blue-400" />;
      case "break_reminder":
        return <Coffee className="w-5 h-5 text-yellow-400" />;
      case "overtime_warning":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case "clock_out_reminder":
        return <Square className="w-5 h-5 text-red-400" />;
      case "auto_punch_in":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-cinema-yellow" />;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-[200] space-y-3 max-w-sm`}>
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`bg-cinema-dark border-cinema-gray-light border-l-4 ${getPriorityClasses(notification.priority)} shadow-lg animate-slide-in`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {notification.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white p-1 h-6 w-6 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* Quick actions for specific notifications */}
            {notification.type === "lunch_reminder" && (
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1"
                  onClick={() => {
                    // Navigate to timesheet or trigger lunch action
                    window.open('/painel-locadora', '_blank');
                    removeNotification(notification.id);
                  }}
                >
                  <Utensils className="w-3 h-3 mr-1" />
                  Registrar Almoço
                </Button>
              </div>
            )}

            {notification.type === "break_reminder" && (
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  className="bg-yellow-500 text-white hover:bg-yellow-600 text-xs px-3 py-1"
                  onClick={() => {
                    window.open('/painel-locadora', '_blank');
                    removeNotification(notification.id);
                  }}
                >
                  <Coffee className="w-3 h-3 mr-1" />
                  Registrar Intervalo
                </Button>
              </div>
            )}

            {notification.type === "clock_out_reminder" && (
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  className="bg-red-500 text-white hover:bg-red-600 text-xs px-3 py-1"
                  onClick={() => {
                    window.open('/painel-locadora', '_blank');
                    removeNotification(notification.id);
                  }}
                >
                  <Square className="w-3 h-3 mr-1" />
                  Registrar Saída
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TimesheetNotifications;
