import { useState } from 'react';
import { Search, Filter, ArrowLeft, FileSpreadsheet, FileText, TrendingUp, TrendingDown, Minus, Target, Building2, Lightbulb, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import MercadoDetailsSheet from '@/components/MercadoDetailsSheet';

export default function MercadosPage() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | undefined>();
  const [segmentacaoFiltro, setSegmentacaoFiltro] = useState<string | undefined>();
  const [crescimentoFiltro, setCrescimentoFiltro] = useState<'positivo' | 'estavel' | 'negativo' | undefined>();
  const [atratividadeFiltro, setAtratividadeFiltro] = useState<'alta' | 'media' | 'baixa' | undefined>();
  const [saturacaoFiltro, setSaturacaoFiltro] = useState<'baixo' | 'medio' | 'alto' | undefined>();
  const [page, setPage] = useState(0);
  const [mercadoSelecionado, setMercadoSelecionado] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const limit = 20;
  

  // Query para listar mercados
  const mercados = trpc.mercados.list.useQuery({
    busca: busca || undefined,
    categoria: categoriaFiltro,
    segmentacao: segmentacaoFiltro,
    crescimento: crescimentoFiltro,
    atratividade: atratividadeFiltro,
    saturacao: saturacaoFiltro,
    limit,
    offset: page * limit,
  });

  const mercadosList = Array.isArray(mercados.data?.data) ? mercados.data.data : [];

  // Função para abrir modal com detalhes
  const abrirDetalhes = (mercado: any) => {
    setMercadoSelecionado(mercado);
    setModalAberto(true);
  };

  // Função para copiar dados do mercado
  const copiarMercado = (mercado: any) => {
    const texto = `
Nome: ${mercado.nome}
Categoria: ${mercado.categoria}
Segmentação: ${mercado.segmentacao}
Tamanho: ${mercado.tamanho_mercado || 'N/A'}
Crescimento: ${mercado.crescimento_anual || 'N/A'}
Score de Atratividade: ${mercado.score_atratividade || 'N/A'}
Nível de Saturação: ${mercado.nivel_saturacao || 'N/A'}
    `.trim();
    
    navigator.clipboard.writeText(texto);
    toast({
      title: 'Copiado!',
      description: 'Dados do mercado copiados para a área de transferência',
      duration: 2000
    });
  };

  // Função para exportar CSV
  const exportarCSV = () => {
    if (!mercadosList || mercadosList.length === 0) return;
    
    const headers = ['Nome', 'Categoria', 'Segmentação', 'Tamanho', 'Crescimento', 'Score', 'Saturação'];
    const rows = mercadosList.map((m: any) => [
      m.nome,
      m.categoria || '',
      m.segmentacao || '',
      m.tamanho_mercado || '',
      m.crescimento_anual || '',
      m.score_atratividade || '',
      m.nivel_saturacao || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mercados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: 'Exportado!',
      description: 'Arquivo CSV baixado com sucesso',
      duration: 2000
    });
  };

  // Helpers para badges
  const getBadgeCategoria = (categoria: string) => {
    const cores: Record<string, string> = {
      'Comércio': 'bg-blue-100 text-blue-800',
      'Saúde': 'bg-green-100 text-green-800',
      'Tecnologia': 'bg-purple-100 text-purple-800',
      'Serviços': 'bg-orange-100 text-orange-800',
      'Indústria': 'bg-gray-100 text-gray-800',
      'Agro': 'bg-yellow-100 text-yellow-800'
    };
    return cores[categoria] || 'bg-gray-100 text-gray-800';
  };

  const getIconeCrescimento = (crescimento: string) => {
    if (!crescimento) return <Minus className="h-4 w-4 text-gray-400" />;
    const valor = parseFloat(crescimento.replace(/[^0-9.-]/g, ''));
    if (valor > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (valor < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const getCorScore = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBadgeSaturacao = (saturacao: string | null) => {
    if (!saturacao) return 'bg-gray-100 text-gray-600';
    if (saturacao.toLowerCase() === 'baixo') return 'bg-green-100 text-green-800';
    if (saturacao.toLowerCase() === 'medio' || saturacao.toLowerCase() === 'médio') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Browse de Mercados"
        description="Explore e analise mercados com filtros avançados"
        icon={Target}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Mercados' }
        ]}
      />

      {/* Filtros */}
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
              onClick={exportarCSV}
              disabled={!mercadosList || mercadosList.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Busca */}
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, tendências, players..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPage(0);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por Categoria */}
          <div>
            <Select value={categoriaFiltro || 'todos'} onValueChange={(v) => {
              setCategoriaFiltro(v === 'todos' ? undefined : v);
              setPage(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Categorias</SelectItem>
                <SelectItem value="Comércio">Comércio</SelectItem>
                <SelectItem value="Saúde">Saúde</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Serviços">Serviços</SelectItem>
                <SelectItem value="Indústria">Indústria</SelectItem>
                <SelectItem value="Agro">Agro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Segmentação */}
          <div>
            <Select value={segmentacaoFiltro || 'todos'} onValueChange={(v) => {
              setSegmentacaoFiltro(v === 'todos' ? undefined : v);
              setPage(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Segmentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Segmentações</SelectItem>
                <SelectItem value="B2B">B2B</SelectItem>
                <SelectItem value="B2C">B2C</SelectItem>
                <SelectItem value="B2G">B2G</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Crescimento */}
          <div>
            <Select value={crescimentoFiltro || 'todos'} onValueChange={(v) => {
              setCrescimentoFiltro(v === 'todos' ? undefined : v as any);
              setPage(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Crescimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="positivo">Crescendo (&gt;5%)</SelectItem>
                <SelectItem value="estavel">Estável (0-5%)</SelectItem>
                <SelectItem value="negativo">Decrescendo (&lt;0%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Atratividade */}
          <div>
            <Select value={atratividadeFiltro || 'todos'} onValueChange={(v) => {
              setAtratividadeFiltro(v === 'todos' ? undefined : v as any);
              setPage(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Atratividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="alta">Alta (80+)</SelectItem>
                <SelectItem value="media">Média (50-79)</SelectItem>
                <SelectItem value="baixa">Baixa (&lt;50)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Saturação */}
          <div>
            <Select value={saturacaoFiltro || 'todos'} onValueChange={(v) => {
              setSaturacaoFiltro(v === 'todos' ? undefined : v as any);
              setPage(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Saturação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {(busca || categoriaFiltro || segmentacaoFiltro || crescimentoFiltro || atratividadeFiltro || saturacaoFiltro) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBusca('');
              setCategoriaFiltro(undefined);
              setSegmentacaoFiltro(undefined);
              setCrescimentoFiltro(undefined);
              setAtratividadeFiltro(undefined);
              setSaturacaoFiltro(undefined);
              setPage(0);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        {mercados.isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando mercados...</p>
          </div>
        ) : mercados.isError ? (
          <div className="p-12 text-center">
            <p className="text-destructive mb-2">Erro ao carregar mercados</p>
            <p className="text-sm text-muted-foreground">{mercados.error.message}</p>
          </div>
        ) : mercadosList.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum mercado encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar os filtros de busca
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Nome do Mercado</th>
                    <th className="text-left p-4 font-medium">Categoria</th>
                    <th className="text-left p-4 font-medium">Seg.</th>
                    <th className="text-left p-4 font-medium">Tamanho</th>
                    <th className="text-left p-4 font-medium">Crescimento</th>
                    <th className="text-left p-4 font-medium">Score</th>
                    <th className="text-left p-4 font-medium">Saturação</th>
                  </tr>
                </thead>
                <tbody>
                  {mercadosList.map((mercado: any) => (
                    <tr
                      key={mercado.id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onDoubleClick={() => abrirDetalhes(mercado)}
                    >
                      <td className="p-4">
                        <div className="font-medium text-sm">{mercado.nome}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={getBadgeCategoria(mercado.categoria)}>
                          {mercado.categoria}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{mercado.segmentacao}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {mercado.tamanho_mercado || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getIconeCrescimento(mercado.crescimento_anual)}
                          <span className="text-sm">{mercado.crescimento_anual || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`font-semibold ${getCorScore(mercado.score_atratividade)}`}>
                          {mercado.score_atratividade ? `${mercado.score_atratividade}/100` : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getBadgeSaturacao(mercado.nivel_saturacao)}>
                          {mercado.nivel_saturacao || 'N/A'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, mercados.data?.total || 0)} de {mercados.data?.total || 0} mercados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * limit >= (mercados.data?.total || 0)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Sheet de Detalhes */}
      <MercadoDetailsSheet
        mercado={mercadoSelecionado ? {
          id: mercadoSelecionado.id,
          nome: mercadoSelecionado.nome,
          categoria: mercadoSelecionado.categoria,
          segmentacao: mercadoSelecionado.segmentacao,
          tamanhoMercado: mercadoSelecionado.tamanho_mercado,
          crescimentoAnual: mercadoSelecionado.crescimento_anual,
          tendencias: mercadoSelecionado.tendencias,
          principaisPlayers: mercadoSelecionado.principais_players,
          sentimento: mercadoSelecionado.sentimento,
          scoreAtratividade: mercadoSelecionado.score_atratividade,
          nivelSaturacao: mercadoSelecionado.nivel_saturacao,
          oportunidades: mercadoSelecionado.oportunidades,
          riscos: mercadoSelecionado.riscos,
          recomendacaoEstrategica: mercadoSelecionado.recomendacao_estrategica,
          createdAt: mercadoSelecionado.created_at,
          updatedAt: mercadoSelecionado.updated_at,
        } : null}
        open={modalAberto}
        onOpenChange={setModalAberto}
        onUpdate={() => mercados.refetch()}
      />
    </div>
  );
}
