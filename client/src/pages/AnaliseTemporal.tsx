/**
 * Tela: Análise Temporal
 * Evolução + Tendências + Sazonalidade + Comparação de Períodos
 */

import { Calendar, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AnaliseTemporal() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Evolução Temporal',
      description: 'Visualize a evolução de métricas ao longo do tempo',
      color: 'text-primary',
      metrics: ['Receita', 'Clientes', 'Conversão', 'Churn']
    },
    {
      icon: Activity,
      title: 'Sazonalidade',
      description: 'Identifique padrões mensais, semanais e diários',
      color: 'text-secondary',
      metrics: ['Picos', 'Vales', 'Tendências', 'Ciclos']
    },
    {
      icon: BarChart3,
      title: 'Comparação de Períodos',
      description: 'Compare diferentes períodos (YoY, MoM, QoQ)',
      color: 'text-success',
      metrics: ['Crescimento %', 'Diferença', 'Benchmark']
    },
    {
      icon: Calendar,
      title: 'Previsão',
      description: 'Projeções baseadas em tendências históricas',
      color: 'text-warning',
      metrics: ['Próximos 3M', 'Próximos 6M', 'Próximo Ano']
    }
  ];

  const granularidades = [
    { label: 'Diária', value: 'dia', description: 'Análise dia a dia' },
    { label: 'Semanal', value: 'semana', description: '7 dias' },
    { label: 'Mensal', value: 'mes', description: '30 dias' },
    { label: 'Trimestral', value: 'trimestre', description: 'Q1, Q2, Q3, Q4' },
    { label: 'Anual', value: 'ano', description: 'Ano completo' }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tendências no Tempo"
        description="Análise temporal com evolução, sazonalidade e previsões"
        icon={TrendingUp}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Análise' },
          { label: 'Tendências no Tempo' }
        ]}
      />

      {/* Status Badge */}
      <div className="mb-8">
        <Badge variant="default" className="bg-secondary hover:bg-secondary/90">
          🚀 Em Desenvolvimento - FASE 6
        </Badge>
      </div>

      {/* Main Content */}
      <Card className="p-12 text-center mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-10 w-10 text-secondary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">
            Análise Temporal Avançada
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Esta funcionalidade será implementada na <strong>FASE 6</strong> do projeto. 
            Analise tendências, sazonalidade e faça previsões baseadas em dados históricos!
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
                      <div className="flex flex-wrap gap-1">
                        {feature.metrics.map((metric, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Granularidades */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-secondary" />
          Granularidades Disponíveis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {granularidades.map((gran, index) => (
            <Card key={index} className="p-4 text-center hover-lift">
              <div className="text-lg font-semibold text-secondary mb-1">
                {gran.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {gran.description}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Gráficos
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Visualizações interativas com Recharts
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Linha:</span>
              <span className="font-medium">Evolução</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Área:</span>
              <span className="font-medium">Tendências</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Barra:</span>
              <span className="font-medium">Comparação</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" />
            Métricas
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            KPIs calculados automaticamente
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Crescimento:</span>
              <span className="font-medium">% período</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Média:</span>
              <span className="font-medium">Período</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tendência:</span>
              <span className="font-medium">Linear</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-warning" />
            Previsão
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Projeções baseadas em histórico
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método:</span>
              <span className="font-medium">Linear</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horizonte:</span>
              <span className="font-medium">6 meses</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confiança:</span>
              <span className="font-medium text-success">85%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AnaliseTemporal;
