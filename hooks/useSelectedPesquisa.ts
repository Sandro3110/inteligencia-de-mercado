"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedPesquisaState {
  pesquisaId: number | null;
  setSelectedPesquisa: (id: number | null) => void;
}

export const useSelectedPesquisa = create<SelectedPesquisaState>()(
  persist(
    (set) => ({
      pesquisaId: null,
      setSelectedPesquisa: (id) => set({ pesquisaId: id }),
    }),
    {
      name: "selected-pesquisa-storage",
    }
  )
);
