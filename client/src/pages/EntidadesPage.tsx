import { useState, useEffect } from 'react';
import { Database, Search, Filter, Plus, Building2, Mail, Phone, Globe, FileSpreadsheet, FileText, X, Copy, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function EntidadesPage() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'cliente' | 'lead' | 'concorrente' | undefined>();
  const [page, setPage] = useState(0);
  const [entidadeSelecionada, setEntidadeSelecionada] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const limit = 20;
  const { toast } = useToast();

  // Ler parâmetro tipo da URL ao carregar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tipoUrl = urlParams.get('tipo') as 'cliente' | 'lead' | 'concorrente' | null;
    if (tipoUrl) {
      setTipoFiltro(tipoUrl);
    }
  }, []);

  // Função para copiar dados da entidade
  const copiarEntidade = (entidade: any) => {
    const texto = `
Nome: ${entidade.nome}
CNPJ: ${entidade.cnpj || 'N/A'}
Tipo: ${formatTipo(entidade.tipo_entidade)}
Email: ${entidade.email || 'N/A'}
Telefone: ${entidade.telefone || 'N/A'}
Site: ${entidade.site || 'N/A'}
    `.trim();
    
    navigator.clipboard.writeText(texto);
    toast({
      title: 'Copiado!',
      description: 'Dados da entidade copiados para a área de transferência',
      duration: 2000
    });
  };

  // Função para exportar CSV
  const exportarCSV = () => {
    if (!entidades.data || entidades.data.length === 0) return;
    
    const headers = ['Nome', 'CNPJ', 'Tipo', 'Email', 'Telefone', 'Site', 'Origem', 'Data'];
    const rows = entidades.data.map((e: any) => [
      e.nome,
      e.cnpj || '',
      formatTipo(e.tipo_entidade),
      e.email || '',
      e.telefone || '',
      e.site || '',
      e.origem_tipo || '',
      new Date(e.created_at).toLocaleDateString('pt-BR')
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `entidades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: 'Exportado!',
      description: 'Arquivo CSV baixado com sucesso',
      duration: 2000
    });
  };

  // Função para exportar Excel (via CSV)
  const exportarExcel = () => {
    if (!entidades.data || entidades.data.length === 0) return;
    
    const headers = ['Nome', 'CNPJ', 'Tipo', 'Email', 'Telefone', 'Site', 'Origem', 'Data'];
    const rows = entidades.data.map((e: any) => [
      e.nome,
      e.cnpj || '',
      formatTipo(e.tipo_entidade),
      e.email || '',
      e.telefone || '',
      e.site || '',
      e.origem_tipo || '',
      new Date(e.created_at).toLocaleDateString('pt-BR')
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `entidades_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    
    toast({
      title: 'Exportado!',
      description: 'Arquivo Excel baixado com sucesso',
      duration: 2000
    });
  };

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
      />

      {/* Filtros e Exportação */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarExcel}
              disabled={!entidades.data || entidades.data.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarCSV}
              disabled={!entidades.data || entidades.data.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
        
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
                      onDoubleClick={() => {
                        setEntidadeSelecionada(entidade);
                        setModalAberto(true);
                      }}
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

      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Entidade</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => entidadeSelecionada && copiarEntidade(entidadeSelecionada)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAberto(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {entidadeSelecionada && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{entidadeSelecionada.nome}</p>
                  </div>
                  {entidadeSelecionada.nome_fantasia && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                      <p className="font-medium">{entidadeSelecionada.nome_fantasia}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">CNPJ</p>
                    <p className="font-medium">{entidadeSelecionada.cnpj || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <Badge variant={getBadgeVariant(entidadeSelecionada.tipo_entidade)}>
                      {formatTipo(entidadeSelecionada.tipo_entidade)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contato
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {entidadeSelecionada.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{entidadeSelecionada.email}</span>
                    </div>
                  )}
                  {entidadeSelecionada.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{entidadeSelecionada.telefone}</span>
                    </div>
                  )}
                  {entidadeSelecionada.site && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={entidadeSelecionada.site} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {entidadeSelecionada.site}
                      </a>
                    </div>
                  )}
                  {!entidadeSelecionada.email && !entidadeSelecionada.telefone && !entidadeSelecionada.site && (
                    <p className="text-muted-foreground">Nenhuma informação de contato disponível</p>
                  )}
                </div>
              </div>

              {/* Origem */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Origem</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Origem</p>
                    <Badge variant="outline">{entidadeSelecionada.origem_tipo || '—'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-medium">{new Date(entidadeSelecionada.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
