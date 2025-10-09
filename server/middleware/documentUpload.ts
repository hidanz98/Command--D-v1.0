/**
 * MIDDLEWARE DE UPLOAD DE DOCUMENTOS
 * 
 * Configuração segura para upload de PDFs oficiais do governo
 * - Apenas PDFs
 * - Tamanho máximo: 10MB
 * - Validação de tipo MIME
 * - Nome aleatório seguro
 * - Salvo fora do webroot
 */

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Request } from 'express';

// Diretório de upload (fora do webroot)
const UPLOAD_DIR = path.join(__dirname, '../../uploads/documents');

// Garantir que o diretório existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Tipos de arquivo permitidos (APENAS PDF)
const ALLOWED_MIME_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['.pdf'];

// Tamanho máximo: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Configuração de armazenamento
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Gerar nome aleatório seguro
    const randomName = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Formato: timestamp_hash.pdf
    cb(null, `${timestamp}_${randomName}${ext}`);
  }
});

/**
 * Filtro de arquivos
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Apenas arquivos PDF são permitidos'));
  }

  // Verificar extensão
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Apenas arquivos com extensão .pdf são permitidos'));
  }

  // Verificar se o nome do arquivo é seguro
  const filename = path.basename(file.originalname);
  const unsafeChars = /[<>:"/\\|?*\x00-\x1f]/g;
  if (unsafeChars.test(filename)) {
    return cb(new Error('Nome de arquivo contém caracteres inválidos'));
  }

  cb(null, true);
};

/**
 * Configuração do multer
 */
export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Máximo 5 arquivos por vez
    fields: 10
  }
});

/**
 * Middleware para upload múltiplo
 */
export const uploadMultipleDocuments = uploadDocument.array('documents', 5);

/**
 * Middleware para upload único
 */
export const uploadSingleDocument = uploadDocument.single('document');

/**
 * Calcular hash SHA-256 do arquivo
 */
export function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Deletar arquivo
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
  }
}

/**
 * Validar se o arquivo existe e é acessível
 */
export function validateFilePath(filePath: string): boolean {
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Verificar se está no diretório permitido
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return false; // Path traversal attempt
    }

    // Verificar permissões de leitura
    fs.accessSync(filePath, fs.constants.R_OK);

    return true;
  } catch {
    return false;
  }
}

/**
 * Obter informações do arquivo
 */
export function getFileInfo(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile()
    };
  } catch (error) {
    return null;
  }
}

