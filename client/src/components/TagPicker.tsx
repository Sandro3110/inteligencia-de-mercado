import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { TagBadge } from "./TagBadge";
import { toast } from "sonner";

interface TagPickerProps {
  entityType: "mercado" | "cliente" | "concorrente" | "lead";
  entityId: number;
  currentTags: Array<{ tagId: number; name: string; color: string }>;
  onTagsChange?: () => void;
}

export function TagPicker({ entityType, entityId, currentTags, onTagsChange }: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: allTags = [] } = trpc.tags.list.useQuery();
  
  const addMutation = trpc.tags.addToEntity.useMutation({
    onSuccess: () => {
      utils.tags.getEntityTags.invalidate({ entityType, entityId });
      onTagsChange?.();
      toast.success("Tag adicionada!");
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar tag: ${error.message}`);
    },
  });

  const removeMutation = trpc.tags.removeFromEntity.useMutation({
    onSuccess: () => {
      utils.tags.getEntityTags.invalidate({ entityType, entityId });
      onTagsChange?.();
      toast.success("Tag removida!");
    },
    onError: (error) => {
      toast.error(`Erro ao remover tag: ${error.message}`);
    },
  });

  const currentTagIds = new Set(currentTags.map((t) => t.tagId));
  const availableTags = allTags.filter((tag) => !currentTagIds.has(tag.id));

  const handleAddTag = (tagId: number) => {
    addMutation.mutate({ tagId, entityType, entityId });
  };

  const handleRemoveTag = (tagId: number) => {
    removeMutation.mutate({ tagId, entityType, entityId });
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {/* Current tags */}
      {currentTags.map((tag) => (
        <TagBadge
          key={tag.tagId}
          name={tag.name}
          color={tag.color}
          size="sm"
          onRemove={() => handleRemoveTag(tag.tagId)}
        />
      ))}

      {/* Add tag button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-2" align="start">
          <div className="space-y-1">
            {availableTags.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                {allTags.length === 0
                  ? "Nenhuma tag disponível. Crie tags no Gerenciador de Tags."
                  : "Todas as tags já foram adicionadas"}
              </p>
            ) : (
              availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    handleAddTag(tag.id);
                    setIsOpen(false);
                  }}
                  disabled={addMutation.isPending}
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-accent transition-colors text-left"
                >
                  <TagBadge name={tag.name} color={tag.color || "#3b82f6"} size="sm" />
                  <Check className="w-3 h-3 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
