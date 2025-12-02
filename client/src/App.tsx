import { Route, Switch } from 'wouter';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/">
          <HomePage />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
}

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
          Intelmarket
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Sistema de Gestão e Enriquecimento de Inteligência de Mercado com IA
        </p>
        <div className="rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-semibold mb-4">🚀 Projeto Recriado com Sucesso!</h2>
          <p className="text-muted-foreground">
            O projeto foi recriado do zero preservando:
          </p>
          <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Banco de dados Supabase (5.570 cidades)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Schema dimensional v3.0</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>DAL completo (10 tabelas)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Variáveis de ambiente (32)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Domínio intelmarket.app</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
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
