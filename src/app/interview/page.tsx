'use client';

import { useState } from 'react';
import InterviewRecorder from '@/components/interview/InterviewRecorder';
import { prompts } from '@/data/prompts';
import { Prompt } from '@/types/interview';

// TODO: Replace with actual user authentication
const MOCK_USER_ID = 'user-123';

export default function InterviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof prompts>('childhood');
  const [recordings, setRecordings] = useState<Array<{
    prompt: Prompt;
    recordingUrl: string;
    thumbnailUrl: string;
    transcription?: string;
    aiSummary?: string;
  }>>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleSegmentComplete = (segment: {
    prompt: Prompt;
    recordingUrl: string;
    thumbnailUrl: string;
    transcription?: string;
    aiSummary?: string;
  }) => {
    setRecordings(prev => [...prev, segment]);
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Guided Interview</h1>
          <p className="mt-2 text-lg text-gray-600">
            Share your story with guided prompts and AI assistance
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Choose a topic
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as keyof typeof prompts)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={isRecording}
          >
            {Object.keys(prompts).map((category) => (
              <option key={category} value={category}>
                {category.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <InterviewRecorder
          initialCategory={selectedCategory}
          onSegmentComplete={handleSegmentComplete}
          userId={MOCK_USER_ID}
        />

        {recordings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Your Recordings</h2>
            <div className="space-y-6">
              {recordings.map((recording, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-48">
                      <img
                        src={recording.thumbnailUrl}
                        alt="Recording thumbnail"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {recording.prompt.question}
                      </h3>
                      {recording.transcription && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Transcription</h4>
                          <p className="text-gray-600 text-sm">{recording.transcription}</p>
                        </div>
                      )}
                      {recording.aiSummary && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">AI Insights</h4>
                          <p className="text-gray-600 text-sm">{recording.aiSummary}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <video
                        src={recording.recordingUrl}
                        controls
                        className="w-48 h-32 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 