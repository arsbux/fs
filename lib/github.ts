// GitHub Trending scraper for signal detection
// Uses GitHub Search API to find trending repos

export interface GitHubRepo {
  author: string;
  name: string;
  url: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  todayStars: number;
  builtBy: Array<{
    username: string;
    url: string;
    avatar: string;
  }>;
}

/**
 * Fetch trending repos using GitHub Search API
 * Searches for repos created/updated recently with high stars
 * Fetches multiple pages and date ranges to get 100+ results
 */
export async function fetchTrendingRepos(
  language: string = '',
  since: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<GitHubRepo[]> {
  try {
    const allRepos: GitHubRepo[] = [];
    const seenUrls = new Set<string>();
    
    // Use broader date ranges to get more results
    const now = new Date();
    const dateRanges = [
      { days: 7, minStars: 100 },   // Last week, 100+ stars
      { days: 14, minStars: 200 },  // Last 2 weeks, 200+ stars
      { days: 30, minStars: 300 },  // Last month, 300+ stars
      { days: 60, minStars: 500 },  // Last 2 months, 500+ stars
    ];
    
    for (const range of dateRanges) {
      const sinceDate = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000);
      const dateStr = sinceDate.toISOString().split('T')[0];
      
      // Build search query
      let query = `created:>${dateStr} stars:>${range.minStars}`;
      if (language) {
        query += ` language:${language}`;
      }
      
      // Fetch multiple pages (up to 3 pages = 90 repos per query)
      for (let page = 1; page <= 3; page++) {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30&page=${page}`;
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'FounderSignal-App',
          },
        });

        if (!response.ok) {
          console.error(`GitHub API error: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          break; // No more results for this query
        }
        
        // Transform and deduplicate
        for (const item of data.items) {
          if (!seenUrls.has(item.html_url)) {
            seenUrls.add(item.html_url);
            allRepos.push({
              author: item.owner.login,
              name: item.name,
              url: item.html_url,
              description: item.description || '',
              language: item.language || 'Unknown',
              languageColor: '#8b949e',
              stars: item.stargazers_count,
              forks: item.forks_count,
              todayStars: Math.floor(item.stargazers_count / Math.max(1, range.days)), // Estimate
              builtBy: [{
                username: item.owner.login,
                url: item.owner.html_url,
                avatar: item.owner.avatar_url,
              }],
            });
          }
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // If we have enough repos, stop
      if (allRepos.length >= 100) {
        break;
      }
    }
    
    // Sort by stars descending
    allRepos.sort((a, b) => b.stars - a.stars);
    
    return allRepos;
  } catch (error) {
    console.error('Error fetching GitHub trending:', error);
    return [];
  }
}

/**
 * Fetch trending repos for multiple languages in parallel
 * Optimized to get 100+ repos total
 */
export async function fetchTrendingByLanguages(
  languages: string[] = ['', 'typescript', 'python', 'rust', 'go', 'javascript'],
  since: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<GitHubRepo[]> {
  // Fetch general trending first (no language filter) to get the most popular
  console.log('📡 Fetching general trending repos...');
  const generalRepos = await fetchTrendingRepos('', since);
  console.log(`✅ Got ${generalRepos.length} general repos`);
  
  const allRepos: GitHubRepo[] = [...generalRepos];
  const seenUrls = new Set<string>(generalRepos.map(r => r.url));
  
  // Then fetch language-specific repos in parallel (skip empty string since we did it)
  const languagePromises = languages
    .filter(lang => lang !== '')
    .map(async (lang) => {
      console.log(`📡 Fetching ${lang} repos...`);
      const repos = await fetchTrendingRepos(lang, since);
      console.log(`✅ Got ${repos.length} ${lang} repos`);
      return repos;
    });
  
  const results = await Promise.allSettled(languagePromises);
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const repo of result.value) {
        if (!seenUrls.has(repo.url)) {
          seenUrls.add(repo.url);
          allRepos.push(repo);
        }
      }
    }
  }
  
  console.log(`📊 Total unique repos: ${allRepos.length}`);
  
  // Sort by stars to prioritize most popular
  allRepos.sort((a, b) => b.stars - a.stars);
  
  return allRepos;
}

/**
 * Filter repos for signal-worthy content
 */
