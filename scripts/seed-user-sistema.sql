-- ============================================================================
-- SEED: Usuário Sistema
-- ============================================================================
-- Descrição: Cria usuário "Sistema" para ser usado como owner_id e created_by
--            em registros automáticos ou quando não há usuário autenticado
-- ============================================================================

-- Inserir usuário sistema (idempotente)
INSERT INTO users (
  id,
  email,
  name,
  role,
  created_at
) VALUES (
  '1',
  'sistema@intelmarket.app',
  'Sistema',
  'admin',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verificação
SELECT id, email, name, role FROM users WHERE id = '1';
