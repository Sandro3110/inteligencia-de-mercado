import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Building2, Users, Target, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import Fuse from "fuse.js";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { selectedProjectId } = useSelectedProject();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isLoading } = trpc.search.global.useQuery(
    {
      query,
      projectId: selectedProjectId || undefined,
      limit: 50,
    },
    { enabled: query.length > 0 }
  );

  // Fuzzy search local para melhorar resultados
  const fuse = new Fuse(results, {
    keys: ["title", "subtitle"],
    threshold: 0.3,
    includeScore: true,
  });

  const filteredResults =
    query.length > 0
      ? query.length > 2
        ? fuse.search(query).map(r => r.item)
        : results
      : [];

  // Agrupar por tipo
  const groupedResults = filteredResults.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<string, typeof results>
  );

  // Reset selected index quando resultados mudam
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length]);

  // Focus input quando abrir
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Navegação por teclado
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev =>
          Math.min(prev + 1, filteredResults.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredResults]);

  const handleSelect = (result: (typeof results)[0]) => {
    onOpenChange(false);
    setQuery("");

    // Navegar para a entidade selecionada
    switch (result.type) {
      case "mercado":
        setLocation(`/mercado/${result.id}`);
        break;
      case "cliente":
      case "concorrente":
      case "lead":
        // Por enquanto volta para home, pode ser melhorado
        setLocation("/");
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "mercado":
        return <Building2 className="h-4 w-4" />;
      case "cliente":
        return <Users className="h-4 w-4" />;
      case "concorrente":
        return <Target className="h-4 w-4" />;
      case "lead":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mercado":
        return "Mercado";
      case "cliente":
        return "Cliente";
      case "concorrente":
        return "Concorrente";
      case "lead":
        return "Lead";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            placeholder="Buscar mercados, clientes, concorrentes, leads..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {isLoading && query.length > 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}

          {!isLoading && query.length > 0 && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Nenhum resultado encontrado</p>
              <p className="text-xs mt-1">
                Tente buscar por nome, CNPJ ou email
              </p>
            </div>
          )}

          {query.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Digite para buscar...</p>
              <p className="text-xs mt-1">
                Mercados, clientes, concorrentes e leads
              </p>
            </div>
          )}

          {Object.entries(groupedResults).map(([type, items]) => (
            <div key={type} className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {getTypeLabel(type)} ({items.length})
              </div>
              {items.map((result, index) => {
                const globalIndex = filteredResults.indexOf(result);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        {filteredResults.length > 0 && (
          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  Enter
                </kbd>
                Selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  Esc
                </kbd>
                Fechar
              </span>
            </div>
            <span>{filteredResults.length} resultados</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
