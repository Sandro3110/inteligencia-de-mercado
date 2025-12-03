import { useState, useEffect } from 'react';

interface RateLimit {
  user_id: string;
  endpoint: string;
  chamadas: number;
  janela_inicio: string;
  bloqueado_ate: string | null;
  bloqueado_ativo: boolean;
}

interface RateLimitStats {
  usuarios_ativos: number;
  total_chamadas: number;
  bloqueios_ativos: number;
  media_chamadas: number;
}

interface ProximoLimite {
  user_id: string;
  endpoint: string;
  chamadas: number;
  chamadas_restantes: number;
}

export function useRateLimits() {
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [proximosLimite, setProximosLimite] = useState<ProximoLimite[]>([]);
  const [stats, setStats] = useState<RateLimitStats>({
    usuarios_ativos: 0,
    total_chamadas: 0,
    bloqueios_ativos: 0,
    media_chamadas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRateLimits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/rate-limits');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar rate limits');
      }
      
      const data = await response.json();
      setRateLimits(data.rateLimits || []);
      setProximosLimite(data.proximosLimite || []);
      setStats(data.stats || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateLimits();
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchRateLimits, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    rateLimits,
    proximosLimite,
    stats,
    loading,
    error,
    refresh: fetchRateLimits
  };
}
