/**
 * EntityPopupCard Component
 * Entity details popup card
 * Displays detailed information when clicking on a marker
 */

'use client';

import { useCallback, useMemo } from 'react';
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

// ============================================================================
// TYPES
// ============================================================================

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

interface EntityData {
  nome: string;
  qualidadeScore?: number;
  cidade?: string;
  uf?: string;
  mercado?: { nome: string };
  mercados?: Mercado[];
  email?: string;
  telefone?: string;
  site?: string;
  siteOficial?: string;
  tags?: TagData[];
  stats?: EntityStats;
  cliente?: { nome: string };
  latitude?: number;
  longitude?: number;
}

type QualityVariant = 'default' | 'secondary' | 'destructive';

// ============================================================================
// CONSTANTS
// ============================================================================

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
} as const;

const QUALITY_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
} as const;

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  REGULAR: 'w-4 h-4',
  LARGE: 'w-6 h-6',
} as const;

const CLASSES = {
  DIALOG_CONTENT: 'max-w-2xl max-h-[80vh] overflow-y-auto',
  HEADER_CONTAINER: 'flex items-center gap-3',
  ICON_CONTAINER: 'p-2 rounded-lg',
  HEADER_CONTENT: 'flex-1',
  TITLE: 'text-xl',
  BADGES_CONTAINER: 'flex items-center gap-2 mt-1',
  CONTENT: 'space-y-4',
  INFO_ROW: 'flex items-start gap-2',
  INFO_ROW_CENTER: 'flex items-center gap-2',
  ICON_MUTED: 'mt-0.5 text-muted-foreground',
  ICON_MUTED_CENTER: 'text-muted-foreground',
  INFO_LABEL: 'text-sm font-medium',
  INFO_VALUE: 'text-sm text-muted-foreground',
  LINK: 'text-sm text-blue-600 hover:underline',
  BADGES_WRAP: 'flex flex-wrap gap-1 mt-1',
  BADGE_SMALL: 'text-xs',
  STATS_GRID: 'grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg',
  STAT_LABEL: 'text-xs text-muted-foreground',
  STAT_VALUE: 'text-lg font-semibold',
  ACTIONS_CONTAINER: 'flex gap-2',
  BUTTON_FULL: 'flex-1',
  CONTACT_SECTION: 'space-y-2',
  SKELETON_TITLE: 'h-6 w-48',
  SKELETON_SUBTITLE: 'h-4 w-32',
  SKELETON_BLOCK: 'h-20 w-full',
  SKELETON_CONTAINER: 'space-y-4',
} as const;

const LABELS = {
  ERROR_TITLE: 'Erro',
  ERROR_MESSAGE: 'Não foi possível carregar os detalhes da entidade.',
  LOCATION: 'Localização',
  MARKET: 'Mercado',
  MARKETS: 'Mercados',
  TAGS: 'Tags',
  CLIENTS: 'Clientes',
  COMPETITORS: 'Concorrentes',
  LEADS: 'Leads',
  PRODUCTS: 'Produtos',
  CLIENT: 'Cliente',
  VIEW_DETAILS: 'Ver Detalhes',
  OPEN_IN_MAPS: 'Abrir no Maps',
} as const;

const ROUTES = {
  MERCADO: (id: number) => `/mercados/${id}`,
} as const;

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine badge variant based on quality score
 */
function getQualityVariant(score: number): QualityVariant {
  if (score >= QUALITY_THRESHOLDS.HIGH) return 'default';
  if (score >= QUALITY_THRESHOLDS.MEDIUM) return 'secondary';
  return 'destructive';
}

/**
 * Check if entity has location data
 */
function hasLocation(entity: EntityData): boolean {
  return Boolean(entity.cidade || entity.uf);
}

/**
 * Check if entity has contact info
 */
function hasContact(entity: EntityData): boolean {
  return Boolean(entity.email || entity.telefone);
}

/**
 * Check if entity has coordinates
 */
function hasCoordinates(entity: EntityData): boolean {
  return Boolean(entity.latitude && entity.longitude);
}

/**
 * Get site URL
 */
function getSiteUrl(entity: EntityData): string | undefined {
  return entity.site || entity.siteOficial;
}

/**
 * Format location string
 */
function formatLocation(cidade?: string, uf?: string): string {
  return `${cidade}, ${uf}`;
}

/**
 * Build Google Maps URL
 */
function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  return `${GOOGLE_MAPS_URL}${latitude},${longitude}`;
}

/**
 * Get icon container classes
 */
function getIconContainerClasses(bgColor: string): string {
  return `${CLASSES.ICON_CONTAINER} ${bgColor}`;
}

/**
 * Get icon classes
 */
