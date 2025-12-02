import { useLocation, Link } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Search, Save, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PesquisaNovaPage() {
  const [, setLocation] = useLocation();
  const [projetoId, setProjetoId] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const { data: projetos, isLoading: loadingProjetos } = trpc.projetos.listAtivos.useQuery();

  const createMutation = trpc.pesquisas.create.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa criada com sucesso!', {
        description: 'Você pode começar a importar dados agora.'
      });
      setLocation('/pesquisas');
    },
    onError: (error) => {
      toast.error('Erro ao criar pesquisa', {
        description: error.message
      });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!projetoId) {
      toast.error('Projeto é obrigatório', {
        description: 'Por favor, selecione um projeto.'
      });
      return;
    }

    if (!nome.trim()) {
      toast.error('Nome é obrigatório', {
        description: 'Por favor, preencha o nome da pesquisa.'
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
        projetoId: parseInt(projetoId),
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        objetivo: objetivo.trim() || undefined,
      }),
      {
        loading: 'Criando pesquisa...',
        success: 'Pesquisa criada!',
        error: 'Erro ao criar'
      }
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Nova Pesquisa"
        description="Crie uma nova pesquisa de inteligência de mercado"
        icon={Search}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Pesquisas', path: '/pesquisas' },
          { label: 'Nova Pesquisa' }
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <Card className="p-8">
          <div className="space-y-6">
            {/* Projeto */}
            <div className="space-y-2">
              <Label htmlFor="projeto">
                Projeto <span className="text-destructive">*</span>
              </Label>
              <Select
                value={projetoId}
                onValueChange={setProjetoId}
                disabled={loadingProjetos}
              >
                <SelectTrigger id="projeto">
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projetos?.map((projeto) => (
                    <SelectItem key={projeto.id} value={projeto.id.toString()}>
                      {projeto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!projetos || projetos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum projeto ativo encontrado.{' '}
                  <Link href="/projetos/novo">
                    <a className="text-primary hover:underline">
                      Criar primeiro projeto
                    </a>
                  </Link>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Selecione o projeto ao qual esta pesquisa pertence
                </p>
              )}
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome da Pesquisa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Análise de Concorrentes Q1 2025"
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 3 caracteres, máximo 100
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o escopo e metodologia da pesquisa..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 500 caracteres ({descricao.length}/500)
              </p>
            </div>

            {/* Objetivo */}
            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo (opcional)</Label>
              <Textarea
                id="objetivo"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Defina os objetivos e resultados esperados..."
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 300 caracteres ({objetivo.length}/300)
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={createMutation.isPending || !projetos || projetos.length === 0}
            className="min-w-32"
          >
            {createMutation.isPending ? (
              <>Criando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Pesquisa
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/pesquisas')}
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
