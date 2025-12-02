import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { trpc, trpcClient } from './lib/trpc';
import { useState, lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useLocation } from 'wouter';
import { analytics } from './lib/analytics';

// Pages - Eager loading (páginas principais)
import HomePage from './pages/HomePage';
import ProjetosPage from './pages/projetos/ProjetosPage';

// Pages - Lazy loading (páginas secundárias)
const ProjetoNovoPage = lazy(() => import('./pages/projetos/ProjetoNovoPage'));
const PesquisasPage = lazy(() => import('./pages/pesquisas/PesquisasPage'));
const PesquisaNovaPage = lazy(() => import('./pages/pesquisas/PesquisaNovaPage'));
const PesquisaDetalhesPage = lazy(() => import('./pages/pesquisas/PesquisaDetalhesPage'));
const EntidadesPage = lazy(() => import('./pages/EntidadesPage'));
const ImportacaoPage = lazy(() => import('./pages/ImportacaoPage'));
const ImportacoesListPage = lazy(() => import('./pages/ImportacoesListPage'));
const EnriquecimentoPage = lazy(() => import('./pages/EnriquecimentoPage'));
const ProcessamentoIA = lazy(() => import('./pages/ProcessamentoIA'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const GestaoUsuarios = lazy(() => import('./pages/GestaoUsuarios'));

// Páginas Dimensionais - Lazy loading
const CuboExplorador = lazy(() => import('./pages/CuboExplorador'));
const AnaliseTemporal = lazy(() => import('./pages/AnaliseTemporal'));
const AnaliseGeografica = lazy(() => import('./pages/AnaliseGeografica'));
const AnaliseMercado = lazy(() => import('./pages/AnaliseMercado'));
const DetalhesEntidade = lazy(() => import('./pages/DetalhesEntidade'));

// Páginas Legais - Lazy loading
const PrivacidadePage = lazy(() => import('./pages/PrivacidadePage'));
const TermosPage = lazy(() => import('./pages/TermosPage'));

function App() {
  const [location] = useLocation();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos"
        cacheTime: 10 * 60 * 1000, // 10 minutos - tempo em cache
        refetchOnWindowFocus: false, // Não refetch ao focar janela
        retry: 3, // 3 tentativas em caso de erro
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      },
    },
  }));

  // Track pageviews
  useEffect(() => {
    analytics.page(location);
  }, [location]);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Carregando página..." />
              </div>
            }>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/projetos" component={ProjetosPage} />
            <Route path="/projetos/novo" component={ProjetoNovoPage} />
            <Route path="/pesquisas" component={PesquisasPage} />
            <Route path="/pesquisas/novo" component={PesquisaNovaPage} />
            <Route path="/pesquisas/:id" component={PesquisaDetalhesPage} />
            <Route path="/entidades" component={EntidadesPage} />
            <Route path="/importacao" component={ImportacaoPage} />
            <Route path="/importacoes" component={ImportacoesListPage} />
            <Route path="/enriquecimento" component={EnriquecimentoPage} />
            <Route path="/processamento-ia" component={ProcessamentoIA} />
            <Route path="/login" component={LoginPage} />
            <Route path="/usuarios" component={GestaoUsuarios} />
            
            {/* Rotas Dimensionais */}
            <Route path="/cubo" component={CuboExplorador} />
            <Route path="/analise/temporal" component={AnaliseTemporal} />
            <Route path="/analise/geografica" component={AnaliseGeografica} />
            <Route path="/analise/mercado" component={AnaliseMercado} />
            <Route path="/entidade/:id" component={DetalhesEntidade} />
            
            {/* Rotas Legais */}
            <Route path="/privacidade" component={PrivacidadePage} />
            <Route path="/termos" component={TermosPage} />
            
            <Route component={NotFound} />
          </Switch>
            </Suspense>
        </Layout>
      </QueryClientProvider>
    </trpc.Provider>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground">Página não encontrada</p>
    </div>
  );
}

export default App;
