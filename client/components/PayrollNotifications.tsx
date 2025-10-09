import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calculator,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X,
  Bell,
  Gift,
  Clock,
  Users,
  FileText,
  Zap,
} from "lucide-react";

interface PayrollNotification {
  id: string;
  type:
    | "new_extra"
    | "payroll_recalc"
    | "overtime_alert"
    | "missing_timesheet"
    | "approval_needed";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  timestamp: Date;
  employeeId?: string;
  employeeName?: string;
  amount?: number;
  autoHide?: boolean;
  duration?: number;
  actionRequired: boolean;
}

interface Props {
  isAdmin?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export const PayrollNotifications: React.FC<Props> = ({
  isAdmin = false,
  position = "top-right",
}) => {
  const [notifications, setNotifications] = useState<PayrollNotification[]>([]);
  
  // Se é admin, não mostrar notificações popup (só no painel centralizado)
  if (isAdmin) {
    return null;
  }

  // Add notification
  const addNotification = (
    notification: Omit<PayrollNotification, "id" | "timestamp">,
  ) => {
    const newNotification: PayrollNotification = {
      ...notification,
      id: `payroll_notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-hide if specified
    if (newNotification.autoHide && newNotification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Listen for payroll events
  useEffect(() => {
    if (!isAdmin) return;

    const handlePayrollEvents = () => {
      // Check for new extras pending approval
      const checkPendingExtras = () => {
        const pendingExtras = JSON.parse(
          localStorage.getItem("pendingPayrollExtras") || "[]",
        );

        pendingExtras.forEach((extra: any) => {
          if (extra.status === "pending") {
            addNotification({
              type: "approval_needed",
              title: "Extra Aguardando Aprovação",
              message: `${extra.employeeName}: ${extra.name} - R$ ${extra.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              priority: "medium",
              employeeId: extra.employeeId,
              employeeName: extra.employeeName,
              amount: extra.amount,
              actionRequired: true,
              autoHide: false,
            });
          }
        });
      };

      // Check for timesheet updates that require payroll recalculation
      const checkTimesheetUpdates = () => {
        const lastPayrollCalc = localStorage.getItem("lastPayrollCalculation");
        const lastTimesheetUpdate = localStorage.getItem("lastTimesheetUpdate");

        if (
          lastTimesheetUpdate &&
          (!lastPayrollCalc || lastTimesheetUpdate > lastPayrollCalc)
        ) {
          addNotification({
            type: "payroll_recalc",
            title: "Recálculo Necessário",
            message:
              "Folha de ponto foi atualizada. Recomenda-se recalcular a folha de pagamento.",
            priority: "medium",
            actionRequired: true,
            autoHide: true,
            duration: 30000,
          });
        }
      };

      // Check for overtime alerts
      const checkOvertimeAlerts = () => {
        const currentDate = new Date().toISOString().split("T")[0];
        const employees = ["1", "2"]; // Mock employee IDs

        employees.forEach((employeeId) => {
          const entryData = localStorage.getItem(
            `timesheet_${employeeId}_${currentDate}`,
          );
          if (entryData) {
            const entry = JSON.parse(entryData);
            if (entry.overtimeHours > 2) {
              // Alert for more than 2 hours overtime
              addNotification({
                type: "overtime_alert",
                title: "Alerta de Hora Extra",
                message: `${entry.employeeName} trabalhou ${entry.overtimeHours.toFixed(1)}h extras hoje`,
                priority: "high",
                employeeId: entry.employeeId,
                employeeName: entry.employeeName,
                actionRequired: false,
                autoHide: true,
                duration: 25000,
              });
            }
          }
        });
      };

      // Check for missing timesheets
      const checkMissingTimesheets = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Skip weekends
        if (yesterday.getDay() === 0 || yesterday.getDay() === 6) return;

        const yesterdayString = yesterday.toISOString().split("T")[0];
        const employees = [
          { id: "1", name: "João Silva Santos" },
          { id: "2", name: "Maria Santos Oliveira" },
        ];

        employees.forEach((employee) => {
          const entryData = localStorage.getItem(
            `timesheet_${employee.id}_${yesterdayString}`,
          );
          if (!entryData) {
            addNotification({
              type: "missing_timesheet",
              title: "Ponto em Falta",
              message: `${employee.name} não registrou ponto ontem (${yesterday.toLocaleDateString("pt-BR")})`,
              priority: "high",
              employeeId: employee.id,
              employeeName: employee.name,
              actionRequired: true,
              autoHide: false,
            });
          }
        });
      };

      checkPendingExtras();
      checkTimesheetUpdates();
      checkOvertimeAlerts();
      checkMissingTimesheets();
    };

    // Check immediately and then every 5 minutes
    handlePayrollEvents();
    const interval = setInterval(handlePayrollEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  // Listen for custom events
  useEffect(() => {
    if (!isAdmin) return;

    const handleNewExtra = (event: CustomEvent) => {
      const { employeeName, extraName, amount } = event.detail;
      addNotification({
        type: "new_extra",
        title: "Novo Extra Adicionado",
        message: `${employeeName}: ${extraName} - R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        priority: "medium",
        employeeName,
        amount,
        actionRequired: true,
        autoHide: false,
      });
    };

    const handleTimesheetUpdate = () => {
      localStorage.setItem("lastTimesheetUpdate", new Date().toISOString());
    };

    window.addEventListener("newPayrollExtra", handleNewExtra as EventListener);
    window.addEventListener("timesheetUpdated", handleTimesheetUpdate);

    return () => {
      window.removeEventListener(
        "newPayrollExtra",
        handleNewExtra as EventListener,
      );
      window.removeEventListener("timesheetUpdated", handleTimesheetUpdate);
    };
  }, [isAdmin]);

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
      case "urgent":
        return "border-l-red-500 bg-red-500/10";
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
      case "new_extra":
        return <Gift className="w-5 h-5 text-green-400" />;
      case "payroll_recalc":
        return <Calculator className="w-5 h-5 text-yellow-400" />;
      case "overtime_alert":
        return <Clock className="w-5 h-5 text-orange-400" />;
      case "missing_timesheet":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "approval_needed":
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-cinema-yellow" />;
    }
  };

  const handleQuickAction = (notification: PayrollNotification) => {
    switch (notification.type) {
      case "payroll_recalc":
        // Navigate to payroll section
        window.location.hash = "financeiro";
        localStorage.setItem(
          "lastPayrollCalculation",
          new Date().toISOString(),
        );
        removeNotification(notification.id);
        break;
      case "approval_needed":
      case "new_extra":
        // Navigate to payroll section to approve extras
        window.location.hash = "financeiro";
        removeNotification(notification.id);
        break;
      case "missing_timesheet":
        // Navigate to the appropriate section for timesheet
        window.location.hash = "dashboard";
        // Show timesheet details
        alert(
          "📍 Ponto em Falta Detectado!\n\nFuncionário: " +
            notification.title +
            "\n\nVerifique os registros de ponto na seção de documentos ou financeiro para mais detalhes.",
        );
        removeNotification(notification.id);
        break;
      case "overtime_alert":
        // Navigate to reports section
        window.location.hash = "financeiro";
        removeNotification(notification.id);
        break;
      default:
        removeNotification(notification.id);
    }
  };

  if (!isAdmin || notifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-[150] space-y-3 max-w-sm`}>
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
                    {notification.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
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
            {notification.actionRequired && (
              <div className="mt-3 flex space-x-2">
                {notification.type === "payroll_recalc" && (
                  <Button
                    size="sm"
                    className="bg-yellow-500 text-white hover:bg-yellow-600 text-xs px-3 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAction(notification);
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Recalcular
                  </Button>
                )}

                {(notification.type === "approval_needed" ||
                  notification.type === "new_extra") && (
                  <Button
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600 text-xs px-3 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAction(notification);
                    }}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aprovar
                  </Button>
                )}

                {notification.type === "missing_timesheet" && (
                  <Button
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAction(notification);
                    }}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Ver Ponto
                  </Button>
                )}

                {notification.type === "overtime_alert" && (
                  <Button
                    size="sm"
                    className="bg-orange-500 text-white hover:bg-orange-600 text-xs px-3 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAction(notification);
                    }}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Ver Relatório
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to trigger payroll events
export const triggerPayrollExtra = (
  employeeName: string,
  extraName: string,
  amount: number,
) => {
  window.dispatchEvent(
    new CustomEvent("newPayrollExtra", {
      detail: { employeeName, extraName, amount },
    }),
  );
};

export default PayrollNotifications;
