// Reddit scraper for founder-focused subreddits
// Focuses on pain points, unmet needs, and market signals

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
  signal_type: 'pain_point' | 'unmet_need' | 'solution_request' | 'shutdown' | 'pivot' | 'general';
}

// Target subreddits for founder signals
const TARGET_SUBREDDITS = [
  'startups',
  'Entrepreneur',
  'SaaS',
  'sideproject',
  'indiehackers',
  'consulting',
  'marketing',
  'ArtificialIntelligence',
];

// Signal patterns to detect high-value posts
const SIGNAL_PATTERNS = {
  pain_point: [
    /struggling with/i,
    /frustrated by/i,
    /pain point/i,
    /problem with/i,
    /issue with/i,
    /difficult to/i,
    /hard to/i,
    /annoying/i,
    /hate that/i,
  ],
  unmet_need: [
    /wish there was/i,
    /need a tool/i,
    /looking for a/i,
    /anyone know of/i,
    /does anyone have/i,
    /is there a/i,
    /would pay for/i,
  ],
  solution_request: [
    /what are you using for/i,
    /what do you use for/i,
    /how do you handle/i,
    /recommendations for/i,
    /best tool for/i,
    /alternatives to/i,
  ],
  shutdown: [
    /shutting down/i,
    /closing down/i,
    /discontinuing/i,
    /end of life/i,
    /sunsetting/i,
  ],
  pivot: [
    /pivoting/i,
    /changing direction/i,
    /new direction/i,
    /shifting focus/i,
  ],
};

/**
 * Detect signal type from post content
 */
function detectSignalType(title: string, text: string): RedditPost['signal_type'] {
  const content = `${title} ${text}`.toLowerCase();
  
  for (const [type, patterns] of Object.entries(SIGNAL_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(content))) {
      return type as RedditPost['signal_type'];
    }
  }
  
  return 'general';
}

/**
 * Calculate signal score based on engagement and content
 */
function calculateSignalScore(post: RedditPost): number {
  let score = 5; // Base score
  
  // Engagement signals
  if (post.score > 100) score += 2;
  if (post.score > 500) score += 2;
  if (post.num_comments > 50) score += 2;
  if (post.num_comments > 100) score += 1;
  
  // Signal type importance
  if (post.signal_type === 'pain_point') score += 2;
  if (post.signal_type === 'unmet_need') score += 2;
  if (post.signal_type === 'solution_request') score += 1;
  if (post.signal_type === 'shutdown') score += 3;
  if (post.signal_type === 'pivot') score += 2;
  
  // Content quality signals
  if (post.selftext.length > 500) score += 1;
  if (post.selftext.length > 1000) score += 1;
  
  return Math.min(Math.max(score, 1), 10);
}

/**
 * Scrape a specific subreddit for high-signal posts
 */
