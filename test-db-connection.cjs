const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq } = require('drizzle-orm');
const { pgTable, varchar, smallint, timestamp } = require('drizzle-orm/pg-core');

// Schema simplificado
const users = pgTable("users", {
  id: varchar({ length: 64 }).primaryKey().notNull(),
  email: varchar({ length: 320 }).unique().notNull(),
  nome: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 50 }).default("visualizador").notNull(),
  ativo: smallint().default(0).notNull(),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL não está definida');
  process.exit(1);
}

const queryClient = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(queryClient, { schema: { users } });

async function testConnection() {
  try {
    console.log('Testando conexão com banco de dados...');
    
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, 'sandrodireto@gmail.com'))
      .limit(1);

    console.log('Resultado da query:', JSON.stringify(result, null, 2));
    
    if (result.length > 0) {
      const userData = result[0];
      console.log('\nDados do usuário:');
      console.log('- Email:', userData.email);
      console.log('- Nome:', userData.nome);
      console.log('- Role:', userData.role);
      console.log('- Ativo:', userData.ativo);
      console.log('- Aprovado?', userData.ativo === 1 ? 'SIM' : 'NÃO');
    } else {
      console.log('Usuário não encontrado');
    }
    
    await queryClient.end();
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    process.exit(1);
  }
}

testConnection();
