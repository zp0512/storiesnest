import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecordingPreview from '@/components/interview/RecordingPreview';
import { mockApiResponse, mockApiError } from '@/__tests__/utils/test-utils';

describe('RecordingPreview', () => {
  const mockVideoUrl = 'blob:test-video-url';
  const mockOnSave = jest.fn();
  const mockOnRetry = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the preview component', () => {
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText(/preview recording/i)).toBeInTheDocument();
    expect(screen.getByRole('video')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('plays the video when the play button is clicked', async () => {
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    const video = screen.getByRole('video') as HTMLVideoElement;
    const playButton = screen.getByRole('button', { name: /play/i });
    
    fireEvent.click(playButton);
    
    expect(video.play).toHaveBeenCalled();
  });

  it('pauses the video when the pause button is clicked', async () => {
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    const video = screen.getByRole('video') as HTMLVideoElement;
    const playButton = screen.getByRole('button', { name: /play/i });
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    
    fireEvent.click(playButton);
    fireEvent.click(pauseButton);
    
    expect(video.pause).toHaveBeenCalled();
  });

  it('calls onSave when the save button is clicked', async () => {
    // Mock successful API response
    global.fetch = jest.fn().mockImplementation(() => 
      mockApiResponse({ url: 'https://example.com/video.mp4' })
    );
    
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('calls onRetry when the retry button is clicked', () => {
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows error message when save fails', async () => {
    // Mock failed API response
    global.fetch = jest.fn().mockImplementation(() => 
      mockApiError('Save failed', 500)
    );
    
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while saving', async () => {
    // Mock delayed API response
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockApiResponse({ url: 'https://example.com/video.mp4' })), 100))
    );
    
    render(
      <RecordingPreview
        videoUrl={mockVideoUrl}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
  });
}); 