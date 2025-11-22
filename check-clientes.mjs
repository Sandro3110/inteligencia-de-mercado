import { drizzle } from 'drizzle-orm/mysql2';

const db = drizzle(process.env.DATABASE_URL);

const clientes = await db.execute('SELECT id, nome, latitude, longitude FROM clientes LIMIT 5');
console.log('Clientes:', JSON.stringify(clientes[0], null, 2));

process.exit(0);
