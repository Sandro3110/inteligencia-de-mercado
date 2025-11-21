import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotificationsSSE } from '@/hooks/useNotificationsSSE';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { NotificationPanel } from './NotificationPanel';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { unreadCount, isConnected } = useWebSocket();
  const utils = trpc.useUtils();

  // Conectar ao SSE para notificações em tempo real
  const { isConnected: sseConnected } = useNotificationsSSE({
    onNotification: (notification) => {
      // Invalidar cache de notificações
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();

      // Mostrar toast para notificações importantes
      if (notification.type !== 'welcome' && notification.title) {
        toast.info(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      }
    },
    onConnect: () => {
      console.log('[NotificationBell] SSE conectado');
    },
    onDisconnect: () => {
      console.log('[NotificationBell] SSE desconectado');
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={isConnected ? 'Notificações em tempo real' : 'Desconectado'}
        >
          <Bell className={cn(
            'h-5 w-5',
            !isConnected && 'text-muted-foreground'
          )} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-yellow-500" title="Desconectado" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <NotificationPanel />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
