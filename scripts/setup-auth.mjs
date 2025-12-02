#!/usr/bin/env node

import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const DATABASE_URL = process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ POSTGRES_URL não configurada');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function setupAuth() {
  console.log('🚀 Iniciando setup de autenticação...\n');

  try {
    // 1. Criar tabela de roles
    console.log('📊 Criando tabela de roles...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.roles (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(50) UNIQUE NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela roles criada!\n');

    // 2. Inserir roles
    console.log('🔐 Inserindo roles padrão...');
    await sql`
      INSERT INTO public.roles (nome, descricao) VALUES
        ('administrador', 'Administrador com acesso total'),
        ('gerente', 'Gerente com acesso a projetos'),
        ('analista', 'Analista com acesso a dados'),
        ('visualizador', 'Visualizador somente leitura')
      ON CONFLICT (nome) DO NOTHING
    `;
    console.log('✅ Roles inseridas!\n');

    // 3. Criar tabela de user_profiles
    console.log('👤 Criando tabela de usuários...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id VARCHAR(255) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        role_id INTEGER NOT NULL REFERENCES public.roles(id) DEFAULT 4,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela user_profiles criada!\n');

    // 4. Criar índices
    console.log('⚡ Criando índices...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role_id)`;
    console.log('✅ Índices criados!\n');

    // 5. Buscar ID do role administrador
    const [adminRole] = await sql`SELECT id FROM public.roles WHERE nome = 'administrador'`;
    const adminRoleId = adminRole.id;

    // 6. Criar usuários administradores
    console.log('👥 Criando usuários administradores...\n');

    // Usuário 1: sandrodireto@gmail.com
    const user1Id = randomUUID();
    const user1Password = 'Ss311000!';
    const user1Hash = await bcrypt.hash(user1Password, 10);

    await sql`
      INSERT INTO public.user_profiles (id, nome, email, senha_hash, role_id)
      VALUES (${user1Id}, 'Sandro Direto', 'sandrodireto@gmail.com', ${user1Hash}, ${adminRoleId})
      ON CONFLICT (email) DO UPDATE SET senha_hash = ${user1Hash}, role_id = ${adminRoleId}
    `;
    console.log('✅ Usuário criado: sandrodireto@gmail.com');
    console.log(`   Senha: ${user1Password}`);
    console.log(`   Papel: Administrador\n`);

    // Usuário 2: cmbusso@gmail.com
    const user2Id = randomUUID();
    const user2Password = '123456!';
    const user2Hash = await bcrypt.hash(user2Password, 10);

    await sql`
      INSERT INTO public.user_profiles (id, nome, email, senha_hash, role_id)
      VALUES (${user2Id}, 'CM Busso', 'cmbusso@gmail.com', ${user2Hash}, ${adminRoleId})
      ON CONFLICT (email) DO UPDATE SET senha_hash = ${user2Hash}, role_id = ${adminRoleId}
    `;
    console.log('✅ Usuário criado: cmbusso@gmail.com');
    console.log(`   Senha: ${user2Password}`);
    console.log(`   Papel: Administrador\n`);

    // 7. Estatísticas
    console.log('📊 Estatísticas:\n');
    const [stats] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM public.roles) AS total_roles,
        (SELECT COUNT(*) FROM public.user_profiles) AS total_users
    `;
    console.log(`   Roles: ${stats.total_roles}`);
    console.log(`   Usuários: ${stats.total_users}\n`);

    console.log('🎉 Setup de autenticação concluído com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro durante setup:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupAuth();
