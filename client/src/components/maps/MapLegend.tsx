/**
 * Legenda do Mapa Unificado
 * Mostra contadores de entidades por tipo com cores padronizadas
 */

import { Building, Users, Package, Target, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MapLegendProps {
  stats: {
    mercado: number;
    cliente: number;
    produto: number;
    concorrente: number;
    lead: number;
  };
  activeTypes: Set<string>;
  onToggleType?: (type: string) => void;
}

const ENTITY_CONFIG = {
  mercado: {
    label: "Mercados",
    icon: Building,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgLight: "bg-blue-50",
  },
  cliente: {
    label: "Clientes",
    icon: Users,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgLight: "bg-green-50",
  },
  produto: {
    label: "Produtos",
    icon: Package,
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgLight: "bg-yellow-50",
  },
  concorrente: {
    label: "Concorrentes",
    icon: Target,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgLight: "bg-red-50",
  },
  lead: {
    label: "Leads",
    icon: Sparkles,
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgLight: "bg-purple-50",
  },
};

export default function MapLegend({ stats, activeTypes, onToggleType }: MapLegendProps) {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="absolute top-4 right-4 z-[1000] shadow-lg">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Legenda do Mapa</h3>
          <Badge variant="outline" className="text-xs">
            {total} total
          </Badge>
        </div>

        <div className="space-y-2">
          {Object.entries(ENTITY_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const count = stats[type as keyof typeof stats];
            const isActive = activeTypes.has(type);

            return (
              <button
                key={type}
                onClick={() => onToggleType?.(type)}
                className={`w-full flex items-center justify-between p-2 rounded-md transition-all hover:shadow-sm ${
                  isActive ? config.bgLight : "bg-gray-50 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                  <Icon className={`w-4 h-4 ${isActive ? config.textColor : "text-gray-400"}`} />
                  <span className={`text-sm ${isActive ? "font-medium" : "text-gray-400"}`}>
                    {config.label}
                  </span>
                </div>
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={`text-xs ${isActive ? "" : "text-gray-400"}`}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          Clique para mostrar/ocultar camadas
        </div>
      </CardContent>
    </Card>
  );
}
