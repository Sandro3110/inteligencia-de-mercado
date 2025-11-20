import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Target, Award, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
export default function ROIDashboard() {
  const { selectedProjectId } = useSelectedProject();
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [dealValue, setDealValue] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"won" | "lost">("won");

  const { data: metrics, refetch: refetchMetrics } = trpc.roi.metrics.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const { data: conversions, refetch: refetchConversions } = trpc.conversion.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const { data: allLeads } = trpc.leads.list.useQuery(
    { projectId: selectedProjectId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  const createConversionMutation = trpc.conversion.create.useMutation();
  const logActivityMutation = trpc.activity.log.useMutation();

  const handleCreateConversion = async () => {
    if (!selectedLeadId || !selectedProjectId) {
      toast.error("Selecione um lead");
      return;
    }

    try {
      await createConversionMutation.mutateAsync({
        leadId: selectedLeadId,
        projectId: selectedProjectId,
        dealValue: dealValue ? parseFloat(dealValue) : undefined,
        notes,
        status,
      });

      toast.success("Conversão registrada com sucesso!");
      
      // Registrar atividade
      const leadName = allLeads?.find((l: any) => l.id === selectedLeadId)?.nome || `Lead #${selectedLeadId}`;
      await logActivityMutation.mutateAsync({
        projectId: selectedProjectId,
        activityType: "conversion",
        description: `Conversão registrada: ${leadName} - ${status === "won" ? "Ganho" : "Perdido"} - R$ ${parseFloat(dealValue || "0").toFixed(2)}`,
        metadata: JSON.stringify({ leadId: selectedLeadId, dealValue, status, notes }),
      });
      
      setShowConversionDialog(false);
      setSelectedLeadId(null);
      setDealValue("");
      setNotes("");
      setStatus("won");
      refetchMetrics();
      refetchConversions();
    } catch (error) {
      console.error("Erro ao criar conversão:", error);
      toast.error("Erro ao registrar conversão");
    }
  };

  if (!metrics) {
    return (
      <div className="min-h-screen ml-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Preparar dados para o gráfico
  const chartData = metrics.conversionsByMarket.map((m: any) => ({
    name: m.mercadoNome?.substring(0, 20) || "Sem nome",
    conversions: m.conversions,
    value: parseFloat(m.totalValue || "0"),
  }));

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Dashboard de ROI" }]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard de ROI</h1>
            <p className="text-slate-600 mt-1">Acompanhe conversões e retorno sobre investimento</p>
          </div>
          <Button onClick={() => setShowConversionDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Registrar Conversão
          </Button>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Leads</CardTitle>
              <Target className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrics.totalLeads}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Conversões</CardTitle>
              <Award className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrics.totalConversions}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrics.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Valor Médio</CardTitle>
              <DollarSign className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                R$ {metrics.averageDealValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Conversões por Mercado */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Conversões por Mercado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend />
                <Bar dataKey="conversions" fill="#3b82f6" name="Conversões" />
                <Bar dataKey="value" fill="#10b981" name="Valor Total (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela de Conversões */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Histórico de Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Lead ID</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Valor</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions?.map((conv: any) => (
                    <tr key={conv.id} className="border-b border-slate-800/50">
                      <td className="py-3 px-4 text-slate-900">{conv.leadId}</td>
                      <td className="py-3 px-4 text-slate-900">
                        {conv.dealValue ? `R$ ${parseFloat(conv.dealValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          conv.status === 'won' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {conv.status === 'won' ? 'Ganho' : 'Perdido'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(conv.convertedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{conv.notes || '-'}</td>
                    </tr>
                  ))}
                  {(!conversions || conversions.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhuma conversão registrada ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Criar Conversão */}
      <Dialog open={showConversionDialog} onOpenChange={setShowConversionDialog}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Registrar Conversão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lead" className="text-slate-700">Lead</Label>
              <select
                id="lead"
                value={selectedLeadId || ""}
                onChange={(e) => setSelectedLeadId(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900"
              >
                <option value="">Selecione um lead</option>
                {allLeads?.map((lead: any) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nome} (ID: {lead.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dealValue" className="text-slate-700">Valor do Deal (R$)</Label>
              <Input
                id="dealValue"
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="0.00"
                className="mt-1 bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-slate-700">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "won" | "lost")}
                className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900"
              >
                <option value="won">Ganho</option>
                <option value="lost">Perdido</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-700">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a conversão..."
                className="mt-1 bg-white border-slate-300 text-slate-900"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConversionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateConversion} disabled={createConversionMutation.isPending}>
              {createConversionMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
