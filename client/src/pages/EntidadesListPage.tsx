import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  Loader2,
  Users,
  UserPlus,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useEntidades, type EntidadesFilters, type Entidade } from '@/hooks/useEntidades';
import { useToast } from '@/hooks/use-toast';
import EntidadeDetailsSheet from '@/components/EntidadeDetailsSheet';

// Mapeamento de tipos para labels e ícones
const tipoConfig = {
  cliente: { label: 'Clientes', icon: Users, color: 'green' },
  lead: { label: 'Leads', icon: UserPlus, color: 'yellow' },
  concorrente: { label: 'Concorrentes', icon: Building2, color: 'red' },
};

export default function EntidadesListPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { toast } = useToast();

  // Ler filtros herdados da URL
  const tipoInicial = searchParams.get('tipo') || '';
  const projetoIdInicial = searchParams.get('projeto_id');
  const pesquisaIdInicial = searchParams.get('pesquisa_id');

  // Estados dos filtros
  const [tipo] = useState<string>(tipoInicial);
  const [projetoId] = useState<number | undefined>(
    projetoIdInicial ? parseInt(projetoIdInicial) : undefined
  );
  const [pesquisaId] = useState<number | undefined>(
    pesquisaIdInicial ? parseInt(pesquisaIdInicial) : undefined
  );
  const [busca, setBusca] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');
  const [uf, setUf] = useState<string>('');
  const [setor, setSetor] = useState<string>('');
  const [porte, setPorte] = useState<string>('todos');
  const [scoreMin, setScoreMin] = useState<number | undefined>();
  const [scoreMax, setScoreMax] = useState<number | undefined>();
  const [enriquecido, setEnriquecido] = useState<'true' | 'false' | 'todos'>('todos');

  // Paginação
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Sheet de detalhes
  const [selectedEntidade, setSelectedEntidade] = useState<Entidade | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Construir filtros para a query
  const filters: EntidadesFilters = {
    tipo: tipo || undefined,
    projeto_id: projetoId,
    pesquisa_id: pesquisaId,
    busca: busca || undefined,
    cidade: cidade || undefined,
    uf: uf || undefined,
    setor: setor || undefined,
    porte: porte && porte !== 'todos' ? porte : undefined,
    score_min: scoreMin,
    score_max: scoreMax,
    enriquecido: enriquecido && enriquecido !== 'todos' ? enriquecido : undefined,
    limit,
    offset,
  };

  // Buscar dados
  const { data, isLoading, error } = useEntidades(filters);

  // Handler para duplo click na linha
  const handleRowDoubleClick = (id: number) => {
    const entidade = data?.data.find((e) => e.id === id);
    if (entidade) {
      setSelectedEntidade(entidade);
      setSheetOpen(true);
    }
  };

  // Título da página baseado no tipo
  const config = tipo ? tipoConfig[tipo as keyof typeof tipoConfig] : null;
  const titulo = config ? config.label : 'Entidades';
  const Icon = config ? config.icon : Users;

  // Limpar filtros específicos (mantém filtros herdados)
  const handleLimparFiltros = () => {
    setBusca('');
    setCidade('');
    setUf('');
    setSetor('');
    setPorte('');
    setScoreMin(undefined);
    setScoreMax(undefined);
    setEnriquecido('');
    setOffset(0);
    toast({
      title: 'Filtros limpos',
      description: 'Filtros específicos foram removidos',
    });
  };

  // Duplo click para abrir detalhes
  const handleRowDoubleClick = (entidadeId: number) => {
    toast({
      title: 'Detalhes',
      description: `Abrindo detalhes da entidade ${entidadeId}...`,
    });
  };

  // Contar filtros ativos
  const filtrosAtivos = [
    busca,
    cidade,
    uf,
    setor,
    porte,
    scoreMin !== undefined,
    scoreMax !== undefined,
    enriquecido,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/desktop-turbo')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">{titulo}</h1>
                  <p className="text-sm text-muted-foreground">
                    {data ? `${data.total} registros encontrados` : 'Carregando...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges de filtros herdados */}
            <div className="flex items-center gap-2">
              {projetoId && (
                <Badge variant="outline" className="gap-1">
                  Projeto: {projetoId}
                </Badge>
              )}
              {pesquisaId && (
                <Badge variant="outline" className="gap-1">
                  Pesquisa: {pesquisaId}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Filtros:</span>
            {filtrosAtivos > 0 && (
              <Badge variant="secondary">{filtrosAtivos} ativos</Badge>
            )}
            {filtrosAtivos > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLimparFiltros}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca textual */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, CNPJ ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Cidade */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cidade</label>
              <Input
                placeholder="Ex: São Paulo"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>

            {/* UF */}
            <div>
              <label className="text-sm font-medium mb-2 block">UF</label>
              <Input
                placeholder="Ex: SP"
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>

            {/* Setor */}
            <div>
              <label className="text-sm font-medium mb-2 block">Setor</label>
              <Input
                placeholder="Ex: Tecnologia"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
              />
            </div>

            {/* Porte */}
            <div>
              <label className="text-sm font-medium mb-2 block">Porte</label>
              <Select value={porte} onValueChange={setPorte}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Micro">Micro</SelectItem>
                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Score Mínimo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Score Mín.</label>
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={100}
                value={scoreMin || ''}
                onChange={(e) => setScoreMin(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Score Máximo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Score Máx.</label>
              <Input
                type="number"
                placeholder="100"
                min={0}
                max={100}
                value={scoreMax || ''}
                onChange={(e) => setScoreMax(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Enriquecido */}
            <div>
              <label className="text-sm font-medium mb-2 block">Enriquecido</label>
              <Select value={enriquecido} onValueChange={(v) => setEnriquecido(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p>Erro ao carregar entidades. Tente novamente.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && data && data.data.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Nenhuma entidade encontrada</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente ajustar os filtros ou importar novos dados
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && data && data.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resultados ({data.total})</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Exibindo {data.offset + 1}-{Math.min(data.offset + data.limit, data.total)} de {data.total}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Porte</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-center">Validações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((entidade) => (
                        <TableRow
                          key={entidade.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onDoubleClick={() => handleRowDoubleClick(entidade.id)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{entidade.nome}</div>
                              {entidade.nome_fantasia && (
                                <div className="text-sm text-muted-foreground">
                                  {entidade.nome_fantasia}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {entidade.cnpj || '-'}
                              </span>
                              {entidade.validacao_cnpj && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {entidade.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="truncate max-w-[200px]">{entidade.email}</span>
                                  {entidade.validacao_email && (
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                              )}
                              {entidade.telefone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{entidade.telefone}</span>
                                  {entidade.validacao_telefone && (
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {entidade.cidade && entidade.uf ? (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{entidade.cidade}/{entidade.uf}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {entidade.setor || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            {entidade.porte || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            {entidade.score_qualidade_dados !== null ? (
                              <Badge
                                variant={
                                  entidade.score_qualidade_dados >= 70
                                    ? 'default'
                                    : entidade.score_qualidade_dados >= 40
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {entidade.score_qualidade_dados}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {entidade.validacao_cnpj && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" title="CNPJ válido" />
                              )}
                              {entidade.validacao_email && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500" title="Email válido" />
                              )}
                              {entidade.validacao_telefone && (
                                <CheckCircle2 className="h-4 w-4 text-purple-500" title="Telefone válido" />
                              )}
                              {!entidade.validacao_cnpj && !entidade.validacao_email && !entidade.validacao_telefone && (
                                <XCircle className="h-4 w-4 text-muted-foreground" title="Sem validações" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {data.total > limit && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                      disabled={offset === 0}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {Math.floor(offset / limit) + 1} de {Math.ceil(data.total / limit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(offset + limit)}
                      disabled={offset + limit >= data.total}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card">
        <div className="container py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Conforme LGPD (Lei 13.709/2018)</span>
              </div>
              <a href="/politica-privacidade" className="hover:text-foreground transition-colors">
                Política de Privacidade
              </a>
              <a href="/termos-uso" className="hover:text-foreground transition-colors">
                Termos de Uso
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>DPO: dpo@intelmarket.app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet de Detalhes */}
      <EntidadeDetailsSheet
        entidade={selectedEntidade}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
