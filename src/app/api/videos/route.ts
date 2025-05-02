import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// Define the structure of a video item - must match frontend
interface VideoItem {
  id: string;
  title?: string;
  thumbnail_url?: string; // Or video_url if embedding
  item_url: string; // Link to the original post
  platform: 'instagram' | 'tiktok';
  likes?: number;
  views?: number;
}

// Initialize the Apify client
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN || 'YOUR_APIFY_API_TOKEN', // Use environment variable or placeholder
});

// Define Apify Actor IDs
const INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID = 'apify/instagram-hashtag-scraper';

// --- Helper Function to Fetch and Map Instagram Videos ---
async function fetchAndMapInstagramVideos(hashtags: string[], viewThreshold: number = 0, resultsLimit: number = 10): Promise<VideoItem[]> {
    console.log(`Fetching Instagram videos for hashtags: ${hashtags.join(', ')} with view threshold: ${viewThreshold}`);
    const instagramInput = {
        "hashtags": hashtags,
        "resultsLimit": resultsLimit // Limit results per hashtag
    };
    try {
        const instagramRun = await client.actor(INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID).call(instagramInput);
        const { items: instagramItems } = await client.dataset(instagramRun.defaultDatasetId).listItems();
        return mapInstagramData(instagramItems, viewThreshold);
    } catch (error) {
        console.error(`Error fetching Instagram videos for hashtags ${hashtags.join(', ')}:`, error);
        return []; // Return empty array on error for this specific fetch
    }
}

// Helper function to map Instagram data (accepts view threshold)
function mapInstagramData(items: any[], viewThreshold: number): VideoItem[] {
    return items.map((item: any) => ({
        id: item.id || `instagram-${Math.random()}`,
        title: item.caption,
        thumbnail_url: item.displayUrl,
        item_url: item.url,
        platform: 'instagram' as 'instagram',
        likes: item.likesCount,
        views: item.videoViewCount,
    }))
    // Filter for videos with URL, thumbnail, and meeting the view threshold (if threshold > 0)
    .filter(video =>
        video.item_url &&
        video.thumbnail_url &&
        (viewThreshold <= 0 || (video.views && video.views > viewThreshold))
    );
}

// --- Main API Route Handler ---
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || (category !== 'golf' && category !== 'goals')) {
    return NextResponse.json({ error: 'Invalid category specified' }, { status: 400 });
  }

  // Check if the API token placeholder is still being used
  if (!process.env.APIFY_API_TOKEN && client.token === 'YOUR_APIFY_API_TOKEN') {
     console.warn('Apify API token is not configured. Returning empty array.');
     return NextResponse.json({ videos: [] }); // Return empty array if token missing
  }

  try {
    let combinedResults: VideoItem[] = [];

    // Define hashtags for viral and broader search
    const viralHashtags = category === 'golf' ? ['viralgolf'] : ['viralgoals', 'nhlgoals', 'soccergoals', 'futbolgoals'];
    const broadHashtags = category === 'golf' ? ['golf'] : ['goal', 'soccergoal', 'nhlgoal']; // Broader terms
    const viralViewThreshold = 250000;

    // --- Attempt 1: Fetch Viral Instagram Videos (>250k views) ---
    combinedResults = await fetchAndMapInstagramVideos(viralHashtags, viralViewThreshold, 15); // Fetch slightly more initially

    // --- Attempt 2: If no viral videos found, fetch broader, unfiltered videos ---
    if (combinedResults.length === 0) {
        console.log(`No viral videos found for ${category} with >${viralViewThreshold} views. Fetching broader results...`);
        combinedResults = await fetchAndMapInstagramVideos(broadHashtags, 0, 20); // Fetch more, no view filter
    }

    // --- TikTok Fetching (Currently Disabled) ---
    // console.log(`Fetching TikTok videos for category: ${category}`);
    // ... (TikTok fetching logic would go here if re-enabled)

    // Shuffle and limit final results
    combinedResults.sort(() => Math.random() - 0.5);
    const finalVideos = combinedResults.slice(0, 20);

    console.log(`Returning ${finalVideos.length} videos for category: ${category}`);
    return NextResponse.json({ videos: finalVideos });

  } catch (error) {
    // Catch unexpected errors during the overall process (e.g., issues outside Apify calls)
    console.error("Unexpected error in GET handler:", error);
    return NextResponse.json({ videos: [] }); // Return empty array on major error
  }
}

// Mock data function is no longer needed and can be removed

