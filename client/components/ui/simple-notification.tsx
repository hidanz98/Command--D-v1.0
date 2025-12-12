import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function SimpleNotification({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log("🎨 SimpleNotification renderizado:", { message, type, duration });
    console.log("👁️ isVisible:", isVisible);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      console.log("⏱️ Timer configurado para:", duration, "ms");
      const timer = setTimeout(() => {
        console.log("⏰ Timer expirou, escondendo notificação");
        setIsVisible(false);
        setTimeout(() => {
          console.log("🗑️ Removendo notificação");
          onClose?.();
        }, 300);
      }, duration);

      return () => {
        console.log("🧹 Limpando timer");
        clearTimeout(timer);
      };
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-2xl transition-all duration-300 ${getTypeStyles()}`}
      style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        zIndex: 99999,
        minWidth: '300px',
        maxWidth: '500px'
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-semibold">{message}</span>
        <button 
          onClick={handleClose}
          className="ml-2 text-white hover:text-gray-200 text-2xl font-bold flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Hook para usar notificações
export function useSimpleNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  }>>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log("🔔 addNotification chamada:", { message, type, duration, id });
    setNotifications(prev => {
      const updated = [...prev, { id, message, type, duration }];
      console.log("📢 Notificações atualizadas:", updated.length);
      return updated;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const NotificationContainer = () => {
    console.log("📦 NotificationContainer renderizado - total:", notifications.length);
    notifications.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.message} (${n.type})`);
    });
    
    return (
      <div className="fixed top-4 right-4 space-y-3" style={{ zIndex: 99999 }}>
        {notifications.map(notification => (
          <SimpleNotification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    );
  };

  return {
    addNotification,
    NotificationContainer
  };
}
