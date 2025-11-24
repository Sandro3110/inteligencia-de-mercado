import postgres from 'postgres';

const connectionString = 'postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000%21%40%23%24%25@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres';

console.log('🔌 Conectando ao banco...');

const client = postgres(connectionString, { max: 1 });

console.log('✅ Conexão estabelecida\n');

try {
  console.log('🔍 Executando query SQL...');
  
  const result = await client`
    SELECT "id", "email", "nome", "senha_hash", "role", "ativo"
    FROM "users" 
    WHERE "email" = 'sandrodireto@gmail.com' 
    LIMIT 1
  `;
  
  console.log('✅ Query OK! Usuário encontrado:');
  console.log(JSON.stringify(result[0], null, 2));
  
} catch (error) {
  console.error('❌ ERRO:', error.message);
} finally {
  await client.end();
}
