import { Prompt, PromptCategory } from '@/types/interview';

export const prompts: Record<PromptCategory, Prompt[]> = {
  childhood: [
    {
      id: 'childhood-1',
      question: 'What is your earliest childhood memory? Can you describe it in detail?',
      category: 'childhood',
      followUps: [
        'How old were you when this happened?',
        'Who else was present in this memory?',
        'Why do you think this particular memory has stayed with you?'
      ],
      context: 'Early memories often reveal what we value and what has shaped us.'
    },
    {
      id: 'childhood-2',
      question: 'Tell me about the house or neighborhood where you grew up.',
      category: 'childhood',
      followUps: [
        'What was your favorite spot in or around your home?',
        'Who were your neighbors?',
        'What games did you play in the neighborhood?'
      ]
    }
  ],
  career: [
    {
      id: 'career-1',
      question: 'What was your first job? What lessons did you learn from it?',
      category: 'career',
      followUps: [
        'How did you get this job?',
        'Who was your first boss?',
        'What was the most challenging part?'
      ]
    }
  ],
  relationships: [
    {
      id: 'relationships-1',
      question: 'How did you meet your spouse/significant other?',
      category: 'relationships',
      followUps: [
        'What was your first impression?',
        'When did you know they were special?',
        'What made you decide to commit to this relationship?'
      ]
    }
  ],
  life_lessons: [
    {
      id: 'life-lessons-1',
      question: 'What is the most important life lesson you\'ve learned?',
      category: 'life_lessons',
      followUps: [
        'How did you learn this lesson?',
        'How has it influenced your decisions?',
        'What advice would you give others about this?'
      ]
    }
  ],
  historical_events: [
    {
      id: 'historical-1',
      question: 'What major historical event had the biggest impact on your life?',
      category: 'historical_events',
      followUps: [
        'Where were you when this happened?',
        'How did it affect your daily life?',
        'How did it change your perspective?'
      ]
    }
  ],
  family_traditions: [
    {
      id: 'traditions-1',
      question: 'What family traditions were most important in your household growing up?',
      category: 'family_traditions',
      followUps: [
        'Who started these traditions?',
        'How have they evolved over time?',
        'Which traditions have you passed on to the next generation?'
      ]
    }
  ],
  personal_values: [
    {
      id: 'values-1',
      question: 'What values or principles have guided your life decisions?',
      category: 'personal_values',
      followUps: [
        'Where did these values come from?',
        'How have they been tested?',
        'How have you maintained them in difficult times?'
      ]
    }
  ],
  dreams_aspirations: [
    {
      id: 'dreams-1',
      question: 'What dreams or goals did you have when you were younger?',
      category: 'dreams_aspirations',
      followUps: [
        'How have these dreams evolved?',
        'Which ones did you achieve?',
        'What new dreams have taken their place?'
      ]
    }
  ]
}; 