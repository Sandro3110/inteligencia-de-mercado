import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function SharedFilterView() {
  const [, params] = useRoute("/filtros/:token");
  const [, setLocation] = useLocation();
  const shareToken = params?.token;

  const { data: filter, isLoading, error } = trpc.filter.getByToken.useQuery(
    { shareToken: shareToken! },
    { enabled: !!shareToken }
  );

  useEffect(() => {
    if (filter) {
      // Redirecionar para CascadeView com filtros aplicados via query params
      const filters = JSON.parse(filter.filtersJson);
      const queryParams = new URLSearchParams();
      
      // Converter filtros para query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.set(key, JSON.stringify(value));
        }
      });

      setLocation(`/?${queryParams.toString()}`);
    }
  }, [filter, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando filtros compartilhados...</p>
        </div>
      </div>
    );
  }

  if (error || !filter) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Filtro não encontrado</h2>
          <p className="text-muted-foreground">
            O link de compartilhamento pode estar inválido ou expirado.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="text-primary hover:underline"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return null;
}
