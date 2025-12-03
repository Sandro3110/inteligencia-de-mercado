// api/exportar-relatorio.js - Exportar relatórios em CSV
import postgres from 'postgres';

function gerarCSV(dados, colunas) {
  // Cabeçalho
  let csv = colunas.join(',') + '\n';
  
  // Linhas
  for (const linha of dados) {
    const valores = colunas.map(col => {
      const valor = linha[col];
      
      // Escapar vírgulas e aspas
      if (valor === null || valor === undefined) return '';
      const str = String(valor);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    
    csv += valores.join(',') + '\n';
  }
  
  return csv;
}

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
    const { tipo, periodo = '30', formato = 'csv' } = req.body;

    if (!tipo) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: tipo' });
    }

    let dados = [];
    let colunas = [];
    let nomeArquivo = '';

    // RELATÓRIO: Uso de IA
    if (tipo === 'uso_ia') {
      dados = await client`
        SELECT 
          user_id,
          processo,
          modelo,
          total_tokens,
          custo,
          duracao,
          sucesso,
          created_at::TEXT
        FROM ia_usage
        WHERE created_at >= NOW() - INTERVAL '${parseInt(periodo)} days'
        ORDER BY created_at DESC
      `;
      
      colunas = ['user_id', 'processo', 'modelo', 'total_tokens', 'custo', 'duracao', 'sucesso', 'created_at'];
      nomeArquivo = `uso_ia_${periodo}dias`;
    }

    // RELATÓRIO: Logs de Auditoria
    else if (tipo === 'auditoria') {
      dados = await client`
        SELECT 
          user_id,
          acao,
          endpoint,
          resultado,
          duracao_ms,
          custo,
          ip_address,
          created_at::TEXT
        FROM audit_logs
        WHERE created_at >= NOW() - INTERVAL '${parseInt(periodo)} days'
        ORDER BY created_at DESC
      `;
      
      colunas = ['user_id', 'acao', 'endpoint', 'resultado', 'duracao_ms', 'custo', 'ip_address', 'created_at'];
      nomeArquivo = `auditoria_${periodo}dias`;
    }

    // RELATÓRIO: Custos por Usuário
    else if (tipo === 'custos_usuario') {
      dados = await client`
        SELECT 
          user_id,
          COUNT(*)::INTEGER as total_chamadas,
          SUM(total_tokens)::INTEGER as total_tokens,
          SUM(custo)::NUMERIC as custo_total,
          AVG(duracao)::INTEGER as duracao_media
        FROM ia_usage
        WHERE created_at >= NOW() - INTERVAL '${parseInt(periodo)} days'
        AND sucesso = TRUE
        GROUP BY user_id
        ORDER BY custo_total DESC
      `;
      
      colunas = ['user_id', 'total_chamadas', 'total_tokens', 'custo_total', 'duracao_media'];
      nomeArquivo = `custos_usuario_${periodo}dias`;
    }

    // RELATÓRIO: Alertas de Segurança
    else if (tipo === 'alertas') {
      dados = await client`
        SELECT 
          user_id,
          tipo,
          descricao,
          severidade,
          resolvido,
          created_at::TEXT
        FROM alertas_seguranca
        WHERE created_at >= NOW() - INTERVAL '${parseInt(periodo)} days'
        ORDER BY created_at DESC
      `;
      
      colunas = ['user_id', 'tipo', 'descricao', 'severidade', 'resolvido', 'created_at'];
      nomeArquivo = `alertas_${periodo}dias`;
    }

    else {
      return res.status(400).json({ error: 'Tipo de relatório inválido' });
    }

    await client.end();

    // Gerar CSV
    if (formato === 'csv') {
      const csv = gerarCSV(dados, colunas);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}.csv"`);
      
      return res.send('\uFEFF' + csv); // BOM para UTF-8
    }

    // JSON (fallback)
    return res.json({
      success: true,
      dados,
      total: dados.length
    });

  } catch (error) {
    console.error('[Exportar Relatório] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
