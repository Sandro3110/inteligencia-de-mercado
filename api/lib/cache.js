// Módulo de cache para IA
import postgres from 'postgres';

// Gerar chave de cache normalizada
export function gerarCacheKey(tipo, ...params) {
  const normalized = params
    .map(p => String(p).toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    .join('_');
  return `${tipo}_${normalized}`;
}

// Buscar no cache
export async function getCache(client, cacheKey) {
  try {
    const [cached] = await client`
      SELECT dados, expires_at, hits
      FROM ia_cache
      WHERE cache_key = ${cacheKey}
      AND expires_at > NOW()
    `;

    if (cached) {
      // Incrementar hits
      await client`
        UPDATE ia_cache
        SET hits = hits + 1,
            last_hit_at = NOW()
        WHERE cache_key = ${cacheKey}
      `;

      return cached.dados;
    }

    return null;
  } catch (error) {
    console.error('[Cache] Erro ao buscar:', error);
    return null;
  }
}

// Salvar no cache
export async function saveCache(client, cacheKey, tipo, dados, diasExpiracao = 30) {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + diasExpiracao);

    await client`
      INSERT INTO ia_cache (cache_key, tipo, dados, expires_at)
      VALUES (${cacheKey}, ${tipo}, ${JSON.stringify(dados)}, ${expiresAt})
      ON CONFLICT (cache_key) DO UPDATE SET
        dados = EXCLUDED.dados,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW()
    `;

    return true;
  } catch (error) {
    console.error('[Cache] Erro ao salvar:', error);
    return false;
  }
}

// Limpar cache expirado
export async function limparCacheExpirado(client) {
  try {
    const result = await client`
      DELETE FROM ia_cache
      WHERE expires_at < NOW()
    `;

    return result.count;
  } catch (error) {
    console.error('[Cache] Erro ao limpar:', error);
    return 0;
  }
}

// Estatísticas do cache
export async function estatisticasCache(client) {
  try {
    const [stats] = await client`
      SELECT 
        COUNT(*) as total,
        SUM(hits) as total_hits,
        AVG(hits) as avg_hits,
        COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as ativos
      FROM ia_cache
    `;

    return stats;
  } catch (error) {
    console.error('[Cache] Erro ao obter estatísticas:', error);
    return null;
  }
}
