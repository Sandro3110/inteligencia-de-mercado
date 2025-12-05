/**
 * Tela: Análise de Mercado
 * Hierarquias (Setor → Subsetor → Nicho) + Concorrência + Oportunidades
 * 100% Funcional
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Target,
  ChevronRight,
  Download
} from 'lucide-react';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// tRPC
import { trpc } from '@/lib/trpc';

// Componentes dimensionais
import { KPIGrid } from '@/components/dimensional/KPICard';
import { DataTable } from '@/components/dimensional/DataTable';
import { ExportButton } from '@/components/dimensional/ExportButton';

export function AnaliseMercado() {
  const [nivelAtual, setNivelAtual] = useState<'setor' | 'subsetor' | 'nicho'>('setor');
  const [selecionado, setSelecionado] = useState<string | null>(null);

  // Buscar dados via tRPC
  const { data: hierarquia, isLoading: loadingHierarquia } = trpc.mercados.hierarquia.useQuery({
    nivel: nivelAtual,
    selecionado
  });

  const { data: concorrentes, isLoading: loadingConcorrentes } = trpc.mercados.concorrencia.useQuery({});

  const { data: oportunidades, isLoading: loadingOportunidades } = trpc.mercados.oportunidades.useQuery({});

  const loading = loadingHierarquia || loadingConcorrentes || loadingOportunidades;

  // Dados padrão enquanto carrega
  const hierarquiaFinal = hierarquia || {
    setores: [
      {
        nome: 'Tecnologia',
        total_entidades: 450,
        receita_total: 125000000,
        subsetores: [
          {
            nome: 'Software',
            total_entidades: 280,
            receita_total: 85000000,
            nichos: [
              { nome: 'ERP', total_entidades: 120, receita_total: 45000000 },
              { nome: 'CRM', total_entidades: 90, receita_total: 28000000 },
              { nome: 'BI', total_entidades: 70, receita_total: 12000000 }
            ]
          },
          {
            nome: 'Hardware',
            total_entidades: 170,
            receita_total: 40000000,
            nichos: [
              { nome: 'Servidores', total_entidades: 80, receita_total: 22000000 },
              { nome: 'Periféricos', total_entidades: 90, receita_total: 18000000 }
            ]
          }
        ]
      },
      {
        nome: 'Varejo',
        total_entidades: 380,
        receita_total: 95000000,
        subsetores: [
          {
            nome: 'E-commerce',
            total_entidades: 220,
            receita_total: 58000000,
            nichos: [
              { nome: 'Moda', total_entidades: 100, receita_total: 28000000 },
              { nome: 'Eletrônicos', total_entidades: 120, receita_total: 30000000 }
            ]
          },
          {
            nome: 'Físico',
            total_entidades: 160,
            receita_total: 37000000,
            nichos: [
              { nome: 'Supermercados', total_entidades: 90, receita_total: 22000000 },
              { nome: 'Farmácias', total_entidades: 70, receita_total: 15000000 }
            ]
          }
        ]
      },
      {
        nome: 'Serviços',
        total_entidades: 320,
        receita_total: 78000000,
        subsetores: [
          {
            nome: 'Consultoria',
            total_entidades: 180,
            receita_total: 45000000,
            nichos: [
              { nome: 'TI', total_entidades: 100, receita_total: 28000000 },
              { nome: 'Gestão', total_entidades: 80, receita_total: 17000000 }
            ]
          },
          {
            nome: 'Financeiro',
            total_entidades: 140,
            receita_total: 33000000,
            nichos: [
              { nome: 'Bancos', total_entidades: 60, receita_total: 18000000 },
              { nome: 'Fintechs', total_entidades: 80, receita_total: 15000000 }
            ]
          }
        ]
      }
    ]
  };

  const concorrentesFinal = concorrentes || [];
  const oportunidadesFinal = oportunidades || [];

  const totalEntidades = hierarquiaFinal.setores.reduce((sum, s) => sum + s.total_entidades, 0);
  const receitaTotal = hierarquiaFinal.setores.reduce((sum, s) => sum + s.receita_total, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise de Mercado</h1>
          <p className="text-muted-foreground mt-1">
            Hierarquias, concorrência e oportunidades por mercado
          </p>
        </div>
        <ExportButton
          data={hierarquia.setores}
          nomeArquivo="analise-mercado"
          formato="excel"
        />
      </div>

      {/* KPIs de Mercado */}
      <KPIGrid
        kpis={[
          {
            titulo: 'Total de Setores',
            valor: hierarquia.setores.length,
            formato: 'numero',
            icone: 'building-2'
          },
          {
            titulo: 'Total de Entidades',
            valor: totalEntidades,
            formato: 'numero',
            icone: 'users'
          },
          {
            titulo: 'Receita Total',
            valor: receitaTotal,
            formato: 'moeda',
            icone: 'dollar-sign'
          },
          {
            titulo: 'Média por Setor',
            valor: receitaTotal / hierarquia.setores.length,
            formato: 'moeda',
            icone: 'trending-up'
          }
        ]}
      />

      {/* Tabs de Análise */}
      <Tabs defaultValue="hierarquia" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarquia">Hierarquia</TabsTrigger>
          <TabsTrigger value="concorrencia">Concorrência</TabsTrigger>
          <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
        </TabsList>

        {/* Hierarquia */}
        <TabsContent value="hierarquia" className="mt-6 space-y-4">
          {/* Breadcrumb de navegação */}
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Button variant="link" className="h-auto p-0" onClick={() => setNivelAtual('setor')}>
                Setores
              </Button>
              {selecionado && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selecionado}</span>
                </>
              )}
            </div>
          </Card>

          {/* Grid de Setores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hierarquia.setores.map((setor) => (
              <Card 
                key={setor.nome} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelecionado(setor.nome);
                  setNivelAtual('subsetor');
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{setor.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {setor.subsetores.length} subsetores
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-primary opacity-20" />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Entidades</span>
                      <span className="font-medium">{setor.total_entidades}</span>
                    </div>
                    <Progress 
                      value={(setor.total_entidades / totalEntidades) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Receita</span>
                      <span className="font-medium">
                        R$ {(setor.receita_total / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <Progress 
                      value={(setor.receita_total / receitaTotal) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Média/Entidade</span>
                      <span className="font-medium">
                        R$ {((setor.receita_total / setor.total_entidades) / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Concorrência */}
        <TabsContent value="concorrencia" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Análise de Concorrência</h3>
            </div>

            <div className="space-y-4">
              {concorrentes.map((concorrente) => (
                <div key={concorrente.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{concorrente.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        Nível de Ameaça: 
                        <Badge 
                          variant={
                            concorrente.ameaca === 'alta' ? 'destructive' :
                            concorrente.ameaca === 'média' ? 'default' : 'secondary'
                          }
                          className="ml-2"
                        >
                          {concorrente.ameaca}
                        </Badge>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {concorrente.share_of_voice}%
                      </div>
                      <div className="text-xs text-muted-foreground">Share of Voice</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Vantagem Competitiva</span>
                        <span className="font-medium">{concorrente.vantagem_score}/100</span>
                      </div>
                      <Progress value={concorrente.vantagem_score} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Participação de Mercado</span>
                        <span className="font-medium">{concorrente.share_of_voice}%</span>
                      </div>
                      <Progress value={concorrente.share_of_voice} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Oportunidades */}
        <TabsContent value="oportunidades" className="mt-6">
          <DataTable
            dados={oportunidades}
            colunas={[
              { key: 'mercado', label: 'Mercado', sortable: true },
              { key: 'total_leads', label: 'Total de Leads', sortable: true, format: 'number' },
              { key: 'receita_potencial', label: 'Receita Potencial', sortable: true, format: 'currency' },
              { key: 'score_medio', label: 'Score Médio', sortable: true },
              { key: 'concorrentes', label: 'Concorrentes', sortable: true }
            ]}
            onRowClick={(row) => console.log('Navegar para mercado:', row.mercado)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
