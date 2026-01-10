import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  role: "client" | "admin" | "funcionario";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFuncionario: boolean;
  isInitialized: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Helper para obter token de qualquer storage
const getStoredToken = (): string | null => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Helper para obter usuário de qualquer storage
const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("bil_cinema_user") || sessionStorage.getItem("bil_cinema_user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Erro ao parsear usuário:", e);
  }
  return null;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Inicializar com dados do storage imediatamente (sync)
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize authentication state - SIMPLES E DIRETO
  useEffect(() => {
    const token = getStoredToken();
    const savedUser = getStoredUser();
    
    console.log("🔄 Verificando sessão...");
    console.log("   Token:", token ? "Existe" : "Não existe");
    console.log("   Usuário:", savedUser ? savedUser.email : "Não existe");
    
    if (token && savedUser) {
      // Restaurar usuário do storage imediatamente
      setUser(savedUser);
      console.log("✅ Sessão restaurada:", savedUser.email);
    } else {
      console.log("🔒 Sem sessão salva");
      setUser(null);
    }
    
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      // A API retorna { success: true, data: { user, token } }
      const responseData = data.data || data;
      const token = responseData.token || data.token;
      const user = responseData.user || data.user;

      if (!data?.success || !token || !user) {
        console.error("Login falhou - resposta inválida:", data);
        return false;
      }

      // Mapear papel retornado pela API para os papéis usados no front
      const apiRole = (user.role || "").toUpperCase();
      const mappedRole: User["role"] =
        apiRole === "ADMIN" || apiRole === "MASTER_ADMIN"
          ? "admin"
          : apiRole === "EMPLOYEE"
          ? "funcionario"
          : "client";

      const userData: User = {
        id: user.id ?? "user-api",
        name: user.name ?? user.email ?? "Usuário",
        email: user.email,
        phone: user.phone ?? "",
        document: user.document ?? "",
        address: user.address ?? "",
        role: mappedRole,
      };

      // Salvar no estado
      setUser(userData);
      
      // Salvar no storage apropriado baseado em "Lembrar-me"
      if (rememberMe) {
        // Usa localStorage - persiste mesmo fechando o navegador
        localStorage.setItem("bil_cinema_user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        localStorage.setItem("rememberMe", "true");
      } else {
        // Usa sessionStorage - limpa ao fechar o navegador
        sessionStorage.setItem("bil_cinema_user", JSON.stringify(userData));
        sessionStorage.setItem("token", token);
        localStorage.removeItem("bil_cinema_user");
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
      }

      return true;
    } catch (error) {
      console.error("Erro ao fazer login na API:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // Limpar ambos os storages
    localStorage.removeItem("bil_cinema_user");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("bil_cinema_user");
    sessionStorage.removeItem("token");
    console.log("🚪 Usuário deslogado");
  };

  // Verificar admin de forma case-insensitive
  const roleStr = (user?.role || "").toString().toLowerCase();
  const isAdminUser = roleStr === "admin" || roleStr === "master_admin";
  const isFuncionarioUser = roleStr === "funcionario";

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isAdmin: isAdminUser,
    isFuncionario: isFuncionarioUser,
    isInitialized,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
