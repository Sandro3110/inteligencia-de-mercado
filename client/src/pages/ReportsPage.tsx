import { ReportGenerator } from "@/components/ReportGenerator";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: "Relatórios" }]} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Componente de Geração de Relatórios */}
        <ReportGenerator />
      </div>
    </div>
  );
}
