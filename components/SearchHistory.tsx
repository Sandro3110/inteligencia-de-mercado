'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { History, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "gestor-pav-search-history";
const MAX_HISTORY = 10;

interface SearchHistoryProps {
  onSelectSearch: (query: string) => void;
}

export default function SearchHistory({ onSelectSearch }: SearchHistoryProps) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao carregar histórico de buscas:", e);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    toast.success("Histórico de buscas limpo");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <History className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        {history.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            Nenhuma busca recente
          </div>
        ) : (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Buscas Recentes
            </div>
            {history.map((query, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => onSelectSearch(query)}
                className="cursor-pointer"
              >
                <History className="w-3 h-3 mr-2" />
                <span className="truncate">{query}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={clearHistory}
              className="cursor-pointer text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Limpar Histórico
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Função auxiliar para adicionar busca ao histórico
export function addToSearchHistory(query: string) {
  if (!query.trim()) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let history: string[] = stored ? JSON.parse(stored) : [];

    // Remove duplicatas
    history = history.filter(q => q !== query);

    // Adiciona no início
    history.unshift(query);

    // Limita a MAX_HISTORY itens
    history = history.slice(0, MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Erro ao salvar histórico de buscas:", e);
  }
}
