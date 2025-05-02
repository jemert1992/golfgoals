import React from 'react';

// Define the structure of a video item based on expected API response
interface VideoItem {
  id: string;
  title?: string;
  thumbnail_url?: string; // Or video_url if embedding
  item_url: string; // Link to the original post
  platform: 'instagram' | 'tiktok';
  likes?: number;
  views?: number;
}

interface ResultsDisplayProps {
  videos: VideoItem[];
  isLoading: boolean;
  error: string | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ videos, isLoading, error }) => {
  if (isLoading) {
    return <div className="text-center p-10">Loading videos...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error fetching videos: {error}</div>;
  }

  if (videos.length === 0) {
    return <div className="text-center p-10">No videos found. Try a different search.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {videos.map((video) => (
        <div key={video.id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
          {video.thumbnail_url && (
            <a href={video.item_url} target="_blank" rel="noopener noreferrer">
              <img src={video.thumbnail_url} alt={video.title || 'Video thumbnail'} className="w-full h-48 object-cover" />
            </a>
          )}
          <div className="p-4">
            {video.title && <p className="text-sm text-gray-700 mb-2 truncate">{video.title}</p>}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>{video.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</span>
              {/* Display likes/views if available */}
              {/* {video.views && <span>Views: {video.views}</span>} */}
              {/* {video.likes && <span>Likes: {video.likes}</span>} */}
            </div>
            <a
              href={video.item_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
            >
              View Original Post
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsDisplay;

