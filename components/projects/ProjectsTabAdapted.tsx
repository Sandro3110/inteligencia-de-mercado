'use client';

/**
 * Aba de Projetos - Gestão de Projetos
 * Gerenciamento completo de projetos (criar, editar, hibernar, deletar, duplicar)
 */

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// CONSTANTS
// ============================================================================

const FILTER_STATUS_OPTIONS = ['all', 'active', 'hibernated'] as const;
const DEFAULT_FILTER_STATUS = 'all';
const DEFAULT_PROJECT_COLOR = '#3b82f6';

const TOAST_MESSAGES = {
  CREATE_SUCCESS: 'Projeto criado com sucesso!',
  UPDATE_SUCCESS: 'Projeto atualizado com sucesso!',
  DELETE_SUCCESS: 'Projeto deletado com sucesso!',
  HIBERNATE_SUCCESS: 'Projeto adormecido com sucesso!',
  REACTIVATE_SUCCESS: 'Projeto reativado com sucesso!',
  DUPLICATE_SUCCESS: 'Projeto duplicado com sucesso!',
  CREATE_ERROR: (error: string) => `Erro ao criar projeto: ${error}`,
  UPDATE_ERROR: (error: string) => `Erro ao atualizar projeto: ${error}`,
  DELETE_ERROR: (error: string) => `Erro ao deletar projeto: ${error}`,
  HIBERNATE_ERROR: (error: string) => `Erro ao adormecer projeto: ${error}`,
  REACTIVATE_ERROR: (error: string) => `Erro ao reativar projeto: ${error}`,
  DUPLICATE_ERROR: (error: string) => `Erro ao duplicar projeto: ${error}`,
  NAME_REQUIRED: 'Nome do projeto é obrigatório',
  DUPLICATE_NAME_REQUIRED: 'Nome do novo projeto é obrigatório',
};

const CARD_LABELS = {
  TOTAL: 'Total de Projetos',
  ACTIVE: 'Projetos Ativos',
  HIBERNATED: 'Projetos Hibernados',
};

const DIALOG_TITLES = {
  CREATE: 'Criar Novo Projeto',
  EDIT: 'Editar Projeto',
  DUPLICATE: 'Duplicar Projeto',
  HIBERNATE: 'Hibernar Projeto',
  DELETE: 'Deletar Projeto',
};

const DIALOG_DESCRIPTIONS = {
  CREATE: 'Preencha as informações do novo projeto',
  EDIT: 'Atualize as informações do projeto',
  DUPLICATE: (name: string) => `Crie uma cópia do projeto "${name}"`,
  HIBERNATE: (name: string) =>
    `Tem certeza que deseja hibernar o projeto "${name}"?\n\nO projeto ficará em modo somente leitura e não poderá ser editado até ser reativado.`,
  DELETE: (name: string) =>
    `Tem certeza que deseja deletar o projeto "${name}"?\n\nEsta ação não pode ser desfeita. Apenas projetos vazios podem ser deletados.`,
};

const FORM_LABELS = {
  PROJECT_NAME: 'Nome do Projeto *',
  DESCRIPTION: 'Descrição',
  COLOR: 'Cor',
  NEW_PROJECT_NAME: 'Nome do Novo Projeto *',
  COPY_MARKETS: 'Copiar mercados únicos relacionados',
};

const FORM_PLACEHOLDERS = {
  PROJECT_NAME: 'Ex: Projeto Embalagens 2025',
  DESCRIPTION: 'Descrição opcional do projeto',
};

const BUTTON_LABELS = {
  NEW_PROJECT: 'Novo Projeto',
  CREATE: 'Criar Projeto',
  SAVE: 'Salvar Alterações',
  DUPLICATE: 'Duplicar Projeto',
  HIBERNATE: 'Hibernar Projeto',
  DELETE: 'Deletar Projeto',
  CANCEL: 'Cancelar',
  EDIT: 'Editar',
  DUPLICATE_SHORT: 'Duplicar',
  VIEW_RESEARCH: 'Ver Pesquisas',
  HIBERNATE_SHORT: 'Hibernar',
  REACTIVATE: 'Reativar',
  HISTORY: 'Histórico',
};

