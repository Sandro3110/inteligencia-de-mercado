import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'intelmarket-secret-2025-change-me';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'Database não configurado' });
  }

  const client = postgres(connectionString);

  try {
    // Buscar usuário com role
    const [user] = await client`
      SELECT 
        up.*,
        r.nome as role_nome,
        r.descricao as role_descricao
      FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.email = ${email} AND up.ativo = true
    `;

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Atualizar último acesso
    await client`
      UPDATE public.user_profiles
      SET ultimo_acesso = NOW()
      WHERE id = ${user.id}
    `;

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        nome: user.nome,
        roleId: user.role_id,
        roleName: user.role_nome,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: {
          id: user.role_id,
          nome: user.role_nome,
          descricao: user.role_descricao,
        },
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  } finally {
    await client.end();
  }
}
