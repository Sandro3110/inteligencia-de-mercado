import { db } from '../lib/db';
import { clientes, leads, mercadosUnicos, concorrentes, pesquisas } from '../drizzle/schema';
import { eq, sql, and, isNotNull, ne } from 'drizzle-orm';

async function main() {
  console.log('🔍 Buscando dados do projeto TechFilms...\n');

  // Totais
  const [totalClientes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientes)
    .where(eq(clientes.pesquisaId, 1));
  const [totalLeads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(eq(leads.pesquisaId, 1));
  const [totalMercados] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.pesquisaId, 1));
  const [totalConcorrentes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(concorrentes)
    .where(eq(concorrentes.pesquisaId, 1));

  console.log('📊 TOTAIS:');
  console.log(
    `Clientes: ${totalClientes.count} | Leads: ${totalLeads.count} | Mercados: ${totalMercados.count} | Concorrentes: ${totalConcorrentes.count}\n`
  );

  // Top 5 Produtos
  const topProdutos = await db
    .select({
      produto: clientes.produtoPrincipal,
      total: sql<number>`count(*)`,
    })
    .from(clientes)
    .where(
      and(
        eq(clientes.pesquisaId, 1),
        isNotNull(clientes.produtoPrincipal),
        ne(clientes.produtoPrincipal, '')
      )
    )
    .groupBy(clientes.produtoPrincipal)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  console.log('🎯 TOP 5 PRODUTOS:');
  topProdutos.forEach((p, i) =>
    console.log(`${i + 1}. ${p.produto?.substring(0, 50)} (${p.total})`)
  );

  // Top 5 Estados
  const porEstado = await db
    .select({
      uf: clientes.uf,
      total: sql<number>`count(*)`,
    })
    .from(clientes)
    .where(and(eq(clientes.pesquisaId, 1), isNotNull(clientes.uf), ne(clientes.uf, '')))
    .groupBy(clientes.uf)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

  console.log('\n🗺️ TOP 5 ESTADOS:');
  porEstado.forEach((e, i) => console.log(`${i + 1}. ${e.uf}: ${e.total}`));

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
