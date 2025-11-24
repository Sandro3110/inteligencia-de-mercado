import { useCompactMode } from "@/contexts/CompactModeContext";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CompactModeToggle() {
  const { isCompact, toggleCompact } = useCompactMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCompact}
          className="transition-all duration-200 hover:scale-110"
        >
          {isCompact ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isCompact ? "Modo Normal" : "Modo Compacto"}</p>
        <p className="text-xs text-muted-foreground">
          Ajusta densidade da interface
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
