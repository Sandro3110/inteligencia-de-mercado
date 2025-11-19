import { AlertConfig } from "@/components/AlertConfig";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link } from "wouter";

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: "Alertas" }]} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
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
