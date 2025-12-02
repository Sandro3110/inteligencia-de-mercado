import { Link } from "wouter";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 animate-fade-in", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.path ? (
                <Link href={item.path}>
                  <a className="hover:text-foreground transition-colors">
                    {item.label}
                  </a>
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          {Icon && (
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-balance">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-3xl text-balance">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
