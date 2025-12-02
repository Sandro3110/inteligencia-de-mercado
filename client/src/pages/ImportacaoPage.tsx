export default function ImportacaoPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Importação de Dados</h1>
        <p className="text-muted-foreground">
          Importe entidades em massa via CSV ou Excel
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Em Desenvolvimento</h2>
          <p className="text-muted-foreground mb-6">
            Esta funcionalidade será implementada na FASE 4 do projeto. Aqui você poderá:
          </p>
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Fazer upload de arquivos CSV ou Excel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Mapear colunas do arquivo para campos do sistema</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Validar dados antes da importação</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Detectar e prevenir duplicatas (CNPJ)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Acompanhar progresso da importação</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Baixar template de exemplo</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
