/**
 * KPICard - Card de KPI com cópia
 * 100% Funcional
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from './CopyButton';
import { formatarMoeda, formatarNumero, formatarPercentual } from '@/shared/helpers/formatacao';
import type { KPI } from '@/shared/types/dimensional';

interface KPICardProps {
  kpi: KPI;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
  const formatarValor = (valor: number | string, formato: string): string => {
    if (typeof valor === 'string') return valor;

    switch (formato) {
      case 'moeda':
        return formatarMoeda(valor);
      case 'numero':
        return formatarNumero(valor);
      case 'percentual':
        return formatarPercentual(valor);
      default:
        return String(valor);
    }
  };

  const valorFormatado = formatarValor(kpi.valor, kpi.formato);

  const getVariacaoIcon = () => {
    if (!kpi.variacao) return null;

    switch (kpi.variacao.direcao) {
      case 'subiu':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'desceu':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'estavel':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVariacaoColor = () => {
    if (!kpi.variacao) return '';

    switch (kpi.variacao.direcao) {
      case 'subiu':
        return 'text-green-600';
      case 'desceu':
        return 'text-red-600';
      case 'estavel':
        return 'text-gray-600';
    }
  };

  const getMetaProgress = () => {
    if (!kpi.meta || typeof kpi.valor !== 'number') return 0;
    return Math.min((kpi.valor / kpi.meta) * 100, 100);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.nome}
        </CardTitle>
        {kpi.copiavel && (
          <CopyButton
            dados={valorFormatado}
            formatos={['texto']}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valorFormatado}</div>

        {kpi.variacao && (
          <div className={`flex items-center gap-1 text-xs ${getVariacaoColor()} mt-1`}>
            {getVariacaoIcon()}
            <span>
              {kpi.variacao.percentual > 0 ? '+' : ''}
              {kpi.variacao.percentual.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs período anterior</span>
          </div>
        )}

        {kpi.meta && typeof kpi.valor === 'number' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Meta: {formatarValor(kpi.meta, kpi.formato)}</span>
              <span>{getMetaProgress().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getMetaProgress()}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRID DE KPIs
// ============================================================================

interface KPIGridProps {
  kpis: KPI[];
  colunas?: 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ kpis, colunas = 4, className }: KPIGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid gap-4 ${gridCols[colunas]} ${className || ''}`}>
      {kpis.map((kpi, index) => (
        <KPICard key={index} kpi={kpi} />
      ))}
    </div>
  );
}
