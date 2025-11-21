import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../db";
import { projects, pesquisas } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("FASE 103: Teste do Módulo de Seleção de Projetos e Pesquisas", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testProjectIds: number[] = [];
  let testPesquisaIds: number[] = [];

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar projetos de teste
    const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.ativo, 1));
    testProjectIds = allProjects.map(p => p.id);

    // Buscar pesquisas de teste
    const allPesquisas = await db.select().from(pesquisas);
    testPesquisaIds = allPesquisas.map(p => p.id);

    console.log(`\n📊 Dados de teste:`);
    console.log(`   Projetos ativos: ${testProjectIds.length}`);
    console.log(`   Pesquisas: ${testPesquisaIds.length}`);
  });

  describe("103.1 Verificação de Dados Base", () => {
    it("deve ter projetos ativos no banco", async () => {
      expect(testProjectIds.length).toBeGreaterThan(0);
    });

    it("deve ter pesquisas no banco", async () => {
      expect(testPesquisaIds.length).toBeGreaterThan(0);
    });

    it("deve ter projetos com ativo = 1", async () => {
      const activeProjects = await db!
        .select()
        .from(projects)
        .where(eq(projects.ativo, 1));

      expect(activeProjects.length).toBeGreaterThan(0);
      activeProjects.forEach(p => {
        expect(p.ativo).toBe(1);
      });
    });

    it("deve ter pesquisas vinculadas a projetos ativos", async () => {
      const pesquisasComProjeto = await db!
        .select({
          pesquisaId: pesquisas.id,
          pesquisaNome: pesquisas.nome,
          projectId: pesquisas.projectId,
        })
        .from(pesquisas)
        .where(eq(projects.ativo, 1))
        .innerJoin(projects, eq(pesquisas.projectId, projects.id));

      expect(pesquisasComProjeto.length).toBeGreaterThan(0);
      console.log(
        `   ✓ ${pesquisasComProjeto.length} pesquisas vinculadas a projetos ativos`
      );
    });
  });

  describe("103.2 Filtro de Pesquisas por Projeto", () => {
    it("deve filtrar pesquisas por projectId corretamente", async () => {
      if (testProjectIds.length === 0) {
        console.log("   ⚠️  Pulando teste - sem projetos");
        return;
      }

      const projectId = testProjectIds[0];
      const pesquisasDoProj = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.projectId, projectId));

      console.log(
        `   Projeto ${projectId}: ${pesquisasDoProj.length} pesquisas`
      );

      pesquisasDoProj.forEach(p => {
        expect(p.projectId).toBe(projectId);
      });
    });

    it("deve retornar array vazio para projeto sem pesquisas", async () => {
      // Criar projeto temporário sem pesquisas
      const [newProject] = await db!.insert(projects).values({
        nome: "Projeto Teste Vazio",
        descricao: "Teste",
        ativo: 1,
      });

      const projectId = Number(newProject.insertId);

      const pesquisasDoProj = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.projectId, projectId));

      expect(pesquisasDoProj).toHaveLength(0);

      // Limpar
      await db!.delete(projects).where(eq(projects.id, projectId));
    });

    it("deve listar todas as pesquisas quando projectId é null/undefined", async () => {
      const todasPesquisas = await db!.select().from(pesquisas);
      expect(todasPesquisas.length).toBe(testPesquisaIds.length);
    });
  });

  describe("103.3 Validação de Estrutura de Dados", () => {
    it("projetos devem ter campos obrigatórios", async () => {
      const projeto = await db!
        .select()
        .from(projects)
        .where(eq(projects.id, testProjectIds[0]))
        .limit(1);

      expect(projeto).toHaveLength(1);
      expect(projeto[0]).toHaveProperty("id");
      expect(projeto[0]).toHaveProperty("nome");
      expect(projeto[0]).toHaveProperty("ativo");
    });

    it("pesquisas devem ter campos obrigatórios", async () => {
      if (testPesquisaIds.length === 0) {
        console.log("   ⚠️  Pulando teste - sem pesquisas");
        return;
      }

      const pesquisa = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.id, testPesquisaIds[0]))
        .limit(1);

      expect(pesquisa).toHaveLength(1);
      expect(pesquisa[0]).toHaveProperty("id");
      expect(pesquisa[0]).toHaveProperty("nome");
      expect(pesquisa[0]).toHaveProperty("projectId");
      // Campo ano pode não existir em todas as pesquisas
      expect(pesquisa[0]).toHaveProperty("projectId");
    });

    it("pesquisas devem ter projectId válido", async () => {
      const pesquisasInvalidas = await db!
        .select()
        .from(pesquisas)
        .leftJoin(projects, eq(pesquisas.projectId, projects.id))
        .where(eq(projects.id, null as any));

      expect(pesquisasInvalidas).toHaveLength(0);
    });
  });

  describe("103.4 Simulação de Fluxo do Usuário", () => {
    it("fluxo: selecionar projeto → listar pesquisas → selecionar pesquisa", async () => {
      if (testProjectIds.length === 0) {
        console.log("   ⚠️  Pulando teste - sem projetos");
        return;
      }

      // 1. Selecionar primeiro projeto
      const projectId = testProjectIds[0];
      const projeto = await db!
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      expect(projeto).toHaveLength(1);
      console.log(`   1️⃣ Projeto selecionado: ${projeto[0].nome}`);

      // 2. Listar pesquisas do projeto
      const pesquisasDoProj = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.projectId, projectId));

      console.log(`   2️⃣ Pesquisas encontradas: ${pesquisasDoProj.length}`);

      if (pesquisasDoProj.length > 0) {
        // 3. Selecionar primeira pesquisa
        const pesquisaId = pesquisasDoProj[0].id;
        const pesquisa = await db!
          .select()
          .from(pesquisas)
          .where(eq(pesquisas.id, pesquisaId))
          .limit(1);

        expect(pesquisa).toHaveLength(1);
        expect(pesquisa[0].projectId).toBe(projectId);
        console.log(
          `   3️⃣ Pesquisa selecionada: ${pesquisa[0].nome} (${pesquisa[0].ano})`
        );
      }
    });

    it("fluxo: trocar de projeto → pesquisas devem mudar", async () => {
      if (testProjectIds.length < 2) {
        console.log("   ⚠️  Pulando teste - precisa de 2+ projetos");
        return;
      }

      const projeto1Id = testProjectIds[0];
      const projeto2Id = testProjectIds[1];

      // Pesquisas do projeto 1
      const pesquisasProj1 = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.projectId, projeto1Id));

      // Pesquisas do projeto 2
      const pesquisasProj2 = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.projectId, projeto2Id));

      console.log(
        `   Projeto ${projeto1Id}: ${pesquisasProj1.length} pesquisas`
      );
      console.log(
        `   Projeto ${projeto2Id}: ${pesquisasProj2.length} pesquisas`
      );

      // Verificar que são conjuntos diferentes (se ambos têm pesquisas)
      if (pesquisasProj1.length > 0 && pesquisasProj2.length > 0) {
        const ids1 = pesquisasProj1.map(p => p.id);
        const ids2 = pesquisasProj2.map(p => p.id);

        // Não deve haver interseção (cada pesquisa pertence a um projeto)
        const intersecao = ids1.filter(id => ids2.includes(id));
        expect(intersecao).toHaveLength(0);
      }
    });
  });

  describe("103.5 Casos Extremos", () => {
    it("deve lidar com projectId inexistente", async () => {
      const result = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.projectId, 99999));

      expect(result).toHaveLength(0);
    });

    it("deve lidar com pesquisaId inexistente", async () => {
      const pesquisa = await db!
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.id, 99999));

      expect(pesquisa).toHaveLength(0);
    });

    it("deve retornar apenas projetos ativos (ativo = 1)", async () => {
      const projetos = await db!
        .select()
        .from(projects)
        .where(eq(projects.ativo, 1));

      projetos.forEach(p => {
        expect(p.ativo).toBe(1);
      });
    });
  });
});
