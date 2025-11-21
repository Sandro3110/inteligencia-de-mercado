import { createProject } from './server/db.ts';

async function seedSimple() {
  console.log('🌱 Criando projeto de teste simples...\n');
  
  try {
    const project = await createProject({
      nome: 'Projeto Teste PAV',
      descricao: 'Projeto de teste para validação completa do sistema Gestor PAV',
      cor: '#3b82f6'
    });
    
    console.log(`✅ Projeto criado com sucesso!`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Nome: ${project.nome}`);
    console.log(`   Status: ${project.status}`);
    console.log('\n🎉 Agora você pode acessar a aplicação e criar pesquisas via UI!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error.message);
    process.exit(1);
  }
}

seedSimple();
