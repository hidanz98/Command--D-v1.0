import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  autoInvoiceEmail: boolean;
  autoPaymentReminder: boolean;
  autoOverdueNotification: boolean;
  autoReceiptEmail: boolean;
  reminderDaysBefore: number;
  overdueFrequency: "daily" | "weekly" | "monthly";
}

export interface GlobalNotificationConfig {
  defaultSettings: NotificationSettings;
  emailConfig: {
    smtpServer: string;
    smtpPort: number;
    senderEmail: string;
    senderName: string;
    isConfigured: boolean;
  };
  smsConfig: {
    provider: "twilio" | "aws" | "zenvia" | "totalvoice";
    apiKey: string;
    senderNumber: string;
    isConfigured: boolean;
  };
  automationSettings: {
    sendTime: string; // HH:MM format
    timezone: string;
    isActive: boolean;
  };
  templates: {
    invoice: {
      emailSubject: string;
      emailBody: string;
      smsBody: string;
    };
    paymentReminder: {
      emailSubject: string;
      emailBody: string;
      smsBody: string;
    };
    overdue: {
      emailSubject: string;
      emailBody: string;
      smsBody: string;
    };
    receipt: {
      emailSubject: string;
      emailBody: string;
    };
  };
}

interface NotificationContextType {
  config: GlobalNotificationConfig;
  updateConfig: (updates: Partial<GlobalNotificationConfig>) => void;
  getDefaultSettingsForNewClient: () => NotificationSettings;
  sendAutomaticNotification: (
    type: "invoice" | "payment_reminder" | "overdue" | "receipt",
    clientData: any,
  ) => Promise<boolean>;
  isConfigurationValid: () => boolean;
  getNotificationStats: () => {
    totalClientsWithEmail: number;
    totalClientsWithSMS: number;
    totalAutoNotifications: number;
    pendingNotifications: number;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [config, setConfig] = useState<GlobalNotificationConfig>(() => {
    const saved = localStorage.getItem("notificationConfig");
    return saved
      ? JSON.parse(saved)
      : {
          defaultSettings: {
            emailEnabled: true,
            smsEnabled: true,
            autoInvoiceEmail: true,
            autoPaymentReminder: true,
            autoOverdueNotification: true,
            autoReceiptEmail: true,
            reminderDaysBefore: 3,
            overdueFrequency: "weekly",
          },
          emailConfig: {
            smtpServer: "",
            smtpPort: 587,
            senderEmail: "",
            senderName: "Sistema de Locação",
            isConfigured: false,
          },
          smsConfig: {
            provider: "twilio",
            apiKey: "",
            senderNumber: "",
            isConfigured: false,
          },
          automationSettings: {
            sendTime: "09:00",
            timezone: "America/Sao_Paulo",
            isActive: true,
          },
          templates: {
            invoice: {
              emailSubject:
                "Nova Nota Fiscal #{{invoiceNumber}} - {{companyName}}",
              emailBody: `Olá {{clientName}},\n\nSua nota fiscal foi emitida!\n\nNúmero: {{invoiceNumber}}\nValor: R$ {{amount}}\nVencimento: {{dueDate}}\n\nPague agora: {{paymentLink}}\n\nAtenciosamente,\n{{companyName}}`,
              smsBody:
                "{{clientName}}, sua nota fiscal NF #{{invoiceNumber}} de R$ {{amount}} foi emitida. Vencimento: {{dueDate}}. Pague: {{paymentLink}} - {{companyName}}",
            },
            paymentReminder: {
              emailSubject:
                "Lembrete: Pagamento vence em {{daysRemaining}} dias - NF #{{invoiceNumber}}",
              emailBody: `Olá {{clientName}},\n\nSua fatura vence em {{daysRemaining}} dias.\n\nNúmero: {{invoiceNumber}}\nValor: R$ {{amount}}\nVencimento: {{dueDate}}\n\nPague agora: {{paymentLink}}\n\n{{companyName}}`,
              smsBody:
                "{{clientName}}, sua fatura NF #{{invoiceNumber}} de R$ {{amount}} vence em {{daysRemaining}} dias. Pague: {{paymentLink}} - {{companyName}}",
            },
            overdue: {
              emailSubject: "URGENTE: Fatura em atraso - NF #{{invoiceNumber}}",
              emailBody: `{{clientName}},\n\nSua fatura está VENCIDA!\n\nNúmero: {{invoiceNumber}}\nValor: R$ {{amount}}\nVenceu em: {{dueDate}}\n\nEvite negativação: {{paymentLink}}\n\n{{companyName}}`,
              smsBody:
                "{{clientName}}, sua fatura NF #{{invoiceNumber}} de R$ {{amount}} está VENCIDA! Evite negativação: {{paymentLink}} - {{companyName}}",
            },
            receipt: {
              emailSubject:
                "Pagamento Confirmado - NF #{{invoiceNumber}} - {{companyName}}",
              emailBody: `{{clientName}},\n\nPagamento confirmado!\n\nNúmero: {{invoiceNumber}}\nValor: R$ {{amount}}\nData: {{paymentDate}}\n\nObrigado!\n\n{{companyName}}`,
            },
          },
        };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("notificationConfig", JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<GlobalNotificationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const getDefaultSettingsForNewClient = (): NotificationSettings => {
    return { ...config.defaultSettings };
  };

  const sendAutomaticNotification = async (
    type: "invoice" | "payment_reminder" | "overdue" | "receipt",
    clientData: any,
  ): Promise<boolean> => {
    try {
      // Simulate sending notification based on type and client settings
      const template = config.templates[type];

      // Replace template variables
      const processTemplate = (template: string, data: any) => {
        return template
          .replace(/\{\{clientName\}\}/g, data.clientName || "Cliente")
          .replace(/\{\{invoiceNumber\}\}/g, data.invoiceNumber || "")
          .replace(/\{\{amount\}\}/g, data.amount || "0")
          .replace(/\{\{dueDate\}\}/g, data.dueDate || "")
          .replace(/\{\{paymentDate\}\}/g, data.paymentDate || "")
          .replace(/\{\{daysRemaining\}\}/g, data.daysRemaining || "0")
          .replace(/\{\{paymentLink\}\}/g, data.paymentLink || "#")
          .replace(/\{\{companyName\}\}/g, data.companyName || "Empresa");
      };

      // Check if notifications are configured and enabled
      if (!config.automationSettings.isActive) {
        return false;
      }

      // Simulate API calls
      const notifications = [];

      if (
        clientData.settings?.emailEnabled &&
        config.emailConfig.isConfigured
      ) {
        notifications.push({
          type: "email",
          to: clientData.email,
          subject: processTemplate(template.emailSubject, clientData),
          body: processTemplate(template.emailBody, clientData),
        });
      }

      if (
        clientData.settings?.smsEnabled &&
        config.smsConfig.isConfigured &&
        template.smsBody
      ) {
        notifications.push({
          type: "sms",
          to: clientData.phone,
          body: processTemplate(template.smsBody, clientData),
        });
      }

      // Simulate sending (in real implementation, this would call actual APIs)
      for (const notification of notifications) {
        console.log(`Sending ${notification.type} notification:`, notification);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Store in notification history (would be done via API in real implementation)
        const history = JSON.parse(
          localStorage.getItem("notificationHistory") || "[]",
        );
        history.unshift({
          id: `notif_${Date.now()}_${Math.random()}`,
          clientId: clientData.clientId,
          type: notification.type,
          category: type,
          subject: notification.subject || "",
          content: notification.body,
          status: "sent",
          sentAt: new Date().toISOString(),
          deliveredAt: null,
          cost: notification.type === "sms" ? 0.15 : 0.05,
        });
        localStorage.setItem(
          "notificationHistory",
          JSON.stringify(history.slice(0, 100)),
        ); // Keep last 100
      }

      return notifications.length > 0;
    } catch (error) {
      console.error("Error sending automatic notification:", error);
      return false;
    }
  };

  const isConfigurationValid = (): boolean => {
    return config.emailConfig.isConfigured || config.smsConfig.isConfigured;
  };

  const getNotificationStats = () => {
    // These would be calculated from actual client data in real implementation
    const clients = JSON.parse(
      localStorage.getItem("notificationClients") || "[]",
    );

    return {
      totalClientsWithEmail: clients.filter(
        (c: any) => c.settings?.emailEnabled,
      ).length,
      totalClientsWithSMS: clients.filter((c: any) => c.settings?.smsEnabled)
        .length,
      totalAutoNotifications: clients.filter(
        (c: any) =>
          c.settings?.autoInvoiceEmail ||
          c.settings?.autoPaymentReminder ||
          c.settings?.autoOverdueNotification,
      ).length,
      pendingNotifications: 0, // Would be calculated from pending notification queue
    };
  };

  const value = {
    config,
    updateConfig,
    getDefaultSettingsForNewClient,
    sendAutomaticNotification,
    isConfigurationValid,
    getNotificationStats,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

// Helper function to automatically send notifications when financial events occur
export const triggerAutomaticNotification = async (
  event:
    | "invoice_created"
    | "payment_due_soon"
    | "payment_overdue"
    | "payment_received",
  data: {
    clientId: string;
    clientName: string;
    email: string;
    phone: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    paymentDate?: string;
    daysRemaining?: number;
    settings: NotificationSettings;
  },
) => {
  const notificationContext = useNotification();

  const eventTypeMap = {
    invoice_created: "invoice",
    payment_due_soon: "payment_reminder",
    payment_overdue: "overdue",
    payment_received: "receipt",
  } as const;

  const notificationType = eventTypeMap[event];

  // Check if automatic notification is enabled for this event type
  const shouldSend = {
    invoice: data.settings.autoInvoiceEmail,
    payment_reminder: data.settings.autoPaymentReminder,
    overdue: data.settings.autoOverdueNotification,
    receipt: data.settings.autoReceiptEmail,
  }[notificationType];

  if (shouldSend) {
    return await notificationContext.sendAutomaticNotification(
      notificationType,
      {
        ...data,
        paymentLink: `https://pay.company.com/invoice/${data.invoiceNumber}`,
        companyName: "Bil's Cinema e Vídeo",
      },
    );
  }

  return false;
};
