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
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize authentication state
  useEffect(() => {
    // Try to load user from localStorage or sessionStorage
    try {
      // Primeiro tenta localStorage (Lembrar-me marcado)
      let savedUser = localStorage.getItem("bil_cinema_user");
      let savedToken = localStorage.getItem("token");
      
      // Se não encontrar, tenta sessionStorage (Lembrar-me desmarcado)
      if (!savedUser) {
        savedUser = sessionStorage.getItem("bil_cinema_user");
        savedToken = sessionStorage.getItem("token");
      }
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log("✅ Usuário restaurado:", userData.email);
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
      localStorage.removeItem("bil_cinema_user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("bil_cinema_user");
      sessionStorage.removeItem("token");
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
    localStorage.removeItem("bil_cinema_user");
    localStorage.removeItem("token");
  };

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isFuncionario: user?.role === "funcionario",
    isInitialized,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
