export class InterviewService {
  async startRecording(): Promise<MediaRecorder> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.start();
      return recorder;
    } catch (error) {
      throw new Error('Failed to start recording: ' + (error as Error).message);
    }
  }

  async stopRecording(recorder: MediaRecorder): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      recorder.onerror = (error) => {
        reject(new Error('Recording failed: ' + error.message));
      };

      recorder.stop();
    });
  }

  async uploadRecording(blob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('video', blob);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      throw new Error('Failed to upload recording: ' + (error as Error).message);
    }
  }

  async getTranscription(videoUrl: string): Promise<{
    text: string;
    confidence: number;
    segments: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  }> {
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to get transcription: ' + (error as Error).message);
    }
  }

  async getAIAnalysis(transcription: string): Promise<{
    sentiment: string;
    topics: string[];
    keyPoints: string[];
    suggestions: string[];
  }> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to get AI analysis: ' + (error as Error).message);
    }
  }
} 