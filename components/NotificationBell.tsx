'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';
import { NotificationPanel } from './NotificationPanel';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  BELL: 'h-5 w-5',
  BADGE: 'h-5 w-5',
  STATUS_DOT: 'h-2 w-2',
} as const;

const CLASSES = {
  BUTTON: 'relative',
  ICON_DISCONNECTED: 'text-muted-foreground',
  BADGE: 'absolute -top-1 -right-1 flex items-center justify-center p-0 text-xs',
  STATUS_DOT: 'absolute bottom-0 right-0 rounded-full bg-yellow-500',
} as const;

const DIMENSIONS = {
  DROPDOWN_WIDTH: 'w-[400px]',
} as const;

const LABELS = {
  CONNECTED: 'Notificações em tempo real',
  DISCONNECTED: 'Desconectado',
} as const;

const UNREAD_COUNT_MAX = 9;
const UNREAD_COUNT_OVERFLOW = '9+';

// ============================================================================
// TYPES
// ============================================================================

interface UnreadBadgeProps {
  count: number;
}

interface StatusDotProps {
  isConnected: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getButtonTitle(isConnected: boolean): string {
  return isConnected ? LABELS.CONNECTED : LABELS.DISCONNECTED;
}

function getBellIconClasses(isConnected: boolean): string {
  return cn(ICON_SIZES.BELL, !isConnected && CLASSES.ICON_DISCONNECTED);
}

function formatUnreadCount(count: number): string {
  return count > UNREAD_COUNT_MAX ? UNREAD_COUNT_OVERFLOW : String(count);
}

function shouldShowBadge(count: number): boolean {
  return count > 0;
}

function shouldShowStatusDot(isConnected: boolean): boolean {
  return !isConnected;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function UnreadBadge({ count }: UnreadBadgeProps) {
  const formattedCount = useMemo(() => formatUnreadCount(count), [count]);

  return (
    <Badge
      variant="destructive"
      className={`${CLASSES.BADGE} ${ICON_SIZES.BADGE}`}
    >
      {formattedCount}
    </Badge>
  );
}

function StatusDot({ isConnected }: StatusDotProps) {
  if (!shouldShowStatusDot(isConnected)) {
    return null;
  }

  return (
    <span
      className={`${CLASSES.STATUS_DOT} ${ICON_SIZES.STATUS_DOT}`}
      title={LABELS.DISCONNECTED}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NotificationBell
 * 
 * Botão de notificações com badge de contagem não lida e indicador de conexão.
 * Exibe painel de notificações em dropdown.
 * 
 * @example
 * ```tsx
 * <NotificationBell />
 * ```
 */
export function NotificationBell() {
  // State
  const [open, setOpen] = useState(false);

  // Hooks
  const { isConnected } = useWebSocket();
  const unreadCount = useUnreadNotificationsCount((state) => state.count);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const buttonTitle = useMemo(() => getButtonTitle(isConnected), [isConnected]);

  const bellIconClasses = useMemo(
    () => getBellIconClasses(isConnected),
    [isConnected]
  );

  const showBadge = useMemo(
    () => shouldShowBadge(unreadCount),
    [unreadCount]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={CLASSES.BUTTON}
          title={buttonTitle}
        >
          <Bell className={bellIconClasses} />

          {showBadge && <UnreadBadge count={unreadCount} />}

          <StatusDot isConnected={isConnected} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={`${DIMENSIONS.DROPDOWN_WIDTH} p-0`}>
        <NotificationPanel />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
