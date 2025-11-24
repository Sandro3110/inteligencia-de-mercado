import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Componente de Breadcrumbs para navegação contextual
 * Suporta links (href) ou callbacks (onClick)
 *
 * Uso:
 * ```tsx
 * <Breadcrumbs items={[
 *   { label: "Início", href: "/", icon: Home },
 *   { label: "Projetos", href: "/projetos" },
 *   { label: "Projeto #1" }
 * ]} />
 * ```
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-slate-600 mb-4",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        const isFirst = index === 0;

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
            )}
            {item.href && !isLast ? (
              <Link href={item.href}>
                <a className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  {Icon && <Icon className="w-4 h-4" />}
                  {isFirst && !Icon && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </a>
              </Link>
            ) : item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                {Icon && <Icon className="w-4 h-4" />}
                {isFirst && !Icon && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            ) : (
              <span
                className={cn(
                  "flex items-center gap-1",
                  isLast ? "text-slate-900 font-medium" : "text-slate-600"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {isFirst && !Icon && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
