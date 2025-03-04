import { AIGuidance, Prompt } from '@/types/interview';

interface UserContext {
  previousResponses: string[];
  emotionalTone?: string;
  speakingPace?: string;
  keyTopics?: string[];
  goals?: string[];
  emotionalJourney: Array<{
    timestamp: number;
    tone: string;
    intensity: number;
    topics: string[];
  }>;
  followUpHistory: string[];
}

interface EmotionalAnalysis {
  primaryEmotion: string;
  intensity: number;
  secondaryEmotions: string[];
  triggers: string[];
}

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface FollowUpContext {
  previousAnswer: string;
  questionCategory: string;
  emotionalState: string;
}

interface Feedback {
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
  overallScore: number;
}

interface InterviewSummary {
  keyPoints: string[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  overallAssessment: string;
}

export class AIGuidanceService {
  private userContext: UserContext = {
    previousResponses: [],
    keyTopics: [],
    goals: [],
    emotionalJourney: [],
    followUpHistory: []
  };

  private emotionalKeywords = {
    joy: ['happy', 'excited', 'proud', 'grateful', 'loved', 'wonderful', 'amazing', 'fantastic'],
    sadness: ['sad', 'unhappy', 'depressed', 'down', 'heartbroken', 'grief', 'loss'],
    anger: ['angry', 'furious', 'mad', 'upset', 'frustrated', 'annoyed', 'irritated'],
    fear: ['afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'fearful'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected'],
    trust: ['trust', 'confident', 'secure', 'reliable', 'faithful', 'loyal']
  };

  async analyzeResponse(
    prompt: Prompt,
    transcription: string,
    duration: number
  ): Promise<AIGuidance> {
    // Update user context with new response
    this.userContext.previousResponses.push(transcription);
    
    // Enhanced emotional analysis
    const emotionalAnalysis = this.analyzeEmotionalTone(transcription);
    const speakingPace = this.calculateSpeakingPace(transcription, duration);
    
    // Extract key topics and goals
    const keyTopics = this.extractKeyTopics(transcription);
    const goals = this.inferUserGoals(transcription, prompt);

    // Update emotional journey
    this.updateEmotionalJourney(emotionalAnalysis, keyTopics);

    // Generate dynamic follow-up questions
    const followUpQuestion = this.generateFollowUpQuestion(
      prompt,
      emotionalAnalysis,
      keyTopics,
      goals
    );

    // Generate personalized guidance
    return this.generateGuidance(
      prompt,
      emotionalAnalysis,
      speakingPace,
      keyTopics,
      goals,
      followUpQuestion
    );
  }

  private analyzeEmotionalTone(text: string): EmotionalAnalysis {
    const words = text.toLowerCase().split(' ');
    const emotions: Record<string, number> = {};
    const triggers: string[] = [];

    // Analyze primary emotions
    Object.entries(this.emotionalKeywords).forEach(([emotion, keywords]) => {
      emotions[emotion] = words.filter(word => keywords.includes(word)).length;
    });

    // Find the primary emotion
    const primaryEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Calculate intensity (0-1)
    const totalEmotionalWords = Object.values(emotions).reduce((a, b) => a + b, 0);
    const intensity = Math.min(totalEmotionalWords / 10, 1);

    // Find secondary emotions
    const secondaryEmotions = Object.entries(emotions)
      .filter(([emotion]) => emotion !== primaryEmotion)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([emotion]) => emotion);

    // Extract emotional triggers
    words.forEach((word, index) => {
      if (Object.values(this.emotionalKeywords).flat().includes(word)) {
        const context = words.slice(Math.max(0, index - 2), index + 3).join(' ');
        triggers.push(context);
      }
    });

    return {
      primaryEmotion,
      intensity,
      secondaryEmotions,
      triggers
    };
  }

  private updateEmotionalJourney(
    analysis: EmotionalAnalysis,
    topics: string[]
  ): void {
    this.userContext.emotionalJourney.push({
      timestamp: Date.now(),
      tone: analysis.primaryEmotion,
      intensity: analysis.intensity,
      topics
    });
  }

  private generateFollowUpQuestion(
    prompt: Prompt,
    emotionalAnalysis: EmotionalAnalysis,
    keyTopics: string[],
    goals: string[]
  ): string {
    // Generate context-aware follow-up questions
    if (emotionalAnalysis.intensity > 0.7) {
      return `I notice you're feeling very ${emotionalAnalysis.primaryEmotion} about this. Would you like to tell me more about what triggered these feelings?`;
    }

    if (keyTopics.length > 0) {
      const mainTopic = keyTopics[0];
      return `You mentioned ${mainTopic}. Could you elaborate on how this has influenced your life?`;
    }

    if (goals.includes('family legacy')) {
      return `How do you think your family members would react to hearing this story?`;
    }

    return prompt.followUps[0];
  }

