// Hacker News API integration for signal detection
export interface HNItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number; // comment count
  type: 'story' | 'comment' | 'job' | 'poll';
  kids?: number[]; // comment IDs
}

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

/**
 * Fetch top stories from Hacker News
 */
export async function fetchTopStories(limit = 200): Promise<number[]> {
  try {
    const response = await fetch(`${HN_API_BASE}/topstories.json`);
    if (!response.ok) {
      throw new Error(`HN API error: ${response.status}`);
    }
    const storyIds = await response.json();
    return storyIds.slice(0, limit);
  } catch (error) {
    console.error('Error fetching HN top stories:', error);
    throw error;
  }
}

/**
 * Fetch a single item from Hacker News
 */
export async function fetchHNItem(id: number): Promise<HNItem | null> {
  try {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
    if (!response.ok) {
      throw new Error(`HN API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching HN item ${id}:`, error);
    return null;
  }
}

/**
 * Fetch multiple items in parallel with rate limiting
 */
export async function fetchHNItems(ids: number[]): Promise<HNItem[]> {
  const BATCH_SIZE = 10;
  const items: HNItem[] = [];
  
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(id => fetchHNItem(id));
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        items.push(result.value);
      }
    }
    
    // Small delay between batches to be respectful
    if (i + BATCH_SIZE < ids.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return items;
}

/**
 * Filter stories for signal-worthy content
 */
export function filterSignalWorthyStories(stories: HNItem[]): HNItem[] {
  return stories.filter(story => {
    // Only process stories (not comments, jobs, polls)
    if (story.type !== 'story') return false;
    
    // Must have a title
    if (!story.title) return false;
    
    // Minimum engagement threshold
    if (story.score < 50) return false;
    
    // Check for signal-worthy keywords in title
    const title = story.title.toLowerCase();
    const signalKeywords = [
      // Tech releases
      'release', 'launched', 'announcing', 'introduces', 'unveils',
      'open source', 'github', 'version', 'v2', 'v3', 'beta',
      
      // Frameworks/libraries
      'framework', 'library', 'tool', 'api', 'sdk', 'platform',
      'react', 'vue', 'angular', 'node', 'python', 'rust', 'go',
      
      // YC/Startup announcements
      'yc', 'y combinator', 'startup', 'funding', 'raised', 'series',
      'acquired', 'acquisition', 'ipo', 'valuation',
      
      // Market shifts
      'market', 'industry', 'trend', 'shift', 'disruption', 'future',
      'ai', 'machine learning', 'blockchain', 'crypto', 'web3',
      
      // Pain points/rants
      'problem', 'issue', 'broken', 'terrible', 'awful', 'frustrated',
      'why', 'how', 'stop', 'please', 'rant', 'opinion'
    ];
    
    return signalKeywords.some(keyword => title.includes(keyword));
  });
}

/**
 * Categorize HN story into signal type
 */
export function categorizeHNStory(story: HNItem): string {
  const title = story.title.toLowerCase();
  
  // Tech releases
  if (title.match(/(release|launched|announcing|introduces|unveils|version|v\d|beta)/)) {
    return 'tech_release';
  }
  
  // Frameworks/libraries
  if (title.match(/(framework|library|tool|api|sdk|platform|open source)/)) {
    return 'framework_library';
  }
  
  // YC/Startup announcements
  if (title.match(/(yc|y combinator|startup|funding|raised|series|acquired|ipo)/)) {
    return 'startup_announcement';
  }
  
  // Market shifts
  if (title.match(/(market|industry|trend|shift|disruption|future|ai|blockchain|web3)/)) {
    return 'market_shift';
  }
  
  // Pain points/rants
  if (title.match(/(problem|issue|broken|terrible|awful|frustrated|why|how|stop|rant)/)) {
    return 'industry_pain_point';
  }
  
  return 'general_tech';
}

/**
 * Calculate HN signal score (0-10)
 */
export function calculateHNScore(story: HNItem): number {
  let score = 0;
  
  // Base score from HN score (normalized)
  score += Math.min(story.score / 100, 4); // Max 4 points from HN score
  
  // Comment engagement
  if (story.descendants) {
    score += Math.min(story.descendants / 50, 2); // Max 2 points from comments
  }
  
  // Recency bonus (stories from last 6 hours get bonus)
  const hoursOld = (Date.now() / 1000 - story.time) / 3600;
  if (hoursOld < 6) {
    score += 1;
  }
  
  // Category-specific bonuses
  const category = categorizeHNStory(story);
  switch (category) {
    case 'startup_announcement':
    case 'tech_release':
      score += 2;
      break;
    case 'market_shift':
    case 'framework_library':
      score += 1.5;
      break;
    case 'industry_pain_point':
      score += 1;
      break;
  }
  
  // High-signal keywords bonus
  const title = story.title.toLowerCase();
  const highSignalKeywords = ['yc', 'openai', 'google', 'microsoft', 'apple', 'meta', 'amazon'];
  if (highSignalKeywords.some(keyword => title.includes(keyword))) {
    score += 1;
  }
  
  return Math.min(Math.round(score), 10);
}

/**
 * Get HN story URL (handles both direct links and HN discussion)
 */
export function getHNStoryUrl(story: HNItem): string {
  return story.url || `https://news.ycombinator.com/item?id=${story.id}`;
}

/**
 * Get HN discussion URL
 */
export function getHNDiscussionUrl(story: HNItem): string {
  return `https://news.ycombinator.com/item?id=${story.id}`;
}