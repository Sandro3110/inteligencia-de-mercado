export default function EntidadesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Entidades</h1>
        <p className="text-muted-foreground">
          Gerencie as entidades (empresas/organizações) do sistema
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Em Desenvolvimento</h2>
          <p className="text-muted-foreground mb-6">
            Esta funcionalidade será implementada na FASE 4 do projeto. Aqui você poderá:
          </p>
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Visualizar todas as entidades cadastradas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Buscar e filtrar por CNPJ, nome, cidade, mercado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Ver score de qualidade dos dados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Acessar detalhes completos de cada entidade</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Gerenciar produtos e competidores</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
