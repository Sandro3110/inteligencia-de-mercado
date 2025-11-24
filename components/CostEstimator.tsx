import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, DollarSign, Zap } from "lucide-react";

interface CostEstimatorProps {
  totalClientes: number;
  produtosPorMercado?: number;
  concorrentesPorMercado?: number;
  leadsPorMercado?: number;
}

export function CostEstimator({
  totalClientes,
  produtosPorMercado = 3,
  concorrentesPorMercado = 5,
  leadsPorMercado = 5,
}: CostEstimatorProps) {
  // Custos por chamada (estimativa baseada em GPT-4)
  const COST_PER_OPENAI_CALL = 0.03; // $0.03 por chamada
  const COST_PER_SERPAPI_CALL = 0.002; // $0.002 por chamada

  // Sistema ANTIGO (legado)
  const oldOpenAICalls =
    totalClientes *
    (10 + produtosPorMercado + concorrentesPorMercado + leadsPorMercado);
  const oldSerpAPICalls = totalClientes * 45;
  const oldCost =
    oldOpenAICalls * COST_PER_OPENAI_CALL +
    oldSerpAPICalls * COST_PER_SERPAPI_CALL;

  // Sistema NOVO (otimizado)
  const newOpenAICalls = totalClientes * 1; // 1 chamada por cliente
  const newSerpAPICalls = 0; // Não usa mais SerpAPI
  const newCost =
    newOpenAICalls * COST_PER_OPENAI_CALL +
    newSerpAPICalls * COST_PER_SERPAPI_CALL;

  // Economia
  const savings = oldCost - newCost;
  const savingsPercent = ((savings / oldCost) * 100).toFixed(0);

  // Tempo estimado
  const oldTime = totalClientes * 180; // 3 minutos por cliente
  const newTime = totalClientes * 30; // 30 segundos por cliente
  const timeSavings = oldTime - newTime;
  const timeSavingsPercent = ((timeSavings / oldTime) * 100).toFixed(0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  return (
    <Card className="border-green-500/20 bg-green-50/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-500" />
          Estimativa de Economia
        </CardTitle>
        <CardDescription>
          Comparação entre sistema legado e otimizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparação de Custos */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">
              Sistema Antigo
            </div>
            <div className="text-2xl font-bold text-destructive">
              ${oldCost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {oldOpenAICalls} chamadas OpenAI
              <br />
              {oldSerpAPICalls} chamadas SerpAPI
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <TrendingDown className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-700 border-green-500/20"
              >
                -{savingsPercent}%
              </Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">
              Sistema Novo
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${newCost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {newOpenAICalls} chamadas OpenAI
              <br />
              {newSerpAPICalls} chamadas SerpAPI
            </div>
          </div>
        </div>

        {/* Economia Total */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-medium">Economia Total:</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${savings.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Comparação de Tempo */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-3">Tempo de Processamento</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Antigo</div>
              <div className="text-lg font-bold text-destructive">
                {formatTime(oldTime)}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-700 border-blue-500/20"
              >
                -{timeSavingsPercent}%
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Novo</div>
              <div className="text-lg font-bold text-green-600">
                {formatTime(newTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes */}
        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>
            • Sistema otimizado usa 1 chamada OpenAI por cliente (vs{" "}
            {oldOpenAICalls / totalClientes} no antigo)
          </p>
          <p>
            • Deduplicação automática de mercados reduz chamadas redundantes
          </p>
          <p>
            • Processamento em paralelo acelera execução em {timeSavingsPercent}
            %
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
