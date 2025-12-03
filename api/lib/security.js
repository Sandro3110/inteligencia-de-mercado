// Módulo de segurança - Autenticação, Rate Limiting e Auditoria
import jwt from 'jsonwebtoken';

// ============================================================================
// AUTENTICAÇÃO JWT
// ============================================================================

export async function verificarAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Token não fornecido');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-dev');
    return decoded; // { userId, email, role }
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export async function verificarRateLimit(userId, endpoint, client, limite = 10, janela = 60) {
  const agora = new Date();
  
  // Buscar registro
  let [registro] = await client`
    SELECT chamadas, janela_inicio, bloqueado_ate
    FROM rate_limits
    WHERE user_id = ${userId}
    AND endpoint = ${endpoint}
  `;
  
  // Verificar se está bloqueado
  if (registro?.bloqueado_ate && new Date(registro.bloqueado_ate) > agora) {
    const segundos = Math.ceil((new Date(registro.bloqueado_ate) - agora) / 1000);
    throw new Error(`Rate limit excedido. Tente novamente em ${segundos}s`);
  }
  
  // Criar ou resetar janela
  if (!registro || (agora - new Date(registro.janela_inicio)) > janela * 1000) {
    await client`
      INSERT INTO rate_limits (user_id, endpoint, chamadas, janela_inicio)
      VALUES (${userId}, ${endpoint}, 1, NOW())
      ON CONFLICT (user_id, endpoint) DO UPDATE SET
        chamadas = 1,
        janela_inicio = NOW(),
        bloqueado_ate = NULL
    `;
    return true;
  }
  
  // Incrementar contador
  const novasChamadas = registro.chamadas + 1;
  
  if (novasChamadas > limite) {
    // Bloquear por 5 minutos
    await client`
      UPDATE rate_limits
      SET bloqueado_ate = NOW() + INTERVAL '5 minutes'
      WHERE user_id = ${userId} AND endpoint = ${endpoint}
    `;
    
    // Registrar alerta
    await registrarAlerta(userId, 'rate_limit', `Rate limit excedido: ${novasChamadas}/${limite} em ${janela}s`, 'media', client);
    
    throw new Error(`Rate limit excedido (${limite}/${janela}s). Bloqueado por 5 minutos.`);
  }
  
  await client`
    UPDATE rate_limits
    SET chamadas = ${novasChamadas}
    WHERE user_id = ${userId} AND endpoint = ${endpoint}
  `;
  
  return true;
}

// ============================================================================
// AUDITORIA
// ============================================================================

export async function registrarAuditoria(dados, client) {
  try {
    await client`
      INSERT INTO audit_logs (
        user_id, acao, endpoint, metodo, parametros,
        resultado, erro, ip_address, user_agent, duracao_ms, custo
      ) VALUES (
        ${dados.userId},
        ${dados.acao},
        ${dados.endpoint},
        ${dados.metodo || 'POST'},
        ${dados.parametros ? JSON.stringify(dados.parametros) : null},
        ${dados.resultado || 'sucesso'},
        ${dados.erro || null},
        ${dados.ip || null},
        ${dados.userAgent || null},
        ${dados.duracao || null},
        ${dados.custo || null}
      )
    `;
  } catch (error) {
    console.error('[Auditoria] Erro ao registrar:', error);
  }
}

// ============================================================================
// DETECÇÃO DE ABUSO
// ============================================================================

