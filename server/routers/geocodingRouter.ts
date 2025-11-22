/**
 * Router tRPC para Geocodificação
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  geocodeAddress,
  geocodeBatch,
  testGoogleMapsConnection,
} from "../services/geocoding";
import {
  getRecordsSemCoordenadas,
  updateClienteCoordinates,
  updateConcorrenteCoordinates,
  updateLeadCoordinates,
  getGeocodeStats,
} from "../db-geocoding";
import { getEnrichmentConfig } from "../db";

export const geocodingRouter = router({
  /**
   * Busca registros sem coordenadas
   */
  getRecordsSemCoordenadas: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        tipo: z.enum(["cliente", "concorrente", "lead"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const records = await getRecordsSemCoordenadas(input.projetoId, input.tipo);
      return records;
    }),

  /**
   * Geocodifica um endereço individual
   */
  geocodeAddress: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        id: z.number(),
        tipo: z.enum(["cliente", "concorrente", "lead"]),
        cidade: z.string(),
        uf: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar API key das configurações
      const config = await getEnrichmentConfig(input.projetoId);
      const apiKey = config?.googleMapsApiKey;

      if (!apiKey) {
        return {
          success: false,
          error: "API Key do Google Maps não configurada",
        };
      }

      // Geocodificar endereço
      const result = await geocodeAddress(input.cidade, input.uf, "Brasil", apiKey);

      if (!("latitude" in result)) {
        return {
          success: false,
          error: result.error,
        };
      }

      // Atualizar coordenadas no banco
      let updated = false;
      if (input.tipo === "cliente") {
        updated = await updateClienteCoordinates(input.id, result.latitude, result.longitude);
      } else if (input.tipo === "concorrente") {
        updated = await updateConcorrenteCoordinates(input.id, result.latitude, result.longitude);
      } else if (input.tipo === "lead") {
        updated = await updateLeadCoordinates(input.id, result.latitude, result.longitude);
      }

      if (!updated) {
        return {
          success: false,
          error: "Erro ao atualizar coordenadas no banco",
        };
      }

      return {
        success: true,
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress,
        confidence: result.confidence,
      };
    }),

  /**
   * Geocodifica múltiplos registros em lote
   */
  geocodeBatch: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        tipo: z.enum(["cliente", "concorrente", "lead"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar API key das configurações
      const config = await getEnrichmentConfig(input.projetoId);
      const apiKey = config?.googleMapsApiKey;

      if (!apiKey) {
        return {
          success: false,
          error: "API Key do Google Maps não configurada",
          processed: 0,
          succeeded: 0,
          failed: 0,
        };
      }

      // Buscar registros sem coordenadas
      const records = await getRecordsSemCoordenadas(input.projetoId, input.tipo);

      if (records.length === 0) {
        return {
          success: true,
          message: "Nenhum registro sem coordenadas encontrado",
          processed: 0,
          succeeded: 0,
          failed: 0,
        };
      }

      // Geocodificar em lote
      const results = await geocodeBatch(records, apiKey);

      // Atualizar coordenadas no banco
      let succeeded = 0;
      let failed = 0;

      for (const result of results) {
        if ("latitude" in result.result) {
          let updated = false;

          if (result.tipo === "cliente") {
            updated = await updateClienteCoordinates(
              result.id,
              result.result.latitude,
              result.result.longitude
            );
          } else if (result.tipo === "concorrente") {
            updated = await updateConcorrenteCoordinates(
              result.id,
              result.result.latitude,
              result.result.longitude
            );
          } else if (result.tipo === "lead") {
            updated = await updateLeadCoordinates(
              result.id,
              result.result.latitude,
              result.result.longitude
            );
          }

          if (updated) {
            succeeded++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      }

      return {
        success: true,
        processed: results.length,
        succeeded,
        failed,
      };
    }),

  /**
   * Estatísticas de cobertura geográfica
   */
  getStats: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const stats = await getGeocodeStats(input.projetoId);
      return stats;
    }),

  /**
   * Testa conexão com Google Maps API
   */
  testConnection: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar API key das configurações
      const config = await getEnrichmentConfig(input.projetoId);
      const apiKey = config?.googleMapsApiKey;

      if (!apiKey) {
        return {
          success: false,
          message: "API Key do Google Maps não configurada",
        };
      }

      const result = await testGoogleMapsConnection(apiKey);
      return result;
    }),

  /**
   * Busca registros com coordenadas (para exibir no mapa)
   */
  getLocations: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
        mercadoId: z.number().optional(),
        tipo: z.enum(["cliente", "concorrente", "lead"]).optional(),
        validationStatus: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { getGeolocatedRecords } = await import("../db-geocoding");
      return getGeolocatedRecords(input);
    }),

  /**
   * Estatísticas geográficas por região
   */
  getRegionStats: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { getRegionStats } = await import("../db-geocoding");
      return getRegionStats(input.projectId, input.pesquisaId);
    }),
});
