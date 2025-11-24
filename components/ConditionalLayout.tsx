import { useLocation } from "wouter";
import { AppSidebar } from "./AppSidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/register"];

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const [location] = useLocation();

  // Se está em rota pública, não renderizar o sidebar
  if (PUBLIC_ROUTES.includes(location)) {
    return <>{children}</>;
  }

  // Para rotas autenticadas, renderizar com sidebar
  return (
    <>
      <AppSidebar />
      {children}
    </>
  );
}
