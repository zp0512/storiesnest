'use client';

import { Story } from '@/types/story';
import Image from 'next/image';
import { formatDuration } from '@/utils/time';

interface StoryCardProps {
  story: Story;
  onClick?: (story: Story) => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const handleClick = () => {
    if (onClick) onClick(story);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        {story.thumbnailUrl ? (
          <Image
            src={story.thumbnailUrl}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-white/30" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium">
          {formatDuration(story.duration)}
        </div>

        {/* Status indicator */}
        {story.status !== 'ready' && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 text-xs font-medium flex items-center gap-2">
            {story.status === 'processing' && (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400">Processing</span>
              </>
            )}
            {story.status === 'draft' && (
              <>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400">Draft</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
          {story.title}
        </h3>
        {story.description && (
          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
            {story.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{new Date(story.recordedAt).toLocaleDateString()}</span>
          {story.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                {story.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 rounded-full bg-gray-800 text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {story.tags.length > 2 && (
                  <span className="text-xs">+{story.tags.length - 2}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 