'use client';

/**
 * Step1SelectProject - Seleção de Projeto para Pesquisa
 * Permite selecionar, criar, adormecer, reativar e deletar projetos
 */

import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderPlus, X, Moon, Sun, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import type { ResearchWizardData } from '@/types/research-wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const PROJECT_STATUS = {
  ACTIVE: 'active',
  HIBERNATED: 'hibernated',
} as const;

const LABELS = {
  PAGE_TITLE: 'Selecione o Projeto',
  PAGE_DESCRIPTION: 'Escolha o projeto ao qual esta pesquisa pertence',
  FIELD_PROJECT: 'Projeto *',
  FIELD_PROJECT_NAME: 'Nome do Projeto *',
  FIELD_PROJECT_DESC: 'Descrição (opcional)',
  BUTTON_CREATE_PROJECT: 'Criar Novo Projeto',
  BUTTON_CREATE: 'Criar Projeto',
  BUTTON_CANCEL: 'Cancelar',
  BUTTON_CREATING: 'Criando...',
  BUTTON_HIBERNATE: 'Adormecer Projeto',
  BUTTON_HIBERNATING: 'Adormecendo...',
  BUTTON_REACTIVATE: 'Reativar Projeto',
  BUTTON_REACTIVATING: 'Reativando...',
  BUTTON_DELETE: 'Deletar (se vazio)',
  BUTTON_DELETING: 'Deletando...',
  BUTTON_CONFIRM: 'Confirmar',
  BUTTON_CONFIRM_DELETE: 'Confirmar Deleção',
  BUTTON_CLOSE: 'Fechar',
  MODAL_CREATE_TITLE: 'Criar Novo Projeto',
  MODAL_HIBERNATE_TITLE: 'Adormecer Projeto?',
  MODAL_DELETE_TITLE: 'Deletar Projeto?',
  SELECT_PLACEHOLDER: 'Selecione um projeto',
  SELECT_NONE: 'Nenhum projeto disponível',
  BADGE_HIBERNATED: '💤 Adormecido',
  BADGE_READ_ONLY: '💤 Somente Leitura',
  PROJECT_SELECTED: 'Projeto selecionado:',
  LOADING: 'Carregando projetos...',
  CHECKING_DELETE: 'Verificando se o projeto pode ser deletado...',
} as const;

const PLACEHOLDERS = {
  PROJECT_NAME: 'Ex: Embalagens 2025',
  PROJECT_DESC: 'Breve descrição do projeto...',
} as const;

const TOAST_MESSAGES = {
  SUCCESS_CREATE: (name: string) => `Projeto "${name}" criado com sucesso!`,
  SUCCESS_DELETE: 'Projeto deletado com sucesso!',
  SUCCESS_HIBERNATE: 'Projeto adormecido com sucesso!',
  SUCCESS_REACTIVATE: 'Projeto reativado com sucesso!',
  ERROR_CREATE: (message: string) => `Erro ao criar projeto: ${message}`,
  ERROR_DELETE: (message: string) => `Erro ao deletar projeto: ${message}`,
  ERROR_HIBERNATE: (message: string) => `Erro ao adormecer projeto: ${message}`,
  ERROR_REACTIVATE: (message: string) => `Erro ao reativar projeto: ${message}`,
} as const;

const MESSAGES = {
  ERROR_LOAD: (message: string) => `Erro ao carregar projetos: ${message}`,
  NO_PROJECTS: 'Nenhum projeto encontrado. Crie um projeto primeiro.',
  HIBERNATE_INFO: '💤 O projeto ficará em modo somente leitura.',
  HIBERNATE_DETAILS: [
    'Você poderá visualizar todos os dados',
    'Não será possível criar novas pesquisas',
    'Não será possível editar dados existentes',
    'Você pode reativar o projeto a qualquer momento',
  ],
  DELETE_CAN: '⚠️ Este projeto está vazio e pode ser deletado permanentemente.',
  DELETE_CANNOT: '❌ Este projeto NÃO pode ser deletado.',
} as const;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
  MEDIUM: 'w-5 h-5',
  LARGE: 'w-6 h-6',
  XLARGE: 'w-8 h-8',
} as const;

