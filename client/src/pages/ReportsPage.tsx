import { ReportGenerator } from "@/components/ReportGenerator";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Relatórios" }]} />
        
        {/* Componente de Geração de Relatórios */}
        <ReportGenerator />
      </div>
    </div>
  );
}
