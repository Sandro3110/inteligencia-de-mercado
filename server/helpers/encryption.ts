/**
 * Helper de Criptografia
 * FASE 1 - Sessão 1.6
 * 
 * Criptografa dados sensíveis usando AES-256-GCM
 * - CNPJ
 * - CPF
 * - Email
 * - Telefone
 * - Dados bancários
 */

import crypto from 'crypto';

// Algoritmo de criptografia
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para GCM
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Obter chave de criptografia do ambiente
 * DEVE ser uma string hexadecimal de 64 caracteres (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY não configurada');
  }
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Obter salt para hash
 */
function getEncryptionSalt(): string {
  const salt = process.env.ENCRYPTION_SALT;
  if (!salt) {
    throw new Error('ENCRYPTION_SALT não configurada');
  }
  return salt;
}

/**
 * Criptografar texto
 * 
 * @param plaintext - Texto em claro
 * @returns Texto criptografado em formato: iv:authTag:encrypted (hex)
 * 
 * @example
 * const encrypted = encrypt('12345678000190');
 * // Retorna: "a1b2c3d4....:e5f6g7h8....:i9j0k1l2...."
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Formato: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('❌ Erro ao criptografar:', error);
    throw new Error('Falha na criptografia');
  }
}

/**
 * Descriptografar texto
 * 
 * @param encrypted - Texto criptografado (formato: iv:authTag:encrypted)
 * @returns Texto em claro
 * 
 * @example
 * const decrypted = decrypt('a1b2c3d4....:e5f6g7h8....:i9j0k1l2....');
 * // Retorna: "12345678000190"
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) return '';
  
  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Formato de criptografia inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Erro ao descriptografar:', error);
    throw new Error('Falha na descriptografia');
  }
}

/**
 * Gerar hash para busca
 * 
 * Permite buscar dados criptografados sem descriptografar tudo
 * Usa HMAC-SHA256 com salt
 * 
 * @param plaintext - Texto em claro
 * @returns Hash hexadecimal (64 caracteres)
 * 
 * @example
 * const hash = hashForSearch('12345678000190');
 * // Retorna: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
 * 
 * // Buscar no banco:
 * SELECT * FROM entidades WHERE cnpj_hash = 'a1b2c3d4e5f6...'
 */
export function hashForSearch(plaintext: string): string {
  if (!plaintext) return '';
  
  try {
    const salt = getEncryptionSalt();
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(plaintext);
    return hmac.digest('hex');
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error);
    throw new Error('Falha ao gerar hash');
  }
}

/**
 * Criptografar e gerar hash
 * 
 * Conveniência para criptografar e gerar hash de busca ao mesmo tempo
 * 
 * @param plaintext - Texto em claro
 * @returns { encrypted, hash }
 */
export function encryptWithHash(plaintext: string): { encrypted: string; hash: string } {
  return {
    encrypted: encrypt(plaintext),
    hash: hashForSearch(plaintext),
  };
}

/**
 * Verificar se texto criptografado é válido
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts.every(p => /^[0-9a-f]+$/i.test(p));
}

/**
 * Criptografar CNPJ
 */
export function encryptCNPJ(cnpj: string): { encrypted: string; hash: string } {
  // Remover formatação
  const clean = cnpj.replace(/[^\d]/g, '');
  return encryptWithHash(clean);
}

/**
 * Criptografar CPF
 */
export function encryptCPF(cpf: string): { encrypted: string; hash: string } {
  // Remover formatação
  const clean = cpf.replace(/[^\d]/g, '');
  return encryptWithHash(clean);
}

/**
 * Criptografar Email
 */
export function encryptEmail(email: string): { encrypted: string; hash: string } {
  return encryptWithHash(email.toLowerCase().trim());
}

/**
 * Criptografar Telefone
 */
export function encryptPhone(phone: string): { encrypted: string; hash: string } {
  // Remover formatação
  const clean = phone.replace(/[^\d]/g, '');
  return encryptWithHash(clean);
}

/**
 * Descriptografar e formatar CNPJ
 */
export function decryptCNPJ(encrypted: string): string {
  const cnpj = decrypt(encrypted);
  // Formatar: 12.345.678/0001-90
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Descriptografar e formatar CPF
 */
export function decryptCPF(encrypted: string): string {
  const cpf = decrypt(encrypted);
  // Formatar: 123.456.789-01
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Descriptografar e formatar Telefone
 */
export function decryptPhone(encrypted: string): string {
  const phone = decrypt(encrypted);
  // Formatar: (11) 98765-4321
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}
