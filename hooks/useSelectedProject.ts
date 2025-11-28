"use client";

/**
 * useSelectedProject - Hook for managing selected project
 * Fetches projects and manages selection state using ProjectContext
 */

import { useCallback, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useApp } from '@/lib/contexts/AppContext';

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
  const { selectedProjectId, selectProject: setSelectedProjectId } = useApp();
  
  console.log('🔍 useSelectedProject - selectedProjectId:', selectedProjectId);

  // Fetch all projects
  const { data: projectsData, isLoading } = trpc.projects.list.useQuery();

  const projects = (projectsData as Project[]) || [];

  // Auto-select first project if none selected
  const defaultProjectId = useMemo(() => {
    if (projects.length > 0 && !selectedProjectId) {
      console.log('📌 Auto-selecionando primeiro projeto:', projects[0].id);
      return projects[0].id;
    }
    return selectedProjectId;
  }, [projects, selectedProjectId]);

  // Auto-select first project on mount
  useEffect(() => {
    if (defaultProjectId && defaultProjectId !== selectedProjectId) {
      console.log('✅ Setando projeto padrão:', defaultProjectId);
      setSelectedProjectId(defaultProjectId);
    }
  }, [defaultProjectId, selectedProjectId, setSelectedProjectId]);

  const selectProject = useCallback((id: number | null) => {
    console.log('🔄 selectProject chamado com ID:', id);
    setSelectedProjectId(id);
  }, [setSelectedProjectId]);

  return {
    selectedProjectId,
    projects,
    selectProject,
    isLoading,
  };
}
