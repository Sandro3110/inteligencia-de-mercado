'use client';

import { X } from "lucide-react";
import { Badge } from "./ui/badge";

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function TagBadge({
  name,
  color,
  onRemove,
  size = "md",
}: TagBadgeProps) {
  const textSize = size === "sm" ? "text-[10px]" : "text-[11px]";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5";

  return (
    <Badge
      className={`${textSize} ${padding} font-medium inline-flex items-center gap-1`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 transition-opacity"
          aria-label="Remover tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}
