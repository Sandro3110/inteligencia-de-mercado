import { useLocation } from 'wouter';
import { trpc } from '../../lib/trpc';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pesquisaSchema, type PesquisaFormData } from '@/schemas/pesquisa.schema';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PesquisaNovaPage() {
  const [, setLocation] = useLocation();

  const { data: projetos, isLoading: loadingProjetos } = trpc.projetos.listAtivos.useQuery();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PesquisaFormData>({
    resolver: zodResolver(pesquisaSchema),
    defaultValues: {
      projeto_id: 0,
      nome: '',
      descricao: '',
      tipo: 'clientes',
      limite_resultados: 1000,
    },
  });

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

  const onSubmit = (data: PesquisaFormData) => {
    toast.promise(
      createMutation.mutateAsync({
        projetoId: data.projeto_id,
        nome: data.nome,
        descricao: data.descricao || undefined,
        tipo: data.tipo,
        limiteResultados: data.limite_resultados,
      }),
      {
        loading: 'Criando pesquisa...',
        success: 'Pesquisa criada!',
        error: 'Erro ao criar'
      }
    );
  };

  if (loadingProjetos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Carregando projetos..." />
      </div>
    );
  }

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

      <Card className="p-6 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Projeto */}
          <div className="space-y-2">
            <Label htmlFor="projeto_id" className="required">
              Projeto
            </Label>
            <Controller
              name="projeto_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ''}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger className={errors.projeto_id ? 'border-destructive' : ''}>
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
              )}
            />
            {errors.projeto_id && (
              <p className="text-sm text-destructive">{errors.projeto_id.message}</p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="required">
              Nome da Pesquisa
            </Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Empresas de Tecnologia - SP"
              className={errors.nome ? 'border-destructive' : ''}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo de Pesquisa
            </Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clientes">Clientes</SelectItem>
                    <SelectItem value="concorrentes">Concorrentes</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="fornecedores">Fornecedores</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">
              Descrição (opcional)
            </Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descreva os critérios e objetivos da pesquisa..."
              rows={4}
              className={errors.descricao ? 'border-destructive' : ''}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          {/* Limite de Resultados */}
          <div className="space-y-2">
            <Label htmlFor="limite_resultados">
              Limite de Resultados
            </Label>
            <Input
              id="limite_resultados"
              type="number"
              {...register('limite_resultados', { valueAsNumber: true })}
              min={1}
              max={10000}
              className={errors.limite_resultados ? 'border-destructive' : ''}
            />
            {errors.limite_resultados && (
              <p className="text-sm text-destructive">{errors.limite_resultados.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Máximo de 10.000 resultados
            </p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="min-w-32"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting || createMutation.isPending ? 'Criando...' : 'Criar Pesquisa'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/pesquisas')}
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
