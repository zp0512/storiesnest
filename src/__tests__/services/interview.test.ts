import { InterviewService } from '@/services/interview';
import { mockApiResponse, mockApiError } from '@/__tests__/utils/test-utils';

describe('InterviewService', () => {
  let interviewService: InterviewService;

  beforeEach(() => {
    interviewService = new InterviewService();
    jest.clearAllMocks();
  });

  describe('startRecording', () => {
    it('starts recording successfully', async () => {
      const mockStream = new MediaStream();
      const mockRecorder = new MediaRecorder(mockStream);
      
      // Mock getUserMedia
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: jest.fn().mockResolvedValue(mockStream),
        },
        writable: true,
      });
      
      // Mock MediaRecorder
      global.MediaRecorder = jest.fn().mockImplementation(() => mockRecorder) as any;
      
      const result = await interviewService.startRecording();
      
      expect(result).toBe(mockRecorder);
      expect(mockRecorder.start).toHaveBeenCalled();
    });

    it('handles getUserMedia error', async () => {
      // Mock getUserMedia to fail
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied')),
        },
        writable: true,
      });
      
      await expect(interviewService.startRecording()).rejects.toThrow('Permission denied');
    });
  });

  describe('stopRecording', () => {
    it('stops recording and returns blob', async () => {
      const mockBlob = new Blob(['test video data'], { type: 'video/webm' });
      const mockRecorder = {
        state: 'recording',
        stop: jest.fn(),
        ondataavailable: null as ((event: BlobEvent) => void) | null,
      };
      
      const result = await interviewService.stopRecording(mockRecorder as any);
      
      expect(mockRecorder.stop).toHaveBeenCalled();
      expect(result).toBe(mockBlob);
    });

    it('handles recording error', async () => {
      const mockRecorder = {
        state: 'recording',
        stop: jest.fn(),
        ondataavailable: null as ((event: BlobEvent) => void) | null,
        onerror: jest.fn(),
      };
      
      await expect(interviewService.stopRecording(mockRecorder as any)).rejects.toThrow('Recording failed');
    });
  });

  describe('uploadRecording', () => {
    it('uploads recording successfully', async () => {
      const mockBlob = new Blob(['test video data'], { type: 'video/webm' });
      const mockUrl = 'https://example.com/video.mp4';
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse({ url: mockUrl })
      );
      
      const result = await interviewService.uploadRecording(mockBlob);
      
      expect(result).toBe(mockUrl);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('handles upload error', async () => {
      const mockBlob = new Blob(['test video data'], { type: 'video/webm' });
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Upload failed', 500)
      );
      
      await expect(interviewService.uploadRecording(mockBlob)).rejects.toThrow('Upload failed');
    });
  });

  describe('getTranscription', () => {
    it('gets transcription successfully', async () => {
      const mockTranscription = {
        text: 'Test transcription',
        confidence: 0.95,
        segments: [
          {
            text: 'Test',
            start: 0,
            end: 1,
            confidence: 0.95,
          },
        ],
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockTranscription)
      );
      
      const result = await interviewService.getTranscription('https://example.com/video.mp4');
      
      expect(result).toEqual(mockTranscription);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('handles transcription error', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Transcription failed', 500)
      );
      
      await expect(interviewService.getTranscription('https://example.com/video.mp4')).rejects.toThrow('Transcription failed');
    });
  });

  describe('getAIAnalysis', () => {
    it('gets AI analysis successfully', async () => {
      const mockAnalysis = {
        sentiment: 'positive',
        topics: ['test', 'interview'],
        keyPoints: ['Point 1', 'Point 2'],
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockAnalysis)
      );
      
      const result = await interviewService.getAIAnalysis('Test transcription');
      
      expect(result).toEqual(mockAnalysis);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('handles AI analysis error', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Analysis failed', 500)
      );
      
      await expect(interviewService.getAIAnalysis('Test transcription')).rejects.toThrow('Analysis failed');
    });
  });
}); 