// api/ia-job-status.js - Endpoint para consultar status de job
import postgres from 'postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: 'jobId é obrigatório' });
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    // Buscar job
    const [job] = await client`
      SELECT 
        id,
        status,
        progresso,
        etapa_atual,
        etapas_completas,
        dados_parciais,
        tempo_inicio,
        tempo_fim,
        duracao_ms,
        custo,
        erro
      FROM ia_jobs
      WHERE id = ${jobId}
    `;

    if (!job) {
      await client.end();
      return res.status(404).json({ error: 'Job não encontrado' });
    }

    // Parsear JSON
    const etapasCompletas = job.etapas_completas ? JSON.parse(job.etapas_completas) : [];
    const dadosParciais = job.dados_parciais ? JSON.parse(job.dados_parciais) : {};

    // Calcular tempo decorrido
    const tempoInicio = new Date(job.tempo_inicio).getTime();
    const tempoAtual = job.tempo_fim ? new Date(job.tempo_fim).getTime() : Date.now();
    const elapsed = tempoAtual - tempoInicio;

    // Estimar tempo total baseado no progresso
    const estimated = job.progresso > 0 ? (elapsed / job.progresso) * 100 : 25000;

    // Determinar etapas pendentes
    const todasEtapas = ['cliente', 'mercado', 'produtos', 'concorrentes', 'leads'];
    const pending = todasEtapas.filter(e => !etapasCompletas.includes(e) && e !== job.etapa_atual);

    await client.end();

    return res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progresso,
      currentStep: job.etapa_atual,
      completed: etapasCompletas,
      pending,
      data: dadosParciais,
      elapsed,
      estimated: Math.round(estimated),
      cost: parseFloat(job.custo || 0),
      error: job.erro
    });

  } catch (error) {
    console.error('[Job Status] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