export function filterSignalWorthyRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos.filter(repo => {
    // Minimum stars threshold for today
    if (repo.todayStars < 50) return false;
    
    // Check for signal-worthy keywords
    const text = `${repo.name} ${repo.description}`.toLowerCase();
    
    const signalKeywords = [
      // AI/ML
      'ai', 'ml', 'machine learning', 'llm', 'gpt', 'model', 'neural',
      'transformer', 'diffusion', 'stable diffusion', 'chatbot',
      
      // Frameworks/Tools
      'framework', 'library', 'tool', 'cli', 'sdk', 'api',
      'platform', 'engine', 'runtime', 'compiler',
      
      // Hot technologies
      'react', 'vue', 'svelte', 'next', 'remix', 'astro',
      'rust', 'go', 'typescript', 'python', 'wasm',
      'kubernetes', 'docker', 'serverless', 'edge',
      
      // Developer tools
      'devtools', 'testing', 'debugging', 'monitoring',
      'deployment', 'ci/cd', 'automation', 'productivity',
      
      // Emerging tech
      'blockchain', 'web3', 'crypto', 'defi', 'nft',
      'quantum', 'iot', 'edge computing', 'webassembly',
      
      // Open source alternatives
      'alternative', 'open source', 'self-hosted', 'privacy',
      'decentralized', 'p2p', 'local-first'
    ];
    
    return signalKeywords.some(keyword => text.includes(keyword));
  });
}

/**
 * Categorize GitHub repo into signal type
 */
export function categorizeGitHubRepo(repo: GitHubRepo): string {
  const text = `${repo.name} ${repo.description}`.toLowerCase();
  
  // AI/ML models and tools
  if (text.match(/(ai|ml|llm|gpt|model|neural|transformer|diffusion|chatbot)/)) {
    return 'ai_tool';
  }
  
  // Frameworks and libraries
  if (text.match(/(framework|library|sdk|api|platform)/)) {
    return 'framework_library';
  }
  
  // Developer tools
  if (text.match(/(devtools|testing|debugging|monitoring|deployment|ci\/cd|automation)/)) {
    return 'developer_tool';
  }
  
  // Open source alternatives
  if (text.match(/(alternative|open source|self-hosted|privacy|decentralized)/)) {
    return 'open_source_alternative';
  }
  
  // Language/runtime
  if (text.match(/(language|compiler|runtime|interpreter|transpiler)/)) {
    return 'language_runtime';
  }
  
  return 'emerging_tech';
}

/**
 * Calculate GitHub signal score (0-10)
 */
export function calculateGitHubScore(repo: GitHubRepo): number {
  let score = 0;
  
  // Today's stars (normalized)
  score += Math.min(repo.todayStars / 100, 4); // Max 4 points
  
  // Total stars (shows established interest)
  score += Math.min(repo.stars / 1000, 2); // Max 2 points
  
  // Language popularity bonus
  const hotLanguages = ['typescript', 'rust', 'go', 'python'];
  if (hotLanguages.includes(repo.language?.toLowerCase())) {
    score += 1;
  }
  
  // High-signal keywords
  const text = `${repo.name} ${repo.description}`.toLowerCase();
  const highSignalKeywords = ['ai', 'llm', 'gpt', 'framework', 'alternative', 'self-hosted'];
  if (highSignalKeywords.some(keyword => text.includes(keyword))) {
    score += 2;
  }
  
  // Active development (multiple contributors)
  if (repo.builtBy && repo.builtBy.length >= 3) {
    score += 1;
  }
  
  return Math.min(Math.round(score), 10);
}

/**
 * Extract company/project name from repo
 */
export function extractProjectName(repo: GitHubRepo): string {
  // Use repo name, capitalize first letter
  return repo.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get primary language color for UI
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    'typescript': '#3178c6',
    'javascript': '#f1e05a',
    'python': '#3572A5',
    'rust': '#dea584',
    'go': '#00ADD8',
    'java': '#b07219',
    'c++': '#f34b7d',
    'c': '#555555',
    'ruby': '#701516',
    'php': '#4F5D95',
    'swift': '#ffac45',
    'kotlin': '#A97BFF',
  };
  
  return colors[language?.toLowerCase()] || '#8b949e';
}
