import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2, FolderOpen, Calendar } from 'lucide-react';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useSelectedPesquisa } from '@/hooks/useSelectedPesquisa';
import { cn } from '@/lib/utils';

interface QuickPesquisaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickPesquisaSelector({ open, onOpenChange }: QuickPesquisaSelectorProps) {
  const { selectedProject } = useSelectedProject();
  const { pesquisas, selectedPesquisaId, selectPesquisa } = useSelectedPesquisa(selectedProject?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar pesquisas baseado na busca
  const filteredPesquisas = pesquisas.filter(p =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredPesquisas.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Enter' && filteredPesquisas[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredPesquisas[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredPesquisas]);

  const handleSelect = (pesquisaId: number) => {
    selectPesquisa(pesquisaId);
    onOpenChange(false);
  };

  if (!selectedProject) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Seleção Rápida de Pesquisa
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Selecione um projeto primeiro</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Seleção Rápida de Pesquisa
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Projeto: <span className="font-semibold">{selectedProject.nome}</span>
          </p>
        </DialogHeader>

        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Digite para buscar pesquisas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="pl-10"
          />
        </div>

        {/* Lista de pesquisas */}
        <ScrollArea className="h-[400px] pr-4">
          {filteredPesquisas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma pesquisa encontrada</p>
              {searchQuery && (
                <p className="text-sm mt-1">Tente outro termo de busca</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPesquisas.map((pesquisa, index) => {
                const isSelected = pesquisa.id === selectedPesquisaId;
                const isHighlighted = index === selectedIndex;

                return (
                  <button
                    key={pesquisa.id}
                    onClick={() => handleSelect(pesquisa.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      "hover:border-blue-300 hover:bg-blue-50",
                      isHighlighted && "border-blue-400 bg-blue-50 ring-2 ring-blue-200",
                      isSelected && "bg-green-50 border-green-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {pesquisa.nome}
                          </h3>
                          {isSelected && (
                            <Badge variant="default" className="bg-green-600 text-white">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Ativa
                            </Badge>
                          )}
                        </div>
                        {pesquisa.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {pesquisa.descricao}
                          </p>
                        )}
                        {pesquisa.createdAt && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(pesquisa.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Dicas de navegação */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded">↑↓</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd>
              Selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd>
              Fechar
            </span>
          </div>
          <span className="text-muted-foreground">
            {filteredPesquisas.length} {filteredPesquisas.length === 1 ? 'pesquisa' : 'pesquisas'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
