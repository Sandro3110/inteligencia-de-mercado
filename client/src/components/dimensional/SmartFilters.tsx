/**
 * SmartFilters - Filtros inteligentes com alertas e sugestões
 * 100% Funcional
 */

import { AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AlertaPerformance, FiltroInteligente, CombinacaoRecomendada } from '@shared/types/dimensional';

// ============================================================================
// PERFORMANCE ALERT
// ============================================================================

interface PerformanceAlertProps {
  alerta: AlertaPerformance;
  onAplicarSugestao?: (filtro: FiltroInteligente) => void;
  className?: string;
}

export function PerformanceAlert({
  alerta,
  onAplicarSugestao,
  className
}: PerformanceAlertProps) {
  const variants = {
    info: 'default' as const,
    warning: 'default' as const,
    error: 'destructive' as const
  };

  const icons = {
    info: Lightbulb,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const Icon = icons[alerta.tipo];

  return (
    <Alert variant={variants[alerta.tipo]} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>
        {alerta.tipo === 'error' && 'Atenção: Consulta pesada'}
        {alerta.tipo === 'warning' && 'Aviso: Muitos resultados'}
        {alerta.tipo === 'info' && 'Dica de otimização'}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{alerta.mensagem}</p>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Registros:</span>
            <span className="font-medium ml-1">
              {alerta.registrosEstimados.toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Tempo estimado:</span>
            <span className="font-medium ml-1">
              {alerta.tempoEstimado.toFixed(1)}s
            </span>
          </div>
        </div>

        {alerta.sugestoes.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-sm">Sugestões para otimizar:</p>
            {alerta.sugestoes.map((sugestao, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-2 bg-background rounded p-2"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{sugestao.label}</p>
                  {sugestao.impacto && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        {sugestao.impacto.registrosDepois.toLocaleString('pt-BR')} registros
                      </span>
                      <span className="text-green-600">
                        -{sugestao.impacto.reducaoPercentual.toFixed(0)}%
                      </span>
                      <span>
                        ~{sugestao.impacto.tempoEstimado.toFixed(1)}s
                      </span>
                    </div>
                  )}
                </div>
                {onAplicarSugestao && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAplicarSugestao(sugestao)}
                  >
                    Aplicar
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// RECOMMENDED COMBINATIONS
// ============================================================================

interface RecommendedCombinationsProps {
  combinacoes: CombinacaoRecomendada[];
  onAplicarCombinacao?: (combinacao: CombinacaoRecomendada) => void;
  className?: string;
}

export function RecommendedCombinations({
  combinacoes,
  onAplicarCombinacao,
  className
}: RecommendedCombinationsProps) {
  if (combinacoes.length === 0) return null;

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h4 className="font-medium text-sm">Combinações recomendadas</h4>
      </div>

      <div className="space-y-2">
        {combinacoes.map((combinacao, index) => (
          <div
            key={index}
            className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h5 className="font-medium text-sm">{combinacao.nome}</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {combinacao.descricao}
                </p>
              </div>
              {onAplicarCombinacao && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAplicarCombinacao(combinacao)}
                >
                  Aplicar
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {combinacao.filtros.map((filtro, fIndex) => (
                <Badge key={fIndex} variant="secondary" className="text-xs">
                  {filtro.label || `${filtro.campo} ${filtro.operador} ${filtro.valor}`}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Registros:</span>
                <span className="font-medium ml-1">
                  {combinacao.metricas.registros.toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Receita:</span>
                <span className="font-medium ml-1">
                  R$ {(combinacao.metricas.receitaPotencial / 1000000).toFixed(1)}M
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Score médio:</span>
                <span className="font-medium ml-1">
                  {combinacao.metricas.scoreMedia.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa conversão:</span>
                <span className="font-medium ml-1 text-green-600">
                  {combinacao.metricas.taxaConversaoHistorica.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FILTER SUGGESTIONS
// ============================================================================

interface FilterSuggestionsProps {
  sugestoes: string[];
  className?: string;
}

export function FilterSuggestions({
  sugestoes,
  className
}: FilterSuggestionsProps) {
  if (sugestoes.length === 0) return null;

  return (
    <div className={`bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 ${className || ''}`}>
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
            Sugestões para melhorar sua análise:
          </p>
          <ul className="space-y-1">
            {sugestoes.map((sugestao, index) => (
              <li
                key={index}
                className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2"
              >
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>{sugestao}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// SMART FILTERS WRAPPER
// ============================================================================

interface SmartFiltersProps {
  alerta?: AlertaPerformance;
  sugestoes?: FiltroInteligente[];
  combinacoes?: CombinacaoRecomendada[];
  onAplicarSugestao?: (filtro: FiltroInteligente) => void;
  onAplicarCombinacao?: (combinacao: CombinacaoRecomendada) => void;
  className?: string;
}

export function SmartFilters({
  alerta,
  sugestoes,
  combinacoes,
  onAplicarSugestao,
  onAplicarCombinacao,
  className,
}: SmartFiltersProps) {
  return (
    <div className={className}>
      {alerta && (
        <PerformanceAlert
          alerta={alerta}
          onAplicarSugestao={onAplicarSugestao}
          className="mb-4"
        />
      )}
      
      {sugestoes && sugestoes.length > 0 && (
        <FilterSuggestions
          sugestoes={sugestoes}
          onAplicar={onAplicarSugestao}
          className="mb-4"
        />
      )}
      
      {combinacoes && combinacoes.length > 0 && (
        <RecommendedCombinations
          combinacoes={combinacoes}
          onAplicar={onAplicarCombinacao}
        />
      )}
    </div>
  );
}