function getIconClasses(size: string, color: string): string {
  return `${size} ${color}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Loading skeleton
 */
interface LoadingSkeletonProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoadingSkeleton({ isOpen, onClose }: LoadingSkeletonProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={CLASSES.DIALOG_CONTENT}>
        <DialogHeader>
          <Skeleton className={CLASSES.SKELETON_TITLE} />
          <Skeleton className={CLASSES.SKELETON_SUBTITLE} />
        </DialogHeader>
        <div className={CLASSES.SKELETON_CONTAINER}>
          <Skeleton className={CLASSES.SKELETON_BLOCK} />
          <Skeleton className={CLASSES.SKELETON_BLOCK} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Error state
 */
interface ErrorStateProps {
  isOpen: boolean;
  onClose: () => void;
}

function ErrorState({ isOpen, onClose }: ErrorStateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{LABELS.ERROR_TITLE}</DialogTitle>
          <DialogDescription>{LABELS.ERROR_MESSAGE}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Entity header
 */
interface EntityHeaderProps {
  entity: EntityData;
  config: EntityConfig;
}

function EntityHeader({ entity, config }: EntityHeaderProps) {
  const Icon = config.icon;
  const iconContainerClasses = useMemo(() => getIconContainerClasses(config.bgColor), [config.bgColor]);
  const iconClasses = useMemo(() => getIconClasses(ICON_SIZES.LARGE, config.color), [config.color]);

  return (
    <div className={CLASSES.HEADER_CONTAINER}>
      <div className={iconContainerClasses}>
        <Icon className={iconClasses} />
      </div>
      <div className={CLASSES.HEADER_CONTENT}>
        <DialogTitle className={CLASSES.TITLE}>{entity.nome}</DialogTitle>
        <DialogDescription className={CLASSES.BADGES_CONTAINER}>
          <Badge variant="outline">{config.label}</Badge>
          {entity.qualidadeScore && (
            <Badge variant={getQualityVariant(entity.qualidadeScore)}>
              <Star className={`${ICON_SIZES.SMALL} mr-1`} />
              {entity.qualidadeScore}
            </Badge>
          )}
        </DialogDescription>
      </div>
    </div>
  );
}

/**
 * Location info
 */
interface LocationInfoProps {
  entity: EntityData;
}

function LocationInfo({ entity }: LocationInfoProps) {
  if (!hasLocation(entity)) return null;

  return (
    <div className={CLASSES.INFO_ROW}>
      <MapPin className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED}`} />
      <div>
        <p className={CLASSES.INFO_LABEL}>{LABELS.LOCATION}</p>
        <p className={CLASSES.INFO_VALUE}>{formatLocation(entity.cidade, entity.uf)}</p>
      </div>
    </div>
  );
}

/**
 * Market info (single)
 */
interface MarketInfoProps {
  entity: EntityData;
}

