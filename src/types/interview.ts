export type PromptCategory = 
  | 'childhood'
  | 'career'
  | 'relationships'
  | 'life_lessons'
  | 'historical_events'
  | 'family_traditions'
  | 'personal_values'
  | 'dreams_aspirations';

export interface Prompt {
  id: string;
  question: string;
  category: PromptCategory;
  followUps: string[];
  context?: string;
}

export interface InterviewSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  currentPromptId?: string;
  recordingStatus: 'preparing' | 'recording' | 'paused' | 'completed';
  segments: InterviewSegment[];
}

export interface InterviewSegment {
  id: string;
  promptId: string;
  recordingUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  transcription?: string;
  aiSummary?: string;
  startedAt: Date;
  endedAt: Date;
}

export interface AIGuidance {
  type: 'encouragement' | 'follow_up' | 'suggestion' | 'transition';
  message: string;
  timing: 'before' | 'during' | 'after';
  context?: {
    mood?: string;
    pace?: string;
    depth?: string;
  };
} 