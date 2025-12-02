/**
 * Script para popular dim_tempo com calendário 2024-2026
 */

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const mesesCurto = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const diasSemanaCurto = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Feriados nacionais brasileiros (fixos)
const feriadosFixos = [
  { mes: 1, dia: 1 },   // Ano Novo
  { mes: 4, dia: 21 },  // Tiradentes
  { mes: 5, dia: 1 },   // Dia do Trabalho
  { mes: 9, dia: 7 },   // Independência
  { mes: 10, dia: 12 }, // Nossa Senhora Aparecida
  { mes: 11, dia: 2 },  // Finados
  { mes: 11, dia: 15 }, // Proclamação da República
  { mes: 12, dia: 25 }, // Natal
];

function ehFeriado(mes, dia) {
  return feriadosFixos.some(f => f.mes === mes && f.dia === dia);
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function popularDimTempo() {
  console.log('🗓️  Populando dim_tempo...\n');

  const startDate = new Date('2024-01-01');
  const endDate = new Date('2026-12-31');
  
  const registros = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const ano = current.getFullYear();
    const mes = current.getMonth() + 1;
    const dia = current.getDate();
    const diaSemanaNum = current.getDay();
    const trimestre = Math.ceil(mes / 3);
    const semana = getWeekNumber(current);
    const diaAno = Math.floor((current - new Date(ano, 0, 0)) / 86400000);
    
    const ehFimSemana = diaSemanaNum === 0 || diaSemanaNum === 6;
    const ehFeriadoNacional = ehFeriado(mes, dia);
    const ehDiaUtil = !ehFimSemana && !ehFeriadoNacional;

    registros.push({
      data: current.toISOString().split('T')[0],
      ano,
      trimestre,
      mes,
      semana,
      dia_mes: dia,
      dia_ano: diaAno,
      dia_semana: diaSemanaNum,
      nome_mes: meses[mes - 1],
      nome_mes_curto: mesesCurto[mes - 1],
      nome_dia_semana: diasSemana[diaSemanaNum],
      nome_dia_semana_curto: diasSemanaCurto[diaSemanaNum],
      eh_feriado: ehFeriadoNacional,
      eh_fim_semana: ehFimSemana,
      eh_dia_util: ehDiaUtil
    });

    current.setDate(current.getDate() + 1);
  }

  console.log(`📊 Total de registros: ${registros.length}`);
  console.log(`📅 Período: 2024-01-01 a 2026-12-31\n`);

  // Inserir em lotes de 100
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < registros.length; i += batchSize) {
    const batch = registros.slice(i, i + batchSize);
    
    await sql`
      INSERT INTO dim_tempo ${sql(batch)}
      ON CONFLICT (data) DO NOTHING
    `;
    
    inserted += batch.length;
    process.stdout.write(`\r✅ Inseridos: ${inserted}/${registros.length}`);
  }

  console.log('\n\n🎉 dim_tempo populada com sucesso!\n');

  // Estatísticas
  const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM dim_tempo`;
  const [{ dias_uteis }] = await sql`SELECT COUNT(*)::int as dias_uteis FROM dim_tempo WHERE eh_dia_util = true`;
  const [{ feriados }] = await sql`SELECT COUNT(*)::int as feriados FROM dim_tempo WHERE eh_feriado = true`;

  console.log('📊 ESTATÍSTICAS:');
  console.log(`   Total de dias: ${count}`);
  console.log(`   Dias úteis: ${dias_uteis}`);
  console.log(`   Feriados: ${feriados}`);
  console.log(`   Fins de semana: ${count - dias_uteis - feriados}`);
}

async function main() {
  try {
    await popularDimTempo();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
