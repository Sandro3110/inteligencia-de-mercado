import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility para merge de classes TailwindCSS
 * Combina clsx e tailwind-merge para evitar conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