async function scrapeSubreddit(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
  try {
    // Use Reddit's JSON API (no auth required for public posts)
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'FounderSignal/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch r/${subreddit}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const posts: RedditPost[] = [];

    for (const child of data.data.children) {
      const post = child.data;
      
      // Skip removed/deleted posts
      if (post.removed_by_category || post.author === '[deleted]') {
        continue;
      }
      
      // Skip posts without text content
      if (!post.selftext || post.selftext.length < 50) {
        continue;
      }

      const signalType = detectSignalType(post.title, post.selftext);
      
      // Only include posts with detected signals
      if (signalType !== 'general' || post.score > 100) {
        posts.push({
          id: post.id,
          title: post.title,
          selftext: post.selftext,
          author: post.author,
          subreddit: post.subreddit,
          url: `https://reddit.com${post.permalink}`,
          permalink: post.permalink,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: post.created_utc,
          signal_type: signalType,
        });
      }
    }

    return posts;
  } catch (error) {
    console.error(`Error scraping r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Scrape all target subreddits
 */
export async function scrapeRedditSignals(): Promise<RedditPost[]> {
  console.log(`📡 Scraping ${TARGET_SUBREDDITS.length} subreddits...`);
  
  const allPosts: RedditPost[] = [];
  
  // Scrape subreddits sequentially to avoid rate limits
  for (const subreddit of TARGET_SUBREDDITS) {
    console.log(`  Fetching r/${subreddit}...`);
    const posts = await scrapeSubreddit(subreddit);
    allPosts.push(...posts);
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`✅ Found ${allPosts.length} high-signal posts`);
  
  // Sort by signal quality
  return allPosts.sort((a, b) => {
    const scoreA = calculateSignalScore(a);
    const scoreB = calculateSignalScore(b);
    return scoreB - scoreA;
  });
}

/**
 * Generate signal headline from Reddit post
 */
export function generateRedditHeadline(post: RedditPost): string {
  const typeLabels = {
    pain_point: '💢 Pain Point',
    unmet_need: '🎯 Unmet Need',
    solution_request: '🔍 Solution Request',
    shutdown: '🚨 Shutdown Alert',
    pivot: '🔄 Pivot Signal',
    general: '💡 Insight',
  };
  
  const label = typeLabels[post.signal_type];
  return `${label}: ${post.title}`;
}

/**
 * Generate signal summary from Reddit post
 */
export function generateRedditSummary(post: RedditPost): string {
  // Truncate long text
  const text = post.selftext.length > 300 
    ? post.selftext.substring(0, 300) + '...' 
    : post.selftext;
  
  return `From r/${post.subreddit} by u/${post.author}: ${text}`;
}

/**
 * Generate why it matters text
 */
export function generateWhyItMatters(post: RedditPost): string {
  const typeInsights = {
    pain_point: 'This pain point represents a potential market opportunity. High engagement suggests others face the same issue.',
    unmet_need: 'This unmet need indicates market demand for a solution. Consider if this aligns with your product vision.',
    solution_request: 'Active solution seeking shows immediate market demand. Opportunity to engage or validate product-market fit.',
    shutdown: 'Service shutdowns create migration opportunities. Users are actively looking for alternatives.',
    pivot: 'Company pivots signal market shifts or failed hypotheses. Learn from their experience.',
    general: 'High engagement in founder communities indicates relevant market discussion.',
  };
  
  const base = typeInsights[post.signal_type];
  const engagement = post.score > 100 ? ` ${post.score} upvotes and ${post.num_comments} comments show strong community interest.` : '';
  
  return base + engagement;
}

/**
 * Generate recommended action
 */
export function generateRecommendedAction(post: RedditPost): string {
  const actions = {
    pain_point: 'Engage in the discussion to understand the pain point deeper. Consider if this is a problem worth solving.',
    unmet_need: 'Validate if this need aligns with your product. Reach out to the author to learn more about their requirements.',
    solution_request: 'Share your solution if relevant, or learn what alternatives users are considering.',
    shutdown: 'Reach out to affected users with migration offers. This is a time-sensitive opportunity.',
    pivot: 'Analyze why they pivoted. Read the full discussion for market insights.',
    general: 'Read the discussion for market insights and founder perspectives.',
  };
  
  return `${actions[post.signal_type]} View discussion: ${post.url}`;
}

/**
 * Extract tags from Reddit post
 */
export function extractRedditTags(post: RedditPost): string[] {
  const tags = ['reddit', post.subreddit, post.signal_type];
  
  // Add engagement tags
  if (post.score > 500) tags.push('viral');
  if (post.num_comments > 100) tags.push('high_engagement');
  
  // Add content-based tags
  const content = `${post.title} ${post.selftext}`.toLowerCase();
  
  if (content.includes('saas')) tags.push('saas');
  if (content.includes('b2b')) tags.push('b2b');
  if (content.includes('ai') || content.includes('artificial intelligence')) tags.push('ai');
  if (content.includes('startup')) tags.push('startup');
  if (content.includes('founder')) tags.push('founder');
  if (content.includes('marketing')) tags.push('marketing');
  if (content.includes('sales')) tags.push('sales');
  
  return [...new Set(tags)];
}
