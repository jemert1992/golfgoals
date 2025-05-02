"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import SearchFilter from '@/components/SearchFilter';
import ResultsDisplay from '@/components/ResultsDisplay';

// Define the structure of a video item based on expected API response
// Keep this consistent with ResultsDisplay.tsx
interface VideoItem {
  id: string;
  title?: string;
  thumbnail_url?: string;
  item_url: string;
  platform: 'instagram' | 'tiktok';
  likes?: number;
  views?: number;
}

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  const handleSearch = async (category: string) => {
    setIsLoading(true);
    setError(null);
    setVideos([]); // Clear previous results
    setCurrentCategory(category);

    try {
      // Call the backend API route
      const response = await fetch(`/api/videos?category=${category}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch videos');
      }
      const data = await response.json();
      // Ensure the data structure matches VideoItem[]
      if (Array.isArray(data.videos)) {
          setVideos(data.videos);
      } else {
          console.error("API response is not an array:", data);
          throw new Error('Received invalid data format from server');
      }

      // --- Mock Data Removed - Now using API call ---
      // await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      // const mockData: VideoItem[] = category === 'golf' ? [
      //   {
      //     id: 'golf1',
      //     title: 'Amazing Golf Shot!',
      //     thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Golf+Video+1',
      //     item_url: '#',
      //     platform: 'tiktok',
      //   },
      //   {
      //     id: 'golf2',
      //     title: 'Golf Swing Analysis',
      //     thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Golf+Video+2',
      //     item_url: '#',
      //     platform: 'instagram',
      //   }
      // ] : [
      //   {
      //     id: 'goal1',
      //     title: 'Incredible Soccer Goal!',
      //     thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Goal+Video+1',
      //     item_url: '#',
      //     platform: 'instagram',
      //   },
      //   {
      //     id: 'goal2',
      //     title: 'Last Minute NHL Winner',
      //     thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Goal+Video+2',
      //     item_url: '#',
      //     platform: 'tiktok',
      //   },
      //    {
      //     id: 'goal3',
      //     title: 'Top Corner Free Kick',
      //     thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Goal+Video+3',
      //     item_url: '#',
      //     platform: 'tiktok',
      //   }
      // ];
      // setVideos(mockData);
      // --- End Mock Data ---

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <SearchFilter onSearch={handleSearch} isLoading={isLoading} />
      <div className="flex-grow">
        <ResultsDisplay videos={videos} isLoading={isLoading} error={error} />
      </div>
      <footer className="bg-gray-700 text-white text-center p-3 text-sm">
        Disclaimer: This site links to content hosted on third-party platforms (Instagram, TikTok). All content belongs to its respective owners.
      </footer>
    </main>
  );
}

