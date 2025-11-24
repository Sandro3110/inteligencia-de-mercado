import { TRPCError } from "@trpc/server";
import { verifyToken, JWTPayload } from "./jwt";

/**
 * Verifica se o usuário está autenticado através do token JWT
 * @param authHeader Header Authorization
 * @returns Payload do JWT ou lança erro
 */
export function requireAuth(authHeader?: string): JWTPayload {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token de autenticação não fornecido",
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token inválido ou expirado",
    });
  }

  return payload;
}

/**
 * Verifica se o usuário tem perfil de administrador
 * @param payload Payload do JWT
 * @throws TRPCError se não for admin
 */
export function requireAdmin(payload: JWTPayload): void {
  if (payload.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores podem realizar esta ação.",
    });
  }
}

/**
 * Verifica se o usuário pode acessar o recurso
 * Admin pode acessar tudo, usuário comum só seus próprios recursos
 * @param payload Payload do JWT
 * @param resourceUserId ID do usuário dono do recurso
 * @throws TRPCError se não tiver permissão
 */
export function requireOwnershipOrAdmin(
  payload: JWTPayload,
  resourceUserId: string
): void {
  if (payload.role !== "admin" && payload.userId !== resourceUserId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Você não tem permissão para acessar este recurso.",
    });
  }
}
