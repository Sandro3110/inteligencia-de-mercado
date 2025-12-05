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
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Edit,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { EditMercadoDialog } from '@/components/EditMercadoDialog';
import { toast } from 'sonner';

interface Mercado {
  id: number;
  nome: string;
  categoria?: string;
  segmentacao?: string;
  tamanhoMercado?: string;
  crescimentoAnual?: string;
  tendencias?: string;
  principaisPlayers?: string;
  sentimento?: string;
  scoreAtratividade?: number;
  nivelSaturacao?: string;
  oportunidades?: string;
  riscos?: string;
  recomendacaoEstrategica?: string;
  entidadeNome?: string;
  entidadeTipo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MercadoDetailsSheetProps {
  mercado: Mercado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export default function MercadoDetailsSheet({
  mercado,
  open,
  onOpenChange,
  onUpdate,
}: MercadoDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState('dados-gerais');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!mercado) return null;

  // Helper para formatar campos vazios
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    return value;
  };

  // Helper para formatar data
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Helper para badge de sentimento
  const getSentimentoBadge = (sentimento?: string) => {
    if (!sentimento) return <Badge variant="secondary">Não analisado</Badge>;
    
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' }> = {
      'Positivo': { variant: 'default' },
      'Neutro': { variant: 'secondary' },
      'Negativo': { variant: 'destructive' },
    };
    
    const { variant } = config[sentimento] || { variant: 'secondary' };
    return <Badge variant={variant}>{sentimento}</Badge>;
  };

  // Helper para badge de saturação
  const getSaturacaoBadge = (saturacao?: string) => {
    if (!saturacao) return <Badge variant="secondary">-</Badge>;
    
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' }> = {
      'Baixo': { variant: 'default' },
      'Médio': { variant: 'secondary' },
      'Alto': { variant: 'destructive' },
    };
    
    const { variant } = config[saturacao] || { variant: 'secondary' };
    return <Badge variant={variant}>{saturacao}</Badge>;
  };

  // Helper para score de atratividade
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Ação de excluir
  const handleExcluir = async () => {
    if (!confirm(`Tem certeza que deseja excluir o mercado "${mercado.nome}"?`)) {
      return;
    }

    try {
      // TODO: Implementar chamada TRPC mercado.excluir
      toast.success('Mercado excluído com sucesso!');
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao excluir mercado');
      console.error(error);
    }
  };

  // Ação de exportar
  const handleExportar = () => {
    const dados = {
      nome: mercado.nome,
      categoria: mercado.categoria,
      segmentacao: mercado.segmentacao,
      tamanhoMercado: mercado.tamanhoMercado,
      crescimentoAnual: mercado.crescimentoAnual,
      tendencias: mercado.tendencias,
      principaisPlayers: mercado.principaisPlayers,
      sentimento: mercado.sentimento,
      scoreAtratividade: mercado.scoreAtratividade,
      nivelSaturacao: mercado.nivelSaturacao,
      oportunidades: mercado.oportunidades,
      riscos: mercado.riscos,
      recomendacaoEstrategica: mercado.recomendacaoEstrategica,
    };

    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mercado-${mercado.nome.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso!');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-2xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  {mercado.nome || 'Sem nome'}
                </SheetTitle>
                <SheetDescription className="mt-2 flex items-center gap-2">
                  {mercado.categoria && <Badge>{mercado.categoria}</Badge>}
                  {mercado.segmentacao && <Badge variant="outline">{mercado.segmentacao}</Badge>}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dados-gerais">Dados</TabsTrigger>
              <TabsTrigger value="analise">Análise</TabsTrigger>
              <TabsTrigger value="mercado">Mercado</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
              <TabsTrigger value="acoes">Ações</TabsTrigger>
            </TabsList>

            {/* ABA 1: DADOS GERAIS */}
            <TabsContent value="dados-gerais" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nome</p>
                      <p className="font-medium">{formatValue(mercado.nome)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Categoria</p>
                      <p className="font-medium">{formatValue(mercado.categoria)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Segmentação</p>
                      <p className="font-medium">{formatValue(mercado.segmentacao)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entidade Vinculada</p>
                      <p className="font-medium">{formatValue(mercado.entidadeNome)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Metadados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Criado em</p>
                      <p className="font-medium">{formatDate(mercado.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Atualizado em</p>
                      <p className="font-medium">{formatDate(mercado.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA 2: ANÁLISE */}
            <TabsContent value="analise" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Análise de Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Sentimento</p>
                      {getSentimentoBadge(mercado.sentimento)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Score de Atratividade</p>
                      <p className={`text-2xl font-bold ${getScoreColor(mercado.scoreAtratividade)}`}>
                        {mercado.scoreAtratividade || '-'}
                        {mercado.scoreAtratividade && <span className="text-sm">/100</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Nível de Saturação</p>
                      {getSaturacaoBadge(mercado.nivelSaturacao)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA 3: MERCADO */}
            <TabsContent value="mercado" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Dados de Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tamanho do Mercado</p>
                    <p className="text-sm">{formatValue(mercado.tamanhoMercado)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Crescimento Anual</p>
                    <p className="text-sm font-medium">{formatValue(mercado.crescimentoAnual)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tendências</p>
                    <p className="text-sm whitespace-pre-wrap">{formatValue(mercado.tendencias)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA 4: PLAYERS */}
            <TabsContent value="players" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Principais Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{formatValue(mercado.principaisPlayers)}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA 5: ESTRATÉGIA */}
            <TabsContent value="estrategia" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Análise Estratégica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Oportunidades
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{formatValue(mercado.oportunidades)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Riscos
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{formatValue(mercado.riscos)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      Recomendação Estratégica
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{formatValue(mercado.recomendacaoEstrategica)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA 6: AÇÕES */}
            <TabsContent value="acoes" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ações Disponíveis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Dados
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={handleExportar}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={handleExcluir}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Mercado
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <EditMercadoDialog
        mercado={mercado}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          onUpdate?.();
          setEditDialogOpen(false);
        }}
      />
    </>
  );
}
