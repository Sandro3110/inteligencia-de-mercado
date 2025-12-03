import { useState, useEffect } from 'react';

interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  endpoint: string;
  metodo: string;
  parametros: any;
  resultado: string;
  erro?: string;
  ip_address: string;
  user_agent: string;
  duracao_ms: number;
  custo: number;
  created_at: string;
}

interface AuditStats {
  total_logs: number;
  sucessos: number;
  erros: number;
  bloqueados: number;
  duracao_media: number;
  custo_total: number;
}

interface AuditFilters {
  userId?: string;
  action?: string;
  resultado?: string;
  limite?: number;
  offset?: number;
}

export function useAuditLogs(filters: AuditFilters = {}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    total_logs: 0,
    sucessos: 0,
    erros: 0,
    bloqueados: 0,
    duracao_media: 0,
    custo_total: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limite: filters.limite || 50,
    offset: filters.offset || 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.resultado) params.append('resultado', filters.resultado);
      params.append('limite', String(filters.limite || 50));
      params.append('offset', String(filters.offset || 0));
      
      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar logs');
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || {});
      setPagination(data.pagination || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters.userId, filters.action, filters.resultado, filters.limite, filters.offset]);

  return {
    logs,
    stats,
    pagination,
    loading,
    error,
    refresh: fetchLogs
  };
}
