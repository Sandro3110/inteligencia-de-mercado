import { ReportGenerator } from "@/components/ReportGenerator";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Relatórios" }]} />
        
        {/* Componente de Geração de Relatórios */}
        <ReportGenerator />
      </div>
    </div>
  );
}
