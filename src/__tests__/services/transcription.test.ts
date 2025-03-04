import { TranscriptionService } from '@/services/transcription';
import { mockApiResponse, mockApiError } from '@/__tests__/utils/test-utils';

describe('TranscriptionService', () => {
  let transcriptionService: TranscriptionService;
  const mockBaseUrl = 'https://api.example.com';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    transcriptionService = TranscriptionService.getInstance(mockBaseUrl, mockApiKey);
    jest.clearAllMocks();
  });

  describe('transcribeVideo', () => {
    it('transcribes video successfully', async () => {
      const mockTranscription = {
        text: 'This is a test transcription.',
        confidence: 0.95,
        segments: [
          {
            text: 'This is a test',
            start: 0,
            end: 2,
            confidence: 0.95,
          },
          {
            text: 'transcription.',
            start: 2,
            end: 4,
            confidence: 0.95,
          },
        ],
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockTranscription)
      );
      
      const result = await transcriptionService.transcribeVideo('https://example.com/video.mp4');
      
      expect(result).toEqual(mockTranscription);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/transcribe`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        })
      );
    });

    it('handles transcription error', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Transcription failed', 500)
      );
      
      await expect(transcriptionService.transcribeVideo('https://example.com/video.mp4')).rejects.toThrow('Transcription failed');
    });
  });

  describe('getTranscriptionStatus', () => {
    it('gets transcription status successfully', async () => {
      const mockStatus = {
        status: 'completed',
        progress: 100,
        error: null,
        result: {
          text: 'This is a test transcription.',
          confidence: 0.95,
        },
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockStatus)
      );
      
      const result = await transcriptionService.getTranscriptionStatus('transcription-id');
      
      expect(result).toEqual(mockStatus);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/transcribe/transcription-id/status`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when getting transcription status', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get status', 500)
      );
      
      await expect(transcriptionService.getTranscriptionStatus('transcription-id')).rejects.toThrow('Failed to get status');
    });
  });

  describe('getTranscriptionHistory', () => {
    it('gets transcription history successfully', async () => {
      const mockHistory = [
        {
          id: '1',
          videoUrl: 'https://example.com/video1.mp4',
          text: 'First transcription',
          confidence: 0.95,
          createdAt: '2024-03-04T00:00:00Z',
        },
        {
          id: '2',
          videoUrl: 'https://example.com/video2.mp4',
          text: 'Second transcription',
          confidence: 0.92,
          createdAt: '2024-03-04T01:00:00Z',
        },
      ];
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockHistory)
      );
      
      const result = await transcriptionService.getTranscriptionHistory();
      
      expect(result).toEqual(mockHistory);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/transcribe/history`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when getting transcription history', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get history', 500)
      );
      
      await expect(transcriptionService.getTranscriptionHistory()).rejects.toThrow('Failed to get history');
    });
  });

  describe('deleteTranscription', () => {
    it('deletes transcription successfully', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse({ success: true })
      );
      
      await transcriptionService.deleteTranscription('transcription-id');
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/transcribe/transcription-id`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when deleting transcription', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to delete transcription', 500)
      );
      
      await expect(transcriptionService.deleteTranscription('transcription-id')).rejects.toThrow('Failed to delete transcription');
    });
  });

  describe('searchTranscriptions', () => {
    it('searches transcriptions successfully', async () => {
      const mockResults = [
        {
          id: '1',
          videoUrl: 'https://example.com/video1.mp4',
          text: 'First transcription with test',
          confidence: 0.95,
          createdAt: '2024-03-04T00:00:00Z',
        },
        {
          id: '2',
          videoUrl: 'https://example.com/video2.mp4',
          text: 'Second transcription with test',
          confidence: 0.92,
          createdAt: '2024-03-04T01:00:00Z',
        },
      ];
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockResults)
      );
      
      const result = await transcriptionService.searchTranscriptions('test');
      
      expect(result).toEqual(mockResults);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/transcribe/search?q=test`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when searching transcriptions', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to search transcriptions', 500)
      );
      
      await expect(transcriptionService.searchTranscriptions('test')).rejects.toThrow('Failed to search transcriptions');
    });
  });
}); 