import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UseSettingsReturn<T> {
  settings: T | null;
  loading: boolean;
  saving: boolean;
  updateSettings: (data: Partial<T>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSettings<T>(endpoint?: string): UseSettingsReturn<T> {
  const [settings, setSettings] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data as T);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (data: Partial<T>): Promise<boolean> => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = endpoint ? `/api/settings/${endpoint}` : "/api/settings";
      const response = await fetch(url, {
        method: endpoint ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Atualizar estado local
        if (endpoint) {
          // Para endpoints específicos, refetch os dados completos
          await fetchSettings();
        } else {
          // Para update geral, usar os dados retornados
          setSettings(result as T);
        }
        
        toast.success(result.message || "Configurações salvas com sucesso!");
        return true;
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao salvar configurações");
        return false;
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao salvar configurações");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings,
  };
}

