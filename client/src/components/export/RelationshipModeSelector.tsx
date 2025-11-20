/**
 * Seletor de profundidade de relacionamentos (joins)
 * Item 12 do módulo de exportação inteligente
 */

import { Zap, Layers, Network } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface RelationshipModeSelectorProps {
  value: 'direct' | 'extended' | 'full';
  onChange: (mode: 'direct' | 'extended' | 'full') => void;
}

interface Mode {
  id: 'direct' | 'extended' | 'full';
  title: string;
  description: string;
  example: string;
  icon: any;
  color: string;
  levels: number;
  performance: string;
}

export function RelationshipModeSelector({ value, onChange }: RelationshipModeSelectorProps) {
  const modes: Mode[] = [
    {
      id: 'direct',
      title: 'Direto',
      description: 'Apenas relacionamentos de 1º nível',
      example: 'Cliente → Produtos',
      icon: Zap,
      color: 'text-green-600',
      levels: 1,
      performance: 'Rápido'
    },
    {
      id: 'extended',
      title: 'Estendido',
      description: 'Relacionamentos até 2º nível',
      example: 'Cliente → Produtos → Mercados',
      icon: Layers,
      color: 'text-blue-600',
      levels: 2,
      performance: 'Moderado'
    },
    {
      id: 'full',
      title: 'Completo',
      description: 'Todos os relacionamentos (3+ níveis)',
      example: 'Cliente → Produtos → Mercados → Concorrentes',
      icon: Network,
      color: 'text-purple-600',
      levels: 3,
      performance: 'Lento'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Profundidade de Relacionamentos
        </h3>
        <p className="text-xs text-slate-600">
          Define quantos níveis de relacionamento serão incluídos na exportação
        </p>
      </div>

      {/* Grid de modos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.id;

          return (
            <Card
              key={mode.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
              onClick={() => onChange(mode.id)}
            >
              {/* Ícone e título */}
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white' : 'bg-slate-50'}`}>
                  <Icon className={`w-5 h-5 ${mode.color}`} />
                </div>
                {isSelected && (
                  <Badge variant="default" className="text-xs">
                    Selecionado
                  </Badge>
                )}
              </div>

              {/* Título e descrição */}
              <h4 className="font-semibold text-slate-900 mb-1">
                {mode.title}
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                {mode.description}
              </p>

              {/* Exemplo */}
              <div className="bg-white border border-slate-200 rounded p-2 mb-3">
                <p className="text-xs text-slate-700 font-mono">
                  {mode.example}
                </p>
              </div>

              {/* Metadados */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {mode.levels} {mode.levels === 1 ? 'nível' : 'níveis'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {mode.performance}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabelas incluídas (preview) */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-slate-900 mb-2">
          Tabelas que serão incluídas:
        </h4>
        <div className="flex flex-wrap gap-2">
          {value === 'direct' && (
            <>
              <Badge variant="outline">Entidade Principal</Badge>
              <Badge variant="outline">Relacionamento Direto</Badge>
            </>
          )}
          {value === 'extended' && (
            <>
              <Badge variant="outline">Entidade Principal</Badge>
              <Badge variant="outline">Relacionamento Direto</Badge>
              <Badge variant="outline">Relacionamento de 2º Nível</Badge>
            </>
          )}
          {value === 'full' && (
            <>
              <Badge variant="outline">Entidade Principal</Badge>
              <Badge variant="outline">Relacionamento Direto</Badge>
              <Badge variant="outline">Relacionamento de 2º Nível</Badge>
              <Badge variant="outline">Relacionamento de 3º Nível</Badge>
              <Badge variant="outline">Relacionamentos Adicionais</Badge>
            </>
          )}
        </div>
      </div>

      {/* Aviso de performance */}
      {value === 'full' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Atenção:</strong> Modo completo pode gerar arquivos grandes e demorar mais tempo para processar.
            Considere adicionar filtros para reduzir o volume de dados.
          </p>
        </div>
      )}
    </div>
  );
}
