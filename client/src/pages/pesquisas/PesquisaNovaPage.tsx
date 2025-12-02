import { useLocation } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

export default function PesquisaNovaPage() {
  const [, setLocation] = useLocation();
  const [projetoId, setProjetoId] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const { data: projetos } = trpc.projetos.listAtivos.useQuery();

  const createMutation = trpc.pesquisas.create.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa criada com sucesso!');
      setLocation('/pesquisas');
    },
    onError: (error) => {
      toast.error(`Erro ao criar pesquisa: ${error.message}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!projetoId) {
      toast.error('Selecione um projeto');
      return;
    }

    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    createMutation.mutate({
      projetoId: parseInt(projetoId),
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      objetivo: objetivo.trim() || undefined,
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nova Pesquisa</h1>
        <p className="text-muted-foreground">
          Crie uma nova pesquisa de inteligência de mercado
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* Projeto */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Projeto <span className="text-destructive">*</span>
            </label>
            <select
              value={projetoId}
              onChange={(e) => setProjetoId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              required
            >
              <option value="">Selecione um projeto</option>
              {projetos?.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nome}
                </option>
              ))}
            </select>
            {!projetos || projetos.length === 0 ? (
              <p className="text-xs text-muted-foreground mt-1">
                Nenhum projeto ativo encontrado.{' '}
                <a href="/projetos/novo" className="text-primary hover:underline">
                  Criar projeto
                </a>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Selecione o projeto ao qual esta pesquisa pertence
              </p>
            )}
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome da Pesquisa <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Levantamento de Concorrentes - Região Sul"
              className="w-full px-4 py-2 border rounded-lg bg-background"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 3 caracteres, máximo 100
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o escopo e metodologia da pesquisa..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">Máximo 500 caracteres</p>
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium mb-2">Objetivo (opcional)</label>
            <textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Qual o objetivo principal desta pesquisa?"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">Máximo 500 caracteres</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Criando...' : 'Criar Pesquisa'}
          </button>
          <button
            type="button"
            onClick={() => setLocation('/pesquisas')}
            className="px-6 py-2 border rounded-lg hover:bg-accent"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
