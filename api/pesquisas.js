import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projetoId } = req.query;
    
    let query = supabase
      .from('dim_pesquisa')
      .select('id, nome, status, created_at')
      .order('id', { ascending: false })
      .limit(100);
    
    if (projetoId) {
      query = query.eq('projeto_id', projetoId);
    }

    const { data: pesquisas, error } = await query;

    if (error) throw error;

    res.status(200).json({ 
      pesquisas: pesquisas || [],
      total: pesquisas?.length || 0
    });
  } catch (error) {
    console.error('Erro ao buscar pesquisas:', error);
    res.status(500).json({ error: 'Erro ao buscar pesquisas' });
  }
}
