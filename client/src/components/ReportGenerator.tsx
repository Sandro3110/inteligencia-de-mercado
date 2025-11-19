import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, Loader2, CheckCircle2, TrendingUp, Target, Users } from "lucide-react";
import { generateExecutivePDF } from "@/lib/generatePDF";

export function ReportGenerator() {
  const { selectedProjectId } = useSelectedProject();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportData, refetch, isLoading } = trpc.reports.generate.useQuery(
    { projectId: selectedProjectId! },
    { enabled: false } // Não buscar automaticamente
  );

  const handleGenerate = async () => {
    if (!selectedProjectId) {
      toast.error("Nenhum projeto selecionado");
      return;
    }

    setIsGenerating(true);
    toast.info("Gerando relatório executivo...");

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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Relatórios Executivos
          </h2>
          <p className="text-slate-400 mt-1">
            Gere relatórios PDF com análise estratégica completa
          </p>
        </div>
      </div>

      {/* Card Principal */}
      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Relatório Executivo Completo
          </CardTitle>
          <CardDescription>
            Análise estratégica com insights, top mercados, leads prioritários e análise competitiva
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conteúdo do Relatório */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-white">Sumário Executivo</h3>
              </div>
              <p className="text-sm text-slate-400">
                Estatísticas gerais do projeto com métricas-chave
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-white">Top 10 Mercados</h3>
              </div>
              <p className="text-sm text-slate-400">
                Mercados com maior volume de leads e análise competitiva
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium text-white">Leads Prioritários</h3>
              </div>
              <p className="text-sm text-slate-400">
                Top 20 leads com score ≥ 80 e informações de contato
              </p>
            </div>
          </div>

          {/* Insights Incluídos */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Insights Estratégicos Incluídos</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Percentual de leads de alta qualidade e potencial de conversão</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Recomendações de priorização por mercado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Análise de densidade competitiva e estratégias de diferenciação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Identificação de oportunidades de entrada facilitada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
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
            <p className="text-center text-sm text-slate-400">
              Selecione um projeto para gerar o relatório
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preview de Dados (se disponível) */}
      {reportData && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white text-sm">Preview dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Mercados</p>
                <p className="text-xl font-bold text-white">{reportData.summary.totalMercados}</p>
              </div>
              <div>
                <p className="text-slate-400">Clientes</p>
                <p className="text-xl font-bold text-white">{reportData.summary.totalClientes}</p>
              </div>
              <div>
                <p className="text-slate-400">Concorrentes</p>
                <p className="text-xl font-bold text-white">{reportData.summary.totalConcorrentes}</p>
              </div>
              <div>
                <p className="text-slate-400">Leads</p>
                <p className="text-xl font-bold text-white">{reportData.summary.totalLeads}</p>
              </div>
              <div>
                <p className="text-slate-400">Alta Qualidade</p>
                <p className="text-xl font-bold text-green-400">{reportData.summary.leadsHighQuality}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
