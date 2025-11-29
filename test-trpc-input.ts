import { z } from 'zod';

// Testar diferentes schemas
const schema1 = z
  .object({
    projectId: z.number().optional(),
  })
  .optional();

const schema2 = z
  .object({
    projectId: z.number().optional(),
  })
  .optional()
  .default({});

const schema3 = z.object({
  projectId: z.number().optional(),
});

console.log('=== TESTE DE SCHEMAS ===\n');

// Teste 1: undefined
console.log('1. Input: undefined');
try {
  const r1 = schema1.parse(undefined);
  console.log('  Schema1:', r1);
} catch (e: any) {
  console.log('  Schema1 ERRO:', e.message);
}

try {
  const r2 = schema2.parse(undefined);
  console.log('  Schema2:', r2);
} catch (e: any) {
  console.log('  Schema2 ERRO:', e.message);
}

try {
  const r3 = schema3.parse(undefined);
  console.log('  Schema3:', r3);
} catch (e: any) {
  console.log('  Schema3 ERRO:', e.message);
}

console.log('');

// Teste 2: {}
console.log('2. Input: {}');
const r1 = schema1.parse({});
const r2 = schema2.parse({});
const r3 = schema3.parse({});
console.log('  Schema1:', r1);
console.log('  Schema2:', r2);
console.log('  Schema3:', r3);

console.log('');

// Teste 3: {projectId: 1}
console.log('3. Input: {projectId: 1}');
const r1_3 = schema1.parse({ projectId: 1 });
const r2_3 = schema2.parse({ projectId: 1 });
const r3_3 = schema3.parse({ projectId: 1 });
console.log('  Schema1:', r1_3);
console.log('  Schema2:', r2_3);
console.log('  Schema3:', r3_3);

console.log('');

// Teste 4: Verificar se projectId está presente
console.log('4. Verificação de projectId:');
console.log('  r1_3?.projectId:', r1_3?.projectId);
console.log('  r2_3?.projectId:', r2_3?.projectId);
console.log('  r3_3?.projectId:', r3_3?.projectId);
