'use client';

/**
 * Modal de Recuperação de Drafts - Fase 70.2
 * Permite listar, visualizar e gerenciar rascunhos salvos de pesquisas
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { trpc } from "@/lib/trpc/client";
import {
  FileText,
  Trash2,
  Clock,
  FolderOpen,
  Loader2,
  AlertCircle,
  PlayCircle,
  Filter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DraftRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueDraft?: (draftData: any) => void;
}

export default function DraftRecoveryModal({
  open,
  onOpenChange,
  onContinueDraft,
}: DraftRecoveryModalProps) {
  const [draftToDelete, setDraftToDelete] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [projectIdFilter, setProjectIdFilter] = useState<number | undefined>();
  const [progressStatusFilter, setProgressStatusFilter] = useState<
    "started" | "in_progress" | "almost_done" | undefined
  >();
  const [daysAgoFilter, setDaysAgoFilter] = useState<number | undefined>();
  const [searchText, setSearchText] = useState("");

  // Query para listar drafts (com ou sem filtros)
  const {
    data: drafts,
    isLoading,
    refetch,
  } = trpc.drafts.getFiltered.useQuery(
    {
      projectId: projectIdFilter,
      progressStatus: progressStatusFilter,
      daysAgo: daysAgoFilter,
      searchText: searchText || undefined,
    },
    {
      enabled: open,
    }
  );

  // Mutation para deletar draft
  const deleteDraft = trpc.drafts.delete.useMutation({
    onSuccess: () => {
      toast.success("Rascunho excluído com sucesso!");
      refetch();
      setDraftToDelete(null);
    },
    onError: error => {
      toast.error("Erro ao excluir rascunho", {
        description: error.message,
      });
    },
  });

  const handleContinue = (draft: any) => {
    if (onContinueDraft) {
      onContinueDraft(draft);
      onOpenChange(false);
      toast.success("Rascunho carregado!", {
        description: "Continue de onde parou.",
      });
    }
  };

  const handleDelete = (draftId: number) => {
    setDraftToDelete(draftId);
  };

  const confirmDelete = () => {
    if (draftToDelete) {
      deleteDraft.mutate({ draftId: draftToDelete });
    }
  };

  const getStepLabel = (step: number) => {
    const labels: Record<number, string> = {
      1: "Seleção de Projeto",
      2: "Parâmetros",
      3: "Método de Entrada",
      4: "Dados",
    };
    return labels[step] || `Passo ${step}`;
  };

  const getProgressPercentage = (step: number) => {
    return (step / 4) * 100;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recuperar Rascunhos
                </DialogTitle>
                <DialogDescription>
                  Retome pesquisas que você começou mas não finalizou
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Ocultar" : "Filtros"}
              </Button>
            </div>
          </DialogHeader>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Filtros Avançados</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProjectIdFilter(undefined);
                    setProgressStatusFilter(undefined);
                    setDaysAgoFilter(undefined);
                    setSearchText("");
                  }}
                  className="gap-2 text-xs"
                >
                  <X className="w-3 h-3" />
                  Limpar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectFilter" className="text-xs">
                    Projeto
                  </Label>
                  <Input
                    id="projectFilter"
                    type="number"
                    placeholder="ID do projeto"
                    value={projectIdFilter ?? ""}
                    onChange={e =>
                      setProjectIdFilter(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statusFilter" className="text-xs">
                    Status de Progresso
                  </Label>
                  <Select
                    value={progressStatusFilter ?? "all"}
                    onValueChange={v =>
                      setProgressStatusFilter(
                        v === "all" ? undefined : (v as any)
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="started">Iniciado</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="almost_done">Quase Pronto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daysFilter" className="text-xs">
                    Período
                  </Label>
                  <Select
                    value={daysAgoFilter?.toString() ?? "all"}
                    onValueChange={v =>
                      setDaysAgoFilter(v === "all" ? undefined : Number(v))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="searchFilter" className="text-xs">
                    Buscar
                  </Label>
                  <Input
                    id="searchFilter"
                    placeholder="Buscar no conteúdo..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-600">
                {drafts && `${drafts.length} rascunho(s) encontrado(s)`}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !drafts || drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum rascunho encontrado
              </h3>
              <p className="text-muted-foreground text-sm">
                Quando você iniciar uma nova pesquisa, ela será salva
                automaticamente aqui.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-3">
                {drafts.map((draft: any) => (
                  <Card
                    key={draft.id}
                    className="hover:border-primary/50 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Pesquisa em Andamento
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {draft.updatedAt
                              ? formatDistanceToNow(new Date(draft.updatedAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })
                              : "Data desconhecida"}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          Passo {draft.currentStep}/4
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Barra de Progresso */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{getStepLabel(draft.currentStep)}</span>
                          <span>
                            {getProgressPercentage(draft.currentStep).toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{
                              width: `${getProgressPercentage(draft.currentStep)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Preview dos Dados */}
                      {draft.draftData && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {draft.projectId && (
                            <div className="flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              <span>Projeto ID: {draft.projectId}</span>
                            </div>
                          )}
                          {draft.draftData.method && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Método: {draft.draftData.method}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleContinue(draft)}
                        >
                          <PlayCircle className="w-4 h-4" />
                          Continuar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleDelete(draft.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={draftToDelete !== null}
        onOpenChange={open => !open && setDraftToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este rascunho? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
