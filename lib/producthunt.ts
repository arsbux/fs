// Product Hunt API integration using Developer Token
export interface PHPost {
  id: number;
  name: string;
  tagline: string;
  description: string;
  votes_count: number;
  comments_count: number;
  created_at: string;
  website: string;
  redirect_url: string;
  topics: Array<{ name: string }>;
  makers: Array<{
    name: string;
    username: string;
    twitter_username?: string;
  }>;
}

export async function fetchTodaysPosts(): Promise<PHPost[]> {
  const token = process.env.PRODUCT_HUNT_API_TOKEN;
  
  if (!token) {
    throw new Error('Product Hunt API token not configured. Add PRODUCT_HUNT_API_TOKEN to .env.local');
  }

  try {
    console.log('Fetching Product Hunt posts with developer token...');
    
    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            posts(order: VOTES) {
              edges {
                node {
                  id
                  name
                  tagline
                  description
                  votesCount
                  commentsCount
                  createdAt
                  website
                  url
                  topics {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                  makers {
                    name
                    username
                    twitterUsername
                  }
                }
              }
            }
          }
        `
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Product Hunt API error:', response.status, errorText);
      throw new Error(`Product Hunt API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data?.posts?.edges) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response structure from Product Hunt API');
    }

    // Map all posts - no time restrictions
    const allPosts = data.data.posts.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: parseInt(node.id),
        name: node.name,
        tagline: node.tagline,
        description: node.description || '',
        votes_count: node.votesCount || 0,
        comments_count: node.commentsCount || 0,
        created_at: node.createdAt,
        website: node.website || '',
        redirect_url: node.url,
        topics: node.topics?.edges?.map((t: any) => ({ name: t.node.name })) || [],
        makers: node.makers?.map((m: any) => ({
          name: m.name,
          username: m.username,
          twitter_username: m.twitterUsername,
        })) || [],
      };
    });

    console.log(`✓ Fetched ${allPosts.length} posts from Product Hunt (no time restrictions)`);
    return allPosts;
  } catch (error) {
    console.error('Error fetching Product Hunt posts:', error);
    throw error;
  }
}

export function calculatePHScore(post: PHPost): number {
  let score = 5; // Base score
  
  // Votes contribution (0-3 points)
  if (post.votes_count >= 500) score += 3;
  else if (post.votes_count >= 200) score += 2;
  else if (post.votes_count >= 50) score += 1;
  
  // Comments contribution (0-2 points)
  if (post.comments_count >= 100) score += 2;
  else if (post.comments_count >= 30) score += 1;
  
  // Maker reputation (0-2 points)
  const hasTwitterMakers = post.makers.some(m => m.twitter_username);
  if (hasTwitterMakers) score += 1;
  if (post.makers.length > 2) score += 1;
  
  return Math.min(10, score);
}

export function generatePHAction(post: PHPost): string {
  const makers = post.makers
    .map(m => m.twitter_username ? `@${m.twitter_username}` : m.name)
    .filter(Boolean)
    .join(', ');
  
  if (makers) {
    return `Reach out to ${makers} for partnership/integration opportunity. View launch: ${post.redirect_url}`;
  }
  
  return `Explore partnership opportunity. View launch: ${post.redirect_url}`;
}

export function generatePHWhyItMatters(post: PHPost): string {
  const topics = post.topics.map(t => t.name).join(', ');
  const topicsText = topics ? ` in ${topics}` : '';
  
  return `Strong Product Hunt launch with ${post.votes_count} upvotes and ${post.comments_count} comments${topicsText}. Early opportunity for partnership or integration.`;
}

export function matchesWatchlist(
  post: PHPost, 
  companies: Array<{ name: string; tags: string[] }>
): boolean {
  const postText = `${post.name} ${post.tagline} ${post.description}`.toLowerCase();
  const postTopics = post.topics.map(t => t.name.toLowerCase());
  
  return companies.some(company => {
    // Name match
    if (postText.includes(company.name.toLowerCase())) return true;
    
    // Tag/topic match
    return company.tags && company.tags.some(tag => 
      postTopics.includes(tag.toLowerCase()) || postText.includes(tag.toLowerCase())
    );
  });
}
