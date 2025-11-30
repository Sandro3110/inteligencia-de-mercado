'use client';

/**
 * NotificationBell - Versão Simplificada
 * Sino de notificações com contador
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationPanel } from './NotificationPanel';
import { useUnreadCount } from '@/hooks/useNotifications';

interface NotificationBellProps {
  projectId?: number;
}

export function NotificationBell({ projectId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount(projectId);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" title="Notificações em tempo real">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <NotificationPanel projectId={projectId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
