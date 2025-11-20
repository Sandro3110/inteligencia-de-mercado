import { AlertConfig } from "@/components/AlertConfig";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link } from "wouter";

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Alertas" }]} />
        
        {/* Botão Ver Histórico */}
        <div className="flex justify-end">
          <Link href="/alertas/historico">
            <Button variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              Ver Histórico
            </Button>
          </Link>
        </div>
        
        {/* Componente de Configuração de Alertas */}
        <AlertConfig />
      </div>
    </div>
  );
}
