/**
 * Componente de Análise de Sazonalidade
 * Usa campo dia_semana de dim_tempo
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

interface SazonalidadeChartProps {
  dados: {
    mensal?: Array<{ periodo: number; valor: number; ocorrencias: number }>;
    semanal?: Array<{ periodo: number; valor: number; ocorrencias: number }>;
    diaria?: Array<{ periodo: number; valor: number; ocorrencias: number }>;
  };
  metrica: string;
  loading?: boolean;
}

const DIAS_SEMANA = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function SazonalidadeChart({ dados, metrica, loading }: SazonalidadeChartProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  // Formatar dados mensais
  const dadosMensais = dados.mensal?.map(d => ({
    nome: MESES[d.periodo - 1],
    valor: Number(d.valor),
    ocorrencias: d.ocorrencias
  })) || [];

  // Formatar dados semanais (usa dia_semana)
  const dadosSemanais = dados.semanal?.map(d => ({
    nome: DIAS_SEMANA[d.periodo],
    valor: Number(d.valor),
    ocorrencias: d.ocorrencias
  })) || [];

  // Formatar dados diários
  const dadosDiarios = dados.diaria?.map(d => ({
    nome: `Dia ${d.periodo}`,
    valor: Number(d.valor),
    ocorrencias: d.ocorrencias
  })) || [];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Análise de Sazonalidade</h3>
      </div>

      <Tabs defaultValue="mensal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="diaria">Diária</TabsTrigger>
        </TabsList>

        <TabsContent value="mensal" className="mt-6">
          {dadosMensais.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" name={metrica} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {MESES[dadosMensais.reduce((max, d, i) => 
                      d.valor > dadosMensais[max].valor ? i : max, 0
                    )]}
                  </div>
                  <div className="text-sm text-muted-foreground">Mês com maior valor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {MESES[dadosMensais.reduce((min, d, i) => 
                      d.valor < dadosMensais[min].valor ? i : min, 0
                    )]}
                  </div>
                  <div className="text-sm text-muted-foreground">Mês com menor valor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(dadosMensais.reduce((sum, d) => sum + d.valor, 0) / dadosMensais.length).toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Média mensal</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Sem dados mensais disponíveis
            </div>
          )}
        </TabsContent>

        <TabsContent value="semanal" className="mt-6">
          {dadosSemanais.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosSemanais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="hsl(var(--chart-2))" name={metrica} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {dadosSemanais[dadosSemanais.reduce((max, d, i) => 
                      d.valor > dadosSemanais[max].valor ? i : max, 0
                    )].nome}
                  </div>
                  <div className="text-sm text-muted-foreground">Dia com maior valor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {dadosSemanais[dadosSemanais.reduce((min, d, i) => 
                      d.valor < dadosSemanais[min].valor ? i : min, 0
                    )].nome}
                  </div>
                  <div className="text-sm text-muted-foreground">Dia com menor valor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(dadosSemanais.reduce((sum, d) => sum + d.valor, 0) / dadosSemanais.length).toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Média semanal</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Sem dados semanais disponíveis
            </div>
          )}
        </TabsContent>

        <TabsContent value="diaria" className="mt-6">
          {dadosDiarios.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosDiarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="hsl(var(--chart-3))" 
                    name={metrica}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {dadosDiarios[dadosDiarios.reduce((max, d, i) => 
                      d.valor > dadosDiarios[max].valor ? i : max, 0
                    )].nome}
                  </div>
                  <div className="text-sm text-muted-foreground">Dia com maior valor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {dadosDiarios[dadosDiarios.reduce((min, d, i) => 
                      d.valor < dadosDiarios[min].valor ? i : min, 0
                    )].nome}
                  </div>
                  <div className="text-sm text-muted-foreground">Dia com menor valor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(dadosDiarios.reduce((sum, d) => sum + d.valor, 0) / dadosDiarios.length).toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Média diária</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Sem dados diários disponíveis
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
