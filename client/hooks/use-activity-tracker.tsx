import { useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "react-router-dom";

interface ActivityData {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  type: "login" | "logout" | "page_visit" | "cart_add" | "cart_remove" | "order_create" | "settings_change";
  description: string;
  page?: string;
  location?: {
    latitude: number;
    longitude: number;
    isInCompany: boolean;
  };
  metadata?: any;
}

// Hook para rastrear atividades automaticamente
export function useActivityTracker() {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const location = useLocation();

  // Função para registrar atividade
  const logActivity = useCallback((
    type: ActivityData['type'], 
    description: string, 
    metadata?: any
  ) => {
    if (!user) return;

    // Tentar obter localização atual
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const activity: ActivityData = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          userName: user.name,
          timestamp: new Date(),
          type,
          description,
          page: window.location.pathname,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            isInCompany: checkIfInCompany(position.coords.latitude, position.coords.longitude),
          },
          metadata,
        };

        // Salvar atividade localmente
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
        activities.unshift(activity);
        localStorage.setItem('user_activities', JSON.stringify(activities.slice(0, 500))); // Manter últimas 500

        // Salvar atividade específica do usuário
        const userActivities = JSON.parse(localStorage.getItem(`activities_${user.id}`) || '[]');
        userActivities.unshift(activity);
        localStorage.setItem(`activities_${user.id}`, JSON.stringify(userActivities.slice(0, 200))); // Manter últimas 200

        // Notificar gestores sobre atividades importantes
        if (['order_create', 'settings_change'].includes(type)) {
          const notifications = JSON.parse(localStorage.getItem('manager_notifications') || '[]');
          notifications.unshift({
            id: activity.id,
            message: `${user.name}: ${description}`,
            timestamp: new Date(),
            type: 'user_activity',
            userId: user.id,
            read: false,
          });
          localStorage.setItem('manager_notifications', JSON.stringify(notifications.slice(0, 100)));
        }
      },
      () => {
        // Erro de GPS - registrar sem localização
        const activity: ActivityData = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          userName: user.name,
          timestamp: new Date(),
          type,
          description: `${description} (sem GPS)`,
          page: window.location.pathname,
          metadata,
        };

        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
        activities.unshift(activity);
        localStorage.setItem('user_activities', JSON.stringify(activities.slice(0, 500)));
      },
      { timeout: 5000, maximumAge: 300000 } // 5s timeout, cache 5min
    );
  }, [user]);

  // Verificar se está na empresa (coordenadas de exemplo)
  const checkIfInCompany = (lat: number, lng: number): boolean => {
    const companyLocations = [
      { lat: -23.5505, lng: -46.6333, radius: 100 }, // São Paulo exemplo
      { lat: -23.9618, lng: -46.3322, radius: 150 }, // Santos exemplo
    ];

    return companyLocations.some(company => {
      const distance = calculateDistance(lat, lng, company.lat, company.lng);
      return distance <= company.radius;
    });
  };

  // Calcular distância entre coordenadas
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

  // Monitorar mudanças de página
  useEffect(() => {
    if (user) {
      const pageName = getPageName(location.pathname);
      logActivity('page_visit', `Visitou página: ${pageName}`);
    }
  }, [location.pathname, user, logActivity]);

  // Monitorar mudanças no carrinho
  useEffect(() => {
    if (user && cartState.items.length > 0) {
      const lastItemCount = parseInt(localStorage.getItem(`last_cart_count_${user.id}`) || '0');
      
      if (cartState.items.length > lastItemCount) {
        const newItems = cartState.items.slice(lastItemCount);
        newItems.forEach(item => {
          logActivity('cart_add', `Adicionou ao carrinho: ${item.name}`, { 
            productId: item.id, 
            price: item.pricePerDay 
          });
        });
      } else if (cartState.items.length < lastItemCount) {
        logActivity('cart_remove', `Removeu item(s) do carrinho`, { 
          previousCount: lastItemCount, 
          currentCount: cartState.items.length 
        });
      }

      localStorage.setItem(`last_cart_count_${user.id}`, cartState.items.length.toString());
    }
  }, [cartState.items, user, logActivity]);

  // Registrar login/logout
  useEffect(() => {
    if (user) {
      logActivity('login', `Login realizado - ${user.role}`);
      
      // Cleanup no logout
      return () => {
        logActivity('logout', 'Logout realizado');
      };
    }
  }, [user, logActivity]);

  const getPageName = (pathname: string): string => {
    const pageMap: { [key: string]: string } = {
      '/': 'Página Inicial',
      '/equipamentos': 'Catálogo de Equipamentos',
      '/carrinho': 'Carrinho de Compras',
      '/area-cliente': 'Área do Cliente',
      '/painel-admin': 'Painel Administrativo',
      '/login': 'Página de Login',
    };
    return pageMap[pathname] || pathname;
  };

  return { logActivity };
}

// Hook para gestores visualizarem atividades
export function useManagerActivityView() {
  const { isAdmin } = useAuth();

  const getAllActivities = useCallback((): ActivityData[] => {
    if (!isAdmin) return [];
    
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    return activities.sort((a: ActivityData, b: ActivityData) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [isAdmin]);

  const getActivitiesByUser = useCallback((userId: string): ActivityData[] => {
    if (!isAdmin) return [];
    
    const activities = JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
    return activities;
  }, [isAdmin]);

  const getOnlineUsers = useCallback(() => {
    if (!isAdmin) return [];

    const activities = getAllActivities();
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Usuários com atividade nos últimos 5 minutos
    const recentActivities = activities.filter(activity => 
      new Date(activity.timestamp) > fiveMinutesAgo
    );

    // Agrupar por usuário
    const userMap = new Map();
    recentActivities.forEach(activity => {
      if (!userMap.has(activity.userId) || 
          new Date(activity.timestamp) > new Date(userMap.get(activity.userId).timestamp)) {
        userMap.set(activity.userId, activity);
      }
    });

    return Array.from(userMap.values());
  }, [isAdmin, getAllActivities]);

  const getManagerNotifications = useCallback(() => {
    if (!isAdmin) return [];
    
    return JSON.parse(localStorage.getItem('manager_notifications') || '[]');
  }, [isAdmin]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (!isAdmin) return;

    const notifications = getManagerNotifications();
    const updated = notifications.map((notif: any) => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    localStorage.setItem('manager_notifications', JSON.stringify(updated));
  }, [isAdmin, getManagerNotifications]);

  return {
    getAllActivities,
    getActivitiesByUser,
    getOnlineUsers,
    getManagerNotifications,
    markNotificationAsRead,
  };
}
