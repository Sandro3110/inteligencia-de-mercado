import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/drizzle/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configuração do cliente PostgreSQL
const connectionString = process.env.DATABASE_URL;

// Para queries
const queryClient = postgres(connectionString, {
  max: 10, // Máximo de conexões no pool
  idle_timeout: 20,
  connect_timeout: 10,
});

// Instância do Drizzle ORM
export const db = drizzle(queryClient, { schema });

// Exportar tipos
export type Database = typeof db;
export { schema };
