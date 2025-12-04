import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecnzlynmuerbmqingyfl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbnpseW5tdWVyYm1xaW5neWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjI5NzEsImV4cCI6MjA0ODczODk3MX0.AwfAHhQRXy0Y-hNxZXCHNdJjPLAZq0VPHdC8YJpuWQc';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extrair query params
    const {
      tipo,
      projeto_id,
      pesquisa_id,
      busca,
      cidade,
      uf,
      setor,
      porte,
      score_min,
      score_max,
      enriquecido,
      data_inicio,
      data_fim,
      validacao_cnpj,
      validacao_email,
      validacao_telefone,
      limit = '50',
      offset = '0'
    } = req.query;

    // Query base - buscar TODOS os 48 campos de dim_entidade
    let query = supabase
      .from('dim_entidade')
      .select(`
        id,
        entidade_hash,
        tipo_entidade,
        nome,
        nome_fantasia,
        cnpj,
        email,
        telefone,
        site,
        num_filiais,
        num_lojas,
        num_funcionarios,
        origem_tipo,
        origem_arquivo,
        origem_processo,
        origem_prompt,
        origem_confianca,
        origem_data,
        origem_usuario_id,
        created_at,
        created_by,
        updated_at,
        updated_by,
        deleted_at,
        deleted_by,
        importacao_id,
        cnpj_hash,
        cpf_hash,
        email_hash,
        telefone_hash,
        cidade,
        uf,
        porte,
        setor,
        produto_principal,
        segmentacao_b2b_b2c,
        score_qualidade,
        enriquecido_em,
        enriquecido_por,
        cache_hit,
        cache_expires_at,
        score_qualidade_dados,
        validacao_cnpj,
        validacao_email,
        validacao_telefone,
        campos_faltantes,
        ultima_validacao,
        status_qualificacao_id
      `, { count: 'exact' })
      .is('deleted_at', null); // Não retornar registros deletados

    // Filtro: tipo_entidade
    if (tipo) {
      query = query.eq('tipo_entidade', tipo);
    }

    // Filtro: busca textual (nome, CNPJ, email)
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,cnpj.ilike.%${busca}%,email.ilike.%${busca}%`);
    }

    // Filtro: cidade
    if (cidade) {
      query = query.eq('cidade', cidade);
    }

    // Filtro: uf
    if (uf) {
      query = query.eq('uf', uf);
    }

    // Filtro: setor
    if (setor) {
      query = query.eq('setor', setor);
    }

    // Filtro: porte
    if (porte) {
      query = query.eq('porte', porte);
    }

    // Filtro: score_qualidade_dados (range)
    if (score_min) {
      query = query.gte('score_qualidade_dados', parseInt(score_min));
    }
    if (score_max) {
      query = query.lte('score_qualidade_dados', parseInt(score_max));
    }

    // Filtro: enriquecido (boolean)
    if (enriquecido === 'true') {
      query = query.not('enriquecido_em', 'is', null);
    } else if (enriquecido === 'false') {
      query = query.is('enriquecido_em', null);
    }

    // Filtro: data_criacao (range)
    if (data_inicio) {
      query = query.gte('created_at', data_inicio);
    }
    if (data_fim) {
      query = query.lte('created_at', data_fim);
    }

    // Filtro: validacao_cnpj
    if (validacao_cnpj === 'true') {
      query = query.eq('validacao_cnpj', true);
    }

    // Filtro: validacao_email
    if (validacao_email === 'true') {
      query = query.eq('validacao_email', true);
    }

    // Filtro: validacao_telefone
    if (validacao_telefone === 'true') {
      query = query.eq('validacao_telefone', true);
    }

    // Paginação
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);
    query = query.range(offsetInt, offsetInt + limitInt - 1);

    // Ordenação
    query = query.order('created_at', { ascending: false });

    // Executar query
    const { data: entidades, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar entidades:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Se projeto_id ou pesquisa_id foram passados, filtrar por fato_entidade_contexto
    let entidadesFiltradas = entidades;
    let totalFiltrado = count;

    if (projeto_id || pesquisa_id) {
      // Buscar IDs de entidades vinculadas ao projeto/pesquisa
      let contextoQuery = supabase
        .from('fato_entidade_contexto')
        .select('entidade_id');

      if (projeto_id) {
        contextoQuery = contextoQuery.eq('projeto_id', parseInt(projeto_id));
      }

      if (pesquisa_id) {
        contextoQuery = contextoQuery.eq('pesquisa_id', parseInt(pesquisa_id));
      }

      const { data: contextos, error: contextoError } = await contextoQuery;

      if (contextoError) {
        console.error('Erro ao buscar contextos:', contextoError);
        return res.status(500).json({ success: false, error: contextoError.message });
      }

      // Extrair IDs de entidades
      const entidadeIds = contextos.map(c => c.entidade_id);

      // Filtrar entidades
      entidadesFiltradas = entidades.filter(e => entidadeIds.includes(e.id));
      totalFiltrado = entidadesFiltradas.length;
    }

    // Retornar resposta
    return res.status(200).json({
      success: true,
      data: entidadesFiltradas,
      total: totalFiltrado,
      limit: limitInt,
      offset: offsetInt,
      filters: {
        tipo,
        projeto_id: projeto_id ? parseInt(projeto_id) : null,
        pesquisa_id: pesquisa_id ? parseInt(pesquisa_id) : null,
        busca,
        cidade,
        uf,
        setor,
        porte,
        score_min: score_min ? parseInt(score_min) : null,
        score_max: score_max ? parseInt(score_max) : null,
        enriquecido,
        data_inicio,
        data_fim,
        validacao_cnpj: validacao_cnpj === 'true',
        validacao_email: validacao_email === 'true',
        validacao_telefone: validacao_telefone === 'true'
      }
    });

  } catch (error) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}
