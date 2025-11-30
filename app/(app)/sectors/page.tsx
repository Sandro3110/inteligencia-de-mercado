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
import { Loader2, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GeoTable } from '@/components/map/GeoTable';

/**
 * Página de Análise de Setores
 *
 * Visão simplificada com score de oportunidade
 * Clique em setor → abre Geoposição filtrada
 */
export default function SectorsPage() {
  const searchParams = useSearchParams();
  const { selectedProject } = useSelectedProject();

  // Prioridade: URL params > projeto selecionado
  const projectId = searchParams.get('projectId')
    ? parseInt(searchParams.get('projectId')!)
    : selectedProject?.id || null;
  const pesquisaId = searchParams.get('pesquisaId')
    ? parseInt(searchParams.get('pesquisaId')!)
    : null;

  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<'clientes' | 'leads' | 'concorrentes'>('clientes');

  // Buscar resumo de setores
  const { data, isLoading, error } = trpc.sectorAnalysis.getSectorSummary.useQuery({
    projectId,
    pesquisaId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-6">
          <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
        </Card>
      </div>
    );
  }

  const { sectors = [], totals } = data || {};

  // Função para calcular estrelas baseado no score
  const getScoreStars = (score: number) => {
    if (score >= 2.0) return '⭐⭐⭐⭐⭐';
    if (score >= 1.5) return '⭐⭐⭐⭐';
    if (score >= 1.0) return '⭐⭐⭐';
    if (score >= 0.5) return '⭐⭐';
    return '⭐';
  };

  // Função para cor do badge baseado no score
  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 1.5) return 'default'; // Verde
    if (score >= 0.8) return 'secondary'; // Amarelo
    return 'destructive'; // Vermelho
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📊 Análise de Setores</h1>
        <p className="text-muted-foreground mt-2">
          Identifique setores com maior oportunidade de negócio
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clientes</p>
              <p className="text-2xl font-bold">{totals?.clientes || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{totals?.leads || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Concorrentes</p>
              <p className="text-2xl font-bold">{totals?.concorrentes || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Setores */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Setores Ranqueados por Oportunidade</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Score = (Leads / Concorrentes) × Fator Cliente. Maior score = melhor oportunidade
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setor</TableHead>
              <TableHead className="text-center">Clientes</TableHead>
              <TableHead className="text-center">Leads</TableHead>
              <TableHead className="text-center">Concorrentes</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Avaliação</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum setor encontrado
                </TableCell>
              </TableRow>
            ) : (
              sectors.map((sector) => (
                <TableRow
                  key={sector.setor}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedSector(sector.setor)}
                >
                  <TableCell className="font-medium">{sector.setor}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{sector.clientes}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-50">
                      {sector.leads}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-red-50">
                      {sector.concorrentes}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(sector.score)}>
                      {sector.score.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-lg">
                    {getScoreStars(sector.score)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSector(sector.setor);
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Ver Distribuição
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal com Geoposição Filtrada */}
      <Dialog open={!!selectedSector} onOpenChange={() => setSelectedSector(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Distribuição Geográfica: {selectedSector}</DialogTitle>
          </DialogHeader>

          {selectedSector && (
            <div className="mt-4">
              {/* Abas de entidades */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={entityType === 'clientes' ? 'default' : 'outline'}
                  onClick={() => setEntityType('clientes')}
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Clientes
                </Button>
                <Button
                  variant={entityType === 'leads' ? 'default' : 'outline'}
                  onClick={() => setEntityType('leads')}
                  size="sm"
                >
                  <Target className="h-4 w-4 mr-1" />
                  Leads
                </Button>
                <Button
                  variant={entityType === 'concorrentes' ? 'default' : 'outline'}
                  onClick={() => setEntityType('concorrentes')}
                  size="sm"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Concorrentes
                </Button>
              </div>

              {/* Reutilizar componente GeoTable com filtro de setor */}
              <GeoTable
                entityType={entityType}
                projectId={projectId}
                pesquisaId={pesquisaId}
                filters={{ setor: selectedSector }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
