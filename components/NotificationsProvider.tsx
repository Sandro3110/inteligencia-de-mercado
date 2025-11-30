'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useNotificationsPolling } from '@/hooks/useNotificationsPolling';

/**
 * NotificationsProvider
 *
 * Provider que inicializa o polling de notificações
 * Deve ser usado uma vez no layout principal
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | undefined>();

  // Buscar userId do Supabase
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    };

    getUser();
  }, []);

  // Iniciar polling
  useNotificationsPolling({
    userId,
    pollingInterval: 30000, // 30 segundos
    enabled: !!userId,
  });

  return <>{children}</>;
}
