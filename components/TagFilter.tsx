'use client';

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { TagBadge } from "./TagBadge";
import { Badge } from "./ui/badge";

interface TagFilterProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: allTags = [] } = trpc.tags.list.useQuery();

  const toggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
    setIsOpen(false);
  };

  const selectedTagObjects = allTags.filter(tag =>
    selectedTags.includes(tag.id)
  );

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrar por Tags
            {selectedTags.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 px-1.5 py-0 text-[10px]"
              >
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-3" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Filtrar por Tags</label>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  Limpar
                </Button>
              )}
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {allTags.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhuma tag disponível. Crie tags no Gerenciador de Tags.
                </p>
              ) : (
                allTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`w-full flex items-center justify-between p-2 rounded transition-colors ${
                        isSelected
                          ? "bg-accent border border-border"
                          : "hover:bg-accent/50 border border-transparent"
                      }`}
                    >
                      <TagBadge
                        name={tag.name}
                        color={tag.color || "#3b82f6"}
                        size="sm"
                      />
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <X className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected tags preview */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTagObjects.map(tag => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color || "#3b82f6"}
              size="sm"
              onRemove={() => toggleTag(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
