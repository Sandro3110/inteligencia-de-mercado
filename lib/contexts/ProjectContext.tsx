'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProjectContextType {
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  console.log('🏗️ ProjectProvider - selectedProjectId:', selectedProjectId);

  // Persistir no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedProjectId');
    console.log('💾 ProjectContext - carregando do localStorage:', saved);
    if (saved) {
      setSelectedProjectId(Number(saved));
    }
  }, []);

  useEffect(() => {
    console.log('💾 ProjectContext - salvando no localStorage:', selectedProjectId);
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', String(selectedProjectId));
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  }, [selectedProjectId]);

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
