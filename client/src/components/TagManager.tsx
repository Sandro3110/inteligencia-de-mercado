import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { TagBadge } from "./TagBadge";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function TagManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const utils = trpc.useUtils();
  const { data: tags = [] } = trpc.tags.list.useQuery();
  const createMutation = trpc.tags.create.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      setNewTagName("");
      toast.success("Tag criada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar tag: ${error.message}`);
    },
  });
  const deleteMutation = trpc.tags.delete.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      toast.success("Tag removida com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao remover tag: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newTagName.trim()) {
      toast.error("Digite um nome para a tag");
      return;
    }
    createMutation.mutate({ name: newTagName.trim(), color: selectedColor });
  };

  const handleDelete = (tagId: number) => {
    if (confirm("Tem certeza que deseja remover esta tag? Ela será removida de todas as entidades.")) {
      deleteMutation.mutate(tagId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Gerenciar Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create new tag */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Nova Tag</label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
                  }
                }}
                maxLength={50}
              />
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newTagName.trim()}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Color picker */}
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Selecionar cor ${color}`}
                />
              ))}
            </div>
          </div>

          {/* List existing tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags Existentes ({tags.length})</label>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tag criada ainda
                </p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <TagBadge name={tag.name} color={tag.color || "#3b82f6"} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
