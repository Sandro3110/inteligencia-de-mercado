'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { trpc } from '@/lib/trpc/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Package, TrendingUp, Grid3x3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * Página de Análise de Produtos
 *
 * Duas visões:
 * 1. Ranking de produtos (por clientes)
 * 2. Matriz Produto × Mercado (heatmap)
 */
export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { selectedProject } = useSelectedProject();

  // Prioridade: URL params > projeto selecionado
  const projectId = searchParams.get('projectId')
    ? parseInt(searchParams.get('projectId')!)
    : selectedProject?.id || null;
  const pesquisaId = searchParams.get('pesquisaId')
    ? parseInt(searchParams.get('pesquisaId')!)
    : null;

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Buscar ranking de produtos
  const { data: rankingData, isLoading: rankingLoading } =
    trpc.productAnalysis.getProductRanking.useQuery(
      { projectId: projectId!, pesquisaId },
      { enabled: !!projectId }
    );

  // Buscar matriz produto × mercado
  const { data: matrixData, isLoading: matrixLoading } =
    trpc.productAnalysis.getProductMarketMatrix.useQuery(
      { projectId: projectId!, pesquisaId },
      { enabled: !!projectId }
    );

  // Buscar distribuição geográfica do produto selecionado
  const { data: geoData } = trpc.productAnalysis.getProductGeoDistribution.useQuery(
    { produtoNome: selectedProduct!, projectId: projectId!, pesquisaId },
    { enabled: !!selectedProduct && !!projectId }
  );

  if (!projectId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-6">
          <p className="text-muted-foreground">Selecione um projeto para visualizar produtos</p>
        </Card>
      </div>
    );
  }

  if (rankingLoading || matrixLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { products = [] } = rankingData || {};
  const { matrix = [], markets = [] } = matrixData || {};

  // Função para calcular cor do heatmap
  const getHeatmapColor = (value: number, max: number) => {
    if (value === 0) return 'bg-gray-50';
    const intensity = Math.min((value / max) * 100, 100);
    if (intensity > 75) return 'bg-green-500 text-white';
    if (intensity > 50) return 'bg-green-400';
    if (intensity > 25) return 'bg-green-300';
    return 'bg-green-200';
  };

  // Calcular valor máximo para heatmap
  const maxValue = Math.max(
    0,
    ...matrix.flatMap((row) =>
      markets
        .filter((m) => m && m.nome) // Filtrar mercados válidos
        .map((m) => (typeof row[m.nome] === 'number' ? (row[m.nome] as number) : 0))
    )
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📦 Análise de Produtos</h1>
        <p className="text-muted-foreground mt-2">Ranking de produtos e distribuição por mercado</p>
      </div>

      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ranking">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="matrix">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Matriz Produto × Mercado
          </TabsTrigger>
        </TabsList>

        {/* Aba 1: Ranking de Produtos */}
        <TabsContent value="ranking">
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Top Produtos por Clientes</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos ordenados por número de clientes
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, index) => (
                    <TableRow
                      key={product.nome}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedProduct(product.nome)}
                    >
                      <TableCell className="font-medium">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{product.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{product.clientes}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product.nome);
                          }}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Ver Distribuição
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Aba 2: Matriz Produto × Mercado */}
        <TabsContent value="matrix">
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Matriz: Produtos × Mercados</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Heatmap mostra concentração de clientes por produto e mercado
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">Produto</TableHead>
                    {markets
                      .filter((market) => market && market.id && market.nome)
                      .map((market) => (
                        <TableHead key={market.id} className="text-center min-w-[120px]">
                          {market.nome}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={markets.length + 1}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhum dado encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    matrix.map((row) => (
                      <TableRow key={row.produto as string}>
                        <TableCell className="sticky left-0 bg-background z-10 font-medium">
                          {row.produto as string}
                        </TableCell>
                        {markets
                          .filter((market) => market && market.id && market.nome)
                          .map((market) => {
                            const value = row[market.nome] as number;
                            return (
                              <TableCell
                                key={market.id}
                                className={`text-center ${getHeatmapColor(value, maxValue)}`}
                              >
                                {value > 0 ? value : '-'}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Legenda do Heatmap */}
            <div className="p-4 border-t bg-muted/20">
              <p className="text-sm font-medium mb-2">Legenda:</p>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-50 border rounded"></div>
                  <span className="text-sm">Sem clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-200 rounded"></div>
                  <span className="text-sm">Baixa concentração</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-400 rounded"></div>
                  <span className="text-sm">Média concentração</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span className="text-sm text-white">Alta concentração</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal com Distribuição Geográfica */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Distribuição Geográfica: {selectedProduct}</DialogTitle>
          </DialogHeader>

          {geoData && (
            <div className="mt-4">
              <Card>
                <div className="p-4 border-b">
                  <p className="text-sm text-muted-foreground">
                    Total de clientes: <strong>{geoData.totals.total}</strong>
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Região</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead className="text-center">Clientes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geoData.regions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhum dado geográfico encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      geoData.regions.flatMap((region) =>
                        region.cities.map((city, idx) => (
                          <TableRow key={`${city.uf}-${city.cidade}`}>
                            {idx === 0 && (
                              <TableCell rowSpan={region.cities.length} className="font-medium">
                                {region.regiao}
                              </TableCell>
                            )}
                            <TableCell>{city.uf}</TableCell>
                            <TableCell>{city.cidade}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{city.count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
