import { drizzle } from "drizzle-orm/mysql2";
import { clientes } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const results = await db
  .select({ id: clientes.id, nome: clientes.nome })
  .from(clientes)
  .where(eq(clientes.projectId, 1))
  .limit(5);

console.log("IDs dos primeiros 5 clientes:");
results.forEach(c => console.log(`${c.id}: ${c.nome}`));
console.log("\nIDs:", results.map(c => c.id).join(", "));
