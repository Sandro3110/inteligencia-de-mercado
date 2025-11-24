# Guia de Migração: xlsx → exceljs

Este documento descreve como migrar de `xlsx` para `exceljs`.

## 📋 Por que migrar?

- ✅ **Segurança:** exceljs não possui vulnerabilidades conhecidas
- ✅ **Manutenção:** Ativamente mantido
- ✅ **Performance:** Melhor performance em arquivos grandes
- ✅ **TypeScript:** Suporte nativo
- ✅ **Features:** Mais recursos (estilos, fórmulas, etc.)

## 🔄 Comparação de APIs

### Leitura de Arquivos

**xlsx:**
```typescript
import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('file.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);
```

**exceljs:**
```typescript
import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile('file.xlsx');
const worksheet = workbook.getWorksheet(1);
const data = [];
worksheet.eachRow((row, rowNumber) => {
  data.push(row.values);
});
```

### Escrita de Arquivos

**xlsx:**
```typescript
import * as XLSX from 'xlsx';

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
XLSX.writeFile(workbook, 'output.xlsx');
```

**exceljs:**
```typescript
import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet1');

// Add headers
worksheet.columns = [
  { header: 'Name', key: 'name', width: 30 },
  { header: 'Email', key: 'email', width: 30 },
];

// Add data
data.forEach(item => {
  worksheet.addRow(item);
});

await workbook.xlsx.writeFile('output.xlsx');
```

### Leitura de Buffer

**xlsx:**
```typescript
const workbook = XLSX.read(buffer, { type: 'buffer' });
```

**exceljs:**
```typescript
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(buffer);
```

### Escrita para Buffer

**xlsx:**
```typescript
const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
```

**exceljs:**
```typescript
const buffer = await workbook.xlsx.writeBuffer();
```

## 📝 Arquivos a Migrar

### 1. server/renderers/ExcelRenderer.ts

**Antes:**
```typescript
import * as XLSX from 'xlsx';

export class ExcelRenderer {
  render(data: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
```

**Depois:**
```typescript
import ExcelJS from 'exceljs';

export class ExcelRenderer {
  async render(data: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    
    // Auto-detect columns from first row
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      worksheet.columns = keys.map(key => ({
        header: key,
        key: key,
        width: 20
      }));
    }
    
    // Add rows
    data.forEach(row => worksheet.addRow(row));
    
    return await workbook.xlsx.writeBuffer();
  }
}
```

### 2. server/services/spreadsheetParser.ts

**Antes:**
```typescript
import * as XLSX from 'xlsx';

export function parseSpreadsheet(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet);
}
```

**Depois:**
```typescript
import ExcelJS from 'exceljs';

export async function parseSpreadsheet(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.getWorksheet(1);
  const data: any[] = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      rowData[`col${colNumber}`] = cell.value;
    });
    data.push(rowData);
  });
  
  return data;
}
```

### 3. components/FileUploadParser.tsx

**Antes:**
```typescript
import * as XLSX from 'xlsx';

const handleFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    setData(json);
  };
  reader.readAsArrayBuffer(file);
};
```

**Depois:**
```typescript
import ExcelJS from 'exceljs';

const handleFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.getWorksheet(1);
  const data: any[] = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      rowData[`col${colNumber}`] = cell.value;
    });
    data.push(rowData);
  });
  
  setData(data);
};
```

## 🎨 Recursos Avançados do ExcelJS

### Estilos

```typescript
// Add styles to cells
worksheet.getCell('A1').font = {
  name: 'Arial',
  size: 12,
  bold: true
};

worksheet.getCell('A1').fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFF0000' }
};
```

### Fórmulas

```typescript
// Add formula
worksheet.getCell('C1').value = { formula: 'A1+B1' };
```

### Mesclar Células

```typescript
// Merge cells
worksheet.mergeCells('A1:B1');
```

### Validação de Dados

```typescript
// Add data validation
worksheet.getCell('A1').dataValidation = {
  type: 'list',
  allowBlank: true,
  formulae: ['"Option1,Option2,Option3"']
};
```

## 🧪 Testes

Após migrar, teste:

1. **Leitura de arquivos:** Verifique se arquivos .xlsx são lidos corretamente
2. **Escrita de arquivos:** Verifique se arquivos gerados abrem no Excel
3. **Performance:** Compare tempo de processamento
4. **Compatibilidade:** Teste com diferentes versões do Excel

## 📚 Recursos

- [ExcelJS Documentation](https://github.com/exceljs/exceljs)
- [ExcelJS API Reference](https://github.com/exceljs/exceljs#interface)
- [Migration Examples](https://github.com/exceljs/exceljs/blob/master/README.md#reading-xlsx)

## ✅ Checklist de Migração

- [ ] Atualizar imports de `xlsx` para `exceljs`
- [ ] Converter funções síncronas para assíncronas
- [ ] Atualizar leitura de arquivos
- [ ] Atualizar escrita de arquivos
- [ ] Adicionar estilos (opcional)
- [ ] Testar com arquivos reais
- [ ] Atualizar testes
- [ ] Documentar mudanças

---

**Status:** xlsx removido, exceljs instalado. Migração de código pendente.