  private calculateSpeakingPace(text: string, duration: number): string {
    const words = text.split(' ').length;
    const wordsPerMinute = (words / duration) * 60;
    
    if (wordsPerMinute > 150) return 'fast';
    if (wordsPerMinute < 100) return 'slow';
    return 'moderate';
  }

  private extractKeyTopics(text: string): string[] {
    // Enhanced keyword extraction with context
    const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i']);
    const words = text.toLowerCase().split(' ');
    const wordFrequency: Record<string, number> = {};
    const wordContext: Record<string, string[]> = {};
    
    words.forEach((word, index) => {
      if (!commonWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        
        // Store context for each word
        if (!wordContext[word]) {
          wordContext[word] = [];
        }
        const context = words.slice(Math.max(0, index - 2), index + 3).join(' ');
        wordContext[word].push(context);
      }
    });

    // Sort by frequency and context relevance
    return Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private inferUserGoals(text: string, prompt: Prompt): string[] {
    const goals: string[] = [];
    
    // Enhanced goal inference with context
    if (text.includes('want to') || text.includes('hope to') || text.includes('plan to')) {
      goals.push('future aspirations');
    }
    if (text.includes('learned') || text.includes('taught me') || text.includes('helped me')) {
      goals.push('personal growth');
    }
    if (text.includes('family') || text.includes('children') || text.includes('grandchildren')) {
      goals.push('family legacy');
    }
    if (text.includes('help others') || text.includes('inspire') || text.includes('share')) {
      goals.push('helping others');
    }
    if (text.includes('remember') || text.includes('memories') || text.includes('nostalgia')) {
      goals.push('preservation');
    }
    if (text.includes('understand') || text.includes('figure out') || text.includes('discover')) {
      goals.push('self-discovery');
    }

    return goals;
  }

  private generateGuidance(
    prompt: Prompt,
    emotionalAnalysis: EmotionalAnalysis,
    speakingPace: string,
    keyTopics: string[],
    goals: string[],
    followUpQuestion: string
  ): AIGuidance {
    let message = '';
    let type: AIGuidance['type'] = 'encouragement';

    // Emotional support based on intensity
    if (emotionalAnalysis.intensity > 0.7) {
      message = `I can sense that this topic is very ${emotionalAnalysis.primaryEmotion} for you. Your feelings are valid, and it's important to share them.`;
      type = 'encouragement';
    }

    // Pace guidance
    if (speakingPace === 'fast') {
      message = "Take your time. There's no rush - your story is important.";
      type = 'suggestion';
    }

    // Topic exploration with emotional context
    if (keyTopics.length > 0) {
      const mainTopic = keyTopics[0];
      message = `I notice you're talking about ${mainTopic} with ${emotionalAnalysis.primaryEmotion} feelings. ${followUpQuestion}`;
      type = 'follow_up';
    }

    // Goal alignment with emotional journey
    if (goals.includes('family legacy')) {
      message = "Your family will treasure these stories. Keep sharing those precious memories.";
      type = 'encouragement';
    }

    return {
      type,
      message,
      timing: 'during',
      context: {
        mood: emotionalAnalysis.primaryEmotion,
        pace: speakingPace,
        depth: keyTopics.length > 0 ? 'detailed' : 'general'
      }
    };
  }

  async getInitialQuestions(): Promise<Question[]> {
    try {
      const response = await fetch('/api/questions/initial');
      
      if (!response.ok) {
        throw new Error('Failed to get questions');
      }
      
      return response.json();
    } catch (error) {
      throw new Error('Failed to get initial questions: ' + (error as Error).message);
    }
  }

  async getFollowUpQuestions(context: FollowUpContext): Promise<Question[]> {
    try {
      const response = await fetch('/api/questions/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get follow-up questions');
      }
      
      return response.json();
    } catch (error) {
      throw new Error('Failed to get follow-up questions: ' + (error as Error).message);
    }
  }

  async analyzeEmotionalState(videoUrl: string): Promise<EmotionalAnalysis> {
    try {
      const response = await fetch('/api/analyze/emotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze emotional state');
      }
      
      return response.json();
    } catch (error) {
      throw new Error('Failed to analyze emotional state: ' + (error as Error).message);
    }
  }

  async getFeedback(videoUrl: string): Promise<Feedback> {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get feedback');
      }
      
      return response.json();
    } catch (error) {
      throw new Error('Failed to get feedback: ' + (error as Error).message);
    }
  }

  async getInterviewSummary(videoUrl: string): Promise<InterviewSummary> {
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get interview summary');
      }
      
      return response.json();
    } catch (error) {
      throw new Error('Failed to get interview summary: ' + (error as Error).message);
    }
  }
} 