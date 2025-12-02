import { useState } from 'react';
import { Database, Search, Filter, Plus, Building2, Mail, Phone, Globe } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';

export default function EntidadesPage() {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'cliente' | 'lead' | 'concorrente' | undefined>();
  const [page, setPage] = useState(0);
  const limit = 20;

  // Query para listar entidades
  const entidades = trpc.entidades.list.useQuery({
    busca: busca || undefined,
    tipo: tipoFiltro,
    limit,
    offset: page * limit,
  });

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'cliente':
        return 'default';
      case 'lead':
        return 'secondary';
      case 'concorrente':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTipo = (tipo: string) => {
    switch (tipo) {
      case 'cliente':
        return 'Cliente';
      case 'lead':
        return 'Lead';
      case 'concorrente':
        return 'Concorrente';
      default:
        return tipo;
    }
  };

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
        actions={
          <Button asChild>
            <Link href="/entidades/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Entidade
            </Link>
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CNPJ, email..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPage(0);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por tipo */}
          <div className="flex gap-2">
            <Button
              variant={tipoFiltro === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTipoFiltro(undefined);
                setPage(0);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Todos
            </Button>
            <Button
              variant={tipoFiltro === 'cliente' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTipoFiltro('cliente');
                setPage(0);
              }}
            >
              Clientes
            </Button>
            <Button
              variant={tipoFiltro === 'lead' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTipoFiltro('lead');
                setPage(0);
              }}
            >
              Leads
            </Button>
            <Button
              variant={tipoFiltro === 'concorrente' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTipoFiltro('concorrente');
                setPage(0);
              }}
            >
              Concorrentes
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        {entidades.isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando entidades...</p>
          </div>
        ) : entidades.isError ? (
          <div className="p-12 text-center">
            <p className="text-destructive mb-2">Erro ao carregar entidades</p>
            <p className="text-sm text-muted-foreground">{entidades.error.message}</p>
          </div>
        ) : !entidades.data || entidades.data.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma entidade encontrada</h3>
            <p className="text-muted-foreground mb-6">
              {busca || tipoFiltro
                ? 'Tente ajustar os filtros de busca'
                : 'Comece importando dados ou criando uma nova entidade'}
            </p>
            <Button asChild>
              <Link href="/importacao">
                <Plus className="h-4 w-4 mr-2" />
                Importar Dados
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Nome</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-left p-4 font-medium">CNPJ</th>
                    <th className="text-left p-4 font-medium">Contato</th>
                    <th className="text-left p-4 font-medium">Origem</th>
                    <th className="text-left p-4 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {entidades.data.map((entidade: any) => (
                    <tr
                      key={entidade.id}
                      className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/entidades/${entidade.id}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{entidade.nome}</div>
                            {entidade.nome_fantasia && (
                              <div className="text-sm text-muted-foreground">
                                {entidade.nome_fantasia}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getBadgeVariant(entidade.tipo_entidade)}>
                          {formatTipo(entidade.tipo_entidade)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {entidade.cnpj || '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm">
                          {entidade.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {entidade.email}
                            </div>
                          )}
                          {entidade.telefone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {entidade.telefone}
                            </div>
                          )}
                          {entidade.site && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {entidade.site}
                            </div>
                          )}
                          {!entidade.email && !entidade.telefone && !entidade.site && '—'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {entidade.origem_tipo}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(entidade.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {page + 1}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!entidades.data || entidades.data.length < limit}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
