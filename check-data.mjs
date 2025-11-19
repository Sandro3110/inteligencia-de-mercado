import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

const result = await db.execute(sql`
  SELECT 
    (SELECT COUNT(*) FROM mercados_unicos) as total_mercados,
    (SELECT COUNT(*) FROM clientes) as total_clientes,
    (SELECT COUNT(*) FROM concorrentes) as total_concorrentes,
    (SELECT COUNT(*) FROM leads) as total_leads
`);

console.log(JSON.stringify(result[0], null, 2));
process.exit(0);
