// api/usuarios-bloqueados.js - Gerenciar usuários bloqueados
import postgres from 'postgres';
import { bloquearUsuario, desbloquearUsuario } from './lib/security.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    // GET - Listar bloqueados
    if (req.method === 'GET') {
      const bloqueados = await client`
        SELECT 
          id, user_id, motivo, bloqueado_em, bloqueado_ate, bloqueado_por
        FROM usuarios_bloqueados
        WHERE bloqueado_ate > NOW()
        ORDER BY bloqueado_em DESC
      `;

      await client.end();

      return res.json({
        success: true,
        bloqueados,
        total: bloqueados.length
      });
    }

    // POST - Bloquear usuário
    if (req.method === 'POST') {
      const { userId, motivo, minutos = 60 } = req.body;

      if (!userId || !motivo) {
        return res.status(400).json({ error: 'userId e motivo são obrigatórios' });
      }

      await bloquearUsuario(userId, motivo, minutos, client);

      await client.end();

      return res.json({
        success: true,
        message: `Usuário ${userId} bloqueado por ${minutos} minutos`
      });
    }

    // DELETE - Desbloquear usuário
    if (req.method === 'DELETE') {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      await desbloquearUsuario(userId, client);

      await client.end();

      return res.json({
        success: true,
        message: `Usuário ${userId} desbloqueado`
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('[Usuários Bloqueados] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
