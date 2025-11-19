import { AlertConfig } from "@/components/AlertConfig";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Alertas" }]} />
        
        {/* Componente de Configuração de Alertas */}
        <AlertConfig />
      </div>
    </div>
  );
}
