import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Tag,
  DollarSign,
  Barcode,
  Calendar,
  User,
  FileText,
  Building2,
  TrendingUp,
  Search,
  Shield,
  Edit,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useProduto, useProdutoEntidades, useProdutoMercados, type Produto } from '@/hooks/useProdutos';
import { useToast } from '@/hooks/use-toast';
import EditProdutoDialog from './EditProdutoDialog';

interface ProdutoDetailsSheetProps {
  produto: Produto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProdutoDetailsSheet({
  produto,
  open,
  onOpenChange,
}: ProdutoDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState('geral');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Buscar dados relacionados
  const { entidades, isLoading: loadingEntidades } = useProdutoEntidades(produto?.produto_id || 0);
  const { mercados, isLoading: loadingMercados } = useProdutoMercados(produto?.produto_id || 0);

  if (!produto) return null;

  // Helper para formatar campos vazios
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    return value;
  };

  // Helper para formatar data
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Helper para formatar preço
  const formatPreco = (preco?: number, moeda?: string) => {
    if (!preco) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda || 'BRL',
    }).format(preco);
  };

  // Handlers de ações
  const handleEditar = () => {
    setEditDialogOpen(true);
  };

  const handleExportar = () => {
    toast({ title: 'Em desenvolvimento', description: 'Função de exportação será implementada em breve' });
  };

  const handleExcluir = () => {
    toast({ title: 'Em desenvolvimento', description: 'Função de exclusão será implementada em breve' });
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl flex items-center gap-2">
                <Package className="h-6 w-6" />
                {produto.nome || 'Sem nome'}
              </SheetTitle>
              <SheetDescription className="mt-2 flex items-center gap-2 flex-wrap">
                {produto.categoria && (
                  <Badge variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {produto.categoria}
                  </Badge>
                )}
                {produto.sku && (
                  <Badge variant="outline" className="font-mono">
                    <Barcode className="h-3 w-3 mr-1" />
                    {produto.sku}
                  </Badge>
                )}
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
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="entidades" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Entidades
            </TabsTrigger>
            <TabsTrigger value="mercados" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Mercados
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid w-full grid-cols-2 mt-2">
            <TabsTrigger value="rastreabilidade" className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              Rastreabilidade
            </TabsTrigger>
            <TabsTrigger value="acoes" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Ações
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: GERAL */}
          <TabsContent value="geral" className="space-y-4 mt-4">
            {/* Identificação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Nome</label>
                  <p className="font-medium">{formatValue(produto.nome)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">SKU</label>
                  <p className="font-mono">{formatValue(produto.sku)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">EAN</label>
                  <p className="font-mono">{formatValue(produto.ean)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">NCM</label>
                  <p className="font-mono">{formatValue(produto.ncm)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Classificação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Classificação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <p className="font-medium">{formatValue(produto.categoria)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Subcategoria</label>
                  <p className="font-medium">{formatValue(produto.subcategoria)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Precificação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precificação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Preço</label>
                  <p className="font-semibold text-lg">{formatPreco(produto.preco, produto.moeda)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Unidade</label>
                  <p className="font-medium">{formatValue(produto.unidade)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {formatValue(produto.descricao)}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: ENTIDADES */}
          <TabsContent value="entidades" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Entidades Vinculadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEntidades ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : entidades && entidades.length > 0 ? (
                  <div className="space-y-2">
                    {entidades.map((entidade: any) => (
                      <div
                        key={entidade.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{entidade.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {entidade.cnpj} • {entidade.cidade}, {entidade.uf}
                          </p>
                        </div>
                        <Badge variant="outline">{entidade.tipo_entidade}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma entidade vinculada a este produto.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 3: MERCADOS */}
          <TabsContent value="mercados" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Mercados Vinculados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMercados ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : mercados && mercados.length > 0 ? (
                  <div className="space-y-2">
                    {mercados.map((mercado: any) => (
                      <div
                        key={mercado.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{mercado.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {mercado.categoria} • {mercado.segmentacao}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-semibold">{mercado.tamanho_mercado}</p>
                          <p className="text-muted-foreground">{mercado.crescimento_anual}% a.a.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum mercado vinculado a este produto.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 4: RASTREABILIDADE */}
          <TabsContent value="rastreabilidade" className="space-y-4 mt-4">
            {/* Origem dos Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Origem dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Fonte</label>
                  <p className="font-medium">{formatValue(produto.fonte)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Data de Cadastro</label>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(produto.data_cadastro)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Última Atualização</label>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(produto.data_atualizacao)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Auditoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Criado por</label>
                  <p className="font-medium">{formatValue(produto.criado_por)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Atualizado por</label>
                  <p className="font-medium">{formatValue(produto.atualizado_por)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 5: AÇÕES */}
          <TabsContent value="acoes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Ações Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleEditar}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Dados
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportar}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleExcluir}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Produto
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>

    {produto && (
      <EditProdutoDialog
        produto={produto}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          // Refresh produto data
          onOpenChange(false);
          setTimeout(() => onOpenChange(true), 100);
        }}
      />
    )}
  </>;
}
