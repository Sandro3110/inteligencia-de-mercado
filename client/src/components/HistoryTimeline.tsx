import { Clock, Plus, Edit, CheckCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface HistoryEntry {
  id: number;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  changeType: 'created' | 'updated' | 'enriched' | 'validated';
  changedBy: string | null;
  changedAt: Date | string;
}

interface HistoryTimelineProps {
  history: HistoryEntry[];
}

const changeTypeConfig = {
  created: {
    icon: Plus,
    label: 'Criado',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  updated: {
    icon: Edit,
    label: 'Atualizado',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  enriched: {
    icon: Sparkles,
    label: 'Enriquecido',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  validated: {
    icon: CheckCircle,
    label: 'Validado',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
};

const fieldLabels: Record<string, string> = {
  nome: 'Nome',
  cnpj: 'CNPJ',
  email: 'Email',
  telefone: 'Telefone',
  site: 'Site',
  siteOficial: 'Site Oficial',
  cidade: 'Cidade',
  uf: 'UF',
  produto: 'Produto',
  produtoPrincipal: 'Produto Principal',
  categoria: 'Categoria',
  segmentacao: 'Segmentação',
  tamanhoMercado: 'Tamanho do Mercado',
  crescimentoAnual: 'Crescimento Anual',
  tendencias: 'Tendências',
  principaisPlayers: 'Principais Players',
  porte: 'Porte',
  faturamentoEstimado: 'Faturamento Estimado',
  tipo: 'Tipo',
  regiao: 'Região',
  setor: 'Setor',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  cnae: 'CNAE',
  _created: 'Registro Criado',
};

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function formatValue(value: string | null): string {
  if (value === null || value === 'null') return '(vazio)';
  if (value.length > 100) return value.substring(0, 100) + '...';
  return value;
}

export default function HistoryTimeline({ history }: HistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma mudança registrada ainda</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => {
        const config = changeTypeConfig[entry.changeType];
        const Icon = config.icon;
        const fieldLabel = fieldLabels[entry.field || ''] || entry.field;

        return (
          <div key={entry.id} className="relative pl-8">
            {/* Linha vertical */}
            {index < history.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
            )}

            {/* Ícone */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${config.bgColor}`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>

            {/* Conteúdo */}
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className={`font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  {entry.field && entry.field !== '_created' && (
                    <span className="text-sm text-muted-foreground ml-2">
                      • {fieldLabel}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(entry.changedAt)}
                </div>
              </div>

              {entry.field === '_created' ? (
                <div className="text-sm text-muted-foreground">
                  Registro criado no sistema
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Anterior</div>
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                      {formatValue(entry.oldValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Novo</div>
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                      {formatValue(entry.newValue)}
                    </div>
                  </div>
                </div>
              )}

              {entry.changedBy && entry.changedBy !== 'system' && (
                <div className="text-xs text-muted-foreground mt-2">
                  Por: {entry.changedBy}
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
