import bcrypt from "bcryptjs";

/**
 * Interface para resultado de validação de senha
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valida a força da senha conforme requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export function validatePasswordStrength(
  password: string
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("A senha deve ter no mínimo 8 caracteres");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra minúscula");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("A senha deve conter pelo menos um número");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("A senha deve conter pelo menos um caractere especial");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gera hash bcrypt da senha
 * @param password Senha em texto plano
 * @returns Hash bcrypt da senha
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara senha em texto plano com hash bcrypt
 * @param password Senha em texto plano
 * @param hash Hash bcrypt armazenado
 * @returns true se a senha corresponde ao hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
