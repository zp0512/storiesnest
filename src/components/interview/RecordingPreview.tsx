'use client';

import { useState, useRef, useEffect } from 'react';

interface RecordingPreviewProps {
  videoUrl: string;
  onRetry: () => void;
  onSave: (trimmedBlob: Blob) => void;
  onCancel: () => void;
}

export default function RecordingPreview({
  videoUrl,
  onRetry,
  onSave,
  onCancel
}: RecordingPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setDuration(videoRef.current?.duration || 0);
        setTrimEnd(videoRef.current?.duration || 0);
      });

      videoRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(videoRef.current?.currentTime || 0);
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const startTrimming = () => {
    setIsTrimming(true);
    setTrimStart(currentTime);
  };

  const endTrimming = () => {
    setIsTrimming(false);
    setTrimEnd(currentTime);
  };

  const handleSave = async () => {
    if (!videoRef.current) return;

    // Create a MediaRecorder to capture the trimmed portion
    const stream = videoRef.current.captureStream();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const trimmedBlob = new Blob(chunks, { type: 'video/webm' });
      onSave(trimmedBlob);
    };

    // Set video to trim start
    videoRef.current.currentTime = trimStart;
    await videoRef.current.play();

    // Start recording
    mediaRecorder.start();

    // Stop after trim duration
    setTimeout(() => {
      mediaRecorder.stop();
    }, (trimEnd - trimStart) * 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleTimeUpdate}
              className="flex-1"
            />
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={startTrimming}
            disabled={isTrimming}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Set Start
          </button>
          <button
            onClick={endTrimming}
            disabled={!isTrimming}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Set End
          </button>
        </div>

        {isTrimming && (
          <div className="text-sm text-gray-600">
            Trimming from {formatTime(trimStart)} to {formatTime(currentTime)}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onRetry}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Retry Recording
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Save Recording
          </button>
        </div>
      </div>
    </div>
  );
} 