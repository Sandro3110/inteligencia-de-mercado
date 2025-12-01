'use client';

import { ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';

interface SectorCategoriesViewProps {
  pesquisaIds: number[];
  onDrillDown: (categoria: string) => void;
}

/**
 * NÍVEL 1: Visualização de categorias de setores
 * Mostra lista de categorias com contadores agregados
 */
export function SectorCategoriesView({ pesquisaIds, onDrillDown }: SectorCategoriesViewProps) {
  const { data, isLoading } = trpc.sectorDrillDown.getCategories.useQuery({
    pesquisaIds,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const categories = data?.categories || [];

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma categoria de setor encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorias de Setores</h2>
          <p className="text-muted-foreground">Selecione uma categoria para ver os setores</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((categoria) => (
          <Card
            key={categoria.categoria}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onDrillDown(categoria.categoria)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {categoria.categoria}
              </CardTitle>
              <CardDescription>
                {categoria.total} registro{categoria.total !== 1 ? 's' : ''} no total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Clientes */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Clientes</span>
                  <span className="font-medium">{categoria.clientes}</span>
                </div>

                {/* Leads */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Leads</span>
                  <span className="font-medium">{categoria.leads}</span>
                </div>

                {/* Concorrentes */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Concorrentes</span>
                  <span className="font-medium">{categoria.concorrentes}</span>
                </div>

                {/* Botão de ação */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDrillDown(categoria.categoria);
                  }}
                >
                  Ver Setores
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
