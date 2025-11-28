'use client';

/**
 * AppContext - Contexto unificado da aplicação
 * Gerencia hierarquia projeto → pesquisa de forma robusta
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { Project, Pesquisa } from '@/lib/types/api';

// ============================================================================
// TYPES
// ============================================================================

interface AppContextType {
  // Projeto
  selectedProjectId: number | null;
  selectedProject: Project | null;
  projects: Project[];
  selectProject: (id: number | null) => void;
  
  // Pesquisa (filho de projeto)
  selectedPesquisaId: number | null;
  selectedPesquisa: Pesquisa | null;
  pesquisas: Pesquisa[]; // apenas do projeto selecionado
  selectPesquisa: (id: number | null) => void;
  
  // Estado
  isLoadingProjects: boolean;
  isLoadingPesquisas: boolean;
  error: string | null;
  
  // Helpers
  clearSelection: () => void;
  refreshData: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  PROJECT_ID: 'selectedProjectId',
  PESQUISA_ID: 'selectedPesquisaId',
} as const;

// ============================================================================
// PROVIDER
// ============================================================================

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Queries
  const { 
    data: projectsData, 
    isLoading: isLoadingProjects,
    refetch: refetchProjects 
  } = trpc.projects.list.useQuery();

  const { 
    data: pesquisasData, 
    isLoading: isLoadingPesquisas,
    refetch: refetchPesquisas 
  } = trpc.pesquisas.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const projects = (projectsData as Project[]) || [];
  const pesquisas = (pesquisasData as Pesquisa[]) || [];

  // Derived state
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const selectedPesquisa = pesquisas.find(p => p.id === selectedPesquisaId) || null;

  // ============================================================================
  // EFFECTS - Carregar do localStorage
  // ============================================================================

  useEffect(() => {
    try {
      const savedProjectId = localStorage.getItem(STORAGE_KEYS.PROJECT_ID);
      const savedPesquisaId = localStorage.getItem(STORAGE_KEYS.PESQUISA_ID);
      
      if (savedProjectId) {
        setSelectedProjectId(Number(savedProjectId));
      }
      
      if (savedPesquisaId) {
        setSelectedPesquisaId(Number(savedPesquisaId));
      }
    } catch (err) {
      console.error('Erro ao carregar do localStorage:', err);
    }
  }, []);

  // ============================================================================
  // EFFECTS - Auto-selecionar primeiro projeto
  // ============================================================================

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const firstProject = projects[0];
      console.log('📌 Auto-selecionando primeiro projeto:', firstProject.nome);
      // Usar setTimeout para evitar setState síncrono em effect
      setTimeout(() => setSelectedProjectId(firstProject.id), 0);
    }
  }, [projects, selectedProjectId]);

  // ============================================================================
  // EFFECTS - Auto-selecionar primeira pesquisa
  // ============================================================================

  useEffect(() => {
    if (pesquisas.length > 0 && !selectedPesquisaId) {
      const firstPesquisa = pesquisas[0];
      console.log('📌 Auto-selecionando primeira pesquisa:', firstPesquisa.nome);
      // Usar setTimeout para evitar setState síncrono em effect
      setTimeout(() => setSelectedPesquisaId(firstPesquisa.id), 0);
    }
  }, [pesquisas, selectedPesquisaId]);

  // ============================================================================
  // EFFECTS - Validar hierarquia
  // ============================================================================

  useEffect(() => {
    // Se pesquisa selecionada não pertence ao projeto, limpar
    if (selectedPesquisaId && selectedPesquisa && selectedPesquisa.projectId !== selectedProjectId) {
      console.warn('⚠️ Pesquisa não pertence ao projeto selecionado, limpando...');
      // Usar setTimeout para evitar setState síncrono em effect
      setTimeout(() => setSelectedPesquisaId(null), 0);
    }
  }, [selectedProjectId, selectedPesquisaId, selectedPesquisa]);

  // ============================================================================
  // EFFECTS - Persistir no localStorage
  // ============================================================================

  useEffect(() => {
    try {
      if (selectedProjectId) {
        localStorage.setItem(STORAGE_KEYS.PROJECT_ID, String(selectedProjectId));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PROJECT_ID);
      }
    } catch (err) {
      console.error('Erro ao salvar projeto no localStorage:', err);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    try {
      if (selectedPesquisaId) {
        localStorage.setItem(STORAGE_KEYS.PESQUISA_ID, String(selectedPesquisaId));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PESQUISA_ID);
      }
    } catch (err) {
      console.error('Erro ao salvar pesquisa no localStorage:', err);
    }
  }, [selectedPesquisaId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const selectProject = useCallback((id: number | null) => {
    console.log('🔄 Selecionando projeto:', id);
    setSelectedProjectId(id);
    // Limpar pesquisa ao trocar de projeto
    setSelectedPesquisaId(null);
    setError(null);
  }, []);

  const selectPesquisa = useCallback((id: number | null) => {
    console.log('🔄 Selecionando pesquisa:', id);
    
    // Validar se pesquisa pertence ao projeto
    if (id && selectedProjectId) {
      const pesquisa = pesquisas.find(p => p.id === id);
      if (pesquisa && pesquisa.projectId !== selectedProjectId) {
        setError('Pesquisa não pertence ao projeto selecionado');
        return;
      }
    }
    
    setSelectedPesquisaId(id);
    setError(null);
  }, [selectedProjectId, pesquisas]);

  const clearSelection = useCallback(() => {
    console.log('🧹 Limpando seleção');
    setSelectedProjectId(null);
    setSelectedPesquisaId(null);
    setError(null);
  }, []);

  const refreshData = useCallback(() => {
    console.log('🔄 Atualizando dados');
    refetchProjects();
    if (selectedProjectId) {
      refetchPesquisas();
    }
  }, [refetchProjects, refetchPesquisas, selectedProjectId]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AppContextType = {
    // Projeto
    selectedProjectId,
    selectedProject,
    projects,
    selectProject,
    
    // Pesquisa
    selectedPesquisaId,
    selectedPesquisa,
    pesquisas,
    selectPesquisa,
    
    // Estado
    isLoadingProjects,
    isLoadingPesquisas,
    error,
    
    // Helpers
    clearSelection,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Hook legado para compatibilidade
 * @deprecated Use useApp() instead
 */
export function useProject() {
  const { selectedProjectId, setSelectedProjectId } = useApp();
  return { selectedProjectId, setSelectedProjectId };
}
