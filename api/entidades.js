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
    const { data: entidades, error } = await supabase
      .from('dim_entidade')
      .select('id, nome, cnpj, tipo_entidade')
      .order('id', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.status(200).json({ 
      entidades: entidades || [],
      total: entidades?.length || 0
    });
  } catch (error) {
    console.error('Erro ao buscar entidades:', error);
    res.status(500).json({ error: 'Erro ao buscar entidades' });
  }
}
