import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projetoId, pesquisaId, csvData, nomeArquivo } = req.body;

    if (!projetoId || !pesquisaId || !csvData || !Array.isArray(csvData)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    console.log(`Importando ${csvData.length} entidades...`);

    const entidadesParaInserir = csvData.map(row => ({
      entidade_hash: crypto.createHash('md5').update(`${row.nome}_${row.cnpj}_${Date.now()}`).digest('hex'),
      nome: row.nome || 'Sem nome',
      cnpj: row.cnpj || '',
      tipo_entidade: row.tipo_entidade || 'cliente',
      email: row.email || null,
      telefone: row.telefone || null,
      site: row.site || null,
      nome_fantasia: row.nome_fantasia || null,
      num_filiais: row.num_filiais || 0,
      num_lojas: row.num_lojas || 0,
      num_funcionarios: row.num_funcionarios || null,
      origem_tipo: 'importacao',
      origem_arquivo: nomeArquivo,
      origem_data: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('dim_entidade')
      .insert(entidadesParaInserir)
      .select('id');

    if (error) {
      console.error('Erro ao inserir entidades:', error);
      throw error;
    }

    console.log(`✅ ${data.length} entidades importadas com sucesso`);

    res.status(200).json({
      success: true,
      importacaoId: Date.now(),
      totalImportadas: data.length,
      message: `${data.length} entidades importadas com sucesso`
    });

  } catch (error) {
    console.error('Erro na importação:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erro ao importar entidades' 
    });
  }
}
