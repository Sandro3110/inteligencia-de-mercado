'use client';

/**
 * Card Popup de Detalhes de Entidade
 * Exibe informações detalhadas ao clicar em um marcador
 */

import { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building,
  Users,
  Package,
  Target,
  Sparkles,
  MapPin,
  Star,
  ExternalLink,
  Navigation,
  Mail,
  Phone,
  Globe,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useLocation } from 'wouter';

export type EntityType = 'mercado' | 'cliente' | 'produto' | 'concorrente' | 'lead';

export interface EntityPopupCardProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: number;
}

interface EntityConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface Mercado {
  mercadoId: number;
  mercadoNome: string;
}

interface TagData {
  id: number;
  name: string;
  color: string;
}

interface EntityStats {
  totalClientes?: number;
  totalConcorrentes?: number;
  totalLeads?: number;
  totalProdutos?: number;
}

const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  mercado: {
    label: 'Mercado',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  cliente: {
    label: 'Cliente',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  produto: {
    label: 'Produto',
    icon: Package,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  concorrente: {
    label: 'Concorrente',
    icon: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  lead: {
    label: 'Lead',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

/**
 * Determina a variante do badge baseado no score de qualidade
 */
function getQualityVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 70) return 'default';
  if (score >= 40) return 'secondary';
  return 'destructive';
}

export default function EntityPopupCard({
  isOpen,
  onClose,
  entityType,
  entityId,
}: EntityPopupCardProps) {
  const [, setLocation] = useLocation();

  // Buscar detalhes da entidade
  const { data: entity, isLoading } = trpc.unifiedMap.getEntityDetails.useQuery(
    { entityType, entityId },
    { enabled: isOpen }
  );

  const config = ENTITY_CONFIG[entityType];
  const Icon = config.icon;

  const handleNavigateToDetails = useCallback(() => {
    // Navegar para página de detalhes específica
    switch (entityType) {
      case 'mercado':
        setLocation(`/mercados/${entityId}`);
        break;
      case 'cliente':
      case 'concorrente':
      case 'lead':
        // Abrir modal de detalhes (DetailPopup)
        // Por enquanto apenas fecha
        onClose();
        break;
      case 'produto':
        onClose();
        break;
    }
  }, [entityType, entityId, setLocation, onClose]);

  const handleOpenInMaps = useCallback(() => {
    if (entity?.latitude && entity?.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${entity.latitude},${entity.longitude}`,
        '_blank'
      );
    }
  }, [entity]);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!entity) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
            <DialogDescription>
              Não foi possível carregar os detalhes da entidade.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{entity.nome}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{config.label}</Badge>
                {entity.qualidadeScore && (
                  <Badge variant={getQualityVariant(entity.qualidadeScore)}>
                    <Star className="w-3 h-3 mr-1" />
                    {entity.qualidadeScore}
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Informações específicas por tipo */}
        <div className="space-y-4">
          {/* Localização */}
          {(entity.cidade || entity.uf) && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Localização</p>
                <p className="text-sm text-muted-foreground">
                  {entity.cidade}, {entity.uf}
                </p>
              </div>
            </div>
          )}

          {/* Mercado (para clientes, concorrentes, leads) */}
          {entity.mercado && (
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Mercado</p>
                <p className="text-sm text-muted-foreground">{entity.mercado.nome}</p>
              </div>
            </div>
          )}

          {/* Mercados (para clientes - múltiplos) */}
          {entity.mercados && entity.mercados.length > 0 && (
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Mercados</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(entity.mercados as Mercado[]).map((m) => (
                    <Badge key={m.mercadoId} variant="outline" className="text-xs">
                      {m.mercadoNome}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contato */}
          {(entity.email || entity.telefone) && (
            <div className="space-y-2">
              {entity.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`mailto:${entity.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {entity.email}
                  </a>
                </div>
              )}
              {entity.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`tel:${entity.telefone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {entity.telefone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Site */}
          {(entity.site || entity.siteOficial) && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a
                href={entity.site || entity.siteOficial}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {entity.site || entity.siteOficial}
              </a>
            </div>
          )}

          {/* Tags */}
          {entity.tags && entity.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(entity.tags as TagData[]).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Estatísticas (para mercados) */}
          {entity.stats && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="text-lg font-semibold">
                  {(entity.stats as EntityStats).totalClientes || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concorrentes</p>
                <p className="text-lg font-semibold">
                  {(entity.stats as EntityStats).totalConcorrentes || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Leads</p>
                <p className="text-lg font-semibold">
                  {(entity.stats as EntityStats).totalLeads || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Produtos</p>
                <p className="text-lg font-semibold">
                  {(entity.stats as EntityStats).totalProdutos || 0}
                </p>
              </div>
            </div>
          )}

          {/* Cliente (para produtos) */}
          {entity.cliente && (
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-sm text-muted-foreground">{entity.cliente.nome}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={handleNavigateToDetails} className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          {entity.latitude && entity.longitude && (
            <Button onClick={handleOpenInMaps} variant="outline">
              <Navigation className="w-4 h-4 mr-2" />
              Abrir no Maps
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
