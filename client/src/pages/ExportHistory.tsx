import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Trash2, FileText, FileSpreadsheet, FileIcon, Calendar, Clock, HardDrive } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ExportHistory() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, refetch } = trpc.export.listHistory.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  const deleteMutation = trpc.export.deleteHistory.useMutation({
    onSuccess: () => {
      toast.success("Histórico deletado com sucesso!");
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <FileIcon className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  const getFormatBadge = (format: string) => {
    const colors: Record<string, string> = {
      csv: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      excel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      pdf: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[format] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadge = (type: string) => {
    return type === "list" ? "Lista" : "Relatório";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const history = data?.history || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Histórico de Exportações</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as suas exportações anteriores
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Exportações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Registros Exportados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.reduce((sum, item) => sum + (item.recordCount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Espaço Utilizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(history.reduce((sum, item) => sum + (item.fileSize || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Exportações Recentes</CardTitle>
          <CardDescription>
            {total > 0 ? `Mostrando ${page * pageSize + 1}-${Math.min((page + 1) * pageSize, total)} de ${total}` : "Nenhuma exportação encontrada"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma exportação realizada ainda</p>
              <p className="text-sm mt-2">Suas exportações aparecerão aqui</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contexto</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Registros</TableHead>
                    <TableHead className="text-right">Tamanho</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getFormatIcon(item.format)}
                          <span className="max-w-xs truncate">
                            {item.context || "Exportação sem título"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getFormatBadge(item.format)}>
                          {item.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeBadge(item.outputType)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.recordCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <HardDrive className="h-3 w-3 text-muted-foreground" />
                          {formatFileSize(item.fileSize || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </div>
                        {item.generationTime && item.generationTime > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {item.generationTime}s
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.fileUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => item.fileUrl && window.open(item.fileUrl, "_blank")}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page + 1} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Deleção */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este histórico de exportação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ historyId: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
