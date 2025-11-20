import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  File,
  Clock,
  Database,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DynamicBreadcrumbs from "@/components/DynamicBreadcrumbs";

/**
 * Página de histórico de exportações
 * Lista todas as exportações realizadas com opções de download e reexecução
 */
export default function ExportHistory() {
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Buscar histórico
  const { data: history, isLoading, refetch } = trpc.export.listHistory.useQuery();

  // Mutation para deletar
  const deleteMutation = trpc.export.deleteHistory.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  // Filtrar histórico
  const filteredHistory = history?.filter(item => {
    if (selectedFormat !== "all" && item.format !== selectedFormat) return false;
    if (selectedType !== "all" && item.outputType !== selectedType) return false;
    return true;
  }) || [];

  // Ícone por formato
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="w-4 h-4" />;
      case "excel":
        return <FileSpreadsheet className="w-4 h-4" />;
      case "pdf":
        return <File className="w-4 h-4 text-red-500" />;
      case "json":
        return <Database className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Badge de tipo
  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      simple: { label: "Simples", variant: "default" },
      complete: { label: "Completa", variant: "secondary" },
      report: { label: "Relatório", variant: "outline" }
    };
    const config = variants[type] || variants.simple;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Formatar tamanho
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Formatar tempo
  const formatTime = (ms: number | null) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <DynamicBreadcrumbs />
            <h1 className="text-3xl font-bold text-slate-900 mt-2">
              Histórico de Exportações
            </h1>
            <p className="text-slate-600 mt-1">
              Visualize, baixe e reexecute exportações anteriores
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <div className="flex gap-2">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md text-sm"
              >
                <option value="all">Todos os formatos</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="simple">Lista Simples</option>
                <option value="complete">Lista Completa</option>
                <option value="report">Relatório</option>
              </select>
            </div>
            <div className="ml-auto text-sm text-slate-600">
              {filteredHistory.length} exportações encontradas
            </div>
          </div>
        </Card>

        {/* Lista de exportações */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-600">
            Carregando histórico...
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Nenhuma exportação encontrada
            </h3>
            <p className="text-slate-600">
              {selectedFormat !== "all" || selectedType !== "all"
                ? "Tente ajustar os filtros ou criar uma nova exportação"
                : "Crie sua primeira exportação usando o wizard"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    {getFormatIcon(item.format)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {item.context || "Exportação sem título"}
                      </h3>
                      {getTypeBadge(item.outputType)}
                      <Badge variant="outline" className="uppercase">
                        {item.format}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        {item.recordCount} registros
                      </span>
                      <span>•</span>
                      <span>{formatSize(item.fileSize)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.generationTime)}
                      </span>
                      <span>•</span>
                      <span>
                        {format(new Date(item.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR
                        })}
                      </span>
                    </div>

                    {/* Filtros aplicados */}
                    {item.filters && Object.keys(item.filters as any).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.filters as any).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {JSON.stringify(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(item.fileUrl, "_blank")}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // TODO: Implementar reexecução
                        alert("Reexecutar exportação: " + item.id);
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reexecutar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Deseja realmente deletar esta exportação?")) {
                          deleteMutation.mutate({ id: item.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
