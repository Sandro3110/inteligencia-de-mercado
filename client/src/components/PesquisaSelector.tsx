import { useSelectedPesquisa } from '@/hooks/useSelectedPesquisa';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';

interface PesquisaSelectorProps {
  projectId?: number | null;
}

export function PesquisaSelector({ projectId }: PesquisaSelectorProps) {
  const { selectedPesquisaId, selectedPesquisa, pesquisas, selectPesquisa, isLoading } =
    useSelectedPesquisa(projectId);

  if (!projectId) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Selecione um projeto</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (pesquisas.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Nenhuma pesquisa</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedPesquisaId?.toString() || "all"}
        onValueChange={(value) => {
          if (value === "all") {
            selectPesquisa(null);
          } else {
            selectPesquisa(parseInt(value, 10));
          }
        }}
      >
        <SelectTrigger className="w-[220px] h-9">
          <SelectValue placeholder="Todas as pesquisas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="text-muted-foreground">Todas as pesquisas</span>
          </SelectItem>
          {pesquisas.map((pesquisa) => (
            <SelectItem key={pesquisa.id} value={pesquisa.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{pesquisa.nome}</span>
                {pesquisa.totalClientes !== null && (
                  <span className="text-xs text-muted-foreground">
                    ({pesquisa.totalClientes} clientes)
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
