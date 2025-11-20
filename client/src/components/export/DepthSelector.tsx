/**
 * Seletor visual de profundidade de análise
 * Item 7 do módulo de exportação inteligente
 */

import { Zap, Clock, Target } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface DepthSelectorProps {
  value: 'quick' | 'balanced' | 'deep';
  onChange: (depth: 'quick' | 'balanced' | 'deep') => void;
}

interface DepthOption {
  id: 'quick' | 'balanced' | 'deep';
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  time: string;
  quality: string;
  features: string[];
}

export function DepthSelector({ value, onChange }: DepthSelectorProps) {
  const options: DepthOption[] = [
    {
      id: 'quick',
      title: 'Rápida',
      description: 'Análise básica e exportação imediata',
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      time: '< 30 segundos',
      quality: 'Básica',
      features: [
        'Dados principais',
        'Sem análise contextual',
        'Formato simples'
      ]
    },
    {
      id: 'balanced',
      title: 'Balanceada',
      description: 'Equilíbrio entre velocidade e qualidade',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      time: '1-2 minutos',
      quality: 'Boa',
      features: [
        'Dados completos',
        'Análise contextual básica',
        'Insights principais'
      ]
    },
    {
      id: 'deep',
      title: 'Profunda',
      description: 'Análise completa com insights avançados',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      time: '3-5 minutos',
      quality: 'Excelente',
      features: [
        'Dados completos + relacionamentos',
        'Análise contextual avançada',
        'Insights estratégicos',
        'Recomendações'
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Profundidade da Análise
        </h3>
        <p className="text-xs text-slate-600">
          Escolha o nível de detalhamento e análise contextual
        </p>
      </div>

      {/* Grid de opções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;

          return (
            <Card
              key={option.id}
              className={`p-5 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
              onClick={() => onChange(option.id)}
            >
              {/* Ícone e badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isSelected ? 'bg-white shadow-sm' : option.bgColor}`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                {isSelected && (
                  <Badge variant="default" className="text-xs">
                    ✓ Selecionado
                  </Badge>
                )}
              </div>

              {/* Título e descrição */}
              <h4 className="font-bold text-slate-900 mb-2 text-lg">
                {option.title}
              </h4>
              <p className="text-xs text-slate-600 mb-4">
                {option.description}
              </p>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white border border-slate-200 rounded-lg p-2">
                  <p className="text-xs text-slate-500 mb-1">Tempo</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {option.time}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2">
                  <p className="text-xs text-slate-500 mb-1">Qualidade</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {option.quality}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${option.color.replace('text-', 'bg-')}`} />
                    <p className="text-xs text-slate-700">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recomendação */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          💡 <strong>Recomendação:</strong> Use <strong>Balanceada</strong> para a maioria dos casos.
          Escolha <strong>Profunda</strong> apenas quando precisar de insights estratégicos detalhados.
        </p>
      </div>
    </div>
  );
}
