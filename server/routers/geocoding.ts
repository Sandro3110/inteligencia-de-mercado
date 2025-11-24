/**
 * Geocoding Router - Geocodificação de endereços
 * Adaptado para Next.js App Router
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

// Importar serviços de geocodificação (mantidos do original)
import {
  geocodeAddress,
  geocodeBatch,
  testGoogleMapsConnection,
} from '@/server/services/geocoding';

import {
  getRecordsSemCoordenadas,
  updateClienteCoordinates,
  updateConcorrenteCoordinates,
  updateLeadCoordinates,
  getGeocodeStats,
} from '@/server/db-geocoding';

import { getEnrichmentConfig } from '@/server/db';

/**
 * Router de geocodificação
 */
export const geocodingRouter = createTRPCRouter({
  /**
   * Buscar registros sem coordenadas
   */
  getRecordsSemCoordenadas: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        tipo: z.enum(['cliente', 'concorrente', 'lead']).optional(),
      })
    )
    .query(async ({ input }) => {
      const records = await getRecordsSemCoordenadas(input.projetoId, input.tipo);
      return records;
    }),

  /**
   * Geocodificar um endereço individual
   */
  geocodeAddress: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        id: z.number(),
        tipo: z.enum(['cliente', 'concorrente', 'lead']),
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
          error: 'API Key do Google Maps não configurada',
        };
      }

      // Geocodificar endereço
      const result = await geocodeAddress(input.cidade, input.uf, 'Brasil', apiKey);

      if (!('latitude' in result)) {
        return {
          success: false,
          error: result.error,
        };
      }

      // Atualizar coordenadas no banco
      let updated = false;
      if (input.tipo === 'cliente') {
        updated = await updateClienteCoordinates(input.id, result.latitude, result.longitude);
      } else if (input.tipo === 'concorrente') {
        updated = await updateConcorrenteCoordinates(input.id, result.latitude, result.longitude);
      } else if (input.tipo === 'lead') {
        updated = await updateLeadCoordinates(input.id, result.latitude, result.longitude);
      }

      return {
        success: updated,
        latitude: result.latitude,
        longitude: result.longitude,
      };
    }),

  /**
   * Geocodificar múltiplos endereços em batch
   */
  geocodeBatch: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        tipo: z.enum(['cliente', 'concorrente', 'lead']),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar API key
      const config = await getEnrichmentConfig(input.projetoId);
      const apiKey = config?.googleMapsApiKey;

      if (!apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      // Buscar registros sem coordenadas
      const records = await getRecordsSemCoordenadas(input.projetoId, input.tipo);
      const toGeocode = records.slice(0, input.limit);

      if (toGeocode.length === 0) {
        return {
          success: true,
          processed: 0,
          message: 'Não há registros para geocodificar',
        };
      }

      // Preparar endereços
      const addresses = toGeocode.map((r) => ({
        id: r.id,
        address: `${r.cidade}, ${r.uf}, Brasil`,
      }));

      // Geocodificar em batch
      const results = await geocodeBatch(
        addresses.map((a) => a.address),
        apiKey
      );

      // Atualizar coordenadas
      let successCount = 0;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const record = toGeocode[i];

        if ('latitude' in result) {
          let updated = false;
          if (input.tipo === 'cliente') {
            updated = await updateClienteCoordinates(record.id, result.latitude, result.longitude);
          } else if (input.tipo === 'concorrente') {
            updated = await updateConcorrenteCoordinates(
              record.id,
              result.latitude,
              result.longitude
            );
          } else if (input.tipo === 'lead') {
            updated = await updateLeadCoordinates(record.id, result.latitude, result.longitude);
          }

          if (updated) successCount++;
        }
      }

      return {
        success: true,
        processed: toGeocode.length,
        successful: successCount,
        failed: toGeocode.length - successCount,
      };
    }),

  /**
   * Obter estatísticas de geocodificação
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
   * Testar conexão com Google Maps API
   */
  testConnection: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const config = await getEnrichmentConfig(input.projetoId);
      const apiKey = config?.googleMapsApiKey;

      if (!apiKey) {
        return {
          success: false,
          error: 'API Key do Google Maps não configurada',
        };
      }

      const result = await testGoogleMapsConnection(apiKey);
      return result;
    }),

  /**
   * Obter localizações para mapa
   */
  getLocations: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        tipo: z.enum(['cliente', 'concorrente', 'lead', 'all']).default('all'),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar busca de localizações
      // Por enquanto retorna vazio
      return {
        locations: [],
      };
    }),

  /**
   * Obter estatísticas por região
   */
  getRegionStats: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar estatísticas por região
      return {
        regions: [],
      };
    }),

  /**
   * Obter análise regional
   */
  getRegionAnalysis: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        uf: z.string().optional(),
        cidade: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar análise regional
      return {
        analysis: {},
      };
    }),

  /**
   * Obter insights territoriais
   */
  getTerritorialInsights: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar insights territoriais
      return {
        insights: [],
      };
    }),
});
