import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "secondary" | "success" | "warning" | "destructive" | "info";
  className?: string;
  subtitle?: string;
  onClick?: () => void;
}

const colorClasses = {
  primary: {
    bg: "from-primary/10 to-primary/5",
    icon: "text-primary"
  },
  secondary: {
    bg: "from-secondary/10 to-secondary/5",
    icon: "text-secondary"
  },
  success: {
    bg: "from-success/10 to-success/5",
    icon: "text-success"
  },
  warning: {
    bg: "from-warning/10 to-warning/5",
    icon: "text-warning"
  },
  destructive: {
    bg: "from-destructive/10 to-destructive/5",
    icon: "text-destructive"
  },
  info: {
    bg: "from-info/10 to-info/5",
    icon: "text-info"
  }
};

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  color = "primary",
  className,
  subtitle,
  onClick
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <Card 
      className={cn(
        "p-6 hover-lift",
        onClick && "cursor-pointer transition-all hover:scale-105",
        className
      )}
      onDoubleClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
          colors.bg
        )}>
          <Icon className={cn("h-6 w-6", colors.icon)} />
        </div>

        {change !== undefined && (
          <Badge
            variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
            className={cn(
              "gap-1",
              trend === "up" && "bg-success hover:bg-success/90",
              trend === "neutral" && "bg-muted"
            )}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {change > 0 ? "+" : ""}{change}%
          </Badge>
        )}
      </div>

      <div className="text-3xl font-bold mb-1">
        {value}
      </div>

      <div className="text-sm text-muted-foreground">
        {title}
      </div>

      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </div>
      )}
    </Card>
  );
}
