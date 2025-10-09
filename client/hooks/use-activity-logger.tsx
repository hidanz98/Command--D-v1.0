import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  type: "login" | "logout" | "order_created" | "order_modified" | "product_added" | "settings_changed" | "page_visited";
  description: string;
  location?: Location;
  metadata?: any;
}

export function useActivityLogger() {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  const logActivity = useCallback((
    type: ActivityLog['type'], 
    description: string, 
    metadata?: any
  ) => {
    if (!user) return;

    const activity: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      description,
      location: currentLocation || undefined,
      metadata,
    };

    // Salvar atividade
    const savedActivities = JSON.parse(localStorage.getItem(`activities_${user.id}`) || '[]');
    savedActivities.unshift(activity);
    localStorage.setItem(`activities_${user.id}`, JSON.stringify(savedActivities.slice(0, 100)));

    // Notificar gestores se necessário
    if (['order_created', 'order_modified', 'settings_changed'].includes(type)) {
      toast.info("📊 Atividade registrada para o gestor");
    }
  }, [user, currentLocation]);

  return { logActivity };
}

