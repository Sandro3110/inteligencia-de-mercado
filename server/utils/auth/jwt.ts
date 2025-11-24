import jwt from "jsonwebtoken";

/**
 * Payload do JWT contendo informações do usuário
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "visualizador";
  nome: string;
}

/**
 * Configuração do JWT
 */
const JWT_SECRET = process.env.JWT_SECRET || "intelmarket-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token válido por 7 dias

/**
 * Gera um token JWT para o usuário
 * @param payload Dados do usuário para incluir no token
 * @returns Token JWT assinado
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifica e decodifica um token JWT
 * @param token Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 * @param authHeader Header Authorization (formato: "Bearer <token>")
 * @returns Token extraído ou null
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
