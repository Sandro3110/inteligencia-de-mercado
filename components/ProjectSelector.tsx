'use client';

import { useCallback, useMemo } from 'react';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, Loader2 } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
  TINY: 'w-3 h-3',
} as const;

const DIMENSIONS = {
  SELECT_WIDTH: 'w-[200px]',
  SELECT_HEIGHT: 'h-9',
} as const;

const CLASSES = {
  CONTAINER: 'flex items-center gap-2',
  EMPTY_STATE: 'flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground',
  ICON: 'text-muted-foreground',
  ICON_ANIMATED: 'animate-spin',
  PROJECT_ITEM: 'flex items-center gap-2',
  COLOR_DOT: 'rounded-full',
} as const;

const LABELS = {
  LOADING: 'Carregando projetos...',
  NO_PROJECTS: 'Nenhum projeto',
  PLACEHOLDER: 'Selecione um projeto',
} as const;

const DEFAULT_COLOR = '#3b82f6';
const RADIX = 10;

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: number;
  nome: string;
  cor?: string | null;
}

interface ProjectItemProps {
  project: Project;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getProjectColor(project: Project): string {
  return project.cor || DEFAULT_COLOR;
}

function parseProjectId(value: string): number {
  return parseInt(value, RADIX);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LoadingState() {
  return (
    <div className={CLASSES.EMPTY_STATE}>
      <Loader2 className={`${ICON_SIZES.SMALL} ${CLASSES.ICON_ANIMATED}`} />
      <span>{LABELS.LOADING}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={CLASSES.EMPTY_STATE}>
      <Briefcase className={ICON_SIZES.SMALL} />
      <span>{LABELS.NO_PROJECTS}</span>
    </div>
  );
}

function ProjectItem({ project }: ProjectItemProps) {
  const projectColor = useMemo(() => getProjectColor(project), [project]);

  return (
    <div className={CLASSES.PROJECT_ITEM}>
      <div
        className={`${ICON_SIZES.TINY} ${CLASSES.COLOR_DOT}`}
        style={{ backgroundColor: projectColor }}
      />
      <span>{project.nome}</span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ProjectSelector
 * 
 * Seletor de projetos com ícone, cor e nome.
 * Exibe estados de loading e vazio.
 * 
 * @example
 * ```tsx
 * <ProjectSelector />
 * ```
 */
export function ProjectSelector() {
  // Hooks
  const {
    selectedProjectId,
    projects,
    selectProject,
    isLoading,
  } = useSelectedProject();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedValue = useMemo(
    () => selectedProjectId?.toString(),
    [selectedProjectId]
  );

  const hasProjects = useMemo(() => projects.length > 0, [projects.length]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleValueChange = useCallback(
    (value: string) => {
      const projectId = parseProjectId(value);
      selectProject(projectId);
    },
    [selectProject]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasProjects) {
    return <EmptyState />;
  }

  return (
    <div className={CLASSES.CONTAINER}>
      <Briefcase className={`${ICON_SIZES.SMALL} ${CLASSES.ICON}`} />

      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className={`${DIMENSIONS.SELECT_WIDTH} ${DIMENSIONS.SELECT_HEIGHT}`}>
          <SelectValue placeholder={LABELS.PLACEHOLDER} />
        </SelectTrigger>

        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              <ProjectItem project={project} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
