import { Database, Building2, MapPin, Tag, Star, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EntidadesPage() {
  const features = [
    {
      icon: Database,
      title: 'Base Completa',
      description: 'Visualize todas as entidades cadastradas no sistema',
      color: 'text-primary'
    },
    {
      icon: Building2,
      title: 'Busca Avançada',
      description: 'Filtre por CNPJ, nome, cidade, mercado e muito mais',
      color: 'text-secondary'
    },
    {
      icon: Star,
      title: 'Score de Qualidade',
      description: 'Veja o score de qualidade dos dados de cada entidade',
      color: 'text-warning'
    },
    {
      icon: MapPin,
      title: 'Localização',
      description: 'Visualize entidades no mapa com hierarquia geográfica',
      color: 'text-success'
    },
    {
      icon: Tag,
      title: 'Produtos e Mercados',
      description: 'Gerencie produtos fornecidos e mercados de atuação',
      color: 'text-info'
    },
    {
      icon: Users,
      title: 'Relacionamentos',
      description: 'Visualize clientes, concorrentes e leads relacionados',
      color: 'text-destructive'
    }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Base de Entidades"
        description="Gerencie as entidades (empresas/organizações) do sistema"
        icon={Database}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Base de Entidades' }
        ]}
      />

      {/* Status Badge */}
      <div className="mb-8">
        <Badge variant="default" className="bg-info hover:bg-info/90 text-info-foreground">
          🚧 Em Desenvolvimento - FASE 4
        </Badge>
      </div>

      {/* Main Content */}
      <Card className="p-12 text-center mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
            <Database className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">
            Base Centralizada de Entidades
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Esta funcionalidade será implementada na <strong>FASE 4</strong> do projeto. 
            Gerencie todas as entidades do sistema em um único lugar!
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
            <Database className="h-5 w-5 text-primary" />
            Estrutura de Dados
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Star Schema dimensional com 29 tabelas e 477 campos
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">dim_entidade:</span>
              <span className="font-medium">Tabela principal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">dim_geografia:</span>
              <span className="font-medium">5.570 cidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">dim_mercado:</span>
              <span className="font-medium">Hierarquias</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="h-5 w-5 text-secondary" />
            Tipos de Entidade
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Classificação automática por tipo e relacionamento
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clientes:</span>
              <span className="font-medium">45 campos IA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concorrentes:</span>
              <span className="font-medium">38 campos IA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leads:</span>
              <span className="font-medium">76 campos IA</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            Qualidade de Dados
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Score automático de completude e confiabilidade
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score 0-100:</span>
              <span className="font-medium">Automático</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campos:</span>
              <span className="font-medium">477 validados</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auditoria:</span>
              <span className="font-medium">Completa</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
