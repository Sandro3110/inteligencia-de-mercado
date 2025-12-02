import { useLocation } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { FolderKanban, Save, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function ProjetoNovoPage() {
  const [, setLocation] = useLocation();
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [centroCusto, setCentroCusto] = useState('');
  const [unidadeNegocio, setUnidadeNegocio] = useState('');
  const [orcamento, setOrcamento] = useState('');

  const createMutation = trpc.projetos.create.useMutation({
    onSuccess: () => {
      toast.success('Projeto criado com sucesso!', {
        description: 'Você pode começar a adicionar pesquisas e importar dados.'
      });
      setLocation('/projetos');
    },
    onError: (error) => {
      toast.error('Erro ao criar projeto', {
        description: error.message
      });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error('Nome é obrigatório', {
        description: 'Por favor, preencha o nome do projeto.'
      });
      return;
    }

    if (nome.trim().length < 3) {
      toast.error('Nome muito curto', {
        description: 'O nome deve ter pelo menos 3 caracteres.'
      });
      return;
    }

    toast.promise(
      createMutation.mutateAsync({
        nome: nome.trim(),
        codigo: codigo.trim() || undefined,
        descricao: descricao.trim() || undefined,
        centroCusto: centroCusto.trim() || undefined,
        unidadeNegocio: unidadeNegocio.trim() || undefined,
        orcamento: orcamento ? parseFloat(orcamento) : undefined,
      }),
      {
        loading: 'Criando projeto...',
        success: 'Projeto criado!',
        error: 'Erro ao criar'
      }
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Novo Projeto"
        description="Crie um novo projeto de inteligência de mercado"
        icon={FolderKanban}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Projetos', path: '/projetos' },
          { label: 'Novo Projeto' }
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <Card className="p-8">
          <div className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome do Projeto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Análise de Mercado Q1 2025"
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 3 caracteres, máximo 100
              </p>
            </div>

            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo">Código (opcional)</Label>
              <Input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: PROJ-2025-001"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Identificador único do projeto
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva os objetivos e escopo do projeto..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 500 caracteres ({descricao.length}/500)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Centro de Custo */}
              <div className="space-y-2">
                <Label htmlFor="centroCusto">Centro de Custo (opcional)</Label>
                <Input
                  id="centroCusto"
                  type="text"
                  value={centroCusto}
                  onChange={(e) => setCentroCusto(e.target.value)}
                  placeholder="Ex: CC-1234"
                  maxLength={50}
                />
              </div>

              {/* Unidade de Negócio */}
              <div className="space-y-2">
                <Label htmlFor="unidadeNegocio">Unidade de Negócio (opcional)</Label>
                <Input
                  id="unidadeNegocio"
                  type="text"
                  value={unidadeNegocio}
                  onChange={(e) => setUnidadeNegocio(e.target.value)}
                  placeholder="Ex: Comercial"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Orçamento */}
            <div className="space-y-2">
              <Label htmlFor="orcamento">Orçamento (opcional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="orcamento"
                  type="number"
                  value={orcamento}
                  onChange={(e) => setOrcamento(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Orçamento estimado para o projeto
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="min-w-32"
          >
            {createMutation.isPending ? (
              <>Criando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Projeto
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/projetos')}
            disabled={createMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
