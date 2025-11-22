/**
 * Marcador Unificado de Entidades
 * Suporta mercados, clientes, produtos, concorrentes e leads
 */

import { Marker, Popup } from "react-leaflet";
import L, { DivIcon } from "leaflet";
import { Building, Users, Package, Target, Sparkles } from "lucide-react";
import { renderToString } from "react-dom/server";

export type EntityType = "mercado" | "cliente" | "produto" | "concorrente" | "lead";

export interface EntityMarkerProps {
  position: [number, number];
  type: EntityType;
  nome: string;
  qualidadeScore?: number;
  onClick?: () => void;
  children?: React.ReactNode;
}

const ENTITY_COLORS = {
  mercado: "#3b82f6", // blue-500
  cliente: "#10b981", // green-500
  produto: "#eab308", // yellow-500
  concorrente: "#ef4444", // red-500
  lead: "#a855f7", // purple-500
};

const ENTITY_ICONS = {
  mercado: Building,
  cliente: Users,
  produto: Package,
  concorrente: Target,
  lead: Sparkles,
};

/**
 * Cria ícone customizado baseado no tipo de entidade
 */
function createEntityIcon(type: EntityType, qualidadeScore?: number): DivIcon {
  const Icon = ENTITY_ICONS[type];
  const color = ENTITY_COLORS[type];

  // Determinar tamanho baseado na qualidade
  let size = 32;
  if (qualidadeScore) {
    if (qualidadeScore >= 70) size = 40;
    else if (qualidadeScore < 40) size = 28;
  }

  // Adicionar badge de qualidade se disponível
  const qualityBadge = qualidadeScore
    ? `<div style="
        position: absolute;
        top: -4px;
        right: -4px;
        background: ${qualidadeScore >= 70 ? "#10b981" : qualidadeScore >= 40 ? "#eab308" : "#ef4444"};
        color: white;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        border: 2px solid white;
      ">${qualidadeScore}</div>`
    : "";

  const iconHtml = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
      cursor: pointer;
      transition: transform 0.2s;
    " class="entity-marker" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      ${renderToString(<Icon size={size * 0.5} color="white" />)}
      ${qualityBadge}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "custom-entity-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Componente de marcador unificado para todas as entidades
 */
export default function EntityMarker({
  position,
  type,
  nome,
  qualidadeScore,
  onClick,
  children,
}: EntityMarkerProps) {
  const icon = createEntityIcon(type, qualidadeScore);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    >
      {children && (
        <Popup>
          <div className="space-y-2 min-w-[200px]">
            <h3 className="font-semibold text-sm">{nome}</h3>
            {children}
          </div>
        </Popup>
      )}
    </Marker>
  );
}
