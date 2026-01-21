import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('CLOUDFLARE_BUCKET_NAME') || 'linear-attachments';
    
    // Get Cloudflare R2 endpoint
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_SECRET_ACCESS_KEY');
    const accountUrl = this.configService.get<string>('CLOUDFLARE_ACCOUNT_URL');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn('Cloudflare R2 credentials not configured. File uploads will fail.');
    }

    // Initialize S3 client with Cloudflare R2 endpoint
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: accountUrl || `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });

    // Public URL for R2 bucket (if custom domain is configured)
    this.publicUrl = this.configService.get<string>('CLOUDFLARE_PUBLIC_URL') || '';
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'attachments',
  ): Promise<{ url: string; key: string }> {
    if (!this.s3Client) {
      throw new Error('Storage service not configured');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      // Return URL - use public URL if configured, otherwise return key
      const url = this.publicUrl ? `${this.publicUrl}/${key}` : key;

      return { url, key };
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('Storage service not configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client) {
      throw new Error('Storage service not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async getFileMetadata(key: string): Promise<{ size: number; contentType: string }> {
    if (!this.s3Client) {
      throw new Error('Storage service not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return {
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}
