'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWebSocket } from "@/hooks/useWebSocket";
import { NotificationPanel } from "./NotificationPanel";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { unreadCount, isConnected } = useWebSocket();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={isConnected ? "Notificações em tempo real" : "Desconectado"}
        >
          <Bell
            className={cn("h-5 w-5", !isConnected && "text-muted-foreground")}
          />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <span
              className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-yellow-500"
              title="Desconectado"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <NotificationPanel />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
