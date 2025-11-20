import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Download, Loader2, CheckCircle2, TrendingUp, Target, Users, Filter } from "lucide-react";
import { generateExecutivePDF } from "@/lib/generatePDF";

export function ReportGenerator() {
  const { selectedProjectId } = useSelectedProject();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | null>(null);

  // Buscar pesquisas do projeto selecionado
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const { data: reportData, refetch, isLoading } = trpc.reports.generate.useQuery(
    { 
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId ?? undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { enabled: false } // Não buscar automaticamente
  );

  const handleGenerate = async () => {
    if (!selectedProjectId) {
      toast.error("Nenhum projeto selecionado");
      return;
    }

    setIsGenerating(true);
    const filterMsg = dateFrom || dateTo ? " (com filtros)" : "";
    toast.info(`Gerando relatório executivo${filterMsg}...`);

    try {
      const result = await refetch();
      
      if (result.data) {
        // Gerar PDF
        generateExecutivePDF(result.data);
        toast.success("Relatório PDF gerado com sucesso!");
      } else {
        toast.error("Erro ao gerar dados do relatório");
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Relatórios Executivos
          </h2>
          <p className="text-slate-600 mt-1">
            Gere relatórios PDF com análise estratégica completa
          </p>
        </div>
      </div>

      {/* Card Principal */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Relatório Executivo Completo
          </CardTitle>
          <CardDescription>
            Análise estratégica com insights, top mercados, leads prioritários e análise competitiva
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>

            {showFilters && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="font-medium text-slate-900 mb-3">Filtros do Relatório</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="pesquisa">Pesquisa</Label>
                  <select
                    id="pesquisa"
                    value={selectedPesquisaId || ""}
                    onChange={(e) => setSelectedPesquisaId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-700 bg-white"
                  >
                    <option value="">Todas as Pesquisas</option>
                    {pesquisas?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">Data Início</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">Data Fim</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>

                {(dateFrom || dateTo) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>
                      Filtros ativos: {dateFrom && `De ${new Date(dateFrom).toLocaleDateString('pt-BR')}`}
                      {dateFrom && dateTo && " "}
                      {dateTo && `Até ${new Date(dateTo).toLocaleDateString('pt-BR')}`}
                    </span>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>

          {/* Conteúdo do Relatório */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-slate-900">Sumário Executivo</h3>
              </div>
              <p className="text-sm text-slate-600">
                Estatísticas gerais do projeto com métricas-chave
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-slate-900">Top 10 Mercados</h3>
              </div>
              <p className="text-sm text-slate-600">
                Mercados com maior volume de leads e análise competitiva
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium text-slate-900">Leads Prioritários</h3>
              </div>
              <p className="text-sm text-slate-600">
                Top 20 leads com score ≥ 80 e informações de contato
              </p>
            </div>
          </div>

          {/* Insights Incluídos */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-slate-900">Insights Estratégicos Incluídos</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Percentual de leads de alta qualidade e potencial de conversão</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Recomendações de priorização por mercado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Análise de densidade competitiva e estratégias de diferenciação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Identificação de oportunidades de entrada facilitada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Sugestões de expansão de prospecção</span>
              </li>
            </ul>
          </div>

          {/* Botão de Geração */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isLoading || !selectedProjectId}
              size="lg"
              className="gap-2 px-8"
            >
              {isGenerating || isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Gerar Relatório PDF
                </>
              )}
            </Button>
          </div>

          {!selectedProjectId && (
            <p className="text-center text-sm text-slate-600">
              Selecione um projeto para gerar o relatório
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preview de Dados (se disponível) */}
      {reportData && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 text-sm">Preview dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Mercados</p>
                <p className="text-xl font-bold text-slate-900">{reportData.summary.totalMercados}</p>
              </div>
              <div>
                <p className="text-slate-600">Clientes</p>
                <p className="text-xl font-bold text-slate-900">{reportData.summary.totalClientes}</p>
              </div>
              <div>
                <p className="text-slate-600">Concorrentes</p>
                <p className="text-xl font-bold text-slate-900">{reportData.summary.totalConcorrentes}</p>
              </div>
              <div>
                <p className="text-slate-600">Leads</p>
                <p className="text-xl font-bold text-slate-900">{reportData.summary.totalLeads}</p>
              </div>
              <div>
                <p className="text-slate-600">Alta Qualidade</p>
                <p className="text-xl font-bold text-green-400">{reportData.summary.leadsHighQuality}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
