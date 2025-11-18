import { NextResponse } from 'next/server';
import { fetchTodaysPosts } from '@/lib/producthunt';

export async function GET() {
  try {
    const posts = await fetchTodaysPosts();
    
    return NextResponse.json({
      success: true,
      count: posts.length,
      posts: posts.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        votes: p.votes_count,
        comments: p.comments_count,
        url: p.redirect_url,
        makers: p.makers.map(m => ({
          name: m.name,
          twitter: m.twitter_username,
        })),
        topics: p.topics.map(t => t.name),
      })),
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}
