import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface GlobalFilters {
  // Filtros geográficos
  estados: string[];
  cidades: string[];
  regioes: string[];

  // Filtros de qualidade
  qualidadeMin: number;
  qualidadeMax: number;

  // Filtros por tags
  tags: string[];

  // Filtros por status
  statusValidacao: string[]; // "pendente" | "validado" | "descartado"

  // Filtros por tipo de entidade
  tipoEntidade: string; // "todos" | "clientes" | "concorrentes" | "leads"

  // Busca textual
  searchTerm: string;
}

interface FilterContextType {
  filters: GlobalFilters;
  updateFilters: (newFilters: Partial<GlobalFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: GlobalFilters = {
  estados: [],
  cidades: [],
  regioes: [],
  qualidadeMin: 0,
  qualidadeMax: 100,
  tags: [],
  statusValidacao: [],
  tipoEntidade: "todos",
  searchTerm: "",
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  // Carregar filtros do localStorage
  const [filters, setFilters] = useState<GlobalFilters>(() => {
    try {
      const saved = localStorage.getItem("gestor-pav-filters");
      if (saved) {
        return { ...defaultFilters, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Erro ao carregar filtros do localStorage:", error);
    }
    return defaultFilters;
  });

  // Salvar filtros no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem("gestor-pav-filters", JSON.stringify(filters));
    } catch (error) {
      console.error("Erro ao salvar filtros no localStorage:", error);
    }
  }, [filters]);

  const updateFilters = (newFilters: Partial<GlobalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters =
    filters.estados.length > 0 ||
    filters.cidades.length > 0 ||
    filters.regioes.length > 0 ||
    filters.qualidadeMin > 0 ||
    filters.qualidadeMax < 100 ||
    filters.tags.length > 0 ||
    filters.statusValidacao.length > 0 ||
    filters.tipoEntidade !== "todos" ||
    filters.searchTerm.length > 0;

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilters,
        clearFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters deve ser usado dentro de FilterProvider");
  }
  return context;
}
