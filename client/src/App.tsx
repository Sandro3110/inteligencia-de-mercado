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

// Lazy load de páginas principais (carregamento imediato)
import CascadeView from "./pages/CascadeView";
import NotFound from "./pages/NotFound";

// Lazy load de páginas secundárias (carregamento sob demanda)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const Mercados = lazy(() => import("./pages/Mercados"));
const MercadoDetalhes = lazy(() => import("./pages/MercadoDetalhes"));
const EnrichmentFlow = lazy(() => import("./pages/EnrichmentFlow"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const EnrichmentProgress = lazy(() => import("./pages/EnrichmentProgress"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const AlertHistoryPage = lazy(() => import("./pages/AlertHistoryPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ROIDashboard = lazy(() => import("./pages/ROIDashboard"));
const FunnelView = lazy(() => import("./pages/FunnelView"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const AtividadePage = lazy(() => import("./pages/AtividadePage"));
const EnrichmentSettings = lazy(() => import("./pages/EnrichmentSettings"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const ResultadosEnriquecimento = lazy(() => import("./pages/ResultadosEnriquecimento"));
const ResearchOverview = lazy(() => import("./pages/ResearchOverview"));
const PrePesquisaTeste = lazy(() => import("./pages/PrePesquisaTeste"));
const ExportWizard = lazy(() => import("./pages/ExportWizard"));
const TemplateAdmin = lazy(() => import("./pages/TemplateAdmin"));
const ResearchWizard = lazy(() => import("./pages/ResearchWizard"));
const AdminLLM = lazy(() => import("./pages/AdminLLM"));
const MonitoringDashboard = lazy(() => import("./pages/MonitoringDashboard"));
const IntelligentAlerts = lazy(() => import("./pages/IntelligentAlerts"));
const TendenciasDashboard = lazy(() => import("./pages/TendenciasDashboard"));
const ProjectManagement = lazy(() => import("./pages/ProjectManagement"));
const ProjectActivityDashboard = lazy(() => import("./pages/ProjectActivityDashboard"));

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
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard-avancado" component={DashboardPage} />
      <Route path="/mercados" component={Mercados} />
      <Route path="/mercado/:id" component={MercadoDetalhes} />
      <Route path="/enrichment" component={EnrichmentFlow} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/analytics-dashboard" component={AnalyticsDashboard} />
      <Route path="/enrichment-progress" component={EnrichmentProgress} />
      <Route path="/alertas" component={AlertsPage} />
      <Route path="/alertas/historico" component={AlertHistoryPage} />
      <Route path="/relatorios" component={ReportsPage} />
      <Route path="/roi" component={ROIDashboard} />
      <Route path="/funil" component={FunnelView} />
      <Route path="/agendamento" component={SchedulePage} />
      <Route path="/atividade" component={AtividadePage} />
      <Route path="/enrichment-settings" component={EnrichmentSettings} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/resultados-enriquecimento" component={ResultadosEnriquecimento} />
      <Route path="/research-overview" component={ResearchOverview} />
      <Route path="/pre-pesquisa-teste" component={PrePesquisaTeste} />
      <Route path="/export" component={ExportWizard} />
      <Route path="/export/templates" component={TemplateAdmin} />
      <Route path="/research/new" component={ResearchWizard} />
      <Route path="/admin/llm" component={AdminLLM} />
      <Route path="/monitoring" component={MonitoringDashboard} />
      <Route path="/intelligent-alerts" component={IntelligentAlerts} />
      <Route path="/tendencias" component={TendenciasDashboard} />
      <Route path="/projetos" component={ProjectManagement} />
      <Route path="/projetos/atividade" component={ProjectActivityDashboard} />
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
