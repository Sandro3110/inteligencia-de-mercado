import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, Users, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";

interface EmpresaInfo {
  nome: string;
  cnpj: string | null;
  site: string | null;
  produto: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  segmentacao: string | null;
  porte: string | null;
}

interface RetryResult {
  tentativa: number;
  completude: number;
  dados: EmpresaInfo;
  camposFaltantes: string[];
}

interface EntidadeSeparada {
  tipo: "especifica" | "contexto";
  query: string;
  contexto_adicional: string | null;
}

interface PerguntaRefinamento {
  pergunta: string;
  opcoes: string[];
}

export default function PrePesquisaTeste() {
  const [cenarioAtivo, setCenarioAtivo] = useState<"retry" | "multicliente" | "refinamento">("refinamento");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-6 space-y-6">
        <DynamicBreadcrumbs />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            🧪 Teste de Pré-Pesquisa Inteligente
          </h1>
          <p className="text-slate-600">
            Demonstração interativa das 4 melhorias: Retry Inteligente, Multi-Cliente, Aprovação Obrigatória e Refinamento 3 Níveis
          </p>
        </div>

        <Tabs value={cenarioAtivo} onValueChange={(v) => setCenarioAtivo(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="retry" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Cenário 1: Retry Inteligente
            </TabsTrigger>
            <TabsTrigger value="multicliente" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cenário 2: Multi-Cliente
            </TabsTrigger>
            <TabsTrigger value="refinamento" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Cenário 3: Refinamento 3 Níveis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="retry" className="space-y-6">
            <CenarioRetry />
          </TabsContent>

          <TabsContent value="multicliente" className="space-y-6">
            <CenarioMultiCliente />
          </TabsContent>

          <TabsContent value="refinamento" className="space-y-6">
            <CenarioRefinamento />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * CENÁRIO 1: RETRY INTELIGENTE
 */
function CenarioRetry() {
  const [query, setQuery] = useState("Empresa XYZ Ltda");
  const [resultados, setResultados] = useState<RetryResult[]>([]);
  const [tentativaAtual, setTentativaAtual] = useState(0);
  const [aprovado, setAprovado] = useState(false);

  const retryMutation = trpc.prePesquisaTeste.retryInteligente.useMutation({
    onSuccess: (data) => {
      // Simular progresso incremental
      data.forEach((resultado, index) => {
        setTimeout(() => {
          setTentativaAtual(resultado.tentativa);
          setResultados((prev) => [...prev, resultado]);
        }, index * 2500);
      });
    },
  });

  const handleIniciar = () => {
    setResultados([]);
    setTentativaAtual(0);
    setAprovado(false);
    retryMutation.mutate({ query });
  };

  const handleAprovar = () => {
    setAprovado(true);
  };

  const handleRejeitar = () => {
    setResultados([]);
    setTentativaAtual(0);
    setAprovado(false);
  };

  const ultimoResultado = resultados[resultados.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cenário 1: Retry Inteligente com Aprovação Obrigatória</CardTitle>
          <CardDescription>
            Sistema tenta até 3 vezes melhorar a completude dos dados. Ao final, você DEVE aprovar ou rejeitar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Nome da Empresa</Label>
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Empresa XYZ Ltda"
              disabled={retryMutation.isPending || tentativaAtual > 0}
            />
          </div>

          <Button
            onClick={handleIniciar}
            disabled={retryMutation.isPending || tentativaAtual > 0 || aprovado}
            className="w-full"
          >
            {retryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Iniciar Teste de Retry
              </>
            )}
          </Button>

          {tentativaAtual > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progresso</span>
                  <span className="font-medium text-slate-900">
                    Tentativa {tentativaAtual} de 3
                  </span>
                </div>
                <Progress value={(tentativaAtual / 3) * 100} className="h-2" />
              </div>

              <div className="space-y-3">
                {resultados.map((resultado) => (
                  <Card key={resultado.tentativa} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-slate-900">
                            Tentativa {resultado.tentativa}
                          </span>
                        </div>
                        <Badge variant={resultado.completude === 100 ? "default" : "secondary"}>
                          {resultado.completude}% completo
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">Nome:</span>{" "}
                          <span className="font-medium text-slate-900">{resultado.dados.nome}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">CNPJ:</span>{" "}
                          <span className="font-medium text-slate-900">
                            {resultado.dados.cnpj || <span className="text-red-500">Faltando</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Site:</span>{" "}
                          <span className="font-medium text-slate-900">
                            {resultado.dados.site || <span className="text-red-500">Faltando</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Telefone:</span>{" "}
                          <span className="font-medium text-slate-900">
                            {resultado.dados.telefone || <span className="text-red-500">Faltando</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Email:</span>{" "}
                          <span className="font-medium text-slate-900">
                            {resultado.dados.email || <span className="text-red-500">Faltando</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Segmentação:</span>{" "}
                          <span className="font-medium text-slate-900">
                            {resultado.dados.segmentacao || <span className="text-red-500">Faltando</span>}
                          </span>
                        </div>
                      </div>

                      {resultado.camposFaltantes.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded text-sm">
                          <span className="text-red-700 font-medium">Campos faltantes:</span>{" "}
                          <span className="text-red-600">{resultado.camposFaltantes.join(", ")}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {tentativaAtual === 3 && !aprovado && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Aprovação Obrigatória:</strong> Você deve revisar os dados e aprovar ou rejeitar.
                  </AlertDescription>
                </Alert>
              )}

              {tentativaAtual === 3 && !aprovado && (
                <div className="flex gap-3">
                  <Button onClick={handleAprovar} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Aprovar Dados
                  </Button>
                  <Button onClick={handleRejeitar} variant="destructive" className="flex-1">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Rejeitar e Reiniciar
                  </Button>
                </div>
              )}

              {aprovado && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>✅ Dados Aprovados!</strong> Completude final: {ultimoResultado?.completude}%
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * CENÁRIO 2: MULTI-CLIENTE
 */
function CenarioMultiCliente() {
  const [textoLivre, setTextoLivre] = useState(
    "Quero pesquisar a Cooperativa de Holambra, a Carga Pesada Distribuidora e a Braskem"
  );
  const [entidades, setEntidades] = useState<EntidadeSeparada[]>([]);
  const [resultadosPrePesquisa, setResultadosPrePesquisa] = useState<Record<string, EmpresaInfo>>({});
  const [aprovacoes, setAprovacoes] = useState<Record<string, boolean>>({});

  const separacaoMutation = trpc.prePesquisaTeste.separacaoMultiCliente.useMutation({
    onSuccess: (data) => {
      setEntidades(data);
      setResultadosPrePesquisa({});
      setAprovacoes({});
    },
  });

  const prePesquisaMutation = trpc.prePesquisaTeste.prePesquisaEntidade.useMutation({
    onSuccess: (data, variables) => {
      setResultadosPrePesquisa((prev) => ({
        ...prev,
        [variables.query]: data,
      }));
    },
  });

  const handleSeparar = () => {
    separacaoMutation.mutate({ textoLivre });
  };

  const handlePesquisarEntidade = (entidade: EntidadeSeparada) => {
    prePesquisaMutation.mutate(entidade);
  };

  const handleAprovarEntidade = (query: string) => {
    setAprovacoes((prev) => ({ ...prev, [query]: true }));
  };

  const handleRejeitarEntidade = (query: string) => {
    setAprovacoes((prev) => ({ ...prev, [query]: false }));
    setResultadosPrePesquisa((prev) => {
      const novo = { ...prev };
      delete novo[query];
      return novo;
    });
  };

  const todasAprovadas = entidades.length > 0 && entidades.every((e) => aprovacoes[e.query] === true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cenário 2: Processamento Multi-Cliente</CardTitle>
          <CardDescription>
            Sistema separa múltiplas entidades em texto livre, pesquisa cada uma e exige aprovação individual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textoLivre">Texto Livre (múltiplas empresas)</Label>
            <Textarea
              id="textoLivre"
              value={textoLivre}
              onChange={(e) => setTextoLivre(e.target.value)}
              placeholder="Ex: Quero pesquisar a Cooperativa de Holambra, a Carga Pesada Distribuidora e a Braskem"
              rows={3}
              disabled={separacaoMutation.isPending || entidades.length > 0}
            />
          </div>

          <Button
            onClick={handleSeparar}
            disabled={separacaoMutation.isPending || entidades.length > 0}
            className="w-full"
          >
            {separacaoMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Separando entidades...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Separar e Processar
              </>
            )}
          </Button>

          {entidades.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>{entidades.length} entidades detectadas.</strong> Clique para pesquisar cada uma.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {entidades.map((entidade, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{entidade.query}</div>
                          <div className="text-sm text-slate-600">
                            Tipo: <Badge variant="outline">{entidade.tipo}</Badge>
                            {entidade.contexto_adicional && (
                              <span className="ml-2">Contexto: {entidade.contexto_adicional}</span>
                            )}
                          </div>
                        </div>
                        {!resultadosPrePesquisa[entidade.query] && (
                          <Button
                            size="sm"
                            onClick={() => handlePesquisarEntidade(entidade)}
                            disabled={prePesquisaMutation.isPending}
                          >
                            {prePesquisaMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Pesquisar"
                            )}
                          </Button>
                        )}
                      </div>

                      {resultadosPrePesquisa[entidade.query] && (
                        <div className="space-y-3 p-3 bg-slate-50 rounded">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-slate-600">Nome:</span>{" "}
                              <span className="font-medium text-slate-900">
                                {resultadosPrePesquisa[entidade.query].nome}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">CNPJ:</span>{" "}
                              <span className="font-medium text-slate-900">
                                {resultadosPrePesquisa[entidade.query].cnpj || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Produto:</span>{" "}
                              <span className="font-medium text-slate-900">
                                {resultadosPrePesquisa[entidade.query].produto || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Cidade:</span>{" "}
                              <span className="font-medium text-slate-900">
                                {resultadosPrePesquisa[entidade.query].cidade || "N/A"}
                              </span>
                            </div>
                          </div>

                          {aprovacoes[entidade.query] === undefined && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAprovarEntidade(entidade.query)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejeitarEntidade(entidade.query)}
                                className="flex-1"
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Rejeitar
                              </Button>
                            </div>
                          )}

                          {aprovacoes[entidade.query] === true && (
                            <Alert className="border-green-500 bg-green-50">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-green-800">
                                ✅ Aprovado
                              </AlertDescription>
                            </Alert>
                          )}

                          {aprovacoes[entidade.query] === false && (
                            <Alert className="border-red-500 bg-red-50">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-red-800">
                                ❌ Rejeitado
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {todasAprovadas && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>✅ Todas as {entidades.length} entidades foram aprovadas!</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * CENÁRIO 3: REFINAMENTO 3 NÍVEIS
 */
function CenarioRefinamento() {
  const [contextoInicial, setContextoInicial] = useState("cooperativas agrícolas de café");
  const [nivel, setNivel] = useState(0);
  const [perguntaNivel1, setPerguntaNivel1] = useState<PerguntaRefinamento | null>(null);
  const [perguntaNivel2, setPerguntaNivel2] = useState<PerguntaRefinamento | null>(null);
  const [perguntaNivel3, setPerguntaNivel3] = useState<PerguntaRefinamento | null>(null);
  const [respostasNivel1, setRespostasNivel1] = useState<string[]>([]);
  const [respostasNivel2, setRespostasNivel2] = useState<string[]>([]);
  const [respostasNivel3, setRespostasNivel3] = useState<string[]>([]);
  const [resultadosFinais, setResultadosFinais] = useState<EmpresaInfo[]>([]);
  const [aprovacoes, setAprovacoes] = useState<Record<string, boolean>>({});

  const nivel1Mutation = trpc.prePesquisaTeste.refinamentoNivel1.useMutation({
    onSuccess: (data) => {
      setPerguntaNivel1(data);
      setNivel(1);
    },
  });

  const nivel2Mutation = trpc.prePesquisaTeste.refinamentoNivel2.useMutation({
    onSuccess: (data) => {
      setPerguntaNivel2(data);
      setNivel(2);
    },
  });

  const nivel3Mutation = trpc.prePesquisaTeste.refinamentoNivel3.useMutation({
    onSuccess: (data) => {
      setPerguntaNivel3(data);
      setNivel(3);
    },
  });

  const prePesquisaRefinadaMutation = trpc.prePesquisaTeste.prePesquisaRefinada.useMutation({
    onSuccess: (data) => {
      setResultadosFinais(data);
      setNivel(4);
    },
  });

  const handleIniciarRefinamento = () => {
    nivel1Mutation.mutate({ contextoInicial });
  };

  const handleToggleNivel1 = (opcao: string) => {
    setRespostasNivel1(prev => 
      prev.includes(opcao) ? prev.filter(o => o !== opcao) : [...prev, opcao]
    );
  };

  const handleToggleNivel2 = (opcao: string) => {
    setRespostasNivel2(prev => 
      prev.includes(opcao) ? prev.filter(o => o !== opcao) : [...prev, opcao]
    );
  };

  const handleToggleNivel3 = (opcao: string) => {
    setRespostasNivel3(prev => 
      prev.includes(opcao) ? prev.filter(o => o !== opcao) : [...prev, opcao]
    );
  };

  const handleAvancarNivel1 = () => {
    if (respostasNivel1.length === 0) return;
    nivel2Mutation.mutate({ contextoInicial, respostasNivel1 });
  };

  const handleAvancarNivel2 = () => {
    if (respostasNivel2.length === 0) return;
    nivel3Mutation.mutate({ contextoInicial, respostasNivel1, respostasNivel2 });
  };

  const handleAvancarNivel3 = () => {
    if (respostasNivel3.length === 0) return;
    prePesquisaRefinadaMutation.mutate({
      contextoInicial,
      respostasNivel1,
      respostasNivel2,
      respostasNivel3,
    });
  };

  const handleAprovarResultado = (nome: string) => {
    setAprovacoes((prev) => ({ ...prev, [nome]: true }));
  };

  const handleRejeitarResultado = (nome: string) => {
    setAprovacoes((prev) => ({ ...prev, [nome]: false }));
  };

  const todasAprovadas =
    resultadosFinais.length > 0 && resultadosFinais.every((r) => aprovacoes[r.nome] === true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cenário 3: Refinamento de Contexto (3 Níveis)</CardTitle>
          <CardDescription>
            Sistema faz 3 perguntas progressivas para refinar o contexto antes da pré-pesquisa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nivel === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contextoInicial">Contexto Inicial (genérico)</Label>
                <Input
                  id="contextoInicial"
                  value={contextoInicial}
                  onChange={(e) => setContextoInicial(e.target.value)}
                  placeholder="Ex: cooperativas agrícolas de café"
                  disabled={nivel1Mutation.isPending}
                />
              </div>

              <Button
                onClick={handleIniciarRefinamento}
                disabled={nivel1Mutation.isPending}
                className="w-full"
              >
                {nivel1Mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Filter className="mr-2 h-4 w-4" />
                    Iniciar Refinamento
                  </>
                )}
              </Button>
            </>
          )}

          {nivel >= 1 && perguntaNivel1 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>Nível 1</Badge>
                  <span className="font-medium text-slate-900">{perguntaNivel1.pergunta}</span>
                </div>
                {nivel === 1 ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {perguntaNivel1.opcoes.map((opcao) => (
                        <label
                          key={opcao}
                          className="flex items-center gap-3 px-4 py-2 border rounded cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={respostasNivel1.includes(opcao)}
                            onChange={() => handleToggleNivel1(opcao)}
                            className="w-4 h-4"
                          />
                          <span>{opcao}</span>
                        </label>
                      ))}
                    </div>
                    <Button
                      onClick={handleAvancarNivel1}
                      disabled={respostasNivel1.length === 0 || nivel2Mutation.isPending}
                      className="w-full"
                    >
                      {nivel2Mutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>
                      ) : (
                        `Avançar (${respostasNivel1.length} selecionado${respostasNivel1.length !== 1 ? 's' : ''})`
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                    ✅ Respostas: <strong>{respostasNivel1.join(', ')}</strong>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {nivel >= 2 && perguntaNivel2 && (
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>Nível 2</Badge>
                  <span className="font-medium text-slate-900">{perguntaNivel2.pergunta}</span>
                </div>
                {nivel === 2 ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {perguntaNivel2.opcoes.map((opcao) => (
                        <label
                          key={opcao}
                          className="flex items-center gap-3 px-4 py-2 border rounded cursor-pointer hover:bg-green-50 hover:border-green-500 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={respostasNivel2.includes(opcao)}
                            onChange={() => handleToggleNivel2(opcao)}
                            className="w-4 h-4"
                          />
                          <span>{opcao}</span>
                        </label>
                      ))}
                    </div>
                    <Button
                      onClick={handleAvancarNivel2}
                      disabled={respostasNivel2.length === 0 || nivel3Mutation.isPending}
                      className="w-full"
                    >
                      {nivel3Mutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>
                      ) : (
                        `Avançar (${respostasNivel2.length} selecionado${respostasNivel2.length !== 1 ? 's' : ''})`
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-2 bg-purple-50 rounded text-sm text-purple-800">
                    ✅ Respostas: <strong>{respostasNivel2.join(', ')}</strong>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {nivel >= 3 && perguntaNivel3 && (
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>Nível 3</Badge>
                  <span className="font-medium text-slate-900">{perguntaNivel3.pergunta}</span>
                </div>
                {nivel === 3 ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {perguntaNivel3.opcoes.map((opcao) => (
                        <label
                          key={opcao}
                          className="flex items-center gap-3 px-4 py-2 border rounded cursor-pointer hover:bg-purple-50 hover:border-purple-500 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={respostasNivel3.includes(opcao)}
                            onChange={() => handleToggleNivel3(opcao)}
                            className="w-4 h-4"
                          />
                          <span>{opcao}</span>
                        </label>
                      ))}
                    </div>
                    <Button
                      onClick={handleAvancarNivel3}
                      disabled={respostasNivel3.length === 0 || prePesquisaRefinadaMutation.isPending}
                      className="w-full"
                    >
                      {prePesquisaRefinadaMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando combinações...</>
                      ) : (
                        `Gerar Pesquisas (${respostasNivel1.length}×${respostasNivel2.length}×${respostasNivel3.length} = ${respostasNivel1.length * respostasNivel2.length * respostasNivel3.length} combinações)`
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-2 bg-green-50 rounded text-sm text-green-800">
                    ✅ Respostas: <strong>{respostasNivel3.join(', ')}</strong>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {nivel === 4 && resultadosFinais.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pré-pesquisa concluída!</strong> {resultadosFinais.length} resultados encontrados.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {resultadosFinais.map((resultado, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4 space-y-3">
                      <div className="font-medium text-slate-900">{resultado.nome}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">CNPJ:</span>{" "}
                          <span className="font-medium text-slate-900">{resultado.cnpj || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Produto:</span>{" "}
                          <span className="font-medium text-slate-900">{resultado.produto || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Cidade:</span>{" "}
                          <span className="font-medium text-slate-900">
                            {resultado.cidade}, {resultado.uf}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Porte:</span>{" "}
                          <span className="font-medium text-slate-900">{resultado.porte || "N/A"}</span>
                        </div>
                      </div>

                      {aprovacoes[resultado.nome] === undefined && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAprovarResultado(resultado.nome)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejeitarResultado(resultado.nome)}
                            className="flex-1"
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Rejeitar
                          </Button>
                        </div>
                      )}

                      {aprovacoes[resultado.nome] === true && (
                        <Alert className="border-green-500 bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">✅ Aprovado</AlertDescription>
                        </Alert>
                      )}

                      {aprovacoes[resultado.nome] === false && (
                        <Alert className="border-red-500 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">❌ Rejeitado</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {todasAprovadas && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>✅ Todos os {resultadosFinais.length} resultados foram aprovados!</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
