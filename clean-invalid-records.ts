import { eq, or, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { clientes, concorrentes, leads } from "./drizzle/schema";
import { isRealCompany } from "./server/_core/companyFilters";

const db = drizzle(process.env.DATABASE_URL!);

async function cleanInvalidRecords() {
  console.log("🧹 Iniciando limpeza de registros inválidos...\n");

  // 1. Limpar concorrentes inválidos
  console.log("📋 Buscando concorrentes...");
  const allConcorrentes = await db.select().from(concorrentes);
  console.log(`   Total: ${allConcorrentes.length}`);

  let deletedConcorrentes = 0;
  for (const concorrente of allConcorrentes) {
    const isValid = isRealCompany({
      title: concorrente.nome,
      link: concorrente.site || '',
      snippet: '',
    });

    if (!isValid) {
      await db.delete(concorrentes).where(eq(concorrentes.id, concorrente.id));
      deletedConcorrentes++;
      console.log(`   ❌ Deletado: ${concorrente.nome} (${concorrente.site})`);
    }
  }
  console.log(`   ✅ Concorrentes deletados: ${deletedConcorrentes}\n`);

  // 2. Limpar leads inválidos
  console.log("📋 Buscando leads...");
  const allLeads = await db.select().from(leads);
  console.log(`   Total: ${allLeads.length}`);

  let deletedLeads = 0;
  for (const lead of allLeads) {
    const isValid = isRealCompany({
      title: lead.nome,
      link: lead.site || '',
      snippet: '',
    });

    if (!isValid) {
      await db.delete(leads).where(eq(leads.id, lead.id));
      deletedLeads++;
      console.log(`   ❌ Deletado: ${lead.nome} (${lead.site})`);
    }
  }
  console.log(`   ✅ Leads deletados: ${deletedLeads}\n`);

  console.log("✅ Limpeza concluída!");
  console.log(`   Total deletado: ${deletedConcorrentes + deletedLeads} registros`);
  
  process.exit(0);
}

cleanInvalidRecords().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
