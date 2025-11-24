import { Skeleton } from './ui/skeleton';

// ============================================================================
// CONSTANTS
// ============================================================================

const DIMENSIONS = {
  SIDEBAR_WIDTH: 'w-[280px]',
  LOGO_SIZE: 'h-8 w-8',
  LOGO_TEXT_WIDTH: 'w-24',
  LOGO_TEXT_HEIGHT: 'h-4',
  MENU_ITEM_HEIGHT: 'h-10',
  AVATAR_SIZE: 'h-9 w-9',
  USER_NAME_HEIGHT: 'h-3',
  USER_NAME_WIDTH: 'w-20',
  USER_EMAIL_HEIGHT: 'h-2',
  USER_EMAIL_WIDTH: 'w-32',
  HEADER_HEIGHT: 'h-12',
  HEADER_WIDTH: 'w-48',
  CARD_HEIGHT: 'h-32',
  CONTENT_HEIGHT: 'h-64',
} as const;

const CLASSES = {
  CONTAINER: 'flex min-h-screen bg-background',
  SIDEBAR: 'border-r border-border bg-background p-4 space-y-6',
  LOGO_AREA: 'flex items-center gap-3 px-2',
  MENU_CONTAINER: 'space-y-2 px-2',
  USER_PROFILE: 'absolute bottom-4 left-4 right-4',
  USER_PROFILE_INNER: 'flex items-center gap-3 px-1',
  USER_INFO: 'flex-1 space-y-2',
  MAIN_CONTENT: 'flex-1 p-4 space-y-4',
  CARDS_GRID: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
} as const;

const BORDER_RADIUS = {
  SMALL: 'rounded-md',
  MEDIUM: 'rounded-lg',
  LARGE: 'rounded-xl',
  FULL: 'rounded-full',
} as const;

const MENU_ITEMS_COUNT = 3;
const CARD_ITEMS_COUNT = 3;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SidebarSkeleton() {
  return (
    <div className={`${DIMENSIONS.SIDEBAR_WIDTH} ${CLASSES.SIDEBAR}`}>
      {/* Logo area */}
      <div className={CLASSES.LOGO_AREA}>
        <Skeleton className={`${DIMENSIONS.LOGO_SIZE} ${BORDER_RADIUS.SMALL}`} />
        <Skeleton className={`${DIMENSIONS.LOGO_TEXT_HEIGHT} ${DIMENSIONS.LOGO_TEXT_WIDTH}`} />
      </div>

      {/* Menu items */}
      <div className={CLASSES.MENU_CONTAINER}>
        {Array.from({ length: MENU_ITEMS_COUNT }).map((_, index) => (
          <Skeleton
            key={index}
            className={`${DIMENSIONS.MENU_ITEM_HEIGHT} w-full ${BORDER_RADIUS.MEDIUM}`}
          />
        ))}
      </div>

      {/* User profile area at bottom */}
      <div className={CLASSES.USER_PROFILE}>
        <div className={CLASSES.USER_PROFILE_INNER}>
          <Skeleton className={`${DIMENSIONS.AVATAR_SIZE} ${BORDER_RADIUS.FULL}`} />
          <div className={CLASSES.USER_INFO}>
            <Skeleton className={`${DIMENSIONS.USER_NAME_HEIGHT} ${DIMENSIONS.USER_NAME_WIDTH}`} />
            <Skeleton className={`${DIMENSIONS.USER_EMAIL_HEIGHT} ${DIMENSIONS.USER_EMAIL_WIDTH}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MainContentSkeleton() {
  return (
    <div className={CLASSES.MAIN_CONTENT}>
      {/* Header skeleton */}
      <Skeleton className={`${DIMENSIONS.HEADER_HEIGHT} ${DIMENSIONS.HEADER_WIDTH} ${BORDER_RADIUS.MEDIUM}`} />

      {/* Cards grid */}
      <div className={CLASSES.CARDS_GRID}>
        {Array.from({ length: CARD_ITEMS_COUNT }).map((_, index) => (
          <Skeleton key={index} className={`${DIMENSIONS.CARD_HEIGHT} ${BORDER_RADIUS.LARGE}`} />
        ))}
      </div>

      {/* Content block */}
      <Skeleton className={`${DIMENSIONS.CONTENT_HEIGHT} ${BORDER_RADIUS.LARGE}`} />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DashboardLayoutSkeleton
 * 
 * Skeleton loader para o layout do dashboard.
 * Exibe placeholders animados enquanto o conteúdo real está carregando.
 */
export function DashboardLayoutSkeleton() {
  return (
    <div className={CLASSES.CONTAINER}>
      <SidebarSkeleton />
      <MainContentSkeleton />
    </div>
  );
}
