import { Sparkles, Brain, Search, Network, Target, Zap } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EnriquecimentoPage() {
  const features = [
    {
      icon: Brain,
      title: 'Enriquecimento via IA',
      description: 'Utilize OpenAI GPT-4o para enriquecer dados automaticamente',
      color: 'text-primary'
    },
    {
      icon: Search,
      title: 'Busca Web Automática',
      description: 'Encontre informações relevantes na web para cada entidade',
      color: 'text-secondary'
    },
    {
      icon: Network,
      title: 'Classificação Inteligente',
      description: 'Classifique entidades por mercado, produtos e segmentos',
      color: 'text-success'
    },
    {
      icon: Target,
      title: 'Identificação de Concorrentes',
      description: 'Detecte concorrentes automaticamente usando IA',
      color: 'text-warning'
    },
    {
      icon: Zap,
      title: 'Score de Qualidade',
      description: 'Calcule automaticamente a qualidade dos dados enriquecidos',
      color: 'text-info'
    },
    {
      icon: Sparkles,
      title: 'Processamento em Lote',
      description: 'Processe milhares de entidades em paralelo com filas',
      color: 'text-destructive'
    }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Processar com IA"
        description="Enriqueça dados de entidades usando inteligência artificial avançada"
        icon={Sparkles}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Processar com IA' }
        ]}
      />

      {/* Status Badge */}
      <div className="mb-8">
        <Badge variant="default" className="bg-warning hover:bg-warning/90 text-warning-foreground">
          🚧 Em Desenvolvimento - FASE 5
        </Badge>
      </div>

      {/* Main Content */}
      <Card className="p-12 text-center mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-warning" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">
            Enriquecimento Inteligente de Dados
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Esta funcionalidade será implementada na <strong>FASE 5</strong> do projeto. 
            Prepare-se para revolucionar a forma como você enriquece dados de mercado!
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-left hover-lift">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-${feature.color}/10 to-${feature.color}/5 flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Modelo de IA
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Temperatura 1.0 para máxima qualidade e criatividade
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPT-4o:</span>
              <span className="font-medium">Análise complexa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPT-4o-mini:</span>
              <span className="font-medium">Listagens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custo:</span>
              <span className="font-medium text-success">$0.006/cliente</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Performance
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Processamento em lote com filas BullMQ + Redis
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concorrência:</span>
              <span className="font-medium">10 workers</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retry:</span>
              <span className="font-medium">3 tentativas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeout:</span>
              <span className="font-medium">30 segundos</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-success" />
            Dados Enriquecidos
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            159 campos preenchidos automaticamente por entidade
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clientes:</span>
              <span className="font-medium">45 campos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concorrentes:</span>
              <span className="font-medium">38 campos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leads:</span>
              <span className="font-medium">76 campos</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