const EMPTY_STATE_MESSAGES = {
  NO_PROJECTS: 'Nenhum projeto encontrado. Crie seu primeiro projeto!',
  NO_ACTIVE: 'Nenhum projeto ativo encontrado.',
  NO_HIBERNATED: 'Nenhum projeto hibernado encontrado.',
};

const BADGE_LABELS = {
  ACTIVE: 'Ativo',
  HIBERNATED: 'Hibernado',
};

const DUPLICATE_NAME_PREFIX = 'Cópia de ';

// ============================================================================
// TYPES
// ============================================================================

type FilterStatus = (typeof FILTER_STATUS_OPTIONS)[number];

interface Project {
  id: number;
  nome: string;
  descricao?: string | null;
  cor?: string | null;
  status: string;
  lastActivityAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  ativo?: number;
  executionMode?: string | null;
  maxParallelJobs?: number | null;
  isPaused?: number | null;
}

interface ProjectsTabProps {
  onShowHistory?: (projectId: number) => void;
}

interface ProjectStats {
  total: number;
  active: number;
  hibernated: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateStats(projects: Project[] | undefined): ProjectStats {
  if (!projects) {
    return { total: 0, active: 0, hibernated: 0 };
  }

  return {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    hibernated: projects.filter((p) => p.status === 'hibernated').length,
  };
}

function filterProjects(
  projects: Project[] | undefined,
  status: FilterStatus
): Project[] {
  if (!projects) return [];
  if (status === 'all') return projects;
  return projects.filter((p) => p.status === status);
}

function getEmptyStateMessage(status: FilterStatus): string {
  switch (status) {
    case 'all':
      return EMPTY_STATE_MESSAGES.NO_PROJECTS;
    case 'active':
      return EMPTY_STATE_MESSAGES.NO_ACTIVE;
    case 'hibernated':
      return EMPTY_STATE_MESSAGES.NO_HIBERNATED;
    default:
      return EMPTY_STATE_MESSAGES.NO_PROJECTS;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProjectsTab({ onShowHistory }: ProjectsTabProps) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] =
    useState<FilterStatus>(DEFAULT_FILTER_STATUS);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHibernateDialog, setShowHibernateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectColor, setProjectColor] = useState(DEFAULT_PROJECT_COLOR);
  const [duplicateName, setDuplicateName] = useState('');
  const [copyMarkets, setCopyMarkets] = useState(false);

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.CREATE_SUCCESS);
      refetch();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.CREATE_ERROR(error.message));
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
      refetch();
      setShowEditDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.UPDATE_ERROR(error.message));
    },
  });

  const deleteMutation = trpc.projects.deleteEmpty.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      refetch();
      setShowDeleteDialog(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.DELETE_ERROR(error.message));
    },
  });

  const hibernateMutation = trpc.projects.hibernate.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.HIBERNATE_SUCCESS);
      refetch();
      setShowHibernateDialog(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.HIBERNATE_ERROR(error.message));
    },
  });

  const reactivateMutation = trpc.projects.reactivate.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.REACTIVATE_SUCCESS);
      refetch();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.REACTIVATE_ERROR(error.message));
    },
  });

  const duplicateMutation = trpc.projects.duplicate.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.DUPLICATE_SUCCESS);
      refetch();
      setShowDuplicateDialog(false);
      setDuplicateName('');
      setCopyMarkets(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.DUPLICATE_ERROR(error.message));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => calculateStats(projects), [projects]);

  const filteredProjects = useMemo(
    () => filterProjects(projects, filterStatus),
    [projects, filterStatus]
  );

  const hasProjects = useMemo(
    () => filteredProjects.length > 0,
    [filteredProjects]
  );

  const emptyStateMessage = useMemo(
    () => getEmptyStateMessage(filterStatus),
    [filterStatus]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const resetForm = useCallback(() => {
    setProjectName('');
    setProjectDesc('');
    setProjectColor(DEFAULT_PROJECT_COLOR);
    setSelectedProject(null);
  }, []);

  const handleCreate = useCallback(() => {
    if (!projectName.trim()) {
      toast.error(TOAST_MESSAGES.NAME_REQUIRED);
      return;
    }
    createMutation.mutate({
      nome: projectName,
      descricao: projectDesc || undefined,
      cor: projectColor,
    });
  }, [projectName, projectDesc, projectColor, createMutation]);

  const handleUpdate = useCallback(() => {
    if (!selectedProject || !projectName.trim()) {
      toast.error(TOAST_MESSAGES.NAME_REQUIRED);
      return;
    }
    updateMutation.mutate({
      id: selectedProject.id,
      nome: projectName,
      descricao: projectDesc || undefined,
      cor: projectColor,
    });
  }, [selectedProject, projectName, projectDesc, projectColor, updateMutation]);

  const handleDelete = useCallback(() => {
    if (!selectedProject) return;
    deleteMutation.mutate(selectedProject.id);
  }, [selectedProject, deleteMutation]);

  const handleHibernate = useCallback(() => {
    if (!selectedProject) return;
    hibernateMutation.mutate(selectedProject.id);
  }, [selectedProject, hibernateMutation]);

  const handleReactivate = useCallback(
    (projectId: number) => {
      reactivateMutation.mutate(projectId);
    },
    [reactivateMutation]
  );

  const handleDuplicate = useCallback(() => {
    if (!selectedProject || !duplicateName.trim()) {
      toast.error(TOAST_MESSAGES.DUPLICATE_NAME_REQUIRED);
      return;
    }
    duplicateMutation.mutate({
      projectId: selectedProject.id,
      newName: duplicateName,
      copyMarkets,
    });
  }, [selectedProject, duplicateName, copyMarkets, duplicateMutation]);

  const openEditDialog = useCallback((project: Project) => {
    setSelectedProject(project);
    setProjectName(project.nome);
    setProjectDesc(project.descricao || '');
    setProjectColor(project.cor || DEFAULT_PROJECT_COLOR);
    setShowEditDialog(true);
  }, []);

  const openDuplicateDialog = useCallback((project: Project) => {
    setSelectedProject(project);
    setDuplicateName(`${DUPLICATE_NAME_PREFIX}${project.nome}`);
    setCopyMarkets(false);
    setShowDuplicateDialog(true);
  }, []);

  const openHibernateDialog = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowHibernateDialog(true);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilterStatus(value as FilterStatus);
  }, []);

  const handleNavigateToPesquisas = useCallback(
    (projectId: number) => {
      router.push(`/pesquisas?projectId=${projectId}`);
    },
    [router]
  );

  const handleShowHistory = useCallback(
    (projectId: number) => {
      if (onShowHistory) {
        onShowHistory(projectId);
      }
    },
    [onShowHistory]
  );

  const handleOpenCreateDialog = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setShowCreateDialog(false);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setShowEditDialog(false);
  }, []);

  const handleCloseDuplicateDialog = useCallback(() => {
    setShowDuplicateDialog(false);
  }, []);

  const handleProjectNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProjectName(e.target.value);
    },
    []
  );

  const handleProjectDescChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setProjectDesc(e.target.value);
    },
    []
  );

  const handleProjectColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProjectColor(e.target.value);
    },
    []
  );

  const handleDuplicateNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDuplicateName(e.target.value);
    },
    []
  );

  const handleCopyMarketsChange = useCallback((checked: boolean) => {
    setCopyMarkets(checked);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {CARD_LABELS.TOTAL}
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {CARD_LABELS.ACTIVE}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {CARD_LABELS.HIBERNATED}
            </CardTitle>
            <Moon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.hibernated}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({stats.total})</SelectItem>
              <SelectItem value="active">Ativos ({stats.active})</SelectItem>
              <SelectItem value="hibernated">
                Hibernados ({stats.hibernated})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleOpenCreateDialog}>
          <FolderPlus className="h-4 w-4 mr-2" />
          {BUTTON_LABELS.NEW_PROJECT}
        </Button>
      </div>

      {/* Lista de Projetos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hasProjects ? (
          filteredProjects.map((project) => (
            <Card key={project.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: project.cor || DEFAULT_PROJECT_COLOR,
                      }}
                    />
                    <CardTitle className="text-lg">{project.nome}</CardTitle>
                  </div>
                  {project.status === 'hibernated' ? (
                    <Badge variant="secondary" className="gap-1">
                      <Moon className="h-3 w-3" />
                      {BADGE_LABELS.HIBERNATED}
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {BADGE_LABELS.ACTIVE}
                    </Badge>
                  )}
                </div>
                {project.descricao && (
                  <CardDescription className="line-clamp-2">
                    {project.descricao}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {project.lastActivityAt && (
                  <p className="text-xs text-muted-foreground">
                    Última atividade:{' '}
                    {formatDistanceToNow(new Date(project.lastActivityAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.status === 'active' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(project)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {BUTTON_LABELS.EDIT}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDuplicateDialog(project)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {BUTTON_LABELS.DUPLICATE_SHORT}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigateToPesquisas(project.id)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {BUTTON_LABELS.VIEW_RESEARCH}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openHibernateDialog(project)}
                      >
                        <Moon className="h-3 w-3 mr-1" />
                        {BUTTON_LABELS.HIBERNATE_SHORT}
                      </Button>
                      {onShowHistory && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowHistory(project.id)}
                        >
                          <History className="h-3 w-3 mr-1" />
                          {BUTTON_LABELS.HISTORY}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleReactivate(project.id)}
                      disabled={reactivateMutation.isPending}
                    >
                      <Sun className="h-3 w-3 mr-1" />
                      {BUTTON_LABELS.REACTIVATE}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{emptyStateMessage}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog: Criar Projeto */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DIALOG_TITLES.CREATE}</DialogTitle>
            <DialogDescription>
              {DIALOG_DESCRIPTIONS.CREATE}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{FORM_LABELS.PROJECT_NAME}</Label>
              <Input
                id="name"
                value={projectName}
                onChange={handleProjectNameChange}
                placeholder={FORM_PLACEHOLDERS.PROJECT_NAME}
              />
            </div>
            <div>
              <Label htmlFor="desc">{FORM_LABELS.DESCRIPTION}</Label>
              <Textarea
                id="desc"
                value={projectDesc}
                onChange={handleProjectDescChange}
                placeholder={FORM_PLACEHOLDERS.DESCRIPTION}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="color">{FORM_LABELS.COLOR}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={projectColor}
                  onChange={handleProjectColorChange}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">
                  {projectColor}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDialog}>
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {BUTTON_LABELS.CREATE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Projeto */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DIALOG_TITLES.EDIT}</DialogTitle>
            <DialogDescription>{DIALOG_DESCRIPTIONS.EDIT}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">{FORM_LABELS.PROJECT_NAME}</Label>
              <Input
                id="edit-name"
                value={projectName}
                onChange={handleProjectNameChange}
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">{FORM_LABELS.DESCRIPTION}</Label>
              <Textarea
                id="edit-desc"
                value={projectDesc}
                onChange={handleProjectDescChange}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-color">{FORM_LABELS.COLOR}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={projectColor}
                  onChange={handleProjectColorChange}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">
                  {projectColor}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {BUTTON_LABELS.SAVE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Duplicar Projeto */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DIALOG_TITLES.DUPLICATE}</DialogTitle>
            <DialogDescription>
              {selectedProject &&
                DIALOG_DESCRIPTIONS.DUPLICATE(selectedProject.nome)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dup-name">{FORM_LABELS.NEW_PROJECT_NAME}</Label>
              <Input
                id="dup-name"
                value={duplicateName}
                onChange={handleDuplicateNameChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-markets"
                checked={copyMarkets}
                onCheckedChange={(checked) =>
                  handleCopyMarketsChange(checked as boolean)
                }
              />
              <Label htmlFor="copy-markets" className="cursor-pointer">
                {FORM_LABELS.COPY_MARKETS}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDuplicateDialog}>
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {BUTTON_LABELS.DUPLICATE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Hibernar Projeto */}
      <AlertDialog
        open={showHibernateDialog}
        onOpenChange={setShowHibernateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DIALOG_TITLES.HIBERNATE}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProject &&
                DIALOG_DESCRIPTIONS.HIBERNATE(selectedProject.nome)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{BUTTON_LABELS.CANCEL}</AlertDialogCancel>
            <AlertDialogAction onClick={handleHibernate}>
              {BUTTON_LABELS.HIBERNATE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Deletar Projeto */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DIALOG_TITLES.DELETE}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProject &&
                DIALOG_DESCRIPTIONS.DELETE(selectedProject.nome)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{BUTTON_LABELS.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              {BUTTON_LABELS.DELETE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
