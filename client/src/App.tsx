import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompactModeProvider } from "./contexts/CompactModeContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { DashboardCustomizationProvider } from "./contexts/DashboardCustomizationContext";
import { GlobalShortcuts } from "./components/GlobalShortcuts";
import { OnboardingTour } from "./components/OnboardingTour";
import { AppSidebar } from "./components/AppSidebar";
import { useRealtimeNotifications } from "./hooks/useRealtimeNotifications";

// Lazy load de páginas principais (carregamento imediato)
import CascadeView from "./pages/CascadeView";
import NotFound from "./pages/NotFound";

// Lazy load de páginas secundárias (carregamento sob demanda)
// Dashboard, DashboardPage e AnalyticsDashboard foram fundidos em AnalyticsPage
const Mercados = lazy(() => import("./pages/Mercados"));
const MercadoDetalhes = lazy(() => import("./pages/MercadoDetalhes"));
const EnrichmentFlow = lazy(() => import("./pages/EnrichmentFlow"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const EnrichmentProgress = lazy(() => import("./pages/EnrichmentProgress"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));

const ReportsAutomation = lazy(() => import("./pages/ReportsAutomation"));
const PerformanceCenter = lazy(() => import("./pages/PerformanceCenter"));
const EnrichmentSettings = lazy(() => import("./pages/EnrichmentSettings"));

const ResultadosEnriquecimento = lazy(() => import("./pages/ResultadosEnriquecimento"));

const ExportWizard = lazy(() => import("./pages/ExportWizard"));
// TemplateAdmin fundido em ExportWizard
const ResearchWizard = lazy(() => import("./pages/ResearchWizard"));
const AdminLLM = lazy(() => import("./pages/AdminLLM"));
const MonitoringDashboard = lazy(() => import("./pages/MonitoringDashboard"));

const TendenciasDashboard = lazy(() => import("./pages/TendenciasDashboard"));
const ProjectManagement = lazy(() => import("./pages/ProjectManagement"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));
const NotificationConfig = lazy(() => import("./pages/NotificationConfig"));
// ExportHistory fundido em ExportWizard
const Geocodificacao = lazy(() => import("./pages/Geocodificacao"));
const GeoAdmin = lazy(() => import("./pages/GeoAdmin"));
const GeoCockpit = lazy(() => import("./pages/GeoCockpit"));
// GeoCockpitTest, GeoCockpitAdvanced, TerritorialAnalysis, TerritorialHeatmap fundidos em GeoCockpit


const SystemSettings = lazy(() => import("./pages/SystemSettings"));
const Ajuda = lazy(() => import("./pages/Ajuda"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={CascadeView} />
      {/* Rotas antigas redirecionadas para /analytics */}
      <Route path="/mercados" component={Mercados} />
      <Route path="/mercado/:id" component={MercadoDetalhes} />
      <Route path="/enrichment" component={EnrichmentFlow} />
      <Route path="/analytics" component={AnalyticsPage} />
      {/* /analytics-dashboard fundido em /analytics */}
      <Route path="/enrichment-progress" component={EnrichmentProgress} />
      <Route path="/alertas" component={AlertsPage} />
      {/* /alertas/historico fundido em /alertas */}
      
      {/* Relatórios e Automação - Fusão de 3 páginas */}
      <Route path="/relatorios" component={ReportsAutomation} />
      <Route path="/agendamentos-relatorios">{() => { window.location.href = '/relatorios'; return null; }}</Route>
      <Route path="/agendamento">{() => { window.location.href = '/relatorios'; return null; }}</Route>
      
      {/* Performance e Conversão - Fusão de 3 páginas */}
      <Route path="/performance" component={PerformanceCenter} />
      <Route path="/roi">{() => { window.location.href = '/performance'; return null; }}</Route>
      <Route path="/funil">{() => { window.location.href = '/performance'; return null; }}</Route>
      <Route path="/research-overview">{() => { window.location.href = '/performance'; return null; }}</Route>
      
      <Route path="/enrichment-settings" component={EnrichmentSettings} />
      <Route path="/resultados-enriquecimento" component={ResultadosEnriquecimento} />

      <Route path="/export" component={ExportWizard} />
      {/* /export/templates fundido em /export/wizard */}
      <Route path="/research/new" component={ResearchWizard} />
      <Route path="/admin/llm" component={AdminLLM} />
      <Route path="/monitoring" component={MonitoringDashboard} />
      {/* /intelligent-alerts fundido em /alertas */}
      <Route path="/tendencias" component={TendenciasDashboard} />
      
      {/* Gestão de Projetos - Fusão de 3 páginas */}
      <Route path="/projetos" component={ProjectManagement} />
      <Route path="/projetos/atividade">{() => { window.location.href = '/projetos'; return null; }}</Route>
      <Route path="/atividade">{() => { window.location.href = '/projetos'; return null; }}</Route>
      <Route path="/notificacoes" component={Notificacoes} />
      <Route path="/notificacoes/config" component={NotificationConfig} />
      {/* /export/historico fundido em /export/wizard */}
      <Route path="/geocodificacao" component={Geocodificacao} />
      <Route path="/geo-admin" component={GeoAdmin} />
      <Route path="/geo-cockpit" component={GeoCockpit} />
      {/* Rotas removidas - funcionalidades fundidas em /geo-cockpit */}
      {/* /quality-trends fundido em /tendencias */}

      <Route path="/configuracoes/sistema" component={SystemSettings} />
      <Route path="/ajuda" component={Ajuda} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Conectar ao stream de notificações em tempo real
  useRealtimeNotifications();
  
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <CompactModeProvider>
          <OnboardingProvider>
            <DashboardCustomizationProvider>
              <TooltipProvider>
                <Toaster />
                <GlobalShortcuts />
                <OnboardingTour />
                <AppSidebar />
                <Suspense fallback={<PageLoader />}>
                  <Router />
                </Suspense>
              </TooltipProvider>
            </DashboardCustomizationProvider>
          </OnboardingProvider>
        </CompactModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
