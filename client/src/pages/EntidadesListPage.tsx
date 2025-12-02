import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Building2, Search as SearchIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Badge } from '@/components/ui/badge';

export default function EntidadesListPage() {
  const [busca, setBusca] = useState('');
  const { data: entidades, isLoading, error, refetch } = trpc.entidades.list.useQuery({ 
    busca: busca || undefined, 
    limit: 50 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Carregando entidades..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar entidades"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Lista de Entidades"
        description="Visualize e gerencie todas as entidades cadastradas"
        icon={Building2}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Lista de Entidades' }
        ]}
      />

      {/* Search */}
      <Card className="p-6 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Results */}
      {!entidades || entidades.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma entidade encontrada"
          description={busca ? "Tente ajustar os filtros de busca." : "Nenhuma entidade cadastrada no sistema."}
        />
      ) : (
        <div className="space-y-3">
          {entidades.map((ent: any) => (
            <Card key={ent.id} className="p-6 hover-lift cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{ent.nome}</h3>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {ent.cnpj && (
                      <p>
                        <span className="font-medium">CNPJ:</span> {ent.cnpj}
                      </p>
                    )}
                    {ent.cidade && (
                      <p>
                        <span className="font-medium">Localização:</span> {ent.cidade}/{ent.estado}
                      </p>
                    )}
                    {ent.mercado && (
                      <p>
                        <span className="font-medium">Mercado:</span> {ent.mercado}
                      </p>
                    )}
                  </div>
                </div>

                {ent.tipo && (
                  <Badge variant="secondary">
                    {ent.tipo}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Count */}
      {entidades && entidades.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Mostrando {entidades.length} entidade{entidades.length !== 1 ? 's' : ''}
          {busca && ` para "${busca}"`}
        </div>
      )}
    </div>
  );
}
