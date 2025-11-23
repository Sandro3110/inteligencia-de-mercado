import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("Aplicando migrações...");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrações aplicadas com sucesso!");

await connection.end();
