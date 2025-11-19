import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2, Link2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface SavedFiltersManagerProps {
  currentFilters: Record<string, any>;
  projectId?: number;
  onApplyFilter: (filters: Record<string, any>) => void;
}

export function SavedFiltersManager({ currentFilters, projectId, onApplyFilter }: SavedFiltersManagerProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: savedFilters = [] } = trpc.filter.list.useQuery();

  const saveMutation = trpc.filter.save.useMutation({
    onSuccess: (data) => {
      utils.filter.list.invalidate();
      setSaveDialogOpen(false);
      setFilterName("");
      setIsPublic(false);
      
      if (data.shareToken) {
        toast.success("Filtro salvo e link de compartilhamento gerado!");
      } else {
        toast.success("Filtro salvo com sucesso!");
      }
    },
    onError: () => {
      toast.error("Erro ao salvar filtro");
    },
  });

  const deleteMutation = trpc.filter.delete.useMutation({
    onSuccess: () => {
      utils.filter.list.invalidate();
      toast.success("Filtro excluído");
    },
    onError: () => {
      toast.error("Erro ao excluir filtro");
    },
  });

  const handleSave = () => {
    if (!filterName.trim()) {
      toast.error("Digite um nome para o filtro");
      return;
    }

    saveMutation.mutate({
      projectId,
      name: filterName,
      filtersJson: JSON.stringify(currentFilters),
      isPublic: isPublic ? 1 : 0,
    });
  };

  const handleApply = (filtersJson: string) => {
    try {
      const filters = JSON.parse(filtersJson);
      onApplyFilter(filters);
      toast.success("Filtros aplicados!");
    } catch (error) {
      toast.error("Erro ao aplicar filtros");
    }
  };

  const handleCopyLink = (shareToken: string) => {
    const url = `${window.location.origin}/filtros/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(shareToken);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSaveDialogOpen(true)}
        className="gap-2"
      >
        <Save className="w-4 h-4" />
        Salvar Filtros
      </Button>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Filtros Atuais</DialogTitle>
            <DialogDescription>
              Salve a combinação atual de filtros para reutilizar depois ou compartilhar com outros usuários.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Nome do Filtro</Label>
              <Input
                id="filter-name"
                placeholder="Ex: Leads B2B São Paulo"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-public">Compartilhável</Label>
                <p className="text-sm text-muted-foreground">
                  Gerar link público para compartilhar
                </p>
              </div>
              <Switch
                id="is-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {savedFilters.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Filtros Salvos</CardTitle>
            <CardDescription>
              Clique para aplicar ou gerenciar seus filtros salvos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApply(filter.filtersJson)}
                      className="font-medium hover:text-primary transition-colors text-left"
                    >
                      {filter.name}
                    </button>
                    {filter.isPublic === 1 && (
                      <Link2 className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filter.createdAt ? new Date(filter.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {filter.shareToken && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(filter.shareToken!)}
                      className="gap-2"
                    >
                      {copiedToken === filter.shareToken ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ id: filter.id })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
