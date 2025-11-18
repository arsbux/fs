import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  scrapeRedditSignals,
  generateRedditHeadline,
  generateRedditSummary,
  generateWhyItMatters,
  generateRecommendedAction,
  extractRedditTags,
  type RedditPost,
} from '@/lib/reddit';

// Calculate signal score
function calculateScore(post: RedditPost): number {
  let score = 5;
  
  if (post.score > 100) score += 2;
  if (post.score > 500) score += 2;
  if (post.num_comments > 50) score += 2;
  if (post.num_comments > 100) score += 1;
  
  if (post.signal_type === 'pain_point') score += 2;
  if (post.signal_type === 'unmet_need') score += 2;
  if (post.signal_type === 'solution_request') score += 1;
  if (post.signal_type === 'shutdown') score += 3;
  if (post.signal_type === 'pivot') score += 2;
  
  return Math.min(Math.max(score, 1), 10);
}

export async function POST() {
  try {
    console.log('🚀 Starting Reddit sync...');
    
    // Scrape Reddit posts
    const posts = await scrapeRedditSignals();
    console.log(`📊 Found ${posts.length} high-signal posts`);
    
    let created = 0;
    let skipped = 0;
    
    for (const post of posts) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('signals')
        .select('id')
        .eq('source_link', post.url)
        .single();
      
      if (existing) {
        skipped++;
        continue;
      }
      
      // Create signal
      const { error } = await supabase.from('signals').insert([{
        headline: generateRedditHeadline(post),
        summary: generateRedditSummary(post),
        source_link: post.url,
        why_it_matters: generateWhyItMatters(post),
        recommended_action: generateRecommendedAction(post),
        score: calculateScore(post),
        credibility: post.score > 100 ? 'high' : post.score > 50 ? 'medium' : 'low',
        signal_type: 'community',
        tags: extractRedditTags(post),
        status: 'published',
        published_at: new Date(post.created_utc * 1000).toISOString(),
        created_at: new Date().toISOString(),
        
        // Reddit-specific metadata
        reddit_post_id: post.id,
        reddit_subreddit: post.subreddit,
        reddit_author: post.author,
        reddit_score: post.score,
        reddit_comments: post.num_comments,
      }]);
      
      if (error) {
        console.error(`Error creating signal for ${post.id}:`, error);
      } else {
        created++;
        console.log(`✅ Created: ${post.title.substring(0, 50)}...`);
      }
    }
    
    console.log(`🎉 Reddit sync complete: ${created} created, ${skipped} skipped`);
    
    return NextResponse.json({
      success: true,
      postsFound: posts.length,
      signalsCreated: created,
      signalsSkipped: skipped,
    });
  } catch (error) {
    console.error('❌ Reddit sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Reddit signals' },
      { status: 500 }
    );
  }
}
