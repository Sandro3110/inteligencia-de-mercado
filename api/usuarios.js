import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'intelmarket-secret-2025-change-me';

// Middleware de autenticação
function verificarToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('Token não fornecido');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

export default async function handler(req, res) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'Database não configurado' });
  }

  const client = postgres(connectionString);

  try {
    // Verificar autenticação
    const userAuth = verificarToken(req);

    // GET: Listar usuários
    if (req.method === 'GET') {
      const usuarios = await client`
        SELECT 
          up.id,
          up.nome,
          up.email,
          up.ativo,
          up.created_at,
          up.ultimo_acesso,
          r.id as role_id,
          r.nome as role_nome,
          r.descricao as role_descricao
        FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        ORDER BY up.created_at DESC
      `;

      return res.json({ success: true, usuarios });
    }

    // POST: Criar usuário
    if (req.method === 'POST') {
      const { nome, email, senha, roleId } = req.body;

      if (!nome || !email || !senha || !roleId) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      // Verificar se email já existe
      const [existente] = await client`
        SELECT id FROM public.user_profiles WHERE email = ${email}
      `;

      if (existente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criar usuário
      const userId = randomUUID();
      const senhaHash = await bcrypt.hash(senha, 10);

      const [novoUsuario] = await client`
        INSERT INTO public.user_profiles (id, nome, email, senha_hash, role_id)
        VALUES (${userId}, ${nome}, ${email}, ${senhaHash}, ${roleId})
        RETURNING id, nome, email, role_id, ativo, created_at
      `;

      return res.json({ success: true, usuario: novoUsuario });
    }

    // PUT: Atualizar usuário
    if (req.method === 'PUT') {
      const { id, nome, email, roleId, ativo, senha } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      // Atualizar dados
      if (senha) {
        const senhaHash = await bcrypt.hash(senha, 10);
        await client`
          UPDATE public.user_profiles
          SET nome = ${nome},
              email = ${email},
              role_id = ${roleId},
              ativo = ${ativo},
              senha_hash = ${senhaHash}
          WHERE id = ${id}
        `;
      } else {
        await client`
          UPDATE public.user_profiles
          SET nome = ${nome},
              email = ${email},
              role_id = ${roleId},
              ativo = ${ativo}
          WHERE id = ${id}
        `;
      }

      return res.json({ success: true, message: 'Usuário atualizado' });
    }

    // DELETE: Excluir usuário
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      await client`
        DELETE FROM public.user_profiles WHERE id = ${id}
      `;

      return res.json({ success: true, message: 'Usuário excluído' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Erro na API de usuários:', error);
    
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
}
