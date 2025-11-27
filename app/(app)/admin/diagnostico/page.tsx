'use client';

import { useState, useEffect } from 'react';

export default function DiagnosticoPage() {
  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    executarDiagnostico();
  }, []);

  const executarDiagnostico = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/diagnostico');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao executar diagnóstico');
        return;
      }

      setDiagnostico(data);
    } catch (err) {
      setError('Erro de conexão: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔍 Executando Diagnóstico...</h1>
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e5e7eb',
            borderTop: '5px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#dc2626', fontSize: '20px', marginBottom: '10px' }}>❌ Erro</h2>
          <p style={{ color: '#991b1b' }}>{error}</p>
        </div>
        <button
          onClick={executarDiagnostico}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>🔍 Diagnóstico do Sistema</h1>

      {/* Status Geral */}
      <div
        style={{
          backgroundColor: diagnostico?.statusGeral === 'OK' ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${diagnostico?.statusGeral === 'OK' ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
        }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>
          {diagnostico?.statusGeral === 'OK' ? '✅' : '❌'} Status Geral
        </h2>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{diagnostico?.statusGeral}</p>
      </div>

      {/* Usuário Atual */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>👤 Usuário Atual</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Email:</td>
              <td style={{ padding: '10px' }}>{diagnostico?.usuario?.email}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Nome:</td>
              <td style={{ padding: '10px' }}>{diagnostico?.usuario?.nome}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Role:</td>
              <td style={{ padding: '10px' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: diagnostico?.usuario?.role === 'admin' ? '#10b981' : '#f59e0b',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  {diagnostico?.usuario?.role}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Ativo:</td>
              <td style={{ padding: '10px' }}>
                {diagnostico?.usuario?.ativo === 1 ? '✅ Sim' : '❌ Não'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Permissões */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>🔐 Permissões</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>{diagnostico?.permissoes?.podeAprovar ? '✅' : '❌'} Pode aprovar usuários</div>
          <div>{diagnostico?.permissoes?.eAdmin ? '✅' : '❌'} É administrador</div>
          <div>{diagnostico?.permissoes?.estaAtivo ? '✅' : '❌'} Está ativo</div>
        </div>
      </div>

      {/* Problemas Detectados */}
      {diagnostico?.problemas && diagnostico.problemas.length > 0 && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#92400e' }}>
            ⚠️ Problemas Detectados
          </h3>
          <ul style={{ marginLeft: '20px', color: '#92400e' }}>
            {diagnostico.problemas.map((problema: string, index: number) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                {problema}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Solução */}
      {diagnostico?.solucao && (
        <div
          style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #60a5fa',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#1e40af' }}>💡 Solução</h3>
          <p style={{ color: '#1e40af', lineHeight: '1.6' }}>{diagnostico.solucao}</p>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={executarDiagnostico}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          🔄 Atualizar Diagnóstico
        </button>
      </div>
    </div>
  );
}
