import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>{items[0]?.label || "Início"}</span>
      </button>

      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
