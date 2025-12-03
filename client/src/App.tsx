import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { trpc, trpcClient } from './lib/trpc';
import { useState, lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ProtectedLayout } from './components/ProtectedLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useLocation } from 'wouter';
import { analytics } from './lib/analytics';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

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
const GestaoIA = lazy(() => import('./pages/GestaoIA'));

// Páginas Dimensionais - Lazy loading
const CuboExplorador = lazy(() => import('./pages/CuboExplorador'));
const AnaliseTemporal = lazy(() => import('./pages/AnaliseTemporal'));
const AnaliseGeografica = lazy(() => import('./pages/AnaliseGeografica'));
const AnaliseMercado = lazy(() => import('./pages/AnaliseMercado'));
const DetalhesEntidade = lazy(() => import('./pages/DetalhesEntidade'));

// Páginas Legais - Lazy loading
const PrivacidadePage = lazy(() => import('./pages/PrivacidadePage'));
const TermosPage = lazy(() => import('./pages/TermosPage'));
const DocumentacaoPage = lazy(() => import('./pages/DocumentacaoPage'));

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
      <AuthProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
          <ProtectedLayout>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Carregando página..." />
              </div>
            }>
          <Switch>
            {/* Rotas Públicas */}
            <Route path="/login" component={LoginPage} />
            <Route path="/privacidade" component={PrivacidadePage} />
            <Route path="/termos" component={TermosPage} />
            
            {/* Rotas Protegidas */}
            <Route path="/">
              <PrivateRoute><HomePage /></PrivateRoute>
            </Route>
            <Route path="/projetos">
              <PrivateRoute><ProjetosPage /></PrivateRoute>
            </Route>
            <Route path="/projetos/novo">
              <PrivateRoute><ProjetoNovoPage /></PrivateRoute>
            </Route>
            <Route path="/pesquisas">
              <PrivateRoute><PesquisasPage /></PrivateRoute>
            </Route>
            <Route path="/pesquisas/novo">
              <PrivateRoute><PesquisaNovaPage /></PrivateRoute>
            </Route>
            <Route path="/pesquisas/:id">
              <PrivateRoute><PesquisaDetalhesPage /></PrivateRoute>
            </Route>
            <Route path="/entidades">
              <PrivateRoute><EntidadesPage /></PrivateRoute>
            </Route>
            <Route path="/importacao">
              <PrivateRoute><ImportacaoPage /></PrivateRoute>
            </Route>
            <Route path="/importacoes">
              <PrivateRoute><ImportacoesListPage /></PrivateRoute>
            </Route>
            <Route path="/enriquecimento">
              <PrivateRoute><EnriquecimentoPage /></PrivateRoute>
            </Route>
            <Route path="/processamento-ia">
              <PrivateRoute><ProcessamentoIA /></PrivateRoute>
            </Route>
            
            {/* Rotas Admin */}
            <Route path="/usuarios">
              <PrivateRoute requiredRole={['administrador']}>
                <GestaoUsuarios />
              </PrivateRoute>
            </Route>
            <Route path="/gestao-ia">
              <PrivateRoute requiredRole={['administrador']}>
                <GestaoIA />
              </PrivateRoute>
            </Route>
            
            {/* Rotas Dimensionais */}
            <Route path="/cubo">
              <PrivateRoute><CuboExplorador /></PrivateRoute>
            </Route>
            <Route path="/analise/temporal">
              <PrivateRoute><AnaliseTemporal /></PrivateRoute>
            </Route>
            <Route path="/analise/geografica">
              <PrivateRoute><AnaliseGeografica /></PrivateRoute>
            </Route>
            <Route path="/analise/mercado">
              <PrivateRoute><AnaliseMercado /></PrivateRoute>
            </Route>
            <Route path="/entidade/:id">
              <PrivateRoute><DetalhesEntidade /></PrivateRoute>
            </Route>
            
            {/* Rotas de Ajuda */}
            <Route path="/documentacao">
              <PrivateRoute><DocumentacaoPage /></PrivateRoute>
            </Route>
            
            <Route component={NotFound} />
          </Switch>
            </Suspense>
        </ProtectedLayout>
          </QueryClientProvider>
        </trpc.Provider>
      </AuthProvider>
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
