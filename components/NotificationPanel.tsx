'use client';

import { useCallback, useMemo } from 'react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  CheckCheck,
  Trash2,
  Check,
  Bell,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// CONSTANTS
// ============================================================================

const NOTIFICATION_TYPES = {
  ENRICHMENT_COMPLETE: 'enrichment_complete',
  NEW_LEAD: 'new_lead',
  QUALITY_ALERT: 'quality_alert',
  SYSTEM: 'system',
} as const;

const ICON_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  [NOTIFICATION_TYPES.ENRICHMENT_COMPLETE]: {
    icon: Zap,
    color: 'text-green-500',
  },
  [NOTIFICATION_TYPES.NEW_LEAD]: {
    icon: TrendingUp,
    color: 'text-blue-500',
  },
  [NOTIFICATION_TYPES.QUALITY_ALERT]: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
  },
  [NOTIFICATION_TYPES.SYSTEM]: {
    icon: Bell,
    color: 'text-purple-500',
  },
};

const DEFAULT_ICON_CONFIG = {
  icon: Info,
  color: 'text-gray-500',
};

const BADGE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  [NOTIFICATION_TYPES.ENRICHMENT_COMPLETE]: {
    label: 'Concluído',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  [NOTIFICATION_TYPES.NEW_LEAD]: {
    label: 'Novo Lead',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  [NOTIFICATION_TYPES.QUALITY_ALERT]: {
    label: 'Alerta',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  [NOTIFICATION_TYPES.SYSTEM]: {
    label: 'Sistema',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

const DEFAULT_BADGE_CONFIG = {
  label: 'Info',
  className: '',
};

const LABELS = {
  TITLE: 'Notificações',
  DISCONNECTED: 'Desconectado',
  UNREAD_COUNT: (count: number) => `${count} ${count === 1 ? 'nova' : 'novas'}`,
  MARK_ALL_READ: 'Marcar todas como lidas',
  CLEAR_ALL: 'Limpar tudo',
  EMPTY_TITLE: 'Nenhuma notificação',
  EMPTY_DESCRIPTION: 'Você receberá notificações em tempo real aqui',
  MARK_AS_READ: 'Marcar como lida',
  CONNECTED: '🟢 Conectado - Notificações em tempo real ativas',
} as const;

const ICON_SIZES = {
  LARGE: 'h-12 w-12',
  MEDIUM: 'h-4 w-4',
  SMALL: 'h-3 w-3',
  TINY: 'h-6 w-6',
} as const;

const DIMENSIONS = {
  MAX_HEIGHT: 'max-h-[400px]',
  BUTTON_HEIGHT: 'h-7',
} as const;

const CSS_CLASSES = {
  DISCONNECTED_BADGE: 'bg-yellow-50 text-yellow-700 border-yellow-200 text-xs',
  UNREAD_BACKGROUND: 'bg-primary/5',
  HOVER_BACKGROUND: 'hover:bg-accent/50',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getIconConfig(type: Notification['type']) {
  return ICON_CONFIG[type] || DEFAULT_ICON_CONFIG;
}

function getBadgeConfig(type: Notification['type']) {
  return BADGE_CONFIG[type] || DEFAULT_BADGE_CONFIG;
}

function formatTimestamp(timestamp: string): string {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: ptBR,
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

function NotificationPanel() {
  const notifications = useNotifications((state) => state.notifications);
  const isConnected = useNotifications((state) => state.isConnected);
  const markAsRead = useNotifications((state) => state.markAsRead);
  const markAllAsRead = useNotifications((state) => state.markAllAsRead);
  const clearNotifications = useNotifications((state) => state.clearAll);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasNotifications = useMemo(
    () => notifications.length > 0,
    [notifications.length]
  );

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  const unreadLabel = useMemo(
    () => LABELS.UNREAD_COUNT(unreadCount),
    [unreadCount]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
    },
    [markAsRead]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNotificationIcon = useCallback((type: Notification['type']) => {
    const { icon: Icon, color } = getIconConfig(type);
    return <Icon className={`${ICON_SIZES.MEDIUM} ${color}`} />;
  }, []);

  const renderNotificationBadge = useCallback((type: Notification['type']) => {
    const { label, className } = getBadgeConfig(type);
    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  }, []);

  const renderHeader = useCallback(
    () => (
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{LABELS.TITLE}</h3>
            {!isConnected && (
              <Badge variant="outline" className={CSS_CLASSES.DISCONNECTED_BADGE}>
                {LABELS.DISCONNECTED}
              </Badge>
            )}
          </div>
          {hasUnread && (
            <Badge variant="default" className="text-xs">
              {unreadLabel}
            </Badge>
          )}
        </div>

        {hasNotifications && (
          <div className="flex gap-2">
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className={`${DIMENSIONS.BUTTON_HEIGHT} text-xs`}
              >
                <CheckCheck className={`${ICON_SIZES.SMALL} mr-1`} />
                {LABELS.MARK_ALL_READ}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className={`${DIMENSIONS.BUTTON_HEIGHT} text-xs text-destructive hover:text-destructive`}
            >
              <Trash2 className={`${ICON_SIZES.SMALL} mr-1`} />
              {LABELS.CLEAR_ALL}
            </Button>
          </div>
        )}
      </div>
    ),
    [
      isConnected,
      hasUnread,
      hasNotifications,
      unreadLabel,
      markAllAsRead,
      clearNotifications,
    ]
  );

  const renderEmptyState = useCallback(
    () => (
      <div className="p-8 text-center">
        <Bell
          className={`${ICON_SIZES.LARGE} mx-auto mb-3 text-muted-foreground opacity-50`}
        />
        <p className="text-sm text-muted-foreground">{LABELS.EMPTY_TITLE}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {LABELS.EMPTY_DESCRIPTION}
        </p>
      </div>
    ),
    []
  );

  const renderNotification = useCallback(
    (notification: Notification) => (
      <div
        key={notification.id}
        className={`p-3 ${CSS_CLASSES.HOVER_BACKGROUND} transition-colors ${
          !notification.read ? CSS_CLASSES.UNREAD_BACKGROUND : ''
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="mt-0.5">
            {renderNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm leading-tight">
                {notification.title}
              </p>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${ICON_SIZES.TINY} flex-shrink-0`}
                  onClick={() => handleMarkAsRead(notification.id)}
                  title={LABELS.MARK_AS_READ}
                >
                  <Check className={ICON_SIZES.SMALL} />
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {notification.message}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {renderNotificationBadge(notification.type)}
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(notification.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [renderNotificationIcon, renderNotificationBadge, handleMarkAsRead]
  );

  const renderNotificationsList = useCallback(
    () => (
      <ScrollArea className={`flex-1 ${DIMENSIONS.MAX_HEIGHT}`}>
        {!hasNotifications ? (
          renderEmptyState()
        ) : (
          <div className="divide-y">{notifications.map(renderNotification)}</div>
        )}
      </ScrollArea>
    ),
    [hasNotifications, notifications, renderEmptyState, renderNotification]
  );

  const renderFooter = useCallback(
    () =>
      isConnected ? (
        <div className="p-2 border-t bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            {LABELS.CONNECTED}
          </p>
        </div>
      ) : null,
    [isConnected]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-full">
      {renderHeader()}
      {renderNotificationsList()}
      {renderFooter()}
    </div>
  );
}

export default NotificationPanel;
