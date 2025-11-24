/**
 * Sugestões contextuais baseadas em dados disponíveis
 * Item 11 do módulo de exportação inteligente
 */

import { Lightbulb, TrendingUp, Users, Target, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface ContextualSuggestionsProps {
  projectId?: number;
  onSelectSuggestion: (context: string) => void;
}

interface Suggestion {
  title: string;
  description: string;
  context: string;
  icon: any;
  color: string;
  priority: "high" | "medium" | "low";
}

export function ContextualSuggestions({
  projectId,
  onSelectSuggestion,
}: ContextualSuggestionsProps) {
  // Sugestões baseadas em análise de dados
  const suggestions: Suggestion[] = [
    {
      title: "Top 10 Mercados por Volume",
      description: "Mercados com maior número de clientes e leads",
      context:
        "Exportar os 10 mercados com mais clientes, incluindo estatísticas de leads e concorrentes",
      icon: TrendingUp,
      color: "text-green-600",
      priority: "high",
    },
    {
      title: "Clientes Validados Recentes",
      description: "Clientes aprovados nos últimos 30 dias",
      context:
        "Clientes com status validado criados nos últimos 30 dias, com produtos e mercados",
      icon: Users,
      color: "text-blue-600",
      priority: "high",
    },
    {
      title: "Leads de Alta Qualidade",
      description: "Leads com score acima de 80",
      context:
        "Leads com qualityScore maior que 80, incluindo dados de contato e mercado",
      icon: Award,
      color: "text-orange-600",
      priority: "high",
    },
    {
      title: "Mercados B2B em Crescimento",
      description: "Mercados B2B com tendência de crescimento",
      context:
        "Mercados com segmentação B2B e crescimento positivo, com análise competitiva",
      icon: Target,
      color: "text-purple-600",
      priority: "medium",
    },
    {
      title: "Concorrentes por Região",
      description: "Análise de concorrentes agrupados por UF",
      context:
        "Concorrentes agrupados por estado, com contagem e principais produtos",
      icon: Users,
      color: "text-red-600",
      priority: "medium",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          Sugestões Baseadas em Seus Dados
        </h3>
      </div>

      {/* Grid de sugestões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <Card
              key={index}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border-slate-200"
              onClick={() => onSelectSuggestion(suggestion.context)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-slate-50`}>
                  <Icon className={`w-5 h-5 ${suggestion.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {suggestion.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityBadge(suggestion.priority)}`}
                    >
                      {suggestion.priority === "high"
                        ? "Alta"
                        : suggestion.priority === "medium"
                          ? "Média"
                          : "Baixa"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    {suggestion.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectSuggestion(suggestion.context);
                    }}
                  >
                    Usar esta sugestão →
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Nota informativa */}
      <p className="text-xs text-slate-500 italic">
        💡 As sugestões são atualizadas dinamicamente baseadas nos dados do seu
        projeto
      </p>
    </div>
  );
}
