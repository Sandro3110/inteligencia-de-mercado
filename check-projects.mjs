import Database from 'better-sqlite3';

const db = new Database('./database.db');
const projects = db.prepare('SELECT id, nome, ativo FROM projects ORDER BY id').all();

console.log('Projetos no banco:');
console.log(JSON.stringify(projects, null, 2));

db.close();
