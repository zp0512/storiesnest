export type StoryStatus = 'draft' | 'recorded' | 'processing' | 'ready';

export interface Story {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  recordedAt: Date;
  duration: number; // in seconds
  status: StoryStatus;
  tags: string[];
  category: string;
  videoUrl?: string;
  transcriptUrl?: string;
  familyMemberId: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  stories: Story[];
}

export interface StoryCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  storyIds: string[];
  coverImageUrl?: string;
} 