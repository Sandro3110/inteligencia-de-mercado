import { trpc } from "@/lib/trpc";
import { TagPicker } from "./TagPicker";

type EntityTag = {
  tagId: number;
  name: string;
  color: string;
};

interface EntityTagPickerProps {
  entityType: "mercado" | "cliente" | "concorrente" | "lead";
  entityId: number;
}

export function EntityTagPicker({ entityType, entityId }: EntityTagPickerProps) {
  const { data: entityTags = [] } = trpc.tags.getEntityTags.useQuery({
    entityType,
    entityId,
  });

  // Map tags to ensure color is string (not null)
  const mappedTags: EntityTag[] = entityTags.map((tag) => ({
    tagId: tag.tagId,
    name: tag.name,
    color: tag.color || "#3b82f6",
  }));

  return (
    <TagPicker
      entityType={entityType}
      entityId={entityId}
      currentTags={mappedTags}
    />
  );
}
