'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StoryCard from '@/components/dashboard/StoryCard';
import { Story } from '@/types/story';

// Mock data for development
const mockStories: Story[] = [
  {
    id: '1',
    title: 'My First Job',
    description: 'The story of how I started my career and the lessons I learned along the way.',
    recordedAt: new Date('2024-03-15'),
    duration: 485, // 8:05
    status: 'ready',
    tags: ['Career', 'Life Lessons'],
    category: 'Professional Life',
    familyMemberId: 'user1',
  },
  {
    id: '2',
    title: 'Growing Up in the 60s',
    description: 'Memories of childhood, family traditions, and how different life was back then.',
    recordedAt: new Date('2024-03-14'),
    duration: 723, // 12:03
    status: 'processing',
    tags: ['Childhood', 'Family', 'History'],
    category: 'Memories',
    familyMemberId: 'user2',
  },
  {
    id: '3',
    title: 'Meeting Your Grandmother',
    thumbnailUrl: '/story-thumbnails/grandparents.jpg',
    description: 'The beautiful story of how I met your grandmother and our early days together.',
    recordedAt: new Date('2024-03-13'),
    duration: 845, // 14:05
    status: 'ready',
    tags: ['Love', 'Family'],
    category: 'Relationships',
    familyMemberId: 'user1',
  },
];

const categories = ['All Stories', 'Memories', 'Professional Life', 'Relationships', 'Life Lessons'];

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = mockStories.filter(story => {
    const matchesCategory = selectedCategory === 'All Stories' || story.category === selectedCategory;
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Your Stories</h1>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-10 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onClick={(story) => {
                // TODO: Navigate to story detail page
                console.log('Navigate to story:', story.id);
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-300">No stories found</h3>
            <p className="mt-1 text-gray-400">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start by recording your first story'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 