import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';
import { TenantSettings } from '@prisma/client';
import { CloudStorageService } from './CloudStorageService';

const execAsync = promisify(exec);

export interface BackupOptions {
  tenantId: string;
  tenantName: string;
  backupDir?: string;
  compress?: boolean;
}

export interface BackupResult {
  success: boolean;
  filename: string;
  filepath: string;
  size: number;
  timestamp: Date;
  cloudUrl?: string;
  error?: string;
}

export class BackupService {
  private settings: TenantSettings;
  private backupBaseDir: string;

  constructor(settings: TenantSettings) {
    this.settings = settings;
    this.backupBaseDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
  }

  /**
   * Cria um backup completo do banco de dados do tenant
   */
  async createBackup(options: BackupOptions): Promise<BackupResult> {
    try {
      // Criar diretório de backups se não existir
      const tenantBackupDir = path.join(this.backupBaseDir, options.tenantId);
      await fs.mkdir(tenantBackupDir, { recursive: true });

      // Nome do arquivo de backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFilename = `backup_${options.tenantName}_${timestamp}`;
      const sqlFilename = `${baseFilename}.sql`;
      const sqlFilepath = path.join(tenantBackupDir, sqlFilename);

      // Obter configurações do banco de dados
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL não configurada');
      }

      // Parse da URL do banco de dados
      const dbConfig = this.parseDatabaseUrl(dbUrl);

      // Executar pg_dump
      const dumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${sqlFilepath}"`;
      
      await execAsync(dumpCommand, {
        env: {
          ...process.env,
          PGPASSWORD: dbConfig.password
        }
      });

      let finalFilepath = sqlFilepath;
      let finalFilename = sqlFilename;

      // Comprimir se solicitado
      if (options.compress !== false) {
        const gzFilename = `${sqlFilename}.gz`;
        const gzFilepath = path.join(tenantBackupDir, gzFilename);

        await this.compressFile(sqlFilepath, gzFilepath);

        // Remover arquivo SQL original
        await fs.unlink(sqlFilepath);

        finalFilepath = gzFilepath;
        finalFilename = gzFilename;
      }

      // Obter tamanho do arquivo
      const stats = await fs.stat(finalFilepath);

      console.log(`✅ Backup criado com sucesso: ${finalFilename} (${this.formatBytes(stats.size)})`);

      // Limpar backups antigos
      await this.cleanOldBackups(tenantBackupDir);

      // Upload para cloud se habilitado
      let cloudUrl: string | undefined;
      if (this.settings.backupCloudEnabled) {
        const cloudService = new CloudStorageService(this.settings);
        const uploadResult = await cloudService.uploadBackup(
          finalFilepath,
          finalFilename,
          options.tenantId
        );

        if (uploadResult.success) {
          cloudUrl = uploadResult.url;
          console.log(`☁️  Backup enviado para cloud: ${cloudUrl}`);
        } else {
          console.warn(`⚠️  Falha no upload para cloud: ${uploadResult.error}`);
        }
      }

      return {
        success: true,
        filename: finalFilename,
        filepath: finalFilepath,
        size: stats.size,
        timestamp: new Date(),
        cloudUrl
      };
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      return {
        success: false,
        filename: '',
        filepath: '',
        size: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Comprime um arquivo usando gzip
   */
  private async compressFile(inputPath: string, outputPath: string): Promise<void> {
    const input = createReadStream(inputPath);
    const output = createWriteStream(outputPath);
    const gzip = createGzip();

    await pipeline(input, gzip, output);
  }

  /**
   * Limpa backups antigos baseado na política de retenção
   */
  private async cleanOldBackups(backupDir: string): Promise<void> {
    try {
      const retentionDays = this.settings.backupRetentionDays || 7;
      const files = await fs.readdir(backupDir);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`🗑️  Backup antigo removido: ${file}`);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }

  /**
   * Parse da URL do banco de dados PostgreSQL
   */
  private parseDatabaseUrl(url: string): {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  } {
    // Formato: postgresql://user:password@host:port/database
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = url.match(regex);

    if (!match) {
      throw new Error('URL do banco de dados inválida');
    }

    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4]),
      database: match[5]
    };
  }

  /**
   * Formata bytes para formato legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Lista todos os backups disponíveis
   */
  async listBackups(tenantId: string): Promise<Array<{
    filename: string;
    filepath: string;
    size: number;
    created: Date;
  }>> {
    try {
      const tenantBackupDir = path.join(this.backupBaseDir, tenantId);
      const files = await fs.readdir(tenantBackupDir);

      const backups = await Promise.all(
        files.map(async (file) => {
          const filepath = path.join(tenantBackupDir, file);
          const stats = await fs.stat(filepath);

          return {
            filename: file,
            filepath,
            size: stats.size,
            created: stats.mtime
          };
        })
      );

      // Ordenar por data de criação (mais recente primeiro)
      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  /**
   * Restaura um backup
   */
  async restoreBackup(backupPath: string): Promise<boolean> {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL não configurada');
      }

      const dbConfig = this.parseDatabaseUrl(dbUrl);

      // Se o arquivo está comprimido, descomprimir primeiro
      let sqlFilepath = backupPath;
      if (backupPath.endsWith('.gz')) {
        // TODO: Implementar descompressão
        throw new Error('Restauração de arquivos comprimidos ainda não implementada');
      }

      // Executar psql para restaurar
      const restoreCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${sqlFilepath}"`;
      
      await execAsync(restoreCommand, {
        env: {
          ...process.env,
          PGPASSWORD: dbConfig.password
        }
      });

      console.log('✅ Backup restaurado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      return false;
    }
  }
}

