import { AIGuidanceService } from '@/services/aiGuidance';
import { mockApiResponse, mockApiError } from '@/__tests__/utils/test-utils';

describe('AIGuidanceService', () => {
  let aiGuidanceService: AIGuidanceService;

  beforeEach(() => {
    aiGuidanceService = new AIGuidanceService();
    jest.clearAllMocks();
  });

  describe('getInitialQuestions', () => {
    it('gets initial questions successfully', async () => {
      const mockQuestions = [
        {
          id: '1',
          text: 'Tell me about yourself',
          category: 'background',
          difficulty: 'easy',
        },
        {
          id: '2',
          text: 'What are your strengths?',
          category: 'skills',
          difficulty: 'medium',
        },
      ];
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockQuestions)
      );
      
      const result = await aiGuidanceService.getInitialQuestions();
      
      expect(result).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('handles error when getting initial questions', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get questions', 500)
      );
      
      await expect(aiGuidanceService.getInitialQuestions()).rejects.toThrow('Failed to get questions');
    });
  });

  describe('getFollowUpQuestions', () => {
    it('gets follow-up questions successfully', async () => {
      const mockContext = {
        previousAnswer: 'I have 5 years of experience in software development',
        questionCategory: 'experience',
        emotionalState: 'confident',
      };
      
      const mockQuestions = [
        {
          id: '3',
          text: 'Can you describe a challenging project you worked on?',
          category: 'experience',
          difficulty: 'medium',
        },
        {
          id: '4',
          text: 'How do you handle tight deadlines?',
          category: 'workstyle',
          difficulty: 'medium',
        },
      ];
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockQuestions)
      );
      
      const result = await aiGuidanceService.getFollowUpQuestions(mockContext);
      
      expect(result).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('handles error when getting follow-up questions', async () => {
      const mockContext = {
        previousAnswer: 'I have 5 years of experience in software development',
        questionCategory: 'experience',
        emotionalState: 'confident',
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get follow-up questions', 500)
      );
      
      await expect(aiGuidanceService.getFollowUpQuestions(mockContext)).rejects.toThrow('Failed to get follow-up questions');
    });
  });

  describe('analyzeEmotionalState', () => {
    it('analyzes emotional state successfully', async () => {
      const mockAnalysis = {
        state: 'confident',
        confidence: 0.85,
        indicators: ['clear voice', 'positive language'],
        suggestions: ['maintain this energy', 'show more enthusiasm'],
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockAnalysis)
      );
      
      const result = await aiGuidanceService.analyzeEmotionalState('test video url');
      
      expect(result).toEqual(mockAnalysis);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('handles error when analyzing emotional state', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to analyze emotional state', 500)
      );
      
      await expect(aiGuidanceService.analyzeEmotionalState('test video url')).rejects.toThrow('Failed to analyze emotional state');
    });
  });

  describe('getFeedback', () => {
    it('gets feedback successfully', async () => {
      const mockFeedback = {
        strengths: ['clear communication', 'technical knowledge'],
        areasForImprovement: ['body language', 'response time'],
        suggestions: ['maintain eye contact', 'be more concise'],
        overallScore: 8.5,
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockFeedback)
      );
      
      const result = await aiGuidanceService.getFeedback('test video url');
      
      expect(result).toEqual(mockFeedback);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('handles error when getting feedback', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get feedback', 500)
      );
      
      await expect(aiGuidanceService.getFeedback('test video url')).rejects.toThrow('Failed to get feedback');
    });
  });

  describe('getInterviewSummary', () => {
    it('gets interview summary successfully', async () => {
      const mockSummary = {
        keyPoints: ['technical skills', 'problem-solving ability'],
        strengths: ['communication', 'experience'],
        areasForImprovement: ['time management', 'technical depth'],
        recommendations: ['practice coding challenges', 'review system design'],
        overallAssessment: 'Strong candidate with room for improvement',
      };
      
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiResponse(mockSummary)
      );
      
      const result = await aiGuidanceService.getInterviewSummary('test video url');
      
      expect(result).toEqual(mockSummary);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('handles error when getting interview summary', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        mockApiError('Failed to get interview summary', 500)
      );
      
      await expect(aiGuidanceService.getInterviewSummary('test video url')).rejects.toThrow('Failed to get interview summary');
    });
  });
}); 