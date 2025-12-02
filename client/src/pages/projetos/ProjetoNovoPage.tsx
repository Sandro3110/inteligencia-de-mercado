import { useLocation } from 'wouter';
import { trpc } from '../../lib/trpc';
import { toast } from 'sonner';
import { FolderKanban, Save, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projetoSchema, type ProjetoFormData } from '@/schemas/projeto.schema';

export default function ProjetoNovoPage() {
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      descricao: '',
      centro_custo: '',
      status: 'ativo',
    },
  });

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

  const onSubmit = (data: ProjetoFormData) => {
    toast.promise(
      createMutation.mutateAsync({
        nome: data.nome,
        codigo: data.codigo || undefined,
        descricao: data.descricao || undefined,
        centroCusto: data.centro_custo || undefined,
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

      <Card className="p-6 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="required">
              Nome do Projeto
            </Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Análise de Mercado Q4 2024"
              className={errors.nome ? 'border-destructive' : ''}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="codigo">
              Código (opcional)
            </Label>
            <Input
              id="codigo"
              {...register('codigo')}
              placeholder="Ex: PROJ-2024-001"
              className={errors.codigo ? 'border-destructive' : ''}
            />
            {errors.codigo && (
              <p className="text-sm text-destructive">{errors.codigo.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Apenas letras maiúsculas, números e hífen
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">
              Descrição (opcional)
            </Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descreva os objetivos e escopo do projeto..."
              rows={4}
              className={errors.descricao ? 'border-destructive' : ''}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          {/* Centro de Custo */}
          <div className="space-y-2">
            <Label htmlFor="centro_custo">
              Centro de Custo (opcional)
            </Label>
            <Input
              id="centro_custo"
              {...register('centro_custo')}
              placeholder="Ex: Marketing"
              className={errors.centro_custo ? 'border-destructive' : ''}
            />
            {errors.centro_custo && (
              <p className="text-sm text-destructive">{errors.centro_custo.message}</p>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="min-w-32"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting || createMutation.isPending ? 'Criando...' : 'Criar Projeto'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/projetos')}
              disabled={isSubmitting || createMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
