/**
 * Tela: Cubo Explorador
 * Busca semântica + Filtros inteligentes + Consultas dimensionais
 */

import { useState } from 'react';
import { Search, Sparkles, Database, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CuboExplorador() {
  const features = [
    {
      icon: Sparkles,
      title: 'Busca Semântica com IA',
      description: 'Faça perguntas em linguagem natural e receba insights automáticos',
      color: 'text-primary',
      example: '"Quais clientes de SP compraram mais de R$100k?"'
    },
    {
      icon: Database,
      title: 'Filtros Dimensionais',
      description: 'Combine múltiplas dimensões para análises complexas',
      color: 'text-secondary',
      example: 'Geografia × Mercado × Produto × Tempo'
    },
    {
      icon: TrendingUp,
      title: 'KPIs Automáticos',
      description: 'Visualize métricas calculadas automaticamente',
      color: 'text-success',
      example: 'Total, Média, Crescimento, Participação'
    },
    {
      icon: Search,
      title: 'Drill-Down Inteligente',
      description: 'Navegue entre níveis de hierarquia com um clique',
      color: 'text-warning',
      example: 'País → Estado → Cidade → Bairro'
    }
  ];

  const exampleQueries = [
    {
      query: 'Clientes de São Paulo que compraram mais de R$100.000',
      dimensions: ['Geografia', 'Valor'],
      metrics: ['Total Clientes', 'Valor Total']
    },
    {
      query: 'Concorrentes no mercado de Tecnologia por estado',
      dimensions: ['Mercado', 'Geografia'],
      metrics: ['Total Concorrentes', 'Participação']
    },
    {
      query: 'Leads qualificados com score > 80 por cidade',
      dimensions: ['Tipo', 'Geografia', 'Score'],
      metrics: ['Total Leads', 'Taxa Conversão']
    },
    {
      query: 'Evolução mensal de vendas por produto',
      dimensions: ['Tempo', 'Produto'],
      metrics: ['Vendas', 'Crescimento %']
    }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Explorador Inteligente"
        description="Análise dimensional com busca semântica e filtros inteligentes"
        icon={Sparkles}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Análise' },
          { label: 'Explorador Inteligente' }
        ]}
      />

      {/* Status Badge */}
      <div className="mb-8">
        <Badge variant="default" className="bg-primary hover:bg-primary/90">
          🚀 Em Desenvolvimento - FASE 6
        </Badge>
      </div>

      {/* Main Content */}
      <Card className="p-12 text-center mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">
            Análise Dimensional Inteligente
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Esta funcionalidade será implementada na <strong>FASE 6</strong> do projeto. 
            Explore seus dados com busca semântica e análise multidimensional!
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-left hover-lift">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-${feature.color}/10 to-${feature.color}/5 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {feature.description}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {feature.example}
                      </code>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Example Queries */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Exemplos de Consultas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleQueries.map((example, index) => (
            <Card key={index} className="p-6 hover-lift">
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">Exemplo {index + 1}</Badge>
                <p className="font-medium text-sm">{example.query}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dimensões:</p>
                  <div className="flex flex-wrap gap-1">
                    {example.dimensions.map((dim, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {dim}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Métricas:</p>
                  <div className="flex flex-wrap gap-1">
                    {example.metrics.map((metric, i) => (
                      <Badge key={i} variant="default" className="text-xs bg-success hover:bg-success/90">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            IA Semântica
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            GPT-4o converte perguntas em SQL otimizado
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modelo:</span>
              <span className="font-medium">GPT-4o</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latência:</span>
              <span className="font-medium">~2s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precisão:</span>
              <span className="font-medium text-success">95%+</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Database className="h-5 w-5 text-secondary" />
            Star Schema
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Modelo dimensional otimizado para análise
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dimensões:</span>
              <span className="font-medium">8 tabelas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fatos:</span>
              <span className="font-medium">3 tabelas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campos:</span>
              <span className="font-medium">477 total</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Performance
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Consultas otimizadas com índices e cache
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache:</span>
              <span className="font-medium">Redis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Índices:</span>
              <span className="font-medium">15 otimizados</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempo médio:</span>
              <span className="font-medium text-success">&lt;500ms</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CuboExplorador;
