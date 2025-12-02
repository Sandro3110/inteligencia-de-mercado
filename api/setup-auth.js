import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar secret de setup (proteção básica)
  const { secret } = req.body;
  if (secret !== 'setup-intelmarket-2025') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'Database não configurado' });
  }

  const client = postgres(connectionString);

  try {
    console.log('🚀 Iniciando setup de autenticação...');

    // 1. Criar tabela de roles
    await client`
      CREATE TABLE IF NOT EXISTS public.roles (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(50) UNIQUE NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Inserir roles
    await client`
      INSERT INTO public.roles (nome, descricao) VALUES
        ('administrador', 'Administrador com acesso total'),
        ('gerente', 'Gerente com acesso a projetos'),
        ('analista', 'Analista com acesso a dados'),
        ('visualizador', 'Visualizador somente leitura')
      ON CONFLICT (nome) DO NOTHING
    `;

    // 3. Criar tabela de usuários
    await client`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id VARCHAR(255) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        role_id INTEGER NOT NULL REFERENCES public.roles(id) DEFAULT 4,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 4. Criar índices
    await client`CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email)`;
    await client`CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role_id)`;

    // 5. Buscar ID do role administrador
    const [adminRole] = await client`SELECT id FROM public.roles WHERE nome = 'administrador'`;
    const adminRoleId = adminRole.id;

    // 6. Criar usuários administradores
    const user1Id = randomUUID();
    const user1Hash = await bcrypt.hash('Ss311000!', 10);

    await client`
      INSERT INTO public.user_profiles (id, nome, email, senha_hash, role_id)
      VALUES (${user1Id}, 'Sandro Direto', 'sandrodireto@gmail.com', ${user1Hash}, ${adminRoleId})
      ON CONFLICT (email) DO UPDATE SET senha_hash = ${user1Hash}, role_id = ${adminRoleId}
    `;

    const user2Id = randomUUID();
    const user2Hash = await bcrypt.hash('123456!', 10);

    await client`
      INSERT INTO public.user_profiles (id, nome, email, senha_hash, role_id)
      VALUES (${user2Id}, 'CM Busso', 'cmbusso@gmail.com', ${user2Hash}, ${adminRoleId})
      ON CONFLICT (email) DO UPDATE SET senha_hash = ${user2Hash}, role_id = ${adminRoleId}
    `;

    // 7. Estatísticas
    const [stats] = await client`
      SELECT 
        (SELECT COUNT(*) FROM public.roles) AS total_roles,
        (SELECT COUNT(*) FROM public.user_profiles) AS total_users
    `;

    res.json({
      success: true,
      message: 'Setup de autenticação concluído!',
      stats: {
        roles: parseInt(stats.total_roles),
        users: parseInt(stats.total_users),
      },
      usuarios_criados: [
        { email: 'sandrodireto@gmail.com', senha: 'Ss311000!', papel: 'Administrador' },
        { email: 'cmbusso@gmail.com', senha: '123456!', papel: 'Administrador' },
      ],
    });

  } catch (error) {
    console.error('Erro no setup:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
}
