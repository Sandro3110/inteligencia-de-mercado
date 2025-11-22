/**
 * Middleware de Autenticação Compartilhado
 * 
 * Aplica autenticação baseada em sessão/cookie para endpoints Express
 * que não passam pelo tRPC (SSE, webhooks, etc)
 */

import type { Request, Response, NextFunction } from 'express';
import { sdk } from './sdk';
import type { User } from '../../drizzle/schema';

// Estender tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware que requer autenticação
 * Retorna 401 se usuário não estiver autenticado
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Authentication failed:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Middleware que tenta autenticar mas permite acesso sem autenticação
 * Útil para endpoints que podem ser públicos ou privados
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    req.user = user || undefined;
  } catch (error) {
    // Autenticação falhou, mas permitimos continuar
    req.user = undefined;
  }
  
  next();
}
