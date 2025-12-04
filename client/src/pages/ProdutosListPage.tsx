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
  Package,
  Tag,
  DollarSign,
  CheckCircle2,
  XCircle,
  Barcode,
} from 'lucide-react';
import { useProdutos, useCategorias, useSubcategorias, type ProdutoFiltros, type Produto } from '@/hooks/useProdutos';
import { useToast } from '@/hooks/use-toast';
import ProdutoDetailsSheet from '@/components/ProdutoDetailsSheet';

export default function ProdutosListPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { toast } = useToast();

  // Estados dos filtros
  const [search, setSearch] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('todas');
  const [subcategoria, setSubcategoria] = useState<string>('todas');
  const [precoMin, setPrecoMin] = useState<string>('');
  const [precoMax, setPrecoMax] = useState<string>('');
  const [ativo, setAtivo] = useState<'true' | 'false' | 'todos'>('todos');
  const [ordem, setOrdem] = useState<'nome' | 'preco' | 'data_cadastro' | 'categoria'>('data_cadastro');
  const [direcao, setDirecao] = useState<'asc' | 'desc'>('desc');

  // Paginação
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Sheet de detalhes (preparação)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Buscar categorias e subcategorias
  const { categorias } = useCategorias();
  const { subcategorias } = useSubcategorias(categoria !== 'todas' ? categoria : undefined);

  // Construir filtros para a query
  const filters: ProdutoFiltros = {
    search: search || undefined,
    categoria: categoria && categoria !== 'todas' ? categoria : undefined,
    subcategoria: subcategoria && subcategoria !== 'todas' ? subcategoria : undefined,
    preco_min: precoMin ? parseFloat(precoMin) : undefined,
    preco_max: precoMax ? parseFloat(precoMax) : undefined,
    ativo: ativo && ativo !== 'todos' ? ativo === 'true' : undefined,
    ordem,
    direcao,
    limit,
    offset,
  };

  // Buscar produtos
  const { produtos, total, isLoading, isError, error } = useProdutos(filters);

  // Handlers
  const handleLimparFiltros = () => {
    setSearch('');
    setCategoria('todas');
    setSubcategoria('todas');
    setPrecoMin('');
    setPrecoMax('');
    setAtivo('todos');
    setOrdem('data_cadastro');
    setDirecao('desc');
    setOffset(0);
  };

  const handlePaginaAnterior = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleProximaPagina = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const handleDuploClick = (produto: Produto) => {
    setSelectedProduto(produto);
    setSheetOpen(true);
  };

  // Formatação de preço
  const formatarPreco = (preco?: number, moeda?: string) => {
    if (!preco) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda || 'BRL',
    }).format(preco);
  };

  // Formatação de data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Contadores para badges
  const totalFiltrado = total;
  const totalAtivos = produtos?.filter(p => p.ativo).length || 0;
  const totalInativos = produtos?.filter(p => !p.ativo).length || 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              Catálogo de Produtos
            </h1>
            <p className="text-muted-foreground">
              Gerencie o catálogo de produtos do sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Package className="h-3 w-3 mr-1" />
            {totalFiltrado} produtos
          </Badge>
          <Badge variant="outline" className="text-sm text-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {totalAtivos} ativos
          </Badge>
          <Badge variant="outline" className="text-sm text-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            {totalInativos} inativos
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Linha 1: Busca */}
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Linha 2: Categoria, Subcategoria, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={categoria} onValueChange={(value) => {
                setCategoria(value);
                setSubcategoria('todas'); // Reset subcategoria
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categorias?.map((cat: any) => (
                    <SelectItem key={cat.categoria} value={cat.categoria}>
                      {cat.categoria} ({cat.total_produtos})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subcategoria</label>
              <Select 
                value={subcategoria} 
                onValueChange={setSubcategoria}
                disabled={categoria === 'todas'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as subcategorias</SelectItem>
                  {subcategorias?.map((sub: any) => (
                    <SelectItem key={sub.subcategoria} value={sub.subcategoria}>
                      {sub.subcategoria} ({sub.total_produtos})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={ativo} onValueChange={(value: any) => setAtivo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 3: Preço Min, Preço Max, Ordenação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Preço Mínimo</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preço Máximo</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <div className="flex gap-2">
                <Select value={ordem} onValueChange={(value: any) => setOrdem(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nome">Nome</SelectItem>
                    <SelectItem value="preco">Preço</SelectItem>
                    <SelectItem value="data_cadastro">Data</SelectItem>
                    <SelectItem value="categoria">Categoria</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={direcao} onValueChange={(value: any) => setDirecao(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">A-Z</SelectItem>
                    <SelectItem value="desc">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLimparFiltros}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-semibold">Erro ao carregar produtos</p>
              <p className="text-sm text-muted-foreground">{error?.message}</p>
            </div>
          ) : !produtos || produtos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou limpar a busca
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Subcategoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow
                      key={produto.produto_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onDoubleClick={() => handleDuploClick(produto)}
                    >
                      <TableCell className="font-mono text-sm">
                        {produto.sku ? (
                          <div className="flex items-center gap-2">
                            <Barcode className="h-4 w-4 text-muted-foreground" />
                            {produto.sku}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {produto.categoria || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {produto.subcategoria || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatarPreco(produto.preco, produto.moeda)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {produto.unidade || '-'}
                      </TableCell>
                      <TableCell>
                        {produto.ativo ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatarData(produto.data_cadastro)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando {offset + 1} a {Math.min(offset + limit, total)} de {total} produtos
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePaginaAnterior}
                    disabled={offset === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProximaPagina}
                    disabled={offset + limit >= total}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sheet de Detalhes */}
      <ProdutoDetailsSheet
        produto={selectedProduto}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
