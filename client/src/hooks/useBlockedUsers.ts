import { useState, useEffect } from 'react';

interface BlockedUser {
  id: number;
  user_id: string;
  motivo: string;
  bloqueado_em: string;
  bloqueado_ate: string;
  bloqueado_por: string;
}

export function useBlockedUsers() {
  const [bloqueados, setBloqueados] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBloqueados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/usuarios-bloqueados');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários bloqueados');
      }
      
      const data = await response.json();
      setBloqueados(data.bloqueados || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bloquearUsuario = async (userId: string, motivo: string, minutos: number = 60) => {
    try {
      const response = await fetch('/api/usuarios-bloqueados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, motivo, minutos })
      });

      if (!response.ok) {
        throw new Error('Erro ao bloquear usuário');
      }

      // Recarregar lista
      await fetchBloqueados();
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const desbloquearUsuario = async (userId: string) => {
    try {
      const response = await fetch('/api/usuarios-bloqueados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Erro ao desbloquear usuário');
      }

      // Recarregar lista
      await fetchBloqueados();
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchBloqueados();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchBloqueados, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    bloqueados,
    loading,
    error,
    refresh: fetchBloqueados,
    bloquearUsuario,
    desbloquearUsuario
  };
}
