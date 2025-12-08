/**
 * MinIO Object Storage Connection
 * Handles file uploads/downloads for images and large files
 */

import * as Minio from 'minio';
import { config } from '@/config/settings';
import { logger } from '@/utils/logger';
import { retry } from '@/utils/retry';

let minioClient: Minio.Client | null = null;

/**
 * Initialize MinIO client
 */
export async function initializeStorage(): Promise<void> {
  try {
    if (minioClient) {
      logger.debug('MinIO client already initialized');
      return;
    }

    minioClient = new Minio.Client({
      endPoint: config.MINIO_ENDPOINT,
      port: config.MINIO_PORT,
      useSSL: config.MINIO_USE_SSL,
      accessKey: config.MINIO_ACCESS_KEY,
      secretKey: config.MINIO_SECRET_KEY,
    });

    // Verify connectivity and create bucket if not exists
    await retry(
      async () => {
        const bucketExists = await minioClient!.bucketExists(config.MINIO_BUCKET_NAME);
        if (!bucketExists) {
          await minioClient!.makeBucket(config.MINIO_BUCKET_NAME);
          logger.info('MinIO bucket created', { bucket: config.MINIO_BUCKET_NAME });
        }
        logger.info('MinIO connection established', {
          endpoint: config.MINIO_ENDPOINT,
          port: config.MINIO_PORT,
          bucket: config.MINIO_BUCKET_NAME,
        });
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
      }
    );
  } catch (error) {
    logger.error('Failed to initialize MinIO connection', error);
    minioClient = null;
    throw error;
  }
}

/**
 * Close MinIO connection (cleanup)
 */
export async function closeStorage(): Promise<void> {
  // MinIO client doesn't have explicit close, just nullify reference
  minioClient = null;
  logger.info('MinIO connection closed');
}

/**
 * Get MinIO client instance
 */
export function getStorageClient(): Minio.Client {
  if (!minioClient) {
    throw new Error('MinIO client not initialized. Call initializeStorage() first.');
  }
  return minioClient;
}

/**
 * Get MinIO connection status
 */
export async function getStorageStatus(): Promise<{ connected: boolean; error?: string }> {
  try {
    if (!minioClient) {
      return {
        connected: false,
        error: 'Client not initialized',
      };
    }

    // Try to list buckets as a health check
    await minioClient.bucketExists(config.MINIO_BUCKET_NAME);
    return {
      connected: true,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload a file to MinIO
 */
export async function uploadFile(
  objectName: string,
  filePath: string | Buffer,
  contentType: string
): Promise<string> {
  const client = getStorageClient();

  if (typeof filePath === 'string') {
    await client.fPutObject(config.MINIO_BUCKET_NAME, objectName, filePath, {
      'Content-Type': contentType,
    });
  } else {
    await client.putObject(config.MINIO_BUCKET_NAME, objectName, filePath, filePath.length, {
      'Content-Type': contentType,
    });
  }

  logger.debug('File uploaded to MinIO', { objectName, contentType });
  return objectName;
}

/**
 * Download a file from MinIO
 */
export async function downloadFile(objectName: string): Promise<Buffer> {
  const client = getStorageClient();

  const dataStream = await client.getObject(config.MINIO_BUCKET_NAME, objectName);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    dataStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    dataStream.on('end', () => resolve(Buffer.concat(chunks)));
    dataStream.on('error', reject);
  });
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(objectName: string): Promise<void> {
  const client = getStorageClient();
  await client.removeObject(config.MINIO_BUCKET_NAME, objectName);
  logger.debug('File deleted from MinIO', { objectName });
}

/**
 * Get a presigned URL for file download
 */
export async function getPresignedUrl(
  objectName: string,
  expirySeconds: number = 3600
): Promise<string> {
  const client = getStorageClient();
  return client.presignedGetObject(config.MINIO_BUCKET_NAME, objectName, expirySeconds);
}

/**
 * Check if a file exists
 */
export async function fileExists(objectName: string): Promise<boolean> {
  try {
    const client = getStorageClient();
    await client.statObject(config.MINIO_BUCKET_NAME, objectName);
    return true;
  } catch {
    return false;
  }
}