const COLORS = {
  LOADING: {
    BG: 'bg-blue-50',
    BORDER: 'border-blue-200',
    TEXT: 'text-blue-800',
  },
  ERROR: {
    BG: 'bg-red-50',
    BORDER: 'border-red-200',
    TEXT: 'text-red-800',
  },
  WARNING: {
    BG: 'bg-yellow-50',
    BORDER: 'border-yellow-200',
    TEXT: 'text-yellow-800',
  },
  SUCCESS: {
    BG: 'bg-green-50',
    BORDER: 'border-green-200',
    TEXT: 'text-green-800',
  },
  INFO: {
    BG: 'bg-blue-50',
    BORDER: 'border-blue-200',
    TEXT: 'text-blue-800',
  },
  HIBERNATED: {
    BG: 'bg-blue-50',
    BORDER: 'border-blue-200',
    TEXT: 'text-blue-800',
    BADGE_BG: 'bg-blue-50',
    BADGE_TEXT: 'text-blue-700',
    BADGE_BORDER: 'border-blue-300',
  },
  ACTIVE: {
    BG: 'bg-green-50',
    BORDER: 'border-green-200',
    TEXT: 'text-green-800',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: number;
  nome: string;
  descricao?: string;
  status: 'active' | 'hibernated';
}

interface CanDeleteResult {
  canDelete: boolean;
  reason?: string;
  stats?: {
    pesquisas: number;
    clientes: number;
    mercados: number;
  };
}

interface Step1Props {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

function getProjectCount(count: number): string {
  return `${count} ${pluralize(count, 'projeto', 'projetos')} ${pluralize(count, 'disponível', 'disponíveis')}`;
}

function isProjectHibernated(project: Project | undefined): boolean {
  return project?.status === PROJECT_STATUS.HIBERNATED;
}

function getProjectStatusClasses(isHibernated: boolean) {
  return isHibernated
    ? {
        bg: COLORS.HIBERNATED.BG,
        border: COLORS.HIBERNATED.BORDER,
        text: COLORS.HIBERNATED.TEXT,
      }
    : {
        bg: COLORS.ACTIVE.BG,
        border: COLORS.ACTIVE.BORDER,
        text: COLORS.ACTIVE.TEXT,
      };
}

function formatProjectStats(stats: CanDeleteResult['stats']): string {
  if (!stats) return '';
  return `Pesquisas: ${stats.pesquisas} | Clientes: ${stats.clientes} | Mercados: ${stats.mercados}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step1SelectProject({ data, updateData }: Step1Props) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [projectToHibernate, setProjectToHibernate] = useState<number | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = trpc.projects.list.useQuery();

  const canDeleteQuery = trpc.projects.canDelete.useQuery(projectToDelete || 0, {
    enabled: projectToDelete !== null,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (newProject) => {
      if (newProject) {
        refetch();
        updateData({
          projectId: newProject.id,
          projectName: newProject.nome,
        });
        setShowCreateProject(false);
        setNewProjectName('');
        setNewProjectDesc('');
        toast.success(TOAST_MESSAGES.SUCCESS_CREATE(newProject.nome));
      }
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_CREATE(error.message));
    },
  });

  const deleteProject = trpc.projects.deleteEmpty.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(TOAST_MESSAGES.SUCCESS_DELETE);
      if (data.projectId === projectToDelete) {
        updateData({ projectId: undefined, projectName: '' });
      }
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_DELETE(error.message));
    },
  });

  const hibernateProject = trpc.projects.hibernate.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(TOAST_MESSAGES.SUCCESS_HIBERNATE);
      setProjectToHibernate(null);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_HIBERNATE(error.message));
    },
  });

  const reactivateProject = trpc.projects.reactivate.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(TOAST_MESSAGES.SUCCESS_REACTIVATE);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_REACTIVATE(error.message));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasProjects = useMemo(() => projects && projects.length > 0, [projects]);

  const selectedProject = useMemo(
    () => projects?.find((p) => p.id === data.projectId),
    [projects, data.projectId]
  );

  const isSelectedProjectHibernated = useMemo(
    () => isProjectHibernated(selectedProject),
    [selectedProject]
  );

  const isCreating = useMemo(() => createProject.isPending, [createProject.isPending]);
  const isDeleting = useMemo(() => deleteProject.isPending, [deleteProject.isPending]);
  const isHibernating = useMemo(
    () => hibernateProject.isPending,
    [hibernateProject.isPending]
  );
  const isReactivating = useMemo(
    () => reactivateProject.isPending,
    [reactivateProject.isPending]
  );

  const canDelete = useMemo(
    () => canDeleteQuery.data?.canDelete ?? false,
    [canDeleteQuery.data]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggleCreateProject = useCallback(() => {
    setShowCreateProject((prev) => !prev);
  }, []);

  const handleCloseCreateProject = useCallback(() => {
    setShowCreateProject(false);
  }, []);

  const handleNewProjectNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewProjectName(e.target.value);
    },
    []
  );

  const handleNewProjectDescChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewProjectDesc(e.target.value);
    },
    []
  );

  const handleCreateProject = useCallback(() => {
    if (newProjectName.trim()) {
      createProject.mutate({
        nome: newProjectName.trim(),
        descricao: newProjectDesc.trim() || undefined,
      });
    }
  }, [newProjectName, newProjectDesc, createProject]);

  const handleProjectChange = useCallback(
    (value: string) => {
      const project = projects?.find((p) => p.id === parseInt(value, 10));
      updateData({
        projectId: parseInt(value, 10),
        projectName: project?.nome || '',
      });
    },
    [projects, updateData]
  );

  const handleOpenHibernateModal = useCallback(() => {
    if (data.projectId) {
      setProjectToHibernate(data.projectId);
    }
  }, [data.projectId]);

  const handleCloseHibernateModal = useCallback(() => {
    setProjectToHibernate(null);
  }, []);

  const handleConfirmHibernate = useCallback(() => {
    if (projectToHibernate) {
      hibernateProject.mutate(projectToHibernate);
    }
  }, [projectToHibernate, hibernateProject]);

  const handleReactivate = useCallback(() => {
    if (data.projectId) {
      reactivateProject.mutate(data.projectId);
    }
  }, [data.projectId, reactivateProject]);

  const handleOpenDeleteModal = useCallback(() => {
    if (data.projectId) {
      setProjectToDelete(data.projectId);
    }
  }, [data.projectId]);

  const handleCloseDeleteModal = useCallback(() => {
    setProjectToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete);
    }
  }, [projectToDelete, deleteProject]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLoadingState = useCallback(
    () => (
      <div className={`p-4 ${COLORS.LOADING.BG} border ${COLORS.LOADING.BORDER} rounded-lg`}>
        <p className={`text-sm ${COLORS.LOADING.TEXT}`}>{LABELS.LOADING}</p>
      </div>
    ),
    []
  );

  const renderErrorState = useCallback(
    () => (
      <div className={`p-4 ${COLORS.ERROR.BG} border ${COLORS.ERROR.BORDER} rounded-lg`}>
        <p className={`text-sm ${COLORS.ERROR.TEXT}`}>
          {MESSAGES.ERROR_LOAD(error?.message || '')}
        </p>
      </div>
    ),
    [error]
  );

  const renderNoProjectsState = useCallback(
    () => (
      <div
        className={`p-4 ${COLORS.WARNING.BG} border ${COLORS.WARNING.BORDER} rounded-lg space-y-3`}
      >
        <p className={`text-sm ${COLORS.WARNING.TEXT}`}>{MESSAGES.NO_PROJECTS}</p>
        <Button
          onClick={handleToggleCreateProject}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <FolderPlus className={`${ICON_SIZES.SMALL} mr-2`} />
          {LABELS.BUTTON_CREATE_PROJECT}
        </Button>
      </div>
    ),
    [handleToggleCreateProject]
  );

  const renderCreateProjectModal = useCallback(
    () => (
      <Card className={`p-4 space-y-4 border-2 ${COLORS.INFO.BORDER} ${COLORS.INFO.BG}/50`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{LABELS.MODAL_CREATE_TITLE}</h3>
          <Button variant="ghost" size="sm" onClick={handleCloseCreateProject}>
            <X className={ICON_SIZES.SMALL} />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>{LABELS.FIELD_PROJECT_NAME}</Label>
            <Input
              value={newProjectName}
              onChange={handleNewProjectNameChange}
              placeholder={PLACEHOLDERS.PROJECT_NAME}
            />
          </div>

          <div>
            <Label>{LABELS.FIELD_PROJECT_DESC}</Label>
            <Textarea
              value={newProjectDesc}
              onChange={handleNewProjectDescChange}
              placeholder={PLACEHOLDERS.PROJECT_DESC}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
              className="flex-1"
            >
              {isCreating ? LABELS.BUTTON_CREATING : LABELS.BUTTON_CREATE}
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseCreateProject}
              disabled={isCreating}
            >
              {LABELS.BUTTON_CANCEL}
            </Button>
          </div>
        </div>
      </Card>
    ),
    [
      newProjectName,
      newProjectDesc,
      isCreating,
      handleCloseCreateProject,
      handleNewProjectNameChange,
      handleNewProjectDescChange,
      handleCreateProject,
    ]
  );

  const renderProjectSelect = useCallback(
    () => (
      <Select
        disabled={isLoading || !hasProjects}
        value={data.projectId?.toString() || ''}
        onValueChange={handleProjectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={LABELS.SELECT_PLACEHOLDER} />
        </SelectTrigger>
        <SelectContent>
          {hasProjects ? (
            projects!.map((project) => (
              <SelectItem key={project.id} value={project.id.toString()}>
                <div className="flex items-center gap-2">
                  <span>{project.nome}</span>
                  {isProjectHibernated(project) && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${COLORS.HIBERNATED.BADGE_BG} ${COLORS.HIBERNATED.BADGE_TEXT} ${COLORS.HIBERNATED.BADGE_BORDER}`}
                    >
                      {LABELS.BADGE_HIBERNATED}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              {LABELS.SELECT_NONE}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    ),
    [isLoading, hasProjects, data.projectId, projects, handleProjectChange]
  );

  const renderSelectedProject = useCallback(() => {
    if (!data.projectId || !selectedProject) return null;

    const statusClasses = getProjectStatusClasses(isSelectedProjectHibernated);

    return (
      <div className={`p-4 border rounded-lg ${statusClasses.bg} ${statusClasses.border}`}>
        <div className="flex items-center justify-between">
          <p className={`text-sm ${statusClasses.text}`}>
            ✓ {LABELS.PROJECT_SELECTED} <strong>{data.projectName}</strong>
          </p>
          {isSelectedProjectHibernated && (
            <Badge
              className={`${COLORS.HIBERNATED.BADGE_BG} ${COLORS.HIBERNATED.BADGE_TEXT} ${COLORS.HIBERNATED.BADGE_BORDER}`}
            >
              {LABELS.BADGE_READ_ONLY}
            </Badge>
          )}
        </div>
      </div>
    );
  }, [data.projectId, data.projectName, selectedProject, isSelectedProjectHibernated]);

  const renderProjectActions = useCallback(() => {
    if (!data.projectId) return null;

    return (
      <div className="flex gap-2">
        {isSelectedProjectHibernated ? (
          <Button
            onClick={handleReactivate}
            disabled={isReactivating}
            variant="outline"
            size="sm"
            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
          >
            <Sun className={`${ICON_SIZES.SMALL} mr-2`} />
            {isReactivating ? LABELS.BUTTON_REACTIVATING : LABELS.BUTTON_REACTIVATE}
          </Button>
        ) : (
          <Button
            onClick={handleOpenHibernateModal}
            variant="outline"
            size="sm"
            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
          >
            <Moon className={`${ICON_SIZES.SMALL} mr-2`} />
            {LABELS.BUTTON_HIBERNATE}
          </Button>
        )}

        <Button
          onClick={handleOpenDeleteModal}
          variant="ghost"
          size="sm"
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className={`${ICON_SIZES.SMALL} mr-2`} />
          {LABELS.BUTTON_DELETE}
        </Button>
      </div>
    );
  }, [
    data.projectId,
    isSelectedProjectHibernated,
    isReactivating,
    handleReactivate,
    handleOpenHibernateModal,
    handleOpenDeleteModal,
  ]);

  const renderHibernateModal = useCallback(() => {
    if (!projectToHibernate) return null;

    return (
      <Card
        className={`p-4 space-y-4 border-2 ${COLORS.HIBERNATED.BORDER} ${COLORS.HIBERNATED.BG}/50`}
      >
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-lg ${COLORS.HIBERNATED.TEXT}`}>
            {LABELS.MODAL_HIBERNATE_TITLE}
          </h3>
          <Button variant="ghost" size="sm" onClick={handleCloseHibernateModal}>
            <X className={ICON_SIZES.SMALL} />
          </Button>
        </div>

        <div className="space-y-3">
          <div className={`p-3 ${COLORS.HIBERNATED.BG} border ${COLORS.HIBERNATED.BORDER} rounded`}>
            <p className={`text-sm ${COLORS.HIBERNATED.TEXT} font-semibold mb-2`}>
              {MESSAGES.HIBERNATE_INFO}
            </p>
            <ul className={`text-xs ${COLORS.HIBERNATED.TEXT} space-y-1 ml-4 list-disc`}>
              {MESSAGES.HIBERNATE_DETAILS.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleConfirmHibernate}
              disabled={isHibernating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isHibernating ? LABELS.BUTTON_HIBERNATING : LABELS.BUTTON_CONFIRM}
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseHibernateModal}
              disabled={isHibernating}
            >
              {LABELS.BUTTON_CANCEL}
            </Button>
          </div>
        </div>
      </Card>
    );
  }, [projectToHibernate, isHibernating, handleCloseHibernateModal, handleConfirmHibernate]);

  const renderDeleteModal = useCallback(() => {
    if (!projectToDelete) return null;

    return (
      <Card className={`p-4 space-y-4 border-2 ${COLORS.ERROR.BORDER} ${COLORS.ERROR.BG}/50`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-lg ${COLORS.ERROR.TEXT}`}>
            {LABELS.MODAL_DELETE_TITLE}
          </h3>
          <Button variant="ghost" size="sm" onClick={handleCloseDeleteModal}>
            <X className={ICON_SIZES.SMALL} />
          </Button>
        </div>

        {canDeleteQuery.isLoading && (
          <p className="text-sm text-gray-600">{LABELS.CHECKING_DELETE}</p>
        )}

        {canDeleteQuery.data && (
          <div className="space-y-3">
            {canDelete ? (
              <>
                <div className={`p-3 ${COLORS.WARNING.BG} border ${COLORS.WARNING.BORDER} rounded`}>
                  <p className={`text-sm ${COLORS.WARNING.TEXT} font-semibold mb-2`}>
                    {MESSAGES.DELETE_CAN}
                  </p>
                  <p className={`text-xs ${COLORS.WARNING.TEXT}`}>
                    {formatProjectStats(canDeleteQuery.data.stats)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isDeleting ? LABELS.BUTTON_DELETING : LABELS.BUTTON_CONFIRM_DELETE}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCloseDeleteModal}
                    disabled={isDeleting}
                  >
                    {LABELS.BUTTON_CANCEL}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className={`p-3 ${COLORS.ERROR.BG} border ${COLORS.ERROR.BORDER} rounded`}>
                  <p className={`text-sm ${COLORS.ERROR.TEXT} font-semibold mb-2`}>
                    {MESSAGES.DELETE_CANNOT}
                  </p>
                  <p className={`text-xs ${COLORS.ERROR.TEXT}`}>
                    {canDeleteQuery.data.reason}
                  </p>
                  {canDeleteQuery.data.stats && (
                    <p className={`text-xs ${COLORS.ERROR.TEXT} mt-1`}>
                      {formatProjectStats(canDeleteQuery.data.stats)}
                    </p>
                  )}
                </div>

                <Button variant="outline" onClick={handleCloseDeleteModal} className="w-full">
                  {LABELS.BUTTON_CLOSE}
                </Button>
              </>
            )}
          </div>
        )}
      </Card>
    );
  }, [
    projectToDelete,
    canDeleteQuery.isLoading,
    canDeleteQuery.data,
    canDelete,
    isDeleting,
    handleCloseDeleteModal,
    handleConfirmDelete,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{LABELS.PAGE_TITLE}</h2>
        <p className="text-muted-foreground">{LABELS.PAGE_DESCRIPTION}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{LABELS.FIELD_PROJECT}</Label>
          {!isLoading && hasProjects && (
            <span className="text-sm text-muted-foreground">
              {getProjectCount(projects!.length)}
            </span>
          )}
        </div>

        {isLoading && renderLoadingState()}
        {error && renderErrorState()}
        {!isLoading && !error && !hasProjects && renderNoProjectsState()}

        {showCreateProject && renderCreateProjectModal()}

        {!showCreateProject && hasProjects && (
          <Button
            onClick={handleToggleCreateProject}
            variant="outline"
            size="sm"
            className="w-full mb-2"
          >
            <FolderPlus className={`${ICON_SIZES.SMALL} mr-2`} />
            {LABELS.BUTTON_CREATE_PROJECT}
          </Button>
        )}

        {renderProjectSelect()}
        {renderSelectedProject()}
        {renderProjectActions()}
        {renderHibernateModal()}
        {renderDeleteModal()}
      </div>
    </div>
  );
}
