import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  console.log('============================================');
  console.log('INICIANDO RESET DO BANCO DE DADOS');
  console.log('============================================\n');

  try {
    // ========================================================================
    // PASSO 1: APROVAR E CONFIGURAR ADMIN
    // ========================================================================
    console.log('PASSO 1: Configurando admin...');
    
    const adminEmail = 'sandrodireto@gmail.com';
    
    // Verificar se usuário existe
    const checkUser = await db.execute(sql`
      SELECT id, email, nome, role, ativo 
      FROM users 
      WHERE email = ${adminEmail}
    `);

    if (checkUser.rows.length === 0) {
      console.error(`❌ ERRO: Usuário ${adminEmail} não encontrado!`);
      process.exit(1);
    }

    const admin = checkUser.rows[0];
    console.log(`   Encontrado: ${admin.email}`);

    // Atualizar admin
    await db.execute(sql`
      UPDATE users 
      SET 
        ativo = 1,
        role = 'admin',
        liberado_por = id,
        liberado_em = NOW()
      WHERE email = ${adminEmail}
    `);

    console.log(`✅ Admin configurado: ${adminEmail}`);
    console.log('   - Role: admin');
    console.log('   - Ativo: 1 (aprovado)');

    // ========================================================================
    // PASSO 2: APAGAR TODOS OS OUTROS USUÁRIOS
    // ========================================================================
    console.log('\nPASSO 2: Apagando outros usuários...');
    
    const otherUsers = await db.execute(sql`
      SELECT email FROM users WHERE email != ${adminEmail}
    `);

    console.log(`   Encontrados ${otherUsers.rows.length} usuários para apagar:`);
    otherUsers.rows.forEach((u: any) => console.log(`   - ${u.email}`));

    if (otherUsers.rows.length > 0) {
      await db.execute(sql`
        DELETE FROM users WHERE email != ${adminEmail}
      `);
      console.log(`✅ ${otherUsers.rows.length} usuários apagados`);
    } else {
      console.log('✅ Nenhum outro usuário encontrado');
    }

    // ========================================================================
    // PASSO 3: LIMPAR DADOS DE TESTE
    // ========================================================================
    console.log('\nPASSO 3: Limpando dados de teste...');

    // Contar antes de apagar
    const counts = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM projects) as projects,
        (SELECT COUNT(*) FROM pesquisas) as pesquisas,
        (SELECT COUNT(*) FROM mercados_unicos) as mercados,
        (SELECT COUNT(*) FROM leads) as leads
    `);

    const count = counts.rows[0];
    console.log(`   Projetos: ${count.projects}`);
    console.log(`   Pesquisas: ${count.pesquisas}`);
    console.log(`   Mercados: ${count.mercados}`);
    console.log(`   Leads: ${count.leads}`);

    // Apagar dados (em ordem para respeitar foreign keys)
    console.log('\n   Apagando dados...');
    
    await db.execute(sql`DELETE FROM activity_log`);
    await db.execute(sql`DELETE FROM alert_history`);
    await db.execute(sql`DELETE FROM alert_configs`);
    await db.execute(sql`DELETE FROM analytics_timeline`);
    await db.execute(sql`DELETE FROM analytics_pesquisas`);
    await db.execute(sql`DELETE FROM analytics_mercados`);
    await db.execute(sql`DELETE FROM analytics_dimensoes`);
    await db.execute(sql`DELETE FROM clientes_history`);
    await db.execute(sql`DELETE FROM clientes_mercados`);
    await db.execute(sql`DELETE FROM clientes`);
    await db.execute(sql`DELETE FROM concorrentes_history`);
    await db.execute(sql`DELETE FROM concorrentes`);
    await db.execute(sql`DELETE FROM enrichment_cache`);
    await db.execute(sql`DELETE FROM enrichment_configs`);
    await db.execute(sql`DELETE FROM enrichment_jobs`);
    await db.execute(sql`DELETE FROM enrichment_queue`);
    await db.execute(sql`DELETE FROM enrichment_runs`);
    await db.execute(sql`DELETE FROM entity_tags`);
    await db.execute(sql`DELETE FROM hibernation_warnings`);
    await db.execute(sql`DELETE FROM intelligent_alerts_history`);
    await db.execute(sql`DELETE FROM intelligent_alerts_configs`);
    await db.execute(sql`DELETE FROM lead_conversions`);
    await db.execute(sql`DELETE FROM leads_history`);
    await db.execute(sql`DELETE FROM leads`);
    await db.execute(sql`DELETE FROM mercados_history`);
    await db.execute(sql`DELETE FROM mercados_unicos`);
    await db.execute(sql`DELETE FROM notifications`);
    await db.execute(sql`DELETE FROM pesquisa_fields`);
    await db.execute(sql`DELETE FROM pesquisa_results`);
    await db.execute(sql`DELETE FROM pesquisas`);
    await db.execute(sql`DELETE FROM project_members`);
    await db.execute(sql`DELETE FROM projects`);
    await db.execute(sql`DELETE FROM research_drafts`);
    await db.execute(sql`DELETE FROM saved_filters_export`);
    await db.execute(sql`DELETE FROM search_history`);
    await db.execute(sql`DELETE FROM territorial_analysis`);
    await db.execute(sql`DELETE FROM territorial_comparisons`);

    console.log('✅ Todos os dados de teste foram apagados');

    // ========================================================================
    // PASSO 4: RESETAR SEQUENCES
    // ========================================================================
    console.log('\nPASSO 4: Resetando sequences...');

    // Buscar todas as sequences
    const sequences = await db.execute(sql`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);

    for (const seq of sequences.rows) {
      const seqName = (seq as any).sequence_name;
      await db.execute(sql.raw(`ALTER SEQUENCE ${seqName} RESTART WITH 1`));
    }

    console.log(`✅ ${sequences.rows.length} sequences resetadas`);

    // ========================================================================
    // PASSO 5: VERIFICAÇÃO FINAL
    // ========================================================================
    console.log('\n============================================');
    console.log('VERIFICAÇÃO FINAL');
    console.log('============================================');

    const finalUsers = await db.execute(sql`
      SELECT email, nome, role, ativo, liberado_em 
      FROM users
    `);
    
    console.log(`\n✅ Usuários restantes: ${finalUsers.rows.length}`);
    
    if (finalUsers.rows.length === 1) {
      const adminUser: any = finalUsers.rows[0];
      console.log('\n📋 ADMIN CONFIGURADO:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nome: ${adminUser.nome}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Ativo: ${adminUser.ativo}`);
      console.log(`   Liberado em: ${adminUser.liberado_em}`);

      if (adminUser.role === 'admin' && adminUser.ativo === 1) {
        console.log('\n✅ Admin configurado corretamente!');
      } else {
        console.error('\n❌ ERRO: Admin não está configurado corretamente!');
        process.exit(1);
      }
    } else {
      console.error('\n❌ ERRO: Mais de 1 usuário no banco!');
      process.exit(1);
    }

    // Verificar dados
    const finalCounts = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM projects) as projects,
        (SELECT COUNT(*) FROM pesquisas) as pesquisas,
        (SELECT COUNT(*) FROM mercados_unicos) as mercados,
        (SELECT COUNT(*) FROM leads) as leads
    `);

    const finalCount: any = finalCounts.rows[0];
    console.log('\n📊 DADOS RESTANTES:');
    console.log(`   Projetos: ${finalCount.projects}`);
    console.log(`   Pesquisas: ${finalCount.pesquisas}`);
    console.log(`   Mercados: ${finalCount.mercados}`);
    console.log(`   Leads: ${finalCount.leads}`);

    if (
      finalCount.projects === '0' &&
      finalCount.pesquisas === '0' &&
      finalCount.mercados === '0' &&
      finalCount.leads === '0'
    ) {
      console.log('\n✅ Banco de dados limpo!');
    } else {
      console.error('\n❌ ATENÇÃO: Ainda existem dados no banco!');
    }

    console.log('\n============================================');
    console.log('RESET CONCLUÍDO COM SUCESSO!');
    console.log('============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO ao resetar banco de dados:', error);
    process.exit(1);
  }
}

resetDatabase();
