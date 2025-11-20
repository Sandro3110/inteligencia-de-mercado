import { useWebSocket, Notification } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCheck, 
  Trash2, 
  Check, 
  Bell,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useWebSocket();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'enrichment_complete':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'new_lead':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'quality_alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'system':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: Notification['type']) => {
    switch (type) {
      case 'enrichment_complete':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case 'new_lead':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Novo Lead</Badge>;
      case 'quality_alert':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Alerta</Badge>;
      case 'system':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Sistema</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {!isConnected && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                Desconectado
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-xs">
              {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
            </Badge>
          )}
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Limpar tudo
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1 max-h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Você receberá notificações em tempo real aqui
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 hover:bg-accent/50 transition-colors ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
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
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => markAsRead(notification.id)}
                          title="Marcar como lida"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {getNotificationBadge(notification.type)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {isConnected && (
        <div className="p-2 border-t bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            🟢 Conectado - Notificações em tempo real ativas
          </p>
        </div>
      )}
    </div>
  );
}
