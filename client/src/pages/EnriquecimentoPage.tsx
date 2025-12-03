import { useState, useEffect } from 'react';
import { Sparkles, Brain, Search, Network, Target, Zap, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnrichmentProgressModal } from '@/components/EnrichmentProgressModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface Entidade {
  id: number;
  nome: string;
  cnpj: string;
  tipo_entidade: string;
  enriquecida?: boolean;
}

interface EnriquecimentoResult {
  entidadeId: number;
  nome: string;
  status: 'processando' | 'sucesso' | 'erro';
  dados?: any;
  erro?: string;
  tokens?: number;
  custo?: number;
  tempo?: number;
}

export default function EnriquecimentoPage() {
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState<Map<number, EnriquecimentoResult>>(new Map());
  
  // Estados para modal de progresso
  const [jobId, setJobId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    carregarEntidades();
  }, []);

  const carregarEntidades = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/entidades');
      if (!response.ok) throw new Error('Erro ao carregar entidades');
      const data = await response.json();
      setEntidades(data.entidades || []);
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
      toast.error('Erro ao carregar entidades');
    } finally {
      setLoading(false);
    }
  };

  const enriquecerEntidade = async (entidade: Entidade) => {
    const novoResultado: EnriquecimentoResult = {
      entidadeId: entidade.id,
      nome: entidade.nome,
      status: 'processando'
    };
    
    setResultados(prev => new Map(prev).set(entidade.id, novoResultado));

    try {
      const inicio = Date.now();
      
      const response = await fetch('/api/ia-enriquecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entidadeId: entidade.id,
          nome: entidade.nome,
          cnpj: entidade.cnpj,
          tipo: entidade.tipo_entidade
        })
      });

      const tempo = Date.now() - inicio;

      if (!response.ok) {
        throw new Error('Erro ao enriquecer entidade');
      }

      const data = await response.json();
      
      // Se retornou jobId, abrir modal de progresso
      if (data.jobId) {
        setJobId(data.jobId);
        setShowProgress(true);
      }

      setResultados(prev => new Map(prev).set(entidade.id, {
        ...novoResultado,
        status: 'sucesso',
        dados: data.dados,
        tokens: data.tokens,
        custo: data.custo,
        tempo
      }));

      toast.success(`${entidade.nome} enriquecida com sucesso!`);
      
    } catch (error: any) {
      setResultados(prev => new Map(prev).set(entidade.id, {
        ...novoResultado,
        status: 'erro',
        erro: error.message
      }));

      toast.error(`Erro ao enriquecer ${entidade.nome}`);
    }
  };

  const enriquecerTodas = async () => {
    setProcessando(true);
    
    for (const entidade of entidades) {
      await enriquecerEntidade(entidade);
      // Pequeno delay entre chamadas para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setProcessando(false);
    toast.success('Processamento concluído!');
  };

  const getStatusBadge = (entidadeId: number) => {
    const resultado = resultados.get(entidadeId);
    if (!resultado) return null;

    switch (resultado.status) {
      case 'processando':
        return (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processando...
          </Badge>
        );
      case 'sucesso':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            Enriquecida
          </Badge>
        );
      case 'erro':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Erro
          </Badge>
        );
    }
  };

  const getMetricas = () => {
    const resultadosArray = Array.from(resultados.values());
    const sucesso = resultadosArray.filter(r => r.status === 'sucesso').length;
    const erro = resultadosArray.filter(r => r.status === 'erro').length;
    const totalTokens = resultadosArray.reduce((sum, r) => sum + (r.tokens || 0), 0);
    const totalCusto = resultadosArray.reduce((sum, r) => sum + (r.custo || 0), 0);
    const tempoMedio = resultadosArray.length > 0 
      ? resultadosArray.reduce((sum, r) => sum + (r.tempo || 0), 0) / resultadosArray.length 
      : 0;

    return { sucesso, erro, totalTokens, totalCusto, tempoMedio };
  };

  const metricas = getMetricas();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Processar com IA"
        description="Enriqueça dados de entidades usando inteligência artificial avançada"
        icon={Sparkles}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Processar com IA' }
        ]}
      />

      {/* Métricas */}
      {resultados.size > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Processadas</div>
            <div className="text-2xl font-bold">{resultados.size}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Sucesso</div>
            <div className="text-2xl font-bold text-green-600">{metricas.sucesso}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Tokens</div>
            <div className="text-2xl font-bold">{metricas.totalTokens.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Custo</div>
            <div className="text-2xl font-bold">${metricas.totalCusto.toFixed(4)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Tempo Médio</div>
            <div className="text-2xl font-bold">{(metricas.tempoMedio / 1000).toFixed(1)}s</div>
          </Card>
        </div>
      )}

      {/* Tabela de Entidades */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Entidades para Enriquecer</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {entidades.length} entidades disponíveis
            </p>
          </div>
          <Button 
            onClick={enriquecerTodas} 
            disabled={processando || entidades.length === 0}
            className="gap-2"
          >
            {processando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Enriquecer Todas
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando entidades...</p>
          </div>
        ) : entidades.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma entidade encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Importe entidades primeiro para poder enriquecê-las
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entidades.map((entidade) => (
                <TableRow key={entidade.id}>
                  <TableCell className="font-mono text-sm">{entidade.id}</TableCell>
                  <TableCell className="font-medium">{entidade.nome}</TableCell>
                  <TableCell className="font-mono text-sm">{entidade.cnpj}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entidade.tipo_entidade}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(entidade.id)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => enriquecerEntidade(entidade)}
                      disabled={resultados.get(entidade.id)?.status === 'processando'}
                      className="gap-2"
                    >
                      {resultados.get(entidade.id)?.status === 'processando' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Enriquecer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Detalhes dos Resultados */}
      {resultados.size > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados do Enriquecimento</h2>
          <div className="space-y-4">
            {Array.from(resultados.values()).map((resultado) => (
              <Card key={resultado.entidadeId} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{resultado.nome}</h3>
                    <p className="text-sm text-muted-foreground">ID: {resultado.entidadeId}</p>
                  </div>
                  {getStatusBadge(resultado.entidadeId)}
                </div>
                
                {resultado.status === 'sucesso' && resultado.dados && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tokens:</span>
                      <span className="ml-2 font-medium">{resultado.tokens?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Custo:</span>
                      <span className="ml-2 font-medium">${resultado.custo?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tempo:</span>
                      <span className="ml-2 font-medium">{((resultado.tempo || 0) / 1000).toFixed(2)}s</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Campos:</span>
                      <span className="ml-2 font-medium">{Object.keys(resultado.dados).length}</span>
                    </div>
                  </div>
                )}

                {resultado.status === 'erro' && (
                  <div className="mt-2 text-sm text-destructive">
                    Erro: {resultado.erro}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Modelo de IA
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            OpenAI GPT-4o-mini para enriquecimento eficiente
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modelo:</span>
              <span className="font-medium">GPT-4o-mini</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temperatura:</span>
              <span className="font-medium">0.7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custo médio:</span>
              <span className="font-medium text-success">~$0.0001</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Performance
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Processamento sequencial com controle de rate limit
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delay:</span>
              <span className="font-medium">1 segundo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeout:</span>
              <span className="font-medium">30 segundos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retry:</span>
              <span className="font-medium">Automático</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-success" />
            Dados Enriquecidos
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Campos preenchidos automaticamente pela IA
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Informações:</span>
              <span className="font-medium">Completas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precisão:</span>
              <span className="font-medium">Alta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fonte:</span>
              <span className="font-medium">OpenAI</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Modal de Progresso */}
      <EnrichmentProgressModal
        jobId={jobId}
        isOpen={showProgress}
        onClose={() => {
          setShowProgress(false);
          setJobId(null);
          // Recarregar entidades após conclusão
          carregarEntidades();
        }}
      />
    </div>
  );
}
