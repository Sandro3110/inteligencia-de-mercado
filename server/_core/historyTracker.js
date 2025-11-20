"use strict";
/**
 * Helper para rastrear mudanças em entidades
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectChanges = detectChanges;
exports.trackMercadoChanges = trackMercadoChanges;
exports.trackClienteChanges = trackClienteChanges;
exports.trackConcorrenteChanges = trackConcorrenteChanges;
exports.trackLeadChanges = trackLeadChanges;
exports.trackCreation = trackCreation;
const db_1 = require("../db");
const schema_1 = require("../../drizzle/schema");
/**
 * Compara dois objetos e retorna lista de mudanças
 */
function detectChanges(oldData, newData, fieldsToTrack) {
    const changes = [];
    for (const field of fieldsToTrack) {
        const oldValue = oldData[field];
        const newValue = newData[field];
        // Ignorar se ambos são null/undefined
        if (oldValue == null && newValue == null)
            continue;
        // Detectar mudança
        if (oldValue !== newValue) {
            changes.push({
                field,
                oldValue: oldValue != null ? String(oldValue) : null,
                newValue: newValue != null ? String(newValue) : null,
            });
        }
    }
    return changes;
}
/**
 * Registra mudanças de mercado no histórico
 */
async function trackMercadoChanges(mercadoId, changes, changeType = 'updated', changedBy = 'system') {
    if (changes.length === 0)
        return;
    const db = await (0, db_1.getDb)();
    if (!db)
        return;
    const records = changes.map((change) => ({
        mercadoId,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changeType,
        changedBy,
    }));
    await db.insert(schema_1.mercadosHistory).values(records);
    console.log(`[History] Registradas ${changes.length} mudanças para mercado ${mercadoId}`);
}
/**
 * Registra mudanças de cliente no histórico
 */
async function trackClienteChanges(clienteId, changes, changeType = 'updated', changedBy = 'system') {
    if (changes.length === 0)
        return;
    const db = await (0, db_1.getDb)();
    if (!db)
        return;
    const records = changes.map((change) => ({
        clienteId,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changeType,
        changedBy,
    }));
    await db.insert(schema_1.clientesHistory).values(records);
    console.log(`[History] Registradas ${changes.length} mudanças para cliente ${clienteId}`);
}
/**
 * Registra mudanças de concorrente no histórico
 */
async function trackConcorrenteChanges(concorrenteId, changes, changeType = 'updated', changedBy = 'system') {
    if (changes.length === 0)
        return;
    const db = await (0, db_1.getDb)();
    if (!db)
        return;
    const records = changes.map((change) => ({
        concorrenteId,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changeType,
        changedBy,
    }));
    await db.insert(schema_1.concorrentesHistory).values(records);
    console.log(`[History] Registradas ${changes.length} mudanças para concorrente ${concorrenteId}`);
}
/**
 * Registra mudanças de lead no histórico
 */
async function trackLeadChanges(leadId, changes, changeType = 'updated', changedBy = 'system') {
    if (changes.length === 0)
        return;
    const db = await (0, db_1.getDb)();
    if (!db)
        return;
    const records = changes.map((change) => ({
        leadId,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changeType,
        changedBy,
    }));
    await db.insert(schema_1.leadsHistory).values(records);
    console.log(`[History] Registradas ${changes.length} mudanças para lead ${leadId}`);
}
/**
 * Registra criação de entidade
 */
async function trackCreation(entityType, entityId, initialData, changedBy = 'system') {
    const db = await (0, db_1.getDb)();
    if (!db)
        return;
    const change = {
        field: '_created',
        oldValue: null,
        newValue: JSON.stringify(initialData),
        changeType: 'created',
        changedBy,
    };
    switch (entityType) {
        case 'mercado':
            await db.insert(schema_1.mercadosHistory).values({ ...change, mercadoId: entityId });
            break;
        case 'cliente':
            await db.insert(schema_1.clientesHistory).values({ ...change, clienteId: entityId });
            break;
        case 'concorrente':
            await db.insert(schema_1.concorrentesHistory).values({ ...change, concorrenteId: entityId });
            break;
        case 'lead':
            await db.insert(schema_1.leadsHistory).values({ ...change, leadId: entityId });
            break;
    }
    console.log(`[History] Criação de ${entityType} ${entityId} registrada`);
}
