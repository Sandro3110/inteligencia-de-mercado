import { useLocation } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

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
      toast.success('Projeto criado com sucesso!');
      setLocation('/projetos');
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    createMutation.mutate({
      nome: nome.trim(),
      codigo: codigo.trim() || undefined,
      descricao: descricao.trim() || undefined,
      centroCusto: centroCusto.trim() || undefined,
      unidadeNegocio: unidadeNegocio.trim() || undefined,
      orcamento: orcamento ? parseFloat(orcamento) : undefined,
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Novo Projeto</h1>
        <p className="text-muted-foreground">
          Crie um novo projeto de inteligência de mercado
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome do Projeto <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Análise de Mercado Q1 2025"
              className="w-full px-4 py-2 border rounded-lg bg-background"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 3 caracteres, máximo 100
            </p>
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-medium mb-2">Código (opcional)</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: PROJ-2025-001"
              className="w-full px-4 py-2 border rounded-lg bg-background"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Identificador único do projeto
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os objetivos e escopo do projeto..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">Máximo 500 caracteres</p>
          </div>

          {/* Centro de Custo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Centro de Custo (opcional)
            </label>
            <input
              type="text"
              value={centroCusto}
              onChange={(e) => setCentroCusto(e.target.value)}
              placeholder="Ex: CC-1234"
              className="w-full px-4 py-2 border rounded-lg bg-background"
              maxLength={50}
            />
          </div>

          {/* Unidade de Negócio */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Unidade de Negócio (opcional)
            </label>
            <input
              type="text"
              value={unidadeNegocio}
              onChange={(e) => setUnidadeNegocio(e.target.value)}
              placeholder="Ex: Comercial"
              className="w-full px-4 py-2 border rounded-lg bg-background"
              maxLength={100}
            />
          </div>

          {/* Orçamento */}
          <div>
            <label className="block text-sm font-medium mb-2">Orçamento (opcional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <input
                type="number"
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="w-full pl-12 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Criando...' : 'Criar Projeto'}
          </button>
          <button
            type="button"
            onClick={() => setLocation('/projetos')}
            className="px-6 py-2 border rounded-lg hover:bg-accent"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
