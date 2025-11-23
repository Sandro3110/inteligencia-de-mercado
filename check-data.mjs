import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("Verificando dados no banco...\n");

const result = await db.execute(sql`
  SELECT 
    (SELECT COUNT(*) FROM mercados_unicos) as total_mercados,
    (SELECT COUNT(*) FROM clientes) as total_clientes,
    (SELECT COUNT(*) FROM concorrentes) as total_concorrentes,
    (SELECT COUNT(*) FROM leads) as total_leads,
    (SELECT COUNT(*) FROM projects) as total_projects,
    (SELECT COUNT(*) FROM pesquisas) as total_pesquisas
`);

console.log("📊 Estatísticas do Banco de Dados:");
console.log("===================================");
console.log(`Projetos: ${result[0][0].total_projects}`);
console.log(`Pesquisas: ${result[0][0].total_pesquisas}`);
console.log(`Mercados: ${result[0][0].total_mercados}`);
console.log(`Clientes: ${result[0][0].total_clientes}`);
console.log(`Concorrentes: ${result[0][0].total_concorrentes}`);
console.log(`Leads: ${result[0][0].total_leads}`);

await connection.end();
