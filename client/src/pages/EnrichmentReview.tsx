import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Edit2, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewItem {
  id: number;
  nome: string;
  approved: boolean;
  editing: boolean;
  [key: string]: any;
}

export default function EnrichmentReview() {
  const [, setLocation] = useLocation();
  const [projectId] = useState(1); // TODO: Get from URL params
  
  // Queries
  const { data: mercados, refetch: refetchMercados } = trpc.mercados.byProject.useQuery({ projectId });
  const { data: clientes } = trpc.clientes.byProject.useQuery({ projectId });
  const { data: concorrentes } = trpc.concorrentes.byProject.useQuery({ projectId });
  const { data: leads } = trpc.leads.byProject.useQuery({ projectId });

  // Local state para revisão
  const [mercadosReview, setMercadosReview] = useState<ReviewItem[]>([]);
  const [concorrentesReview, setConcorrentesReview] = useState<ReviewItem[]>([]);
  const [leadsReview, setLeadsReview] = useState<ReviewItem[]>([]);

  // Mutations
  const deleteMercado = trpc.mercados.delete.useMutation();
  const deleteConcorrente = trpc.concorrentes.delete.useMutation();
  const deleteLead = trpc.leads.delete.useMutation();
  const updateMercado = trpc.mercados.update.useMutation();
  const updateConcorrente = trpc.concorrentes.update.useMutation();
  const updateLead = trpc.leads.update.useMutation();

  // Inicializar dados de revisão
  useState(() => {
    if (mercados) {
      setMercadosReview(mercados.map(m => ({ ...m, approved: true, editing: false })));
    }
    if (concorrentes) {
      setConcorrentesReview(concorrentes.map(c => ({ ...c, approved: true, editing: false })));
    }
    if (leads) {
      setLeadsReview(leads.map(l => ({ ...l, approved: true, editing: false })));
    }
  });

  const handleToggleApproval = (type: 'mercados' | 'concorrentes' | 'leads', id: number) => {
    const setters = {
      mercados: setMercadosReview,
      concorrentes: setConcorrentesReview,
      leads: setLeadsReview,
    };
    
    setters[type]((items: ReviewItem[]) =>
      items.map(item => item.id === id ? { ...item, approved: !item.approved } : item)
    );
  };

  const handleEdit = (type: 'mercados' | 'concorrentes' | 'leads', id: number) => {
    const setters = {
      mercados: setMercadosReview,
      concorrentes: setConcorrentesReview,
      leads: setLeadsReview,
    };
    
    setters[type]((items: ReviewItem[]) =>
      items.map(item => item.id === id ? { ...item, editing: !item.editing } : item)
    );
  };

  const handleFieldChange = (
    type: 'mercados' | 'concorrentes' | 'leads',
    id: number,
    field: string,
    value: string
  ) => {
    const setters = {
      mercados: setMercadosReview,
      concorrentes: setConcorrentesReview,
      leads: setLeadsReview,
    };
    
    setters[type]((items: ReviewItem[]) =>
      items.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  const handleSave = async (type: 'mercados' | 'concorrentes' | 'leads', id: number) => {
    const items = {
      mercados: mercadosReview,
      concorrentes: concorrentesReview,
      leads: leadsReview,
    }[type];

    const item = items.find(i => i.id === id);
    if (!item) return;

    try {
      const mutations = {
        mercados: updateMercado,
        concorrentes: updateConcorrente,
        leads: updateLead,
      };

      await mutations[type].mutateAsync({ id, data: item });
      
      handleEdit(type, id); // Sair do modo de edição
      toast.success('Item atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar item');
      console.error(error);
    }
  };

  const handleDelete = async (type: 'mercados' | 'concorrentes' | 'leads', id: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const mutations = {
        mercados: deleteMercado,
        concorrentes: deleteConcorrente,
        leads: deleteLead,
      };

      await mutations[type].mutateAsync({ id });
      
      const setters = {
        mercados: setMercadosReview,
        concorrentes: setConcorrentesReview,
        leads: setLeadsReview,
      };
      
      setters[type]((items: ReviewItem[]) => items.filter(item => item.id !== id));
      toast.success('Item excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir item');
      console.error(error);
    }
  };

  const handleFinalize = async () => {
    // Deletar itens não aprovados
    const toDelete = {
      mercados: mercadosReview.filter(m => !m.approved).map(m => m.id),
      concorrentes: concorrentesReview.filter(c => !c.approved).map(c => c.id),
      leads: leadsReview.filter(l => !l.approved).map(l => l.id),
    };

    try {
      await Promise.all([
        ...toDelete.mercados.map(id => deleteMercado.mutateAsync({ id })),
        ...toDelete.concorrentes.map(id => deleteConcorrente.mutateAsync({ id })),
        ...toDelete.leads.map(id => deleteLead.mutateAsync({ id })),
      ]);

      toast.success('Projeto finalizado com sucesso!');
      setLocation('/');
    } catch (error) {
      toast.error('Erro ao finalizar projeto');
      console.error(error);
    }
  };

  const renderReviewCard = (
    item: ReviewItem,
    type: 'mercados' | 'concorrentes' | 'leads',
    fields: { key: string; label: string }[]
  ) => (
    <Card key={item.id} className={!item.approved ? 'opacity-50 border-red-500/30' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={item.approved}
              onCheckedChange={() => handleToggleApproval(type, item.id)}
              className="mt-1"
            />
            <div>
              <CardTitle className="text-base">{item.nome}</CardTitle>
              <CardDescription>
                {item.approved ? (
                  <Badge variant="default" className="mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Aprovado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="mt-1">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejeitado
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {item.editing ? (
              <Button size="sm" variant="default" onClick={() => handleSave(type, item.id)}>
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => handleEdit(type, item.id)}>
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(type, item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {item.editing && (
        <CardContent className="space-y-3">
          {fields.map(field => (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={`${type}-${item.id}-${field.key}`} className="text-xs">
                {field.label}
              </Label>
              <Input
                id={`${type}-${item.id}-${field.key}`}
                value={item[field.key] || ''}
                onChange={(e) => handleFieldChange(type, item.id, field.key, e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );

  const approvedCount = {
    mercados: mercadosReview.filter(m => m.approved).length,
    concorrentes: concorrentesReview.filter(c => c.approved).length,
    leads: leadsReview.filter(l => l.approved).length,
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Revisão de Enriquecimento</h1>
            <p className="text-muted-foreground mt-2">
              Revise e aprove os dados identificados automaticamente
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setLocation('/')}>
              Cancelar
            </Button>
            <Button onClick={handleFinalize}>
              Finalizar e Salvar Projeto
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Mercados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount.mercados}</div>
              <p className="text-xs text-muted-foreground">
                de {mercadosReview.length} aprovados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Concorrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount.concorrentes}</div>
              <p className="text-xs text-muted-foreground">
                de {concorrentesReview.length} aprovados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount.leads}</div>
              <p className="text-xs text-muted-foreground">
                de {leadsReview.length} aprovados
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mercados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mercados">
              Mercados ({mercadosReview.length})
            </TabsTrigger>
            <TabsTrigger value="concorrentes">
              Concorrentes ({concorrentesReview.length})
            </TabsTrigger>
            <TabsTrigger value="leads">
              Leads ({leadsReview.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mercados" className="space-y-4 mt-6">
            {mercadosReview.map(item =>
              renderReviewCard(item, 'mercados', [
                { key: 'nome', label: 'Nome do Mercado' },
                { key: 'segmentacao', label: 'Segmentação' },
                { key: 'categoria', label: 'Categoria' },
              ])
            )}
          </TabsContent>

          <TabsContent value="concorrentes" className="space-y-4 mt-6">
            {concorrentesReview.map(item =>
              renderReviewCard(item, 'concorrentes', [
                { key: 'nome', label: 'Nome' },
                { key: 'produto', label: 'Produto' },
                { key: 'porte', label: 'Porte' },
                { key: 'cnpj', label: 'CNPJ' },
                { key: 'site', label: 'Site' },
              ])
            )}
          </TabsContent>

          <TabsContent value="leads" className="space-y-4 mt-6">
            {leadsReview.map(item =>
              renderReviewCard(item, 'leads', [
                { key: 'nome', label: 'Nome' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'porte', label: 'Porte' },
                { key: 'regiao', label: 'Região' },
                { key: 'setor', label: 'Setor' },
              ])
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
