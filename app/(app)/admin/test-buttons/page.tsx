'use client';

export default function TestButtonsPage() {
  const handleClick = () => {
    alert('Botão funcionou!');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        🧪 TESTE DE BOTÕES
      </h1>

      <div
        style={{
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px',
          backgroundColor: 'white',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Usuário Teste
        </h2>

        <p style={{ marginBottom: '16px', color: '#6b7280' }}>Email: teste@example.com</p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleClick}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            ✅ Aprovar (HTML Puro)
          </button>

          <button
            onClick={handleClick}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            ❌ Rejeitar (HTML Puro)
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#92400e' }}>
          <strong>📝 Instruções:</strong>
          <br />
          1. Se estes botões aparecem → Problema é nos componentes UI
          <br />
          2. Se não aparecem → Problema é no navegador/cache
          <br />
          3. Clique nos botões para testar onClick
        </p>
      </div>

      <div style={{ marginTop: '24px' }}>
        <a
          href="/admin/users"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
          }}
        >
          ← Voltar para Admin/Users
        </a>
      </div>
    </div>
  );
}
