import { Building2, Users, Target, TrendingUp, Search } from "lucide-react";

interface EmptyStateProps {
  type: "mercados" | "clientes" | "concorrentes" | "leads" | "search";
  searchTerm?: string;
}

const emptyStateConfig = {
  mercados: {
    icon: Building2,
    title: "Nenhum mercado encontrado",
    description:
      "Comece adicionando seu primeiro mercado para iniciar a pesquisa.",
  },
  clientes: {
    icon: Users,
    title: "Nenhum cliente neste mercado",
    description: "Selecione outro mercado ou adicione novos clientes.",
  },
  concorrentes: {
    icon: Target,
    title: "Nenhum concorrente neste mercado",
    description: "Selecione outro mercado ou adicione novos concorrentes.",
  },
  leads: {
    icon: TrendingUp,
    title: "Nenhum lead neste mercado",
    description: "Selecione outro mercado ou adicione novos leads.",
  },
  search: {
    icon: Search,
    title: "Nenhum resultado encontrado",
    description: "Tente ajustar os termos de busca ou filtros aplicados.",
  },
};

export function EmptyState({ type, searchTerm }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 opacity-40">
        <Icon className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {searchTerm
          ? `Nenhum resultado para "${searchTerm}". ${config.description}`
          : config.description}
      </p>
    </div>
  );
}
