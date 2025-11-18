import { NextResponse } from 'next/server';
import { fetchTopStories, fetchHNItems, filterSignalWorthyStories } from '@/lib/hackernews';

export async function GET() {
  try {
    console.log('Testing Hacker News API connection...');
    
    // Fetch top 10 stories for testing
    const storyIds = await fetchTopStories(10);
    console.log(`✅ Fetched ${storyIds.length} story IDs`);
    
    // Fetch story details
    const stories = await fetchHNItems(storyIds);
    console.log(`✅ Fetched ${stories.length} stories`);
    
    // Filter for signal-worthy content
    const signalStories = filterSignalWorthyStories(stories);
    console.log(`✅ Found ${signalStories.length} signal-worthy stories`);
    
    return NextResponse.json({
      success: true,
      totalStories: stories.length,
      signalWorthyStories: signalStories.length,
      sampleStories: signalStories.slice(0, 3).map(story => ({
        id: story.id,
        title: story.title,
        score: story.score,
        comments: story.descendants,
        author: story.by,
        url: story.url,
      })),
    });
  } catch (error) {
    console.error('HN API test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}