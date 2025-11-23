import { useSelectedProject } from "@/hooks/useSelectedProject";
import { useSidebarState } from "@/hooks/useSidebarState";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart, TrendingUp, PieChart } from "lucide-react";

// Importar componentes de abas
import { OverviewTab } from "@/components/analytics/OverviewTab";
import { InteractiveTab } from "@/components/analytics/InteractiveTab";
import { MetricsTab } from "@/components/analytics/MetricsTab";
import { ComparativeTab } from "@/components/analytics/ComparativeTab";

export default function AnalyticsPage() {
  const { selectedProjectId } = useSelectedProject();
  const { sidebarClass } = useSidebarState();

  if (!selectedProjectId) {
    return (
      <div
        className={`min-h-screen ${sidebarClass} flex items-center justify-center bg-background transition-all duration-300`}
      >
        <p className="text-slate-600">
          Selecione um projeto para visualizar analytics
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${sidebarClass} bg-background transition-all duration-300`}
    >
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container py-3 border-b border-border/30">
          <DynamicBreadcrumbs />
        </div>
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Analytics Unificado
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualizações e análises completas de dados
              </p>
            </div>
            <div className="pill-badge">
              <span className="status-dot success"></span>
              <span>Dados Atualizados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo com Tabs */}
      <div className="container py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="interactive" className="gap-2">
              <LineChart className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="comparative" className="gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Comparativos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab projectId={selectedProjectId} />
          </TabsContent>

          <TabsContent value="interactive" className="space-y-6">
            <InteractiveTab projectId={selectedProjectId} />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <MetricsTab projectId={selectedProjectId} />
          </TabsContent>

          <TabsContent value="comparative" className="space-y-6">
            <ComparativeTab projectId={selectedProjectId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
