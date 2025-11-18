/**
 * Hacker News Sync API with Parallel AI Processing
 * 
 * This endpoint processes HN top stories with AI analysis in parallel batches
 * for high-quality signal extraction. Focuses on tech releases, frameworks,
 * startup announcements, market shifts, and industry pain points.
 * 
 * Features:
 * - Parallel AI analysis with controlled concurrency
 * - Smart filtering for signal-worthy content
 * - Automatic categorization and scoring
 * - Deduplication and error handling
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  fetchTopStories, 
  fetchHNItems, 
  filterSignalWorthyStories,
  calculateHNScore,
  categorizeHNStory,
  getHNStoryUrl,
  getHNDiscussionUrl
} from '@/lib/hackernews';
import { analyzeProductHuntLaunch } from '@/lib/ai';
import { findOrCreateCompany, findOrCreatePerson } from '@/lib/profile-merger';

export async function POST() {
  try {
    console.log('🔥 Starting Hacker News sync with AI processing...');
    
    // Check AI availability - REQUIRED
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasValidKey = apiKey && apiKey.length > 20 && !apiKey.includes('your_');
    
    if (!hasValidKey) {
      const errorMsg = 'AI processing is REQUIRED but API key is not configured';
      console.error('❌', errorMsg);
      return NextResponse.json({
        success: false,
        error: errorMsg,
        message: 'Please configure ANTHROPIC_API_KEY in .env.local to enable AI processing',
      }, { status: 400 });
    }
    
    console.log('✅ AI configured - processing HN stories with Claude');
    
    // Fetch top stories from HN
    console.log('📡 Fetching top 200 stories from Hacker News...');
    const storyIds = await fetchTopStories(200);
    console.log(`✅ Got ${storyIds.length} story IDs`);
    
    // Fetch story details in parallel
    console.log('📖 Fetching story details...');
    const stories = await fetchHNItems(storyIds);
    console.log(`✅ Fetched ${stories.length} stories`);
    
    // Filter for signal-worthy content
    const signalStories = filterSignalWorthyStories(stories);
    console.log(`🎯 Filtered to ${signalStories.length} signal-worthy stories`);
    
    // Filter out already imported stories
    const newStories = [];
    let skipped = 0;
    
    for (const story of signalStories) {
      const { data: existing } = await supabase
        .from('signals')
        .select('id')
        .eq('hn_story_id', story.id.toString())
        .single();

      if (existing) {
        skipped++;
      } else {
        newStories.push(story);
      }
    }
    
    console.log(`📊 Processing ${newStories.length} new stories (${skipped} already imported)`);
    
    if (newStories.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        skipped,
        total: stories.length,
        filtered: signalStories.length,
        message: 'All signal-worthy stories already imported',
      });
    }

    // Process stories in batches to avoid rate limits
    const startTime = Date.now();
    const BATCH_SIZE = 3; // Small batches to avoid rate limits
    const DELAY_BETWEEN_BATCHES = 2000; // 2 second delay between batches
    
    console.log(`🤖 Processing ${newStories.length} stories in batches of ${BATCH_SIZE} with AI...`);
    
    const results: Array<{
      story: any;
      analysis?: any;
      success: boolean;
      error?: string;
    }> = [];
    
    for (let i = 0; i < newStories.length; i += BATCH_SIZE) {
      const batch = newStories.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(newStories.length / BATCH_SIZE);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} stories)...`);
      
      const batchPromises = batch.map(async (story) => {
        try {
          console.log(`🔍 Analyzing "${story.title}"...`);
          
          // Adapt HN story to PH post format for AI analysis
          const adaptedPost = {
            id: story.id,
            name: story.title,
            tagline: story.title,
            description: story.text || story.title,
            website: getHNStoryUrl(story),
            redirect_url: getHNDiscussionUrl(story),
            votes_count: story.score,
            comments_count: story.descendants || 0,
            created_at: new Date(story.time * 1000).toISOString(),
            topics: [{ name: categorizeHNStory(story) }],
            makers: [{ name: story.by, username: story.by }],
          };
          
          const analysis = await analyzeProductHuntLaunch(adaptedPost);
          return { story, analysis, success: true as const, error: undefined };
        } catch (error) {
          console.error(`❌ AI analysis failed for "${story.title}":`, error);
          return { 
            story, 
            analysis: undefined,
            error: error instanceof Error ? error.message : 'Unknown error', 
            success: false as const
          };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Extract values from settled promises
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch promise rejected:', result.reason);
        }
      }
      
      // Add delay between batches (except for last batch)
      if (i + BATCH_SIZE < newStories.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    const aiProcessingTime = Date.now() - startTime;
    console.log(`🤖 AI processing completed in ${aiProcessingTime}ms (${Math.round(aiProcessingTime / newStories.length)}ms per story avg)`);

    // Process results and save to database
    let imported = 0;
    const errors: string[] = [];
    
    for (const result of results) {
      const { story, analysis, success, error } = result;
      
      if (!success || !analysis) {
        errors.push(`${story.title}: ${error || 'Analysis failed'}`);
        continue;
      }
      
      try {
        // Smart company handling with profile merging
        let companyId = null;
        let companyName = 'Hacker News Community'; // Fallback for HN stories
        
        if (analysis.company && analysis.company.name) {
          // Validate company name is not generic
          if (analysis.company.name.toLowerCase() !== story.title.toLowerCase() &&
              !analysis.company.name.toLowerCase().includes('hacker news')) {
            const company = await findOrCreateCompany({
              name: analysis.company.name,
              description: analysis.company.description,
              website: analysis.company.website || getHNStoryUrl(story),
              tags: analysis.company.tags || [categorizeHNStory(story)],
              social_links: analysis.company.social_links || {},
            });
            
            if (company) {
              companyId = company.id;
              companyName = company.name;
            }
          } else {
            console.log(`🚫 Skipped HN company creation - generic name: ${analysis.company.name}`);
          }
        }

        // Smart people handling with profile merging
        const personIds: string[] = [];
        if (analysis.people && analysis.people.length > 0) {
          for (const person of analysis.people) {
            const personId = await findOrCreatePerson({
              name: person.name,
              title: person.title,
              company_id: companyId || undefined,
              company_name: companyName !== 'Hacker News Community' ? companyName : undefined,
              tags: person.tags || ['developer', 'hacker_news'],
              social_links: person.social_links || {},
            });
            
            if (personId) {
              personIds.push(personId);
            }
          }
        }
        
        // Also create person for HN story author if not already extracted
        if (story.by && !personIds.length) {
          const authorId = await findOrCreatePerson({
            name: story.by,
            title: 'Developer',
            tags: ['developer', 'hacker_news_author'],
            social_links: { hacker_news: story.by },
          });
          
          if (authorId) {
            personIds.push(authorId);
          }
        }

        // Calculate score (combine HN score with AI insights)
        const hnScore = calculateHNScore(story);
        const finalScore = Math.min(Math.round(hnScore + 1), 10); // Slight boost for AI-processed content

        // Create signal with AI-refined content
        const { error: signalError } = await supabase
          .from('signals')
          .insert([{
            headline: analysis.signal.headline,
            summary: analysis.signal.summary,
            source_link: getHNStoryUrl(story),
            why_it_matters: analysis.signal.why_it_matters,
            recommended_action: analysis.signal.recommended_action,
            score: finalScore,
            credibility: 'high',
            signal_type: categorizeHNStory(story),
            tags: analysis.signal.tags || [categorizeHNStory(story)],
            company_id: companyId,
            company_name: companyName,
            company_ids: companyId ? [companyId] : [],
            person_ids: personIds,
            status: 'published',
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            
            // Hacker News enrichment
            hn_story_id: story.id.toString(),
            hn_score: story.score,
            hn_comments: story.descendants || 0,
            hn_author: story.by,
            hn_discussion_url: getHNDiscussionUrl(story),
            hn_category: categorizeHNStory(story),
          }]);

        if (signalError) {
          console.error(`Error creating signal for "${story.title}":`, signalError);
          errors.push(`${story.title}: ${signalError.message}`);
        } else {
          imported++;
          console.log(`✅ Saved "${story.title}" with ${personIds.length} people (score: ${finalScore})`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error saving "${story.title}":`, errorMsg);
        errors.push(`${story.title}: ${errorMsg}`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 HN sync completed in ${totalTime}ms - imported ${imported} signals`);

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: stories.length,
      filtered: signalStories.length,
      processed: newStories.length,
      processingTimeMs: totalTime,
      avgTimePerStory: Math.round(totalTime / newStories.length),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Hacker News sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}