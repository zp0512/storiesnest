import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterviewRecorder from '@/components/interview/InterviewRecorder';
import { MockMediaRecorder, mockApiResponse, mockApiError } from '@/__tests__/utils/test-utils';

// Mock the MediaRecorder
global.MediaRecorder = MockMediaRecorder as any;

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue(new MediaStream()),
  },
  writable: true,
});

describe('InterviewRecorder', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the recorder component', () => {
    render(<InterviewRecorder userId={mockUserId} />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('starts recording when the start button is clicked', async () => {
    render(<InterviewRecorder userId={mockUserId} />);
    const startButton = screen.getByRole('button', { name: /start recording/i });
    
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
  });

  it('stops recording when the stop button is clicked', async () => {
    render(<InterviewRecorder userId={mockUserId} />);
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    // Wait for stop button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    fireEvent.click(stopButton);
    
    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByText(/preview recording/i)).toBeInTheDocument();
    });
  });

  it('shows error message when getUserMedia fails', async () => {
    // Mock getUserMedia to fail
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied')),
      },
      writable: true,
    });
    
    render(<InterviewRecorder userId={mockUserId} />);
    const startButton = screen.getByRole('button', { name: /start recording/i });
    
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    });
  });

  it('shows error message when recording fails', async () => {
    render(<InterviewRecorder userId={mockUserId} />);
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    // Wait for stop button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
    
    // Simulate recording error
    const mockRecorder = new MockMediaRecorder(new MediaStream());
    mockRecorder.simulateError(new ErrorEvent('error', { message: 'Recording failed' }));
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    fireEvent.click(stopButton);
    
    await waitFor(() => {
      expect(screen.getByText(/recording failed/i)).toBeInTheDocument();
    });
  });

  it('handles successful recording upload', async () => {
    // Mock successful API response
    global.fetch = jest.fn().mockImplementation(() => 
      mockApiResponse({ url: 'https://example.com/video.mp4' })
    );
    
    render(<InterviewRecorder userId={mockUserId} />);
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    // Wait for stop button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    fireEvent.click(stopButton);
    
    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByText(/preview recording/i)).toBeInTheDocument();
    });
    
    // Click save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/recording saved successfully/i)).toBeInTheDocument();
    });
  });

  it('handles failed recording upload', async () => {
    // Mock failed API response
    global.fetch = jest.fn().mockImplementation(() => 
      mockApiError('Upload failed', 500)
    );
    
    render(<InterviewRecorder userId={mockUserId} />);
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);
    
    // Wait for stop button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    fireEvent.click(stopButton);
    
    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByText(/preview recording/i)).toBeInTheDocument();
    });
    
    // Click save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });
}); 