"use client";

/**
 * useSelectedProject - Hook for managing selected project
 * Fetches projects and manages selection state
 */

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: number;
  nome: string;
  descricao?: string | null;
  status?: string | null;
  createdAt?: string | null;
  totalPesquisas: number | null;
  totalMercados: number | null;
  totalClientes: number | null;
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
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Fetch all projects
  const { data: projectsData, isLoading } = trpc.getProjects.useQuery();

  const projects = (projectsData?.data as Project[]) || [];

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectProject = useCallback((id: number | null) => {
    setSelectedProjectId(id);
  }, []);

  return {
    selectedProjectId,
    projects,
    selectProject,
    isLoading,
  };
}
