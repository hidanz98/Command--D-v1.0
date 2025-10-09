/**
 * VALIDADOR DE PDFs
 * 
 * Valida PDFs oficiais do governo:
 * - Verifica se é PDF válido
 * - Extrai metadados
 * - Verifica QR Code (quando aplicável)
 * - Valida origem oficial
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Resultado da validação
 */
export interface PDFValidationResult {
  isValid: boolean;
  isPDF: boolean;
  fileSize: number;
  hasQRCode: boolean;
  qrCodeData?: string;
  isFromGovSource: boolean;
  metadata?: {
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Validar PDF básico
 */
export async function validatePDF(filePath: string): Promise<PDFValidationResult> {
  const result: PDFValidationResult = {
    isValid: false,
    isPDF: false,
    fileSize: 0,
    hasQRCode: false,
    isFromGovSource: false,
    errors: [],
    warnings: []
  };

  try {
    // Verificar se arquivo existe
    const stats = await fs.stat(filePath);
    result.fileSize = stats.size;

    // Ler primeiros bytes para verificar assinatura PDF
    const buffer = await fs.readFile(filePath);
    
    // PDF sempre começa com %PDF-
    const pdfSignature = buffer.slice(0, 5).toString();
    result.isPDF = pdfSignature === '%PDF-';

    if (!result.isPDF) {
      result.errors.push('Arquivo não é um PDF válido');
      return result;
    }

    // Verificar se o PDF não está corrompido (tem %%EOF no final)
    const lastBytes = buffer.slice(-1024).toString();
    if (!lastBytes.includes('%%EOF')) {
      result.errors.push('PDF pode estar corrompido (sem marcador EOF)');
      result.warnings.push('Verificar integridade do arquivo');
    }

    // Extrair metadados básicos
    result.metadata = await extractPDFMetadata(buffer);

    // Verificar se é de fonte governamental
    result.isFromGovSource = await checkGovSource(buffer, result.metadata);

    // Verificar presença de QR Code (busca por padrões)
    result.hasQRCode = await checkForQRCode(buffer);

    // Se passou em todas validações básicas
    if (result.isPDF && result.errors.length === 0) {
      result.isValid = true;
    }

    return result;
  } catch (error) {
    result.errors.push(`Erro ao validar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return result;
  }
}

/**
 * Extrair metadados do PDF
 */
async function extractPDFMetadata(buffer: Buffer): Promise<PDFValidationResult['metadata']> {
  try {
    const content = buffer.toString('latin1');
    const metadata: any = {};

    // Extrair título
    const titleMatch = content.match(/\/Title\s*\(([^)]+)\)/);
    if (titleMatch) metadata.title = titleMatch[1];

    // Extrair autor
    const authorMatch = content.match(/\/Author\s*\(([^)]+)\)/);
    if (authorMatch) metadata.author = authorMatch[1];

    // Extrair criador
    const creatorMatch = content.match(/\/Creator\s*\(([^)]+)\)/);
    if (creatorMatch) metadata.creator = creatorMatch[1];

    // Extrair produtor
    const producerMatch = content.match(/\/Producer\s*\(([^)]+)\)/);
    if (producerMatch) metadata.producer = producerMatch[1];

    // Extrair data de criação
    const creationDateMatch = content.match(/\/CreationDate\s*\(([^)]+)\)/);
    if (creationDateMatch) metadata.creationDate = creationDateMatch[1];

    // Extrair data de modificação
    const modDateMatch = content.match(/\/ModDate\s*\(([^)]+)\)/);
    if (modDateMatch) metadata.modificationDate = modDateMatch[1];

    return metadata;
  } catch {
    return {};
  }
}

/**
 * Verificar se é de fonte governamental
 */
async function checkGovSource(buffer: Buffer, metadata?: PDFValidationResult['metadata']): Promise<boolean> {
  try {
    const content = buffer.toString('latin1').toLowerCase();

    // Palavras-chave que indicam documento governamental
    const govKeywords = [
      'gov.br',
      'receita federal',
      'governo federal',
      'detran',
      'secretaria',
      'prefeitura',
      'ministério',
      'serpro',
      'dataprev',
      'caixa econômica',
      'banco do brasil'
    ];

    // Verificar no conteúdo
    for (const keyword of govKeywords) {
      if (content.includes(keyword)) {
        return true;
      }
    }

    // Verificar nos metadados
    if (metadata) {
      const metaString = JSON.stringify(metadata).toLowerCase();
      for (const keyword of govKeywords) {
        if (metaString.includes(keyword)) {
          return true;
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Verificar presença de QR Code
 */
async function checkForQRCode(buffer: Buffer): Promise<boolean> {
  try {
    const content = buffer.toString('latin1');

    // PDFs com QR Code geralmente têm esses padrões
    const qrCodePatterns = [
      '/Subtype /Image',
      '/Filter /DCTDecode',
      '/Filter /FlateDecode',
      'QR Code',
      'qrcode',
      '/Type /XObject'
    ];

    let patternMatches = 0;
    for (const pattern of qrCodePatterns) {
      if (content.includes(pattern)) {
        patternMatches++;
      }
    }

    // Se encontrou múltiplos padrões, provavelmente tem QR Code
    return patternMatches >= 3;
  } catch {
    return false;
  }
}

/**
 * Validar tipo de documento específico
 */
export interface DocumentTypeValidation {
  type: 'CPF' | 'RG' | 'CNH' | 'CNPJ' | 'PROOF_OF_ADDRESS';
  isValid: boolean;
  requiresQRCode: boolean;
  requiresGovSource: boolean;
  errors: string[];
}

export async function validateDocumentType(
  filePath: string,
  documentType: DocumentTypeValidation['type']
): Promise<DocumentTypeValidation> {
  const pdfValidation = await validatePDF(filePath);
  
  const result: DocumentTypeValidation = {
    type: documentType,
    isValid: false,
    requiresQRCode: false,
    requiresGovSource: false,
    errors: []
  };

  // Adicionar erros do PDF
  result.errors.push(...pdfValidation.errors);

  // Validações específicas por tipo
  switch (documentType) {
    case 'CPF':
      result.requiresGovSource = true;
      if (!pdfValidation.isFromGovSource) {
        result.errors.push('CPF deve ser PDF oficial da Receita Federal ou gov.br');
      }
      break;

    case 'RG':
      result.requiresQRCode = true;
      result.requiresGovSource = true;
      if (!pdfValidation.hasQRCode) {
        result.errors.push('RG Digital deve conter QR Code de verificação');
      }
      if (!pdfValidation.isFromGovSource) {
        result.errors.push('RG deve ser documento oficial digital do estado');
      }
      break;

    case 'CNH':
      result.requiresQRCode = true;
      result.requiresGovSource = true;
      if (!pdfValidation.hasQRCode) {
        result.errors.push('CNH Digital deve conter QR Code de verificação');
      }
      if (!pdfValidation.isFromGovSource) {
        result.errors.push('CNH deve ser da Carteira Digital de Trânsito oficial');
      }
      break;

    case 'CNPJ':
      result.requiresGovSource = true;
      if (!pdfValidation.isFromGovSource) {
        result.errors.push('CNPJ deve ser PDF oficial da Receita Federal');
      }
      break;

    case 'PROOF_OF_ADDRESS':
      // Comprovante não precisa QR Code, mas deve ser PDF válido
      if (!pdfValidation.isPDF) {
        result.errors.push('Comprovante deve ser em formato PDF');
      }
      break;
  }

  // Se não tem erros, é válido
  result.isValid = result.errors.length === 0;

  return result;
}

/**
 * Validar múltiplos documentos
 */
export async function validateDocuments(
  documents: Array<{ filePath: string; type: DocumentTypeValidation['type'] }>
): Promise<DocumentTypeValidation[]> {
  const results: DocumentTypeValidation[] = [];

  for (const doc of documents) {
    const validation = await validateDocumentType(doc.filePath, doc.type);
    results.push(validation);
  }

  return results;
}

/**
 * Verificar se todos documentos obrigatórios foram enviados
 */
export function checkRequiredDocuments(
  documents: Array<{ type: string }>,
  personType: 'fisica' | 'juridica'
): { isComplete: boolean; missing: string[] } {
  const missing: string[] = [];

  if (personType === 'fisica') {
    // Pessoa Física
    const hasCPF = documents.some(d => d.type === 'CPF');
    const hasIdentity = documents.some(d => ['RG', 'CNH'].includes(d.type));
    const hasAddress = documents.some(d => d.type === 'PROOF_OF_ADDRESS');

    if (!hasCPF) missing.push('CPF');
    if (!hasIdentity) missing.push('RG ou CNH');
    if (!hasAddress) missing.push('Comprovante de Endereço');
  } else {
    // Pessoa Jurídica
    const hasCNPJ = documents.some(d => d.type === 'CNPJ');
    const hasContract = documents.some(d => d.type === 'SOCIAL_CONTRACT');
    const hasAddress = documents.some(d => d.type === 'PROOF_OF_ADDRESS');

    if (!hasCNPJ) missing.push('CNPJ');
    if (!hasContract) missing.push('Contrato Social');
    if (!hasAddress) missing.push('Comprovante de Endereço da Empresa');
  }

  return {
    isComplete: missing.length === 0,
    missing
  };
}