export async function detectarAbuso(userId, client) {
  const [stats] = await client`
    SELECT 
      COUNT(*) as total_chamadas,
      SUM(CASE WHEN resultado = 'erro' THEN 1 ELSE 0 END) as erros,
      SUM(custo) as custo_total
    FROM audit_logs
    WHERE user_id = ${userId}
    AND created_at > NOW() - INTERVAL '1 hour'
  `;
  
  const alertas = [];
  
  // Muitas chamadas
  if (stats.total_chamadas > 100) {
    alertas.push({
      tipo: 'abuso_chamadas',
      descricao: `${stats.total_chamadas} chamadas em 1 hora`,
      severidade: 'alta'
    });
  }
  
  // Muitos erros
  if (stats.erros > 20) {
    alertas.push({
      tipo: 'abuso_erros',
      descricao: `${stats.erros} erros em 1 hora`,
      severidade: 'media'
    });
  }
  
  // Custo alto
  if (stats.custo_total > 1.0) {
    alertas.push({
      tipo: 'custo_alto',
      descricao: `Custo de $${stats.custo_total.toFixed(2)} em 1 hora`,
      severidade: 'alta'
    });
  }
  
  // Registrar alertas
  for (const alerta of alertas) {
    await registrarAlerta(userId, alerta.tipo, alerta.descricao, alerta.severidade, client);
  }
  
  // Bloquear se muito grave
  if (stats.total_chamadas > 200) {
    await bloquearUsuario(userId, 'Abuso detectado: mais de 200 chamadas em 1 hora', 60, client);
  }
  
  return alertas;
}

// ============================================================================
// BLOQUEIOS
// ============================================================================

export async function bloquearUsuario(userId, motivo, minutos, client) {
  await client`
    INSERT INTO usuarios_bloqueados (user_id, motivo, bloqueado_ate)
    VALUES (
      ${userId},
      ${motivo},
      NOW() + INTERVAL '${minutos} minutes'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      motivo = EXCLUDED.motivo,
      bloqueado_em = NOW(),
      bloqueado_ate = EXCLUDED.bloqueado_ate
  `;
  
  await registrarAlerta(userId, 'bloqueio', `Usuário bloqueado: ${motivo}`, 'critica', client);
}

export async function desbloquearUsuario(userId, client) {
  await client`
    DELETE FROM usuarios_bloqueados
    WHERE user_id = ${userId}
  `;
  
  await registrarAlerta(userId, 'desbloqueio', 'Usuário desbloqueado manualmente', 'baixa', client);
}

export async function verificarBloqueio(userId, client) {
  const [bloqueado] = await client`
    SELECT bloqueado_ate, motivo
    FROM usuarios_bloqueados
    WHERE user_id = ${userId}
    AND bloqueado_ate > NOW()
  `;
  
  if (bloqueado) {
    const segundos = Math.ceil((new Date(bloqueado.bloqueado_ate) - new Date()) / 1000);
    throw new Error(`Usuário bloqueado: ${bloqueado.motivo}. Desbloqueio em ${Math.ceil(segundos / 60)} minutos.`);
  }
  
  return false;
}

// ============================================================================
// ALERTAS
// ============================================================================

export async function registrarAlerta(userId, tipo, descricao, severidade, client) {
  try {
    await client`
      INSERT INTO alertas_seguranca (user_id, tipo, descricao, severidade)
      VALUES (${userId}, ${tipo}, ${descricao}, ${severidade})
    `;
  } catch (error) {
    console.error('[Alertas] Erro ao registrar:', error);
  }
}

export async function resolverAlerta(alertaId, client) {
  await client`
    UPDATE alertas_seguranca
    SET resolvido = true
    WHERE id = ${alertaId}
  `;
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

export async function verificarSeguranca(req, client, options = {}) {
  const {
    rateLimit = 10,
    janela = 60,
    verificarBloqueioAtivo = true
  } = options;
  
  // 1. Autenticação JWT
  const user = await verificarAuth(req);
  
  // 2. Verificar bloqueio
  if (verificarBloqueioAtivo) {
    await verificarBloqueio(user.userId || user.id, client);
  }
  
  // 3. Rate limiting
  await verificarRateLimit(user.userId || user.id, req.url, client, rateLimit, janela);
  
  // 4. Detectar abuso (assíncrono, não bloqueia)
  detectarAbuso(user.userId || user.id, client).catch(err => {
    console.error('[Abuso] Erro ao detectar:', err);
  });
  
  return user;
}
