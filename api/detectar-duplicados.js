// api/detectar-duplicados.js - Detectar empresas duplicadas
import postgres from 'postgres';
import { calcularSimilaridade } from './lib/validacao.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    const { nome, cnpj, entidadeId } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: nome' });
    }

    // Buscar empresas similares por nome
    const empresasSimilares = await client`
      SELECT id, nome, cnpj, cidade, uf, created_at
      FROM dim_entidade
      WHERE nome ILIKE ${`%${nome.substring(0, 5)}%`}
      ${entidadeId ? client`AND id != ${entidadeId}` : client``}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Calcular similaridade
    const candidatos = empresasSimilares
      .map(empresa => ({
        ...empresa,
        similaridade: calcularSimilaridade(nome, empresa.nome)
      }))
      .filter(empresa => empresa.similaridade >= 0.7) // 70% similar
      .sort((a, b) => b.similaridade - a.similaridade);

    // Se tem CNPJ, verificar duplicata exata
    let duplicataExata = null;
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const [exata] = await client`
        SELECT id, nome, cnpj, cidade, uf
        FROM dim_entidade
        WHERE cnpj LIKE ${`%${cnpjLimpo}%`}
        ${entidadeId ? client`AND id != ${entidadeId}` : client``}
      `;
      
      if (exata) {
        duplicataExata = exata;
      }
    }

    await client.end();

    return res.json({
      success: true,
      duplicado: candidatos.length > 0 || duplicataExata !== null,
      duplicataExata,
      candidatos,
      total: candidatos.length
    });

  } catch (error) {
    console.error('[Detectar Duplicados] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
