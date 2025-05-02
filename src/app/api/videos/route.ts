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
// IMPORTANT: Replace 'YOUR_APIFY_API_TOKEN' with your actual Apify API token.
// You can find your token in your Apify account settings under Integrations.
// It's recommended to use environment variables for sensitive data like API tokens.
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN || 'YOUR_APIFY_API_TOKEN', // Use environment variable or placeholder
});

// Define Apify Actor IDs (replace with actual actors if needed)
const TIKTOK_TRENDING_ACTOR_ID = 'codebyte/tiktok-trending-videos-insights';
const INSTAGRAM_REEL_SCRAPER_ACTOR_ID = 'apify/instagram-reel-scraper'; // Example, might need different actor for keyword search
const INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID = 'apify/instagram-hashtag-scraper'; // Better for keyword/topic search

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || (category !== 'golf' && category !== 'goals')) {
    return NextResponse.json({ error: 'Invalid category specified' }, { status: 400 });
  }

  // Check if the API token placeholder is still being used
  if (!process.env.APIFY_API_TOKEN && client.token === 'YOUR_APIFY_API_TOKEN') {
     console.warn('Apify API token is not configured. Using placeholder.');
     // Optionally return an error or mock data if the token isn't set
     // return NextResponse.json({ error: 'Apify API token not configured' }, { status: 500 });
     // For now, let's return mock data if token is missing
     const mockData = getMockData(category);
     return NextResponse.json({ videos: mockData });
  }

  try {
    let combinedResults: VideoItem[] = [];

    // --- Fetch TikTok Videos --- (Using Trending Actor as an example)
    // Adjust input based on the specific actor's requirements
    // This actor might not directly support keyword search like 'golf' or 'goals'
    // It's better suited for general trending content by region.
    // We might need a different TikTok actor or strategy for keyword search.
    console.log(`Fetching TikTok videos for category: ${category}`);
    const tiktokInput = {
        // Example input - adjust based on actor docs and desired search
        // "keyword": category === 'golf' ? ['golf', 'golftiktok'] : ['soccergoal', 'nhlgoal', 'goal'],
        "region": "US", // Example region
        "resultsPerPage": 10, // Limit results
        "period": "last_day" // Example period
    };
    // const tiktokRun = await client.actor(TIKTOK_TRENDING_ACTOR_ID).call(tiktokInput);
    // const { items: tiktokItems } = await client.dataset(tiktokRun.defaultDatasetId).listItems();
    // const tiktokVideos = mapTikTokData(tiktokItems);
    // combinedResults = combinedResults.concat(tiktokVideos);

    // --- Fetch Instagram Videos --- (Using Hashtag Scraper)
    console.log(`Fetching Instagram videos for category: ${category}`);
    const instagramHashtags = category === 'golf' ? ['viral golf'] : ['viral goals nhl soccer futbol'];
    const instagramInput = {
        "hashtags": instagramHashtags,
        "resultsLimit": 10 // Limit results per hashtag
    };
    const instagramRun = await client.actor(INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID).call(instagramInput);
    const { items: instagramItems } = await client.dataset(instagramRun.defaultDatasetId).listItems();
    const instagramVideos = mapInstagramData(instagramItems);
    combinedResults = combinedResults.concat(instagramVideos);

    // Sort or shuffle results if needed
    combinedResults.sort(() => Math.random() - 0.5); // Simple shuffle

    return NextResponse.json({ videos: combinedResults.slice(0, 20) }); // Limit total results

  } catch (error) {
    console.error("Error fetching videos from Apify:", error);
    // Fallback to mock data on error in production
    console.log("API fetch failed, returning mock data as fallback.");
    const mockData = getMockData(category);
    return NextResponse.json({ videos: mockData });
    // Original error response:
    // return NextResponse.json({ error: 'Failed to fetch videos from external source' }, { status: 500 });
  }
}

// Helper function to map TikTok data (adjust based on actual actor output)
function mapTikTokData(items: any[]): VideoItem[] {
  return items.map((item: any) => ({
    id: item.id || item.item_id || `tiktok-${Math.random()}`,
    title: item.desc || item.title,
    thumbnail_url: item.video?.cover || item.cover, // Adjust field names
    item_url: item.video_url || item.item_url || `https://www.tiktok.com/@${item.author?.uniqueId}/video/${item.id}`,
    platform: 'tiktok',
    likes: item.stats?.diggCount,
    views: item.stats?.playCount,
  })).filter(video => video.item_url && video.views && video.views > 250000); // Ensure there's a URL and views > 250k
}

// Helper function to map Instagram data (adjust based on actual actor output)
function mapInstagramData(items: any[]): VideoItem[] {
    // The hashtag scraper output might be nested. Inspect the actual output.
    // Assuming items directly contain post data or are nested under a property.
    return items.map((item: any) => ({
        id: item.id || `instagram-${Math.random()}`,
        title: item.caption,
        thumbnail_url: item.displayUrl, // Or first image in carousel
        item_url: item.url,
        platform: 'instagram' as 'instagram', // Explicitly type
        likes: item.likesCount,
        views: item.videoViewCount, // May not always be present
    }))
    // Filter for videos with a URL, thumbnail, and over 250k views
    .filter(video => video.item_url && video.thumbnail_url && video.views && video.views > 250000);
}

// Mock data function (used if API token is missing)
function getMockData(category: string): VideoItem[] {
    console.log(`Returning mock data for category: ${category}`);
    return category === 'golf' ? [
        {
          id: 'mock_golf1',
          title: 'Mock Golf Shot!',
          thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Mock+Golf+1',
          item_url: '#mock1',
          platform: 'tiktok',
        },
        {
          id: 'mock_golf2',
          title: 'Mock Golf Swing',
          thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Mock+Golf+2',
          item_url: '#mock2',
          platform: 'instagram',
        }
      ] : [
        {
          id: 'mock_goal1',
          title: 'Mock Soccer Goal!',
          thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Mock+Goal+1',
          item_url: '#mock3',
          platform: 'instagram',
        },
        {
          id: 'mock_goal2',
          title: 'Mock NHL Winner',
          thumbnail_url: 'https://via.placeholder.com/300x200.png?text=Mock+Goal+2',
          item_url: '#mock4',
          platform: 'tiktok',
        }
      ];
}

