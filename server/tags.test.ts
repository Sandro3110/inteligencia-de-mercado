import { describe, it, expect, beforeAll } from "vitest";
import {
  getAllTags,
  createTag,
  deleteTag,
  getEntityTags,
  addTagToEntity,
  removeTagFromEntity,
  getEntitiesByTag,
} from "./db";

describe("Sistema de Tags", () => {
  let testTagId: number;

  describe("CRUD de Tags", () => {
    it("deve criar uma nova tag", async () => {
      const tag = await createTag("Teste Tag", "#ff0000");
      expect(tag).toBeDefined();
      expect(tag?.name).toBe("Teste Tag");
      expect(tag?.color).toBe("#ff0000");
      testTagId = tag!.id;
    });

    it("deve listar todas as tags", async () => {
      const tags = await getAllTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.some(t => t.id === testTagId)).toBe(true);
    });

    it("deve deletar uma tag", async () => {
      const result = await deleteTag(testTagId);
      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
    });
  });

  describe("Associação de Tags a Entidades", () => {
    let tagId: number;

    beforeAll(async () => {
      const tag = await createTag("Tag Associação", "#00ff00");
      tagId = tag!.id;
    });

    it("deve adicionar tag a um cliente", async () => {
      const result = await addTagToEntity(tagId, "cliente", 1);
      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
    });

    it("deve buscar tags de uma entidade", async () => {
      const tags = await getEntityTags("cliente", 1);
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.some(t => t.tagId === tagId)).toBe(true);
    });

    it("deve buscar entidades por tag", async () => {
      const entities = await getEntitiesByTag(tagId, "cliente");
      expect(Array.isArray(entities)).toBe(true);
      expect(entities.includes(1)).toBe(true);
    });

    it("deve remover tag de uma entidade", async () => {
      const result = await removeTagFromEntity(tagId, "cliente", 1);
      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
    });

    it("não deve adicionar tag duplicada", async () => {
      await addTagToEntity(tagId, "cliente", 2);
      const result = await addTagToEntity(tagId, "cliente", 2);
      expect(result?.alreadyExists).toBe(true);
    });
  });

  describe("Validações", () => {
    it("deve aceitar cores no formato hex", async () => {
      const tag = await createTag("Cor Válida", "#3b82f6");
      expect(tag?.color).toBe("#3b82f6");
    });

    it("deve usar cor padrão se não fornecida", async () => {
      const tag = await createTag("Sem Cor");
      expect(tag?.color).toBe("#3b82f6");
    });
  });
});
