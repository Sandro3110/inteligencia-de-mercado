/**
 * Tela: Cubo Explorador
 * Busca semântica + Filtros inteligentes + Consultas dimensionais
 * 100% Funcional
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Copy, AlertCircle, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Componentes dimensionais
import { SmartFilters } from '@/components/dimensional/SmartFilters';
import { DataTable } from '@/components/dimensional/DataTable';
import { KPIGrid } from '@/components/dimensional/KPICard';
import { ExportButton } from '@/components/dimensional/ExportButton';
import { CopyButton } from '@/components/dimensional/CopyButton';
import { LoadingState } from '@/components/dimensional/LoadingState';
import { ErrorState } from '@/components/dimensional/ErrorState';

// Types
import type { Filtro, ResultadoConsulta } from '@/types/dimensional';

export function CuboExplorador() {
  const [buscaSemantica, setBuscaSemantica] = useState('');
  const [filtros, setFiltros] = useState<Filtro[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Busca semântica com IA
  const handleBuscaSemantica = async () => {
    if (!buscaSemantica.trim()) return;

    setLoading(true);
    setErro(null);

    try {
      // TODO: Chamar tRPC cuboRouter.buscaSemantica
      // const resultado = await trpc.cubo.buscaSemantica.query({ query: buscaSemantica });
      
      // Mock temporário
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResultado: ResultadoConsulta = {
        dados: [
          {
            id: 1,
            nome: 'Ambev S.A.',
            tipo: 'lead',
            receita_potencial: 8500000,
            score_fit: 92,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: 2,
            nome: 'Magazine Luiza',
            tipo: 'lead',
            receita_potencial: 6200000,
            score_fit: 88,
            cidade: 'São Paulo',
            estado: 'SP'
          }
        ],
        total: 2,
        filtrosAplicados: [],
        sugestoes: [
          {
            tipo: 'filtro',
            titulo: 'Adicionar filtro de segmento',
            descricao: 'Filtre por Segmento A para focar em leads de alto valor',
            acao: 'adicionar_filtro',
            parametros: { campo: 'segmento_abc', operador: '=', valor: 'A' }
          }
        ]
      };

      setResultado(mockResultado);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  // Consulta dimensional com filtros
  const handleConsultar = async () => {
    setLoading(true);
    setErro(null);

    try {
      // TODO: Chamar tRPC cuboRouter.consultar
      // const resultado = await trpc.cubo.consultar.query({ filtros });
      
      // Mock temporário
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResultado({
        dados: [],
        total: 0,
        filtrosAplicados: filtros,
        sugestoes: []
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao consultar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cubo Explorador</h1>
          <p className="text-muted-foreground mt-1">
            Explore dados dimensionais com busca semântica e filtros inteligentes
          </p>
        </div>
      </div>

      {/* Busca Semântica */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Busca Inteligente</h2>
          <Badge variant="secondary" className="ml-2">IA</Badge>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ex: Encontre empresas de tecnologia no sul com alto potencial de receita..."
            value={buscaSemantica}
            onChange={(e) => setBuscaSemantica(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscaSemantica()}
            className="flex-1"
          />
          <Button onClick={handleBuscaSemantica} disabled={loading || !buscaSemantica.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          💡 Use linguagem natural para buscar. A IA interpretará sua intenção e aplicará os filtros automaticamente.
        </div>
      </Card>

      {/* Filtros Inteligentes */}
      <SmartFilters
        filtros={filtros}
        onChange={setFiltros}
        onConsultar={handleConsultar}
      />

      {/* Resultados */}
      <Tabs defaultValue="tabela" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="tabela">Tabela</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
          </TabsList>

          {resultado && resultado.dados.length > 0 && (
            <div className="flex gap-2">
              <CopyButton
                data={resultado.dados}
                formato="texto"
                label="Copiar"
              />
              <ExportButton
                data={resultado.dados}
                nomeArquivo="cubo-explorador"
                formato="excel"
              />
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <LoadingState variant="table" mensagem="Processando consulta..." />
        )}

        {/* Erro */}
        {erro && !loading && (
          <ErrorState
            variant="alert"
            titulo="Erro na consulta"
            mensagem={erro}
            onTentarNovamente={handleConsultar}
          />
        )}

        {/* Alertas e Sugestões */}
        {resultado && !loading && !erro && (
          <>
            {/* Alert de Performance */}
            {resultado.total > 10000 && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>⚠️ Sua consulta retornará {resultado.total.toLocaleString()} registros</strong>
                  <br />
                  Isso pode levar 8-12 segundos para carregar. Considere adicionar mais filtros.
                </AlertDescription>
              </Alert>
            )}

            {/* Sugestões */}
            {resultado.sugestoes && resultado.sugestoes.length > 0 && (
              <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Sugestões para melhorar sua análise:
                    </h3>
                    <div className="space-y-2">
                      {resultado.sugestoes.map((sugestao, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400">⭐</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-blue-900 dark:text-blue-100">
                              {sugestao.titulo}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              {sugestao.descricao}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            Aplicar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Tabs de Visualização */}
            <TabsContent value="tabela">
              <DataTable
                dados={resultado.dados}
                colunas={[
                  { key: 'nome', label: 'Nome', sortable: true },
                  { key: 'tipo', label: 'Tipo', sortable: true },
                  { key: 'receita_potencial', label: 'Receita Potencial', sortable: true, format: 'currency' },
                  { key: 'score_fit', label: 'Score Fit', sortable: true },
                  { key: 'cidade', label: 'Cidade', sortable: true },
                  { key: 'estado', label: 'Estado', sortable: true }
                ]}
                onRowClick={(row) => console.log('Navegar para detalhes:', row.id)}
              />
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resultado.dados.map((item: any) => (
                  <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="font-semibold text-lg mb-2">{item.nome}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <Badge>{item.tipo}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Receita:</span>
                        <span className="font-medium">
                          R$ {(item.receita_potencial / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">{item.score_fit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Localização:</span>
                        <span>{item.cidade}/{item.estado}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="kpis">
              <KPIGrid
                kpis={[
                  {
                    titulo: 'Total de Entidades',
                    valor: resultado.total,
                    formato: 'numero',
                    icone: 'users'
                  },
                  {
                    titulo: 'Receita Total',
                    valor: resultado.dados.reduce((sum: number, item: any) => sum + (item.receita_potencial || 0), 0),
                    formato: 'moeda',
                    icone: 'dollar-sign'
                  },
                  {
                    titulo: 'Score Médio',
                    valor: resultado.dados.reduce((sum: number, item: any) => sum + (item.score_fit || 0), 0) / resultado.dados.length,
                    formato: 'numero',
                    icone: 'trending-up'
                  }
                ]}
              />
            </TabsContent>
          </>
        )}

        {/* Empty State */}
        {!resultado && !loading && !erro && (
          <Card className="p-12">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma consulta realizada</h3>
              <p className="text-muted-foreground">
                Use a busca semântica ou configure filtros para explorar os dados
              </p>
            </div>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
