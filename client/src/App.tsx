import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { trpc, trpcClient } from './lib/trpc';
import { useState } from 'react';
import { Toaster } from 'sonner';
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProjetosPage from './pages/projetos/ProjetosPage';
import ProjetoNovoPage from './pages/projetos/ProjetoNovoPage';
import PesquisasPage from './pages/pesquisas/PesquisasPage';
import PesquisaNovaPage from './pages/pesquisas/PesquisaNovaPage';
import EntidadesPage from './pages/EntidadesPage';
import ImportacaoPage from './pages/ImportacaoPage';
import ImportacoesListPage from './pages/ImportacoesListPage';
import EnriquecimentoPage from './pages/EnriquecimentoPage';

// Páginas Dimensionais
import { CuboExplorador } from './pages/CuboExplorador';
import { AnaliseTemporal } from './pages/AnaliseTemporal';
import { AnaliseGeografica } from './pages/AnaliseGeografica';
import { AnaliseMercado } from './pages/AnaliseMercado';
import { DetalhesEntidade } from './pages/DetalhesEntidade';

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/projetos" component={ProjetosPage} />
            <Route path="/projetos/novo" component={ProjetoNovoPage} />
            <Route path="/pesquisas" component={PesquisasPage} />
            <Route path="/pesquisas/novo" component={PesquisaNovaPage} />
            <Route path="/entidades" component={EntidadesPage} />
            <Route path="/importacao" component={ImportacaoPage} />
            <Route path="/importacoes" component={ImportacoesListPage} />
            <Route path="/enriquecimento" component={EnriquecimentoPage} />
            
            {/* Rotas Dimensionais */}
            <Route path="/cubo" component={CuboExplorador} />
            <Route path="/analise/temporal" component={AnaliseTemporal} />
            <Route path="/analise/geografica" component={AnaliseGeografica} />
            <Route path="/analise/mercado" component={AnaliseMercado} />
            <Route path="/entidade/:id" component={DetalhesEntidade} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
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
