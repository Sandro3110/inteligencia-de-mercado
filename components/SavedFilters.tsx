'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SavedFiltersProps {
  onApply: (filtersJson: string) => void;
}

export function SavedFilters({ onApply }: SavedFiltersProps) {
  const utils = trpc.useUtils();
  const { data: savedFilters = [] } = trpc.savedFilters.list.useQuery();
  const deleteMutation = trpc.savedFilters.delete.useMutation({
    onSuccess: () => {
      utils.savedFilters.list.invalidate();
      toast.success("Filtro deletado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao deletar filtro");
    },
  });

  if (savedFilters.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          Filtros Salvos ({savedFilters.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuLabel>Meus Filtros</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {savedFilters.map(filter => (
          <DropdownMenuItem
            key={filter.id}
            className="flex items-center justify-between"
            onSelect={e => {
              e.preventDefault();
            }}
          >
            <button
              className="flex-1 text-left"
              onClick={() => {
                onApply(filter.filtersJson);
                toast.success(`Filtro "${filter.name}" aplicado!`);
              }}
            >
              {filter.name}
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={e => {
                e.stopPropagation();
                deleteMutation.mutate(filter.id);
              }}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
