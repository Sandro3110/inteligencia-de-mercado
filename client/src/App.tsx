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
import EnriquecimentoPage from './pages/EnriquecimentoPage';

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
            <Route path="/enriquecimento" component={EnriquecimentoPage} />
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
