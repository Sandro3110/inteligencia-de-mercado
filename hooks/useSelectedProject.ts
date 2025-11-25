import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectedProjectState {
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | string | null) => void;
}

export const useSelectedProject = create<SelectedProjectState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      setSelectedProjectId: (id) =>
        set({
          selectedProjectId: id ? Number(id) : null,
        }),
    }),
    {
      name: 'selected-project-storage',
    }
  )
);
