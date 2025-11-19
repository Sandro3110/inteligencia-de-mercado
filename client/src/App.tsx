import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompactModeProvider } from "./contexts/CompactModeContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { DashboardCustomizationProvider } from "./contexts/DashboardCustomizationContext";
import { GlobalShortcuts } from "./components/GlobalShortcuts";
import { OnboardingTour } from "./components/OnboardingTour";
import MainNav from "./components/MainNav";
import Dashboard from "./pages/Dashboard";
import DashboardPage from "./pages/DashboardPage";
import Mercados from "./pages/Mercados";
import MercadoDetalhes from "./pages/MercadoDetalhes";
import CascadeView from "./pages/CascadeView";
import EnrichmentFlow from "./pages/EnrichmentFlow";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AnalyticsPage from "./pages/AnalyticsPage";
import EnrichmentProgress from "./pages/EnrichmentProgress";
import AlertsPage from "./pages/AlertsPage";
import AlertHistoryPage from "./pages/AlertHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import ROIDashboard from "./pages/ROIDashboard";
import FunnelView from "./pages/FunnelView";
import SchedulePage from "./pages/SchedulePage";
import AtividadePage from "./pages/AtividadePage";
import Enriquecimento from "./pages/Enriquecimento";

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
      <Route path="/enriquecimento" component={Enriquecimento} />
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
                <MainNav />
                <Router />
              </TooltipProvider>
            </DashboardCustomizationProvider>
          </OnboardingProvider>
        </CompactModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
