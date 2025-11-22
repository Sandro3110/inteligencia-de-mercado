import { UnifiedFilters } from "@/pages/UnifiedCockpit";
import CascadeView from "@/pages/CascadeView";

interface ListViewTabProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
}

/**
 * Aba de visualização em lista
 * Atualmente renderiza o CascadeView completo
 * TODO: Extrair apenas o conteúdo necessário sem header/sidebar
 */
export default function ListViewTab({ filters, onFiltersChange }: ListViewTabProps) {
  return (
    <div className="h-full w-full overflow-hidden">
      <CascadeView />
    </div>
  );
}
