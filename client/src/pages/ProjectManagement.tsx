/**
 * Página de Gerenciamento de Projetos
 * Fase 57: Sistema de Hibernação de Projetos
 *
 * Funcionalidades disponíveis:
 * - Listar todos os projetos (ativos e adormecidos)
 * - Criar novos projetos
 * - Editar projetos existentes
 * - Hibernar projetos (modo somente leitura)
 * - Reativar projetos adormecidos
 * - Deletar projetos vazios
 * - Filtrar por status
 * - Visualizar estatísticas
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  FolderPlus,
  Edit,
  Trash2,
  Moon,
  Sun,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Folder,
  Filter,
  Copy,
  History,
} from "lucide-react";
import { toast } from "sonner";

type FilterStatus = "all" | "active" | "hibernated";

export default function ProjectManagement() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHibernateDialog, setShowHibernateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Form states
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectColor, setProjectColor] = useState("#3b82f6");
  const [duplicateName, setDuplicateName] = useState("");
  const [copyMarkets, setCopyMarkets] = useState(false);

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto criado com sucesso!");
      refetch();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: error => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Projeto atualizado com sucesso!");
      refetch();
      setShowEditDialog(false);
      resetForm();
    },
    onError: error => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    },
  });

  const deleteMutation = trpc.projects.deleteEmpty.useMutation({
    onSuccess: () => {
      toast.success("Projeto deletado com sucesso!");
      refetch();
      setShowDeleteDialog(false);
      setSelectedProject(null);
    },
    onError: error => {
      toast.error(`Erro ao deletar projeto: ${error.message}`);
    },
  });

  const hibernateMutation = trpc.projects.hibernate.useMutation({
    onSuccess: () => {
      toast.success("Projeto adormecido com sucesso!");
      refetch();
      setShowHibernateDialog(false);
      setSelectedProject(null);
    },
    onError: error => {
      toast.error(`Erro ao adormecer projeto: ${error.message}`);
    },
  });

  const reactivateMutation = trpc.projects.reactivate.useMutation({
    onSuccess: () => {
      toast.success("Projeto reativado com sucesso!");
      refetch();
    },
    onError: error => {
      toast.error(`Erro ao reativar projeto: ${error.message}`);
    },
  });

  const duplicateMutation = trpc.projects.duplicate.useMutation({
    onSuccess: data => {
      toast.success("Projeto duplicado com sucesso!");
      refetch();
      setShowDuplicateDialog(false);
      setDuplicateName("");
      setCopyMarkets(false);
      setSelectedProject(null);
    },
    onError: error => {
      toast.error(`Erro ao duplicar projeto: ${error.message}`);
    },
  });

  const { data: auditLog, isLoading: auditLoading } =
    trpc.projects.getAuditLog.useQuery(
      { projectId: selectedProject?.id || 0, limit: 50 },
      { enabled: showHistoryDialog && !!selectedProject }
    );

  const { data: canDeleteData } = trpc.projects.canDelete.useQuery(
    selectedProject?.id || 0,
    { enabled: showDeleteDialog && !!selectedProject }
  );

  const resetForm = () => {
    setProjectName("");
    setProjectDesc("");
    setProjectColor("#3b82f6");
    setSelectedProject(null);
  };

  const handleCreate = () => {
    if (!projectName.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    createMutation.mutate({
      nome: projectName,
      descricao: projectDesc || undefined,
      cor: projectColor,
    });
  };

  const handleUpdate = () => {
    if (!selectedProject) {
      return;
    }

    if (!projectName.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    updateMutation.mutate({
      id: selectedProject.id,
      nome: projectName,
      descricao: projectDesc || undefined,
      cor: projectColor,
    });
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setProjectName(project.nome);
    setProjectDesc(project.descricao || "");
    setProjectColor(project.cor || "#3b82f6");
    setShowEditDialog(true);
  };

  const openDuplicateDialog = (project: any) => {
    setSelectedProject(project);
    setDuplicateName(`Cópia de ${project.nome}`);
    setCopyMarkets(false);
    setShowDuplicateDialog(true);
  };

  const openHistoryDialog = (project: any) => {
    setSelectedProject(project);
    setShowHistoryDialog(true);
  };

  const handleDuplicate = () => {
    if (!selectedProject || !duplicateName.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    duplicateMutation.mutate({
      projectId: selectedProject.id,
      newName: duplicateName,
      copyMarkets,
    });
  };

  const openDeleteDialog = (project: any) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  const openHibernateDialog = (project: any) => {
    setSelectedProject(project);
    setShowHibernateDialog(true);
  };

  const filteredProjects =
    projects?.filter(p => {
      if (filterStatus === "all") {
        return true;
      }
      return p.status === filterStatus;
    }) || [];

  const stats = {
    total: projects?.length || 0,
    active: projects?.filter(p => p.status === "active").length || 0,
    hibernated: projects?.filter(p => p.status === "hibernated").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Projetos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os seus projetos de pesquisa de mercado
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-gray-400" />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-3xl font-bold text-green-600">
                {stats.active}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Projetos Adormecidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-500" />
              <span className="text-3xl font-bold text-blue-600">
                {stats.hibernated}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todos ({stats.total})
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
              className={
                filterStatus === "active"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Ativos ({stats.active})
            </Button>
            <Button
              variant={filterStatus === "hibernated" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("hibernated")}
              className={
                filterStatus === "hibernated"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : ""
              }
            >
              <Moon className="w-4 h-4 mr-1" />
              Adormecidos ({stats.hibernated})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {filterStatus === "all"
                  ? "Nenhum projeto encontrado. Crie seu primeiro projeto!"
                  : `Nenhum projeto ${filterStatus === "active" ? "ativo" : "adormecido"} encontrado.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map(project => (
            <Card key={project.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.cor || "#3b82f6" }}
                    />
                    <div>
                      <CardTitle className="text-lg">{project.nome}</CardTitle>
                      {project.descricao && (
                        <CardDescription className="mt-1">
                          {project.descricao}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      project.status === "active" ? "default" : "secondary"
                    }
                    className={
                      project.status === "active"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-blue-100 text-blue-800 border-blue-300"
                    }
                  >
                    {project.status === "active" ? "✓ Ativo" : "💤 Adormecido"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(project)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>

                  {project.status === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openHibernateDialog(project)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                    >
                      <Moon className="w-4 h-4 mr-1" />
                      Adormecer
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reactivateMutation.mutate(project.id)}
                      disabled={reactivateMutation.isPending}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                    >
                      <Sun className="w-4 h-4 mr-1" />
                      {reactivateMutation.isPending
                        ? "Reativando..."
                        : "Reativar"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDuplicateDialog(project)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-300"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openHistoryDialog(project)}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <History className="w-4 h-4 mr-1" />
                    Histórico
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(project)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Ex: Embalagens"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição (opcional)</Label>
              <Textarea
                id="desc"
                value={projectDesc}
                onChange={e => setProjectDesc(e.target.value)}
                placeholder="Descreva o objetivo deste projeto..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor do Projeto</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={projectColor}
                  onChange={e => setProjectColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-gray-600">{projectColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Projeto"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize as informações do projeto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Projeto *</Label>
              <Input
                id="edit-name"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descrição (opcional)</Label>
              <Textarea
                id="edit-desc"
                value={projectDesc}
                onChange={e => setProjectDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-color">Cor do Projeto</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="edit-color"
                  type="color"
                  value={projectColor}
                  onChange={e => setProjectColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-gray-600">{projectColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hibernate Dialog */}
      <AlertDialog
        open={showHibernateDialog}
        onOpenChange={setShowHibernateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adormecer Projeto?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                O projeto <strong>{selectedProject?.nome}</strong> ficará em
                modo somente leitura.
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Você poderá visualizar todos os dados</li>
                <li>Não será possível criar novas pesquisas</li>
                <li>Não será possível editar dados existentes</li>
                <li>Você pode reativar o projeto a qualquer momento</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProject) {
                  hibernateMutation.mutate(selectedProject.id);
                }
              }}
              disabled={hibernateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {hibernateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adormecendo...
                </>
              ) : (
                "Confirmar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Projeto</DialogTitle>
            <DialogDescription>
              Crie uma cópia do projeto <strong>{selectedProject?.nome}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">Nome do Novo Projeto *</Label>
              <Input
                id="duplicate-name"
                value={duplicateName}
                onChange={e => setDuplicateName(e.target.value)}
                placeholder="Ex: Cópia de Embalagens"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="copy-markets"
                checked={copyMarkets}
                onChange={e => setCopyMarkets(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="copy-markets" className="cursor-pointer">
                Copiar mercados únicos (sem dados de pesquisas)
              </Label>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ O que será copiado:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Nome, descrição e cor do projeto</li>
                <li>Configurações gerais</li>
                {copyMarkets && <li>Mercados únicos (estrutura, sem dados)</li>}
              </ul>
              <p className="mt-2 text-xs">
                <strong>Não será copiado:</strong> Pesquisas, clientes,
                concorrentes, leads
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDuplicateDialog(false);
                setDuplicateName("");
                setCopyMarkets(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={duplicateMutation.isPending || !duplicateName.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {duplicateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Duplicando...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar Projeto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico do Projeto</DialogTitle>
            <DialogDescription>
              Todas as mudanças realizadas em{" "}
              <strong>{selectedProject?.nome}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {auditLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : auditLog && auditLog.logs.length > 0 ? (
              <div className="space-y-4">
                {auditLog.logs.map((log: any) => {
                  const actionLabels: Record<
                    string,
                    { label: string; color: string; icon: string }
                  > = {
                    created: {
                      label: "Criado",
                      color: "bg-green-100 text-green-800 border-green-300",
                      icon: "➕",
                    },
                    updated: {
                      label: "Atualizado",
                      color: "bg-blue-100 text-blue-800 border-blue-300",
                      icon: "✏️",
                    },
                    hibernated: {
                      label: "Adormecido",
                      color: "bg-purple-100 text-purple-800 border-purple-300",
                      icon: "💤",
                    },
                    reactivated: {
                      label: "Reativado",
                      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
                      icon: "☀️",
                    },
                    deleted: {
                      label: "Deletado",
                      color: "bg-red-100 text-red-800 border-red-300",
                      icon: "🗑️",
                    },
                  };

                  const actionInfo = actionLabels[log.action] || {
                    label: log.action,
                    color: "bg-gray-100 text-gray-800",
                    icon: "•",
                  };

                  return (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={actionInfo.color}>
                            {actionInfo.icon} {actionInfo.label}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(log.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {log.userId && (
                          <span className="text-xs text-gray-500">
                            Usuário: {log.userId}
                          </span>
                        )}
                      </div>

                      {log.changes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <p className="font-semibold mb-1">Mudanças:</p>
                          <pre className="whitespace-pre-wrap text-gray-700">
                            {JSON.stringify(JSON.parse(log.changes), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}

                {auditLog.total > 50 && (
                  <p className="text-center text-sm text-gray-500 pt-4">
                    Mostrando 50 de {auditLog.total} registros
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum histórico encontrado</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowHistoryDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Projeto?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {canDeleteData ? (
                canDeleteData.canDelete ? (
                  <>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800 font-semibold mb-2">
                        ⚠️ Este projeto está vazio e pode ser deletado
                        permanentemente.
                      </p>
                      <p className="text-xs text-yellow-700">
                        Pesquisas: {canDeleteData.stats?.pesquisas || 0} |
                        Clientes: {canDeleteData.stats?.clientes || 0} |
                        Mercados: {canDeleteData.stats?.mercados || 0}
                      </p>
                    </div>
                    <p className="text-sm">
                      Esta ação não pode ser desfeita. O projeto{" "}
                      <strong>{selectedProject?.nome}</strong> será removido
                      permanentemente.
                    </p>
                  </>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800 font-semibold mb-2">
                      ❌ Este projeto não pode ser deletado
                    </p>
                    <p className="text-xs text-red-700">
                      {canDeleteData.reason}
                    </p>
                    {canDeleteData.stats && (
                      <p className="text-xs text-red-700 mt-2">
                        Pesquisas: {canDeleteData.stats.pesquisas} | Clientes:{" "}
                        {canDeleteData.stats.clientes} | Mercados:{" "}
                        {canDeleteData.stats.mercados}
                      </p>
                    )}
                  </div>
                )
              ) : (
                <p>Verificando se o projeto pode ser deletado...</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {canDeleteData?.canDelete && (
              <AlertDialogAction
                onClick={() => {
                  if (selectedProject) {
                    deleteMutation.mutate(selectedProject.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  "Deletar Permanentemente"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
