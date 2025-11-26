'use client';

/**
 * useSelectedProject - Hook for managing selected project
 * Fetches projects and manages selection state using ProjectContext
 */

import { useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useProject } from '@/lib/contexts/ProjectContext';

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: number;
  createdAt: string | null;
  updatedAt: string | null;
  nome: string;
  status: string;
  descricao: string | null;
  cor: string | null;
  ativo: number;
  executionMode: string | null;
  maxParallelJobs: number | null;
  isPaused: number | null;
  lastActivityAt: string | null;
}

interface UseSelectedProjectReturn {
  selectedProjectId: number | null;
  projects: Project[];
  selectProject: (id: number | null) => void;
  isLoading: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSelectedProject(): UseSelectedProjectReturn {
  // Use ProjectContext instead of local state
  const { selectedProjectId, setSelectedProjectId } = useProject();

  // Fetch all projects
  const { data: projectsData, isLoading } = trpc.projects.list.useQuery();

  const projects = (projectsData as Project[]) || [];

  // Auto-select first project if none selected
  const defaultProjectId = useMemo(() => {
    if (projects.length > 0 && !selectedProjectId) {
      return projects[0].id;
    }
    return selectedProjectId;
  }, [projects, selectedProjectId]);

  // Auto-select first project on mount
  useMemo(() => {
    if (defaultProjectId && defaultProjectId !== selectedProjectId) {
      setSelectedProjectId(defaultProjectId);
    }
  }, [defaultProjectId, selectedProjectId, setSelectedProjectId]);

  const selectProject = useCallback(
    (id: number | null) => {
      setSelectedProjectId(id);
    },
    [setSelectedProjectId]
  );

  return {
    selectedProjectId,
    projects,
    selectProject,
    isLoading,
  };
}
