'use client';

import { useState, useRef, useEffect } from 'react';
import { Prompt, InterviewSession, AIGuidance } from '@/types/interview';
import { prompts } from '@/data/prompts';
import { AIGuidanceService } from '@/services/aiGuidance';
import { StorageService } from '@/services/storage';
import { TranscriptionService } from '@/services/transcription';
import RecordingPreview from './RecordingPreview';

interface InterviewRecorderProps {
  initialCategory?: keyof typeof prompts;
  onSegmentComplete?: (segment: { 
    prompt: Prompt; 
    recordingUrl: string;
    thumbnailUrl: string;
    transcription?: string;
    aiSummary?: string;
  }) => void;
  userId: string;
}

export default function InterviewRecorder({ 
  initialCategory = 'childhood',
  onSegmentComplete,
  userId
}: InterviewRecorderProps) {
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [aiGuidance, setAiGuidance] = useState<AIGuidance | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const aiServiceRef = useRef(new AIGuidanceService());
  const storageServiceRef = useRef(StorageService.getInstance(
    process.env.NEXT_PUBLIC_STORAGE_API_URL!,
    process.env.NEXT_PUBLIC_STORAGE_API_KEY!,
    userId
  ));
  const transcriptionServiceRef = useRef(TranscriptionService.getInstance(
    process.env.NEXT_PUBLIC_TRANSCRIPTION_API_URL!,
    process.env.NEXT_PUBLIC_TRANSCRIPTION_API_KEY!
  ));
  
  useEffect(() => {
    if (prompts[initialCategory]?.length > 0) {
      setCurrentPrompt(prompts[initialCategory][0]);
    }
  }, [initialCategory]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordingBlob(blob);
        setShowPreview(true);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start recording timer
      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Clean up timer on stop
      mediaRecorder.addEventListener('stop', () => {
        clearInterval(timerInterval);
        setRecordingTime(0);
      });

    } catch (error) {
      setError('Failed to access camera or microphone. Please check your permissions.');
      console.error('Media access error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePreviewSave = async (trimmedBlob: Blob) => {
    try {
      setUploadProgress(0);
      const { url, thumbnailUrl } = await storageServiceRef.current.uploadVideo(trimmedBlob);

      // Get transcription
      const transcription = await transcriptionServiceRef.current.transcribeVideo(url);

      // Get AI analysis
      const aiSummary = await aiServiceRef.current.analyzeResponse(
        currentPrompt!,
        transcription.text,
        recordingTime
      );

      if (currentPrompt && onSegmentComplete) {
        onSegmentComplete({
          prompt: currentPrompt,
          recordingUrl: url,
          thumbnailUrl,
          transcription: transcription.text,
          aiSummary: aiSummary.message
        });
      }
    } catch (error) {
      setError('Failed to upload recording. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploadProgress(null);
      setShowPreview(false);
      setRecordingBlob(null);
    }
  };

  const handlePreviewRetry = () => {
    setShowPreview(false);
    setRecordingBlob(null);
  };

  const handlePreviewCancel = () => {
    setShowPreview(false);
    setRecordingBlob(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showPreview && recordingBlob) {
    return (
      <RecordingPreview
        videoUrl={URL.createObjectURL(recordingBlob)}
        onRetry={handlePreviewRetry}
        onSave={handlePreviewSave}
        onCancel={handlePreviewCancel}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {currentPrompt?.question || 'Loading prompt...'}
        </h2>
        {currentPrompt?.followUps && (
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Follow-up questions to consider:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {currentPrompt.followUps.map((followUp, index) => (
                <li key={index}>{followUp}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
        {uploadProgress !== null && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white mt-2 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            disabled={uploadProgress !== null}
          >
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            disabled={uploadProgress !== null}
          >
            <span>Stop Recording</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {aiGuidance && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">AI</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-blue-800">{aiGuidance.message}</p>
              {aiGuidance.context && (
                <div className="mt-2 text-sm text-blue-600">
                  <p>Mood: {aiGuidance.context.mood}</p>
                  <p>Pace: {aiGuidance.context.pace}</p>
                  <p>Depth: {aiGuidance.context.depth}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 