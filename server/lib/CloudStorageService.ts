import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'fs';
import { TenantSettings } from '@prisma/client';
import { decrypt } from '../utils/encryption';

export interface CloudUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface CloudBackupInfo {
  key: string;
  size: number;
  lastModified: Date;
  url: string;
}

export class CloudStorageService {
  private settings: TenantSettings;
  private s3Client?: S3Client;
  private bucket?: string;

  constructor(settings: TenantSettings) {
    this.settings = settings;
    this.initializeS3();
  }

  /**
   * Inicializa o cliente S3 se as credenciais estiverem configuradas
   */
  private initializeS3() {
    if (this.settings.backupCloudProvider !== 'aws-s3') {
      return;
    }

    if (!this.settings.backupCloudCredentials) {
      return;
    }

    try {
      const credentials = JSON.parse(decrypt(this.settings.backupCloudCredentials));

      this.s3Client = new S3Client({
        region: credentials.region || 'us-east-1',
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
      });

      this.bucket = credentials.bucket;
    } catch (error) {
      console.error('Erro ao inicializar S3:', error);
    }
  }

  /**
   * Faz upload de um arquivo de backup para a cloud
   */
  async uploadBackup(filePath: string, filename: string, tenantId: string): Promise<CloudUploadResult> {
    if (!this.settings.backupCloudEnabled) {
      return {
        success: false,
        error: 'Upload para cloud não está habilitado',
      };
    }

    const provider = this.settings.backupCloudProvider || 'local';

    switch (provider) {
      case 'aws-s3':
        return await this.uploadToS3(filePath, filename, tenantId);
      case 'google-drive':
        return {
          success: false,
          error: 'Google Drive ainda não implementado',
        };
      case 'dropbox':
        return {
          success: false,
          error: 'Dropbox ainda não implementado',
        };
      case 'azure':
        return {
          success: false,
          error: 'Azure ainda não implementado',
        };
      default:
        return {
          success: false,
          error: 'Provedor de cloud não suportado',
        };
    }
  }

  /**
   * Upload para AWS S3
   */
  private async uploadToS3(filePath: string, filename: string, tenantId: string): Promise<CloudUploadResult> {
    if (!this.s3Client || !this.bucket) {
      return {
        success: false,
        error: 'S3 não está configurado corretamente',
      };
    }

    try {
      const fileStream = createReadStream(filePath);
      const key = `backups/${tenantId}/${filename}`;

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: fileStream,
          ContentType: 'application/gzip',
          ServerSideEncryption: 'AES256',
        },
      });

      await upload.done();

      const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;

      console.log(`✅ Backup enviado para S3: ${key}`);

      return {
        success: true,
        url,
        key,
      };
    } catch (error) {
      console.error('Erro ao fazer upload para S3:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Lista backups na cloud
   */
  async listCloudBackups(tenantId: string): Promise<CloudBackupInfo[]> {
    if (!this.settings.backupCloudEnabled || !this.s3Client || !this.bucket) {
      return [];
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: `backups/${tenantId}/`,
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      return response.Contents.map((item) => ({
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
        url: `https://${this.bucket}.s3.amazonaws.com/${item.Key}`,
      }));
    } catch (error) {
      console.error('Erro ao listar backups na cloud:', error);
      return [];
    }
  }

  /**
   * Deleta um backup da cloud
   */
  async deleteCloudBackup(key: string): Promise<boolean> {
    if (!this.s3Client || !this.bucket) {
      return false;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      console.log(`✅ Backup deletado da S3: ${key}`);

      return true;
    } catch (error) {
      console.error('Erro ao deletar backup da cloud:', error);
      return false;
    }
  }
}

