import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import type { Produto } from '@/hooks/useProdutos';

interface EditProdutoDialogProps {
  produto: Produto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditProdutoDialog({
  produto,
  open,
  onOpenChange,
  onSuccess,
}: EditProdutoDialogProps) {
  
  const [loading, setLoading] = useState(false);

  // Estados do formulário (15 campos editáveis)
  const [nome, setNome] = useState(produto.nome || '');
  const [categoria, setCategoria] = useState(produto.categoria || '');
  const [subcategoria, setSubcategoria] = useState(produto.subcategoria || '');
  const [descricao, setDescricao] = useState(produto.descricao || '');
  const [sku, setSku] = useState(produto.sku || '');
  const [ean, setEan] = useState(produto.ean || '');
  const [ncm, setNcm] = useState(produto.ncm || '');
  const [unidade, setUnidade] = useState(produto.unidade || 'UN');
  const [precoBase, setPrecoBase] = useState(produto.preco_base?.toString() || '');
  const [precoVenda, setPrecoVenda] = useState(produto.preco_venda?.toString() || '');
  const [margemLucro, setMargemLucro] = useState(produto.margem_lucro?.toString() || '');
  const [estoqueMinimo, setEstoqueMinimo] = useState(produto.estoque_minimo?.toString() || '');
  const [estoqueAtual, setEstoqueAtual] = useState(produto.estoque_atual?.toString() || '');
  const [peso, setPeso] = useState(produto.peso?.toString() || '');
  const [ativo, setAtivo] = useState(produto.ativo ? 'true' : 'false');

  // Resetar formulário quando produto mudar
  useEffect(() => {
    setNome(produto.nome || '');
    setCategoria(produto.categoria || '');
    setSubcategoria(produto.subcategoria || '');
    setDescricao(produto.descricao || '');
    setSku(produto.sku || '');
    setEan(produto.ean || '');
    setNcm(produto.ncm || '');
    setUnidade(produto.unidade || 'UN');
    setPrecoBase(produto.preco_base?.toString() || '');
    setPrecoVenda(produto.preco_venda?.toString() || '');
    setMargemLucro(produto.margem_lucro?.toString() || '');
    setEstoqueMinimo(produto.estoque_minimo?.toString() || '');
    setEstoqueAtual(produto.estoque_atual?.toString() || '');
    setPeso(produto.peso?.toString() || '');
    setAtivo(produto.ativo ? 'true' : 'false');
  }, [produto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!nome.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'Nome do produto é obrigatório',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!categoria.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'Categoria é obrigatória',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Validar preços
      const precoBaseNum = precoBase ? parseFloat(precoBase) : null;
      const precoVendaNum = precoVenda ? parseFloat(precoVenda) : null;

      if (precoBaseNum !== null && precoBaseNum < 0) {
        toast({
          title: 'Erro de validação',
          description: 'Preço base não pode ser negativo',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (precoVendaNum !== null && precoVendaNum < 0) {
        toast({
          title: 'Erro de validação',
          description: 'Preço de venda não pode ser negativo',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Calcular margem automaticamente se ambos os preços estiverem preenchidos
      let margemCalculada = margemLucro ? parseFloat(margemLucro) : null;
      if (precoBaseNum && precoVendaNum && precoBaseNum > 0) {
        margemCalculada = ((precoVendaNum - precoBaseNum) / precoBaseNum) * 100;
      }

      // Preparar dados para atualização
      const dadosAtualizados = {
        nome: nome.trim(),
        categoria: categoria.trim(),
        subcategoria: subcategoria.trim() || undefined,
        descricao: descricao.trim() || undefined,
        sku: sku.trim() || undefined,
        ean: ean.trim() || undefined,
        ncm: ncm.trim() || undefined,
        unidade: unidade.trim() || 'UN',
        preco_base: precoBaseNum,
        preco_venda: precoVendaNum,
        margem_lucro: margemCalculada,
        estoque_minimo: estoqueMinimo ? parseInt(estoqueMinimo) : null,
        estoque_atual: estoqueAtual ? parseInt(estoqueAtual) : null,
        peso: peso ? parseFloat(peso) : null,
        ativo: ativo === 'true',
      };

      // Chamar API de atualização (TODO: implementar quando router estiver pronto)
      // await trpc.produtos.atualizar.mutate({ id: produto.id, ...dadosAtualizados });

      // Simulação temporária
      console.log('Atualizando produto:', produto.id, dadosAtualizados);

      toast({
        title: 'Produto atualizado!',
        description: `${nome} foi atualizado com sucesso.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Ocorreu um erro ao atualizar o produto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Informações Básicas</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Notebook Dell Inspiron 15"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex: Eletrônicos"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subcategoria">Subcategoria</Label>
                <Input
                  id="subcategoria"
                  value={subcategoria}
                  onChange={(e) => setSubcategoria(e.target.value)}
                  placeholder="Ex: Notebooks"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição detalhada do produto..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Identificação */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Identificação</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: NB-DELL-001"
                />
              </div>

              <div>
                <Label htmlFor="ean">EAN/Código de Barras</Label>
                <Input
                  id="ean"
                  value={ean}
                  onChange={(e) => setEan(e.target.value)}
                  placeholder="Ex: 7891234567890"
                  maxLength={13}
                />
              </div>

              <div>
                <Label htmlFor="ncm">NCM</Label>
                <Input
                  id="ncm"
                  value={ncm}
                  onChange={(e) => setNcm(e.target.value)}
                  placeholder="Ex: 8471.30.12"
                />
              </div>
            </div>
          </div>

          {/* Preços e Margem */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Preços e Margem</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="precoBase">Preço Base (R$)</Label>
                <Input
                  id="precoBase"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precoBase}
                  onChange={(e) => setPrecoBase(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="precoVenda">Preço de Venda (R$)</Label>
                <Input
                  id="precoVenda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
                <Input
                  id="margemLucro"
                  type="number"
                  step="0.01"
                  value={margemLucro}
                  onChange={(e) => setMargemLucro(e.target.value)}
                  placeholder="0.00"
                  disabled={!!(precoBase && precoVenda)}
                  title={
                    precoBase && precoVenda
                      ? 'Margem calculada automaticamente'
                      : 'Preencha preço base e venda para calcular automaticamente'
                  }
                />
              </div>
            </div>
          </div>

          {/* Estoque e Medidas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Estoque e Medidas</h3>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                <Input
                  id="estoqueMinimo"
                  type="number"
                  min="0"
                  value={estoqueMinimo}
                  onChange={(e) => setEstoqueMinimo(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                <Input
                  id="estoqueAtual"
                  type="number"
                  min="0"
                  value={estoqueAtual}
                  onChange={(e) => setEstoqueAtual(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.001"
                  min="0"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="0.000"
                />
              </div>

              <div>
                <Label htmlFor="unidade">Unidade</Label>
                <Select value={unidade} onValueChange={setUnidade}>
                  <SelectTrigger id="unidade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">Unidade (UN)</SelectItem>
                    <SelectItem value="KG">Quilograma (KG)</SelectItem>
                    <SelectItem value="LT">Litro (LT)</SelectItem>
                    <SelectItem value="MT">Metro (MT)</SelectItem>
                    <SelectItem value="CX">Caixa (CX)</SelectItem>
                    <SelectItem value="PC">Pacote (PC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Status</h3>

            <div>
              <Label htmlFor="ativo">Status do Produto</Label>
              <Select value={ativo} onValueChange={setAtivo}>
                <SelectTrigger id="ativo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
