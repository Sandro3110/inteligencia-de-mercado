'use client';

import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/register"];

// ⚠️ VERSÃO DE TESTE - BYPASS DE AUTENTICAÇÃO
// Esta versão permite acesso sem login para testes
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // 🔓 BYPASS ATIVADO - Permitir acesso a todas as rotas
  console.log("🔓 AUTH BYPASS ATIVO - Permitindo acesso sem autenticação");
  console.log("Location:", location);
  console.log("IsAuthenticated:", isAuthenticated);
  console.log("User:", user);

  // Se está em rota pública, renderizar normalmente
  if (PUBLIC_ROUTES.includes(location)) {
    return <>{children}</>;
  }

  // 🔓 BYPASS: Renderizar conteúdo mesmo sem autenticação
  return <>{children}</>;
}
