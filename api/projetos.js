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
    const { data: projetos, error } = await supabase
      .from('dim_projeto')
      .select('id, nome, codigo, status')
      .order('id', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.status(200).json({ 
      projetos: projetos || [],
      total: projetos?.length || 0
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
}
