import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, X, Filter, Calendar, Sliders } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface CompararMercadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  mercadoIds: number[];
  mercados: any[];
}

export function CompararMercadosModal({
  isOpen,
  onClose,
  mercadoIds,
  mercados,
}: CompararMercadosModalProps) {
  // Estados de filtros
  const [periodoDias, setPeriodoDias] = useState<number>(30);
  const [qualidadeMinima, setQualidadeMinima] = useState<number>(0);
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [apenasCompletos, setApenasCompletos] = useState<boolean>(false);
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);

  // Buscar dados de cada mercado
  const mercadosData = mercadoIds.map((id) => {
    const mercado = mercados.find((m) => m.id === id);
    const { data: clientesData } = trpc.clientes.byMercado.useQuery(
      { mercadoId: id },
      { enabled: isOpen && !!id }
    );
    const { data: concorrentesData } = trpc.concorrentes.byMercado.useQuery(
      { mercadoId: id },
      { enabled: isOpen && !!id }
    );
    const { data: leadsData } = trpc.leads.byMercado.useQuery(
      { mercadoId: id },
      { enabled: isOpen && !!id }
    );

    let clientes = clientesData?.data || [];
    let concorrentes = concorrentesData?.data || [];
    let leads = leadsData?.data || [];

    // Aplicar filtros
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - periodoDias);

    const aplicarFiltros = (entidades: any[]) => {
      return entidades.filter((e: any) => {
        // Filtro de período
        if (e.createdAt && new Date(e.createdAt) < dataLimite) return false;

        // Filtro de qualidade mínima
        if ((e.qualidadeScore || 0) < qualidadeMinima) return false;

        // Filtro de status
        if (statusFiltro !== "todos" && e.validationStatus !== statusFiltro) return false;

        // Filtro de dados completos
        if (apenasCompletos) {
          const camposObrigatorios = ['nome', 'cnpj'];
          if (!camposObrigatorios.every(campo => e[campo])) return false;
        }

        return true;
      });
    };

    clientes = aplicarFiltros(clientes);
    concorrentes = aplicarFiltros(concorrentes);
    leads = aplicarFiltros(leads);

    // Calcular qualidade média
    const calcularQualidadeMedia = (entidades: any[]) => {
      if (entidades.length === 0) return 0;
      const total = entidades.reduce((sum, e) => {
        const score = e.qualidadeScore || 0;
        return sum + score;
      }, 0);
      return Math.round(total / entidades.length);
    };

    const qualidadeMediaClientes = calcularQualidadeMedia(clientes);
    const qualidadeMediaConcorrentes = calcularQualidadeMedia(concorrentes);
    const qualidadeMediaLeads = calcularQualidadeMedia(leads);
    const qualidadeMediaGeral = Math.round(
      (qualidadeMediaClientes + qualidadeMediaConcorrentes + qualidadeMediaLeads) / 3
    );

    return {
      mercado,
      clientes,
      concorrentes,
      leads,
      qualidadeMediaClientes,
      qualidadeMediaConcorrentes,
      qualidadeMediaLeads,
      qualidadeMediaGeral,
    };
  });

  // Preparar dados para o gráfico
  const chartData = [
    {
      metrica: "Clientes",
      ...mercadosData.reduce((acc, data, idx) => {
        acc[`Mercado ${idx + 1}`] = data.clientes.length;
        return acc;
      }, {} as any),
    },
    {
      metrica: "Concorrentes",
      ...mercadosData.reduce((acc, data, idx) => {
        acc[`Mercado ${idx + 1}`] = data.concorrentes.length;
        return acc;
      }, {} as any),
    },
    {
      metrica: "Leads",
      ...mercadosData.reduce((acc, data, idx) => {
        acc[`Mercado ${idx + 1}`] = data.leads.length;
        return acc;
      }, {} as any),
    },
    {
      metrica: "Qualidade Média",
      ...mercadosData.reduce((acc, data, idx) => {
        acc[`Mercado ${idx + 1}`] = data.qualidadeMediaGeral;
        return acc;
      }, {} as any),
    },
  ];

  const colors = ["#3b82f6", "#10b981", "#f59e0b"];

  const handleExportPDF = () => {
    toast.info("Exportação em PDF será implementada em breve");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Comparação de Mercados</DialogTitle>
              <DialogDescription>
                Comparando {mercadoIds.length} mercados selecionados
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {(periodoDias !== 30 || qualidadeMinima > 0 || statusFiltro !== "todos" || apenasCompletos) && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    !
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Painel de Filtros */}
        {mostrarFiltros && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro de Período */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Período
                </Label>
                <Select
                  value={periodoDias.toString()}
                  onValueChange={(v) => setPeriodoDias(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="999999">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Qualidade Mínima */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Qualidade Mínima: {qualidadeMinima}%
                </Label>
                <Slider
                  value={[qualidadeMinima]}
                  onValueChange={(v) => setQualidadeMinima(v[0])}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              {/* Filtro de Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="rich">Validados</SelectItem>
                    <SelectItem value="discarded">Descartados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Dados Completos */}
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    checked={apenasCompletos}
                    onCheckedChange={setApenasCompletos}
                  />
                  <Label className="text-sm cursor-pointer" onClick={() => setApenasCompletos(!apenasCompletos)}>
                    Apenas completos
                  </Label>
                </div>
              </div>
            </div>

            {/* Botão Limpar Filtros */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPeriodoDias(30);
                  setQualidadeMinima(0);
                  setStatusFiltro("todos");
                  setApenasCompletos(false);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6 mt-4">
          {/* Cards de Mercados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mercadosData.map((data, idx) => (
              <div
                key={data.mercado?.id}
                className="p-4 rounded-lg border-2"
                style={{ borderColor: colors[idx] }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base line-clamp-1">
                    {data.mercado?.nome}
                  </h3>
                  <Badge
                    variant="outline"
                    style={{ borderColor: colors[idx], color: colors[idx] }}
                  >
                    Mercado {idx + 1}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Segmentação:</span>
                    <span className="font-medium">{data.mercado?.segmentacao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clientes:</span>
                    <span className="font-medium">{data.clientes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concorrentes:</span>
                    <span className="font-medium">{data.concorrentes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leads:</span>
                    <span className="font-medium">{data.leads.length}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Qualidade Média:</span>
                    <span className="font-semibold" style={{ color: colors[idx] }}>
                      {data.qualidadeMediaGeral}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico Comparativo */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Comparação Visual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metrica" />
                <YAxis />
                <Tooltip />
                <Legend />
                {mercadosData.map((_, idx) => (
                  <Bar
                    key={idx}
                    dataKey={`Mercado ${idx + 1}`}
                    fill={colors[idx]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela Comparativa Detalhada */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Métricas Detalhadas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Métrica</th>
                    {mercadosData.map((data, idx) => (
                      <th
                        key={idx}
                        className="text-center py-2 px-3"
                        style={{ color: colors[idx] }}
                      >
                        Mercado {idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3 text-muted-foreground">Total de Clientes</td>
                    {mercadosData.map((data, idx) => (
                      <td key={idx} className="text-center py-2 px-3 font-medium">
                        {data.clientes.length}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 text-muted-foreground">Total de Concorrentes</td>
                    {mercadosData.map((data, idx) => (
                      <td key={idx} className="text-center py-2 px-3 font-medium">
                        {data.concorrentes.length}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 text-muted-foreground">Total de Leads</td>
                    {mercadosData.map((data, idx) => (
                      <td key={idx} className="text-center py-2 px-3 font-medium">
                        {data.leads.length}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 text-muted-foreground">
                      Leads por Cliente
                    </td>
                    {mercadosData.map((data, idx) => (
                      <td key={idx} className="text-center py-2 px-3 font-medium">
                        {data.clientes.length > 0
                          ? (data.leads.length / data.clientes.length).toFixed(1)
                          : "0"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 text-muted-foreground">
                      Concorrentes por Cliente
                    </td>
                    {mercadosData.map((data, idx) => (
                      <td key={idx} className="text-center py-2 px-3 font-medium">
                        {data.clientes.length > 0
                          ? (data.concorrentes.length / data.clientes.length).toFixed(1)
                          : "0"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="py-2 px-3 font-medium">Qualidade Média Clientes</td>
                    {mercadosData.map((data, idx) => (
                      <td
                        key={idx}
                        className="text-center py-2 px-3 font-semibold"
                        style={{ color: colors[idx] }}
                      >
                        {data.qualidadeMediaClientes}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="py-2 px-3 font-medium">Qualidade Média Concorrentes</td>
                    {mercadosData.map((data, idx) => (
                      <td
                        key={idx}
                        className="text-center py-2 px-3 font-semibold"
                        style={{ color: colors[idx] }}
                      >
                        {data.qualidadeMediaConcorrentes}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="py-2 px-3 font-medium">Qualidade Média Leads</td>
                    {mercadosData.map((data, idx) => (
                      <td
                        key={idx}
                        className="text-center py-2 px-3 font-semibold"
                        style={{ color: colors[idx] }}
                      >
                        {data.qualidadeMediaLeads}%
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="py-2 px-3 font-bold">Qualidade Média Geral</td>
                    {mercadosData.map((data, idx) => (
                      <td
                        key={idx}
                        className="text-center py-2 px-3 font-bold text-lg"
                        style={{ color: colors[idx] }}
                      >
                        {data.qualidadeMediaGeral}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
