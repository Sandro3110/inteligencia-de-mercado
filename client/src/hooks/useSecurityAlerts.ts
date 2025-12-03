import { useState, useEffect } from 'react';

interface SecurityAlert {
  id: number;
  user_id: string;
  tipo: string;
  descricao: string;
  severidade: 'critica' | 'alta' | 'media' | 'baixa';
  resolvido: boolean;
  created_at: string;
}

interface AlertStats {
  total: number;
  ativos: number;
  criticos: number;
  altos: number;
  medios: number;
  baixos: number;
}

export function useSecurityAlerts(resolvido: boolean = false) {
  const [alertas, setAlertas] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    ativos: 0,
    criticos: 0,
    altos: 0,
    medios: 0,
    baixos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/alertas-seguranca?resolvido=${resolvido}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar alertas');
      }
      
      const data = await response.json();
      setAlertas(data.alertas || []);
      setStats(data.stats || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resolverAlerta = async (alertaId: number) => {
    try {
      const response = await fetch('/api/alertas-seguranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertaId })
      });

      if (!response.ok) {
        throw new Error('Erro ao resolver alerta');
      }

      // Recarregar alertas
      await fetchAlertas();
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchAlertas();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAlertas, 30000);
    
    return () => clearInterval(interval);
  }, [resolvido]);

  return {
    alertas,
    stats,
    loading,
    error,
    refresh: fetchAlertas,
    resolverAlerta
  };
}
