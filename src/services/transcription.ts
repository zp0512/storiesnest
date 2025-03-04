import { v4 as uuidv4 } from 'uuid';

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

interface Transcription {
  text: string;
  confidence: number;
  segments: TranscriptionSegment[];
}

interface TranscriptionStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error: string | null;
  result: Transcription | null;
}

interface TranscriptionHistoryItem {
  id: string;
  videoUrl: string;
  text: string;
  confidence: number;
  createdAt: string;
}

export class TranscriptionService {
  private static instance: TranscriptionService;
  private baseUrl: string;
  private apiKey: string;

  private constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  static getInstance(baseUrl: string, apiKey: string): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService(baseUrl, apiKey);
    }
    return TranscriptionService.instance;
  }

  async transcribeVideo(videoUrl: string): Promise<Transcription> {
    try {
      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to transcribe video: ' + (error as Error).message);
    }
  }

  async getTranscriptionStatus(id: string): Promise<TranscriptionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/transcribe/${id}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get status');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to get transcription status: ' + (error as Error).message);
    }
  }

  async getTranscriptionHistory(): Promise<TranscriptionHistoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transcribe/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get history');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to get transcription history: ' + (error as Error).message);
    }
  }

  async deleteTranscription(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/transcribe/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete transcription');
      }
    } catch (error) {
      throw new Error('Failed to delete transcription: ' + (error as Error).message);
    }
  }

  async searchTranscriptions(query: string): Promise<TranscriptionHistoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transcribe/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search transcriptions');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to search transcriptions: ' + (error as Error).message);
    }
  }
} 