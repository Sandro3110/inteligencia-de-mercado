-- Criar usuário sistema com ID=1
INSERT INTO dim_usuario (id, nome, email, status, created_at, updated_at)
VALUES (1, 'Sistema', 'sistema@intelmarket.app', 'ativo', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
