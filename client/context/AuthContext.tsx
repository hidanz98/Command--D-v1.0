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
  login: (email: string, password: string) => Promise<boolean>;
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
    // Try to load user from localStorage
    try {
      const savedUser = localStorage.getItem("bil_cinema_user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      localStorage.removeItem("bil_cinema_user");
    }
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app this would be an API call

    // Client login
    if (email === "joao.silva@email.com" && password === "123456") {
      const userData: User = {
        id: "user-123",
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(31) 99999-9999",
        document: "123.456.789-10",
        address: "Rua das Flores, 123 - Centro, BH - MG",
        role: "client",
      };

      setUser(userData);
      localStorage.setItem("bil_cinema_user", JSON.stringify(userData));
      return true;
    }

    // Admin login - check against multiple admin emails
    const adminEmails = [
      "admin@bilscinema.com",
      "admin@locadora.com",
      "cabecadeefeitocine@gmail.com",
    ];

    if (adminEmails.includes(email) && password === "admin123") {
      const userData: User = {
        id: "admin-123",
        name: "Administrador",
        email: email,
        phone: "(31) 3568-8485",
        document: "12.345.678/0001-90",
        address: "Administrador do Sistema",
        role: "admin",
      };

      setUser(userData);
      localStorage.setItem("bil_cinema_user", JSON.stringify(userData));
      return true;
    }

    // Funcionário mock login
    if (email === "funcionario@empresa.com" && password === "admin123") {
      const userData: User = {
        id: "func-123",
        name: "Funcionário Teste",
        email: email,
        phone: "(31) 98888-8888",
        document: "",
        address: "",
        role: "funcionario",
      };

      setUser(userData);
      localStorage.setItem("bil_cinema_user", JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bil_cinema_user");
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
