import { describe, it, expect, beforeAll } from "vitest";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../db";

describe("Sistema Multi-Projetos", () => {
  let testProjectId: number;

  describe("getProjects", () => {
    it("deve retornar lista de projetos ativos", async () => {
      const projects = await getProjects();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);

      // Verificar se projeto "Embalagens" existe
      const embalagensProject = projects.find(p => p.nome === "Embalagens");
      expect(embalagensProject).toBeDefined();
      expect(embalagensProject?.ativo).toBe(1);
    });
  });

  describe("createProject", () => {
    it("deve criar um novo projeto", async () => {
      const newProject = await createProject({
        nome: "Projeto Teste",
        descricao: "Projeto criado para testes",
        cor: "#ff0000",
      });

      expect(newProject).toBeDefined();
      expect(newProject?.nome).toBe("Projeto Teste");
      expect(newProject?.descricao).toBe("Projeto criado para testes");
      expect(newProject?.cor).toBe("#ff0000");
      expect(newProject?.ativo).toBe(1);

      if (newProject) {
        testProjectId = newProject.id;
      }
    });
  });

  describe("getProjectById", () => {
    it("deve retornar projeto por ID", async () => {
      const project = await getProjectById(testProjectId);
      expect(project).toBeDefined();
      expect(project?.id).toBe(testProjectId);
      expect(project?.nome).toBe("Projeto Teste");
    });

    it("deve retornar undefined para ID inexistente", async () => {
      const project = await getProjectById(99999);
      expect(project).toBeUndefined();
    });
  });

  describe("updateProject", () => {
    it("deve atualizar projeto existente", async () => {
      const success = await updateProject(testProjectId, {
        nome: "Projeto Teste Atualizado",
        descricao: "Descrição atualizada",
      });

      expect(success).toBe(true);

      const updatedProject = await getProjectById(testProjectId);
      expect(updatedProject?.nome).toBe("Projeto Teste Atualizado");
      expect(updatedProject?.descricao).toBe("Descrição atualizada");
    });
  });

  describe("deleteProject", () => {
    it("deve fazer soft delete de projeto", async () => {
      const success = await deleteProject(testProjectId);
      expect(success).toBe(true);

      // Projeto não deve aparecer na lista de ativos
      const projects = await getProjects();
      const deletedProject = projects.find(p => p.id === testProjectId);
      expect(deletedProject).toBeUndefined();

      // Mas ainda existe no banco (soft delete)
      const projectById = await getProjectById(testProjectId);
      expect(projectById).toBeDefined();
      expect(projectById?.ativo).toBe(0);
    });
  });
});