function MarketInfo({ entity }: MarketInfoProps) {
  if (!entity.mercado) return null;

  return (
    <div className={CLASSES.INFO_ROW}>
      <Building className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED}`} />
      <div>
        <p className={CLASSES.INFO_LABEL}>{LABELS.MARKET}</p>
        <p className={CLASSES.INFO_VALUE}>{entity.mercado.nome}</p>
      </div>
    </div>
  );
}

/**
 * Markets info (multiple)
 */
interface MarketsInfoProps {
  entity: EntityData;
}

function MarketsInfo({ entity }: MarketsInfoProps) {
  if (!entity.mercados || entity.mercados.length === 0) return null;

  return (
    <div className={CLASSES.INFO_ROW}>
      <Building className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED}`} />
      <div>
        <p className={CLASSES.INFO_LABEL}>{LABELS.MARKETS}</p>
        <div className={CLASSES.BADGES_WRAP}>
          {entity.mercados.map((m) => (
            <Badge key={m.mercadoId} variant="outline" className={CLASSES.BADGE_SMALL}>
              {m.mercadoNome}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Contact info
 */
interface ContactInfoProps {
  entity: EntityData;
}

function ContactInfo({ entity }: ContactInfoProps) {
  if (!hasContact(entity)) return null;

  return (
    <div className={CLASSES.CONTACT_SECTION}>
      {entity.email && (
        <div className={CLASSES.INFO_ROW_CENTER}>
          <Mail className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED_CENTER}`} />
          <a href={`mailto:${entity.email}`} className={CLASSES.LINK}>
            {entity.email}
          </a>
        </div>
      )}
      {entity.telefone && (
        <div className={CLASSES.INFO_ROW_CENTER}>
          <Phone className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED_CENTER}`} />
          <a href={`tel:${entity.telefone}`} className={CLASSES.LINK}>
            {entity.telefone}
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Website info
 */
interface WebsiteInfoProps {
  entity: EntityData;
}

function WebsiteInfo({ entity }: WebsiteInfoProps) {
  const siteUrl = useMemo(() => getSiteUrl(entity), [entity]);

  if (!siteUrl) return null;

  return (
    <div className={CLASSES.INFO_ROW_CENTER}>
      <Globe className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED_CENTER}`} />
      <a href={siteUrl} target="_blank" rel="noopener noreferrer" className={CLASSES.LINK}>
        {siteUrl}
      </a>
    </div>
  );
}

/**
 * Tags info
 */
interface TagsInfoProps {
  entity: EntityData;
}

function TagsInfo({ entity }: TagsInfoProps) {
  if (!entity.tags || entity.tags.length === 0) return null;

  return (
    <div className={CLASSES.INFO_ROW}>
      <Tag className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED}`} />
      <div>
        <p className={CLASSES.INFO_LABEL}>{LABELS.TAGS}</p>
        <div className={CLASSES.BADGES_WRAP}>
          {entity.tags.map((tag) => (
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
  );
}

/**
 * Statistics info
 */
interface StatsInfoProps {
  entity: EntityData;
}

function StatsInfo({ entity }: StatsInfoProps) {
  if (!entity.stats) return null;

  return (
    <div className={CLASSES.STATS_GRID}>
      <div>
        <p className={CLASSES.STAT_LABEL}>{LABELS.CLIENTS}</p>
        <p className={CLASSES.STAT_VALUE}>{entity.stats.totalClientes || 0}</p>
      </div>
      <div>
        <p className={CLASSES.STAT_LABEL}>{LABELS.COMPETITORS}</p>
        <p className={CLASSES.STAT_VALUE}>{entity.stats.totalConcorrentes || 0}</p>
      </div>
      <div>
        <p className={CLASSES.STAT_LABEL}>{LABELS.LEADS}</p>
        <p className={CLASSES.STAT_VALUE}>{entity.stats.totalLeads || 0}</p>
      </div>
      <div>
        <p className={CLASSES.STAT_LABEL}>{LABELS.PRODUCTS}</p>
        <p className={CLASSES.STAT_VALUE}>{entity.stats.totalProdutos || 0}</p>
      </div>
    </div>
  );
}

/**
 * Client info (for products)
 */
interface ClientInfoProps {
  entity: EntityData;
}

function ClientInfo({ entity }: ClientInfoProps) {
  if (!entity.cliente) return null;

  return (
    <div className={CLASSES.INFO_ROW}>
      <Users className={`${ICON_SIZES.REGULAR} ${CLASSES.ICON_MUTED}`} />
      <div>
        <p className={CLASSES.INFO_LABEL}>{LABELS.CLIENT}</p>
        <p className={CLASSES.INFO_VALUE}>{entity.cliente.nome}</p>
      </div>
    </div>
  );
}

/**
 * Action buttons
 */
interface ActionButtonsProps {
  entity: EntityData;
  entityType: EntityType;
  entityId: number;
  onNavigate: () => void;
  onOpenMaps: () => void;
}

function ActionButtons({ entity, onNavigate, onOpenMaps }: ActionButtonsProps) {
  const showMapsButton = useMemo(() => hasCoordinates(entity), [entity]);

  return (
    <div className={CLASSES.ACTIONS_CONTAINER}>
      <Button onClick={onNavigate} className={CLASSES.BUTTON_FULL}>
        <ExternalLink className={`${ICON_SIZES.REGULAR} mr-2`} />
        {LABELS.VIEW_DETAILS}
      </Button>
      {showMapsButton && (
        <Button onClick={onOpenMaps} variant="outline">
          <Navigation className={`${ICON_SIZES.REGULAR} mr-2`} />
          {LABELS.OPEN_IN_MAPS}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Entity details popup card
 */
export default function EntityPopupCard({
  isOpen,
  onClose,
  entityType,
  entityId,
}: EntityPopupCardProps) {
  const [, setLocation] = useLocation();

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: entity, isLoading } = trpc.unifiedMap.getEntityDetails.useQuery(
    { entityType, entityId },
    { enabled: isOpen }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const config = useMemo(() => ENTITY_CONFIG[entityType], [entityType]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNavigateToDetails = useCallback(() => {
    switch (entityType) {
      case 'mercado':
        setLocation(ROUTES.MERCADO(entityId));
        break;
      case 'cliente':
      case 'concorrente':
      case 'lead':
      case 'produto':
        onClose();
        break;
    }
  }, [entityType, entityId, setLocation, onClose]);

  const handleOpenInMaps = useCallback(() => {
    if (entity?.latitude && entity?.longitude) {
      const url = buildGoogleMapsUrl(entity.latitude, entity.longitude);
      window.open(url, '_blank');
    }
  }, [entity]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return <LoadingSkeleton isOpen={isOpen} onClose={onClose} />;
  }

  if (!entity) {
    return <ErrorState isOpen={isOpen} onClose={onClose} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={CLASSES.DIALOG_CONTENT}>
        <DialogHeader>
          <EntityHeader entity={entity} config={config} />
        </DialogHeader>

        <Separator />

        <div className={CLASSES.CONTENT}>
          <LocationInfo entity={entity} />
          <MarketInfo entity={entity} />
          <MarketsInfo entity={entity} />
          <ContactInfo entity={entity} />
          <WebsiteInfo entity={entity} />
          <TagsInfo entity={entity} />
          <StatsInfo entity={entity} />
          <ClientInfo entity={entity} />
        </div>

        <Separator />

        <ActionButtons
          entity={entity}
          entityType={entityType}
          entityId={entityId}
          onNavigate={handleNavigateToDetails}
          onOpenMaps={handleOpenInMaps}
        />
      </DialogContent>
    </Dialog>
  );
}
