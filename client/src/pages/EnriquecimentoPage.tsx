export default function EnriquecimentoPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enriquecimento com IA</h1>
        <p className="text-muted-foreground">
          Enriqueça dados de entidades usando inteligência artificial
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Em Desenvolvimento</h2>
          <p className="text-muted-foreground mb-6">
            Esta funcionalidade será implementada na FASE 5 do projeto. Aqui você poderá:
          </p>
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Enriquecer dados via IA (OpenAI, Anthropic)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Buscar informações na web automaticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Classificar entidades por mercado e produtos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Identificar concorrentes automaticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Calcular score de qualidade dos dados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Acompanhar jobs de enriquecimento em tempo real</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
