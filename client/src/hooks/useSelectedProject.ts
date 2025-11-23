import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

const STORAGE_KEY = "selected-project-id";

export function useSelectedProject() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Buscar lista de projetos
  const { data: projects = [], isLoading: isLoadingProjects } =
    trpc.projects.list.useQuery();

  // Inicializar projeto selecionado
  useEffect(() => {
    if (isLoadingProjects) return;

    // Tentar carregar do localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const projectId = parseInt(stored, 10);
      // Verificar se o projeto ainda existe
      if (projects.some(p => p.id === projectId)) {
        setSelectedProjectId(projectId);
        setIsLoading(false);
        return;
      }
    }

    // Se não há projeto salvo ou ele não existe mais, usar o primeiro disponível
    if (projects.length > 0) {
      setSelectedProjectId(projects[0].id);
      localStorage.setItem(STORAGE_KEY, projects[0].id.toString());
    }

    setIsLoading(false);
  }, [projects, isLoadingProjects]);

  // Função para trocar de projeto
  const selectProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    localStorage.setItem(STORAGE_KEY, projectId.toString());
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return {
    selectedProjectId,
    selectedProject,
    projects,
    selectProject,
    isLoading: isLoading || isLoadingProjects,
  };
}
