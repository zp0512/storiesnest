import { StorageService } from '@/services/storage';
import { mockApiResponse, mockApiError } from '@/__tests__/utils/test-utils';

describe('StorageService', () => {
  let storageService: StorageService;
  const mockBaseUrl = 'https://api.example.com';
  const mockApiKey = 'test-api-key';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    storageService = StorageService.getInstance(mockBaseUrl, mockApiKey, mockUserId);
    jest.clearAllMocks();
  });

  describe('uploadVideo', () => {
    it('uploads video successfully', async () => {
      const mockBlob = new Blob(['test video data'], { type: 'video/webm' });
      const mockUrl = 'https://example.com/video.mp4';
      const mockThumbnailUrl = 'https://example.com/thumbnail.jpg';
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse({ url: mockUrl, thumbnailUrl: mockThumbnailUrl })
      );
      
      const result = await storageService.uploadVideo(mockBlob);
      
      expect(result).toEqual({
        url: mockUrl,
        thumbnailUrl: mockThumbnailUrl,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/upload`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
          body: expect.any(FormData),
        })
      );
    });

    it('handles upload error', async () => {
      const mockBlob = new Blob(['test video data'], { type: 'video/webm' });
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Upload failed', 500)
      );
      
      await expect(storageService.uploadVideo(mockBlob)).rejects.toThrow('Upload failed');
    });
  });

  describe('getSignedUrl', () => {
    it('gets signed URL successfully', async () => {
      const mockSignedUrl = 'https://example.com/video.mp4?signature=abc123';
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse({ signedUrl: mockSignedUrl })
      );
      
      const result = await storageService.getSignedUrl('video.mp4');
      
      expect(result).toBe(mockSignedUrl);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/signed-url/video.mp4`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when getting signed URL', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get signed URL', 500)
      );
      
      await expect(storageService.getSignedUrl('video.mp4')).rejects.toThrow('Failed to get signed URL');
    });
  });

  describe('deleteVideo', () => {
    it('deletes video successfully', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse({ success: true })
      );
      
      await storageService.deleteVideo('video.mp4');
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/videos/video.mp4`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when deleting video', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to delete video', 500)
      );
      
      await expect(storageService.deleteVideo('video.mp4')).rejects.toThrow('Failed to delete video');
    });
  });

  describe('listVideos', () => {
    it('lists videos successfully', async () => {
      const mockVideos = [
        {
          key: 'video1.mp4',
          url: 'https://example.com/video1.mp4',
          thumbnailUrl: 'https://example.com/thumbnail1.jpg',
          createdAt: '2024-03-04T00:00:00Z',
        },
        {
          key: 'video2.mp4',
          url: 'https://example.com/video2.mp4',
          thumbnailUrl: 'https://example.com/thumbnail2.jpg',
          createdAt: '2024-03-04T01:00:00Z',
        },
      ];
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockVideos)
      );
      
      const result = await storageService.listVideos();
      
      expect(result).toEqual(mockVideos);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/videos`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when listing videos', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to list videos', 500)
      );
      
      await expect(storageService.listVideos()).rejects.toThrow('Failed to list videos');
    });
  });

  describe('getVideoMetadata', () => {
    it('gets video metadata successfully', async () => {
      const mockMetadata = {
        size: 1024 * 1024, // 1MB
        duration: 120, // 2 minutes
        format: 'video/webm',
        resolution: '1920x1080',
        createdAt: '2024-03-04T00:00:00Z',
        updatedAt: '2024-03-04T00:00:00Z',
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockMetadata)
      );
      
      const result = await storageService.getVideoMetadata('video.mp4');
      
      expect(result).toEqual(mockMetadata);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/videos/video.mp4/metadata`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
          },
        })
      );
    });

    it('handles error when getting video metadata', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get video metadata', 500)
      );
      
      await expect(storageService.getVideoMetadata('video.mp4')).rejects.toThrow('Failed to get video metadata');
    });
  });
}); 