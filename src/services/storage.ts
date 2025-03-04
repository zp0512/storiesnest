import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface VideoMetadata {
  size: number;
  duration: number;
  format: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

interface Video {
  key: string;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
}

interface UploadResult {
  url: string;
  thumbnailUrl: string;
}

export class StorageService {
  private static instance: StorageService;
  private uploadProgress: Map<string, UploadProgress> = new Map();
  private s3Client: S3Client | null = null;
  private config: S3Config | null = null;
  private baseUrl: string;
  private apiKey: string;
  private userId: string;

  private constructor(baseUrl: string, apiKey: string, userId: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.userId = userId;
  }

  static getInstance(baseUrl: string, apiKey: string, userId: string): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(baseUrl, apiKey, userId);
    }
    return StorageService.instance;
  }

  initialize(config: S3Config): void {
    this.config = config;
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadVideo(blob: Blob): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('video', blob);
      formData.append('userId', this.userId);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to upload video: ' + (error as Error).message);
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/signed-url/${key}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }

      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      throw new Error('Failed to get signed URL: ' + (error as Error).message);
    }
  }

  async deleteVideo(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/videos/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      throw new Error('Failed to delete video: ' + (error as Error).message);
    }
  }

  async listVideos(): Promise<Video[]> {
    try {
      const response = await fetch(`${this.baseUrl}/videos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to list videos');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to list videos: ' + (error as Error).message);
    }
  }

  async getVideoMetadata(key: string): Promise<VideoMetadata> {
    try {
      const response = await fetch(`${this.baseUrl}/videos/${key}/metadata`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get video metadata');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to get video metadata: ' + (error as Error).message);
    }
  }

  private async uploadToS3(blob: Blob, key: string, uploadId: string): Promise<void> {
    if (!this.s3Client || !this.config) return;

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: blob,
      ContentType: blob.type,
    });

    // Create XMLHttpRequest for upload with progress tracking
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        this.updateProgress(uploadId, { progress, status: 'uploading' });
      }
    });

    // Convert blob to buffer for upload
    const buffer = await blob.arrayBuffer();
    await this.s3Client.send(command);
  }

  private async generateThumbnail(videoBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg', 0.7);
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
    });
  }

  private updateProgress(uploadId: string, progress: UploadProgress): void {
    this.uploadProgress.set(uploadId, progress);
  }

  getUploadProgress(uploadId: string): UploadProgress | undefined {
    return this.uploadProgress.get(uploadId);
  }
} 