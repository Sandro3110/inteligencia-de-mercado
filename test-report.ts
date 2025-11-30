import { getDb } from './server/db';
import { fetchEnhancedReportData } from './server/utils/reportData';

async function test() {
  console.log('🔍 Testing enhanced report data fetch...');

  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    console.log('✅ Database connected');

    const pesquisaId = 1;
    console.log(`📊 Fetching data for pesquisa ID: ${pesquisaId}`);

    const reportData = await fetchEnhancedReportData(
      db,
      pesquisaId,
      'completed',
      undefined,
      undefined,
      undefined
    );

    console.log('✅ Data fetched successfully!');
    console.log(JSON.stringify(reportData, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }

  process.exit(0);
}

test();
