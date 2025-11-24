import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  nome: string;
  empresa: string;
  cargo: string;
  setor: string;
  role: "admin" | "visualizador";
  ativo: number;
  createdAt: string | null;
  lastSignedIn: string | null;
}

export function useAuthNew() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Carregar dados do localStorage
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error);
        logout();
      }
    }

    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setLocation("/login");
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin";

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };
}
