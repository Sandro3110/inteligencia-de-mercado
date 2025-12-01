import JSZip from 'jszip';

/**
 * Interface para arquivo a ser adicionado ao ZIP
 */
export interface ZipFile {
  filename: string;
  data: Buffer | string; // Buffer para binários, string para base64
  encoding?: 'base64' | 'buffer';
}

/**
 * Criar arquivo ZIP com múltiplos arquivos
 *
 * @param files - Array de arquivos a serem empacotados
 * @param zipFilename - Nome do arquivo ZIP (opcional, usado apenas para referência)
 * @returns Buffer do ZIP gerado
 *
 * @example
 * ```typescript
 * const files = [
 *   { filename: 'relatorio-1.pdf', data: pdfBuffer, encoding: 'buffer' },
 *   { filename: 'relatorio-2.pdf', data: pdfBase64, encoding: 'base64' },
 * ];
 * const zipBuffer = await createZip(files);
 * ```
 */
export async function createZip(files: ZipFile[], zipFilename?: string): Promise<Buffer> {
  if (!files || files.length === 0) {
    throw new Error('Nenhum arquivo fornecido para criar ZIP');
  }

  console.log(
    `[ZipGenerator] Criando ZIP "${zipFilename || 'arquivo.zip'}" com ${files.length} arquivos`
  );

  const zip = new JSZip();

  // Adicionar cada arquivo ao ZIP
  for (const file of files) {
    if (!file.filename) {
      throw new Error('Nome do arquivo não fornecido');
    }

    if (!file.data) {
      throw new Error(`Dados não fornecidos para o arquivo "${file.filename}"`);
    }

    const encoding = file.encoding || 'buffer';

    if (encoding === 'base64') {
      // Se for base64, converter para Buffer
      const buffer = Buffer.from(file.data as string, 'base64');
      zip.file(file.filename, buffer);
      console.log(`[ZipGenerator] Adicionado: ${file.filename} (${buffer.length} bytes, base64)`);
    } else {
      // Se for Buffer, adicionar diretamente
      zip.file(file.filename, file.data as Buffer);
      console.log(
        `[ZipGenerator] Adicionado: ${file.filename} (${(file.data as Buffer).length} bytes, buffer)`
      );
    }
  }

  // Gerar ZIP como Buffer
  console.log(`[ZipGenerator] Gerando ZIP...`);
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6, // Nível de compressão (0-9, 6 é padrão)
    },
  });

  console.log(`[ZipGenerator] ZIP gerado com sucesso: ${zipBuffer.length} bytes`);

  return zipBuffer;
}

/**
 * Converter Buffer para base64
 *
 * @param buffer - Buffer a ser convertido
 * @returns String base64
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Criar ZIP e retornar em base64 (para envio via tRPC)
 *
 * @param files - Array de arquivos a serem empacotados
 * @param zipFilename - Nome do arquivo ZIP (opcional)
 * @returns String base64 do ZIP
 */
export async function createZipBase64(files: ZipFile[], zipFilename?: string): Promise<string> {
  const zipBuffer = await createZip(files, zipFilename);
  return bufferToBase64(zipBuffer);
}
