export type SignalType = 
  | 'funding'
  | 'hiring'
  | 'product_launch'
  | 'partnership'
  | 'pricing_change'
  | 'growth_hiring'
  | 'layoffs'
  | 'sponsorship'
  | 'press_mention'
  | 'community_traction'
  | 'regulatory'
  | 'signal_of_interest'
  | 'tech_release'
  | 'framework_library'
  | 'startup_announcement'
  | 'market_shift'
  | 'industry_pain_point'
  | 'general_tech'
  | 'ai_tool'
  | 'developer_tool'
  | 'open_source_alternative'
  | 'language_runtime'
  | 'emerging_tech'
  | 'revenue_milestone'
  | 'market_validation'
  | 'indie_insight'
  | 'ai_startup'
  | 'crypto_startup'
  | 'dev_tools_startup'
  | 'fintech_startup'
  | 'healthtech_startup'
  | 'climate_startup'
  | 'marketplace_startup'
  | 'yc_startup';

export type Credibility = 'low' | 'medium' | 'high';
export type SignalStatus = 'draft' | 'published' | 'archived';

export interface Signal {
  id: string;
  headline: string;
  summary: string;
  source_link: string;
  why_it_matters: string;
  recommended_action: string;
  score: number;
  credibility: Credibility;
  signal_type: SignalType;
  tags: string[];
  company_id: string;
  company_name: string;
  status: SignalStatus;
  created_at: string;
  published_at?: string;

  // Related entities
  company_ids?: string[];
  person_ids?: string[];

  // Product Hunt enrichment fields
  ph_votes_count?: number;
  ph_comments_count?: number;
  ph_topics?: string[];
  ph_makers?: Array<{ name: string; twitter_username?: string }>;
  ph_tagline?: string;
  ph_redirect_url?: string;
  ph_post_id?: string;

  // Hacker News enrichment fields
  hn_story_id?: string;
  hn_score?: number;
  hn_comments?: number;
  hn_author?: string;
  hn_discussion_url?: string;
  hn_category?: string;

  // GitHub enrichment fields
  github_repo_url?: string;
  github_stars?: number;
  github_forks?: number;
  github_today_stars?: number;
  github_language?: string;
  github_author?: string;
  github_repo_name?: string;

  // Indie Hackers enrichment fields
  ih_post_id?: string;
  ih_author?: string;
  ih_upvotes?: number;
  ih_comments?: number;
  ih_category?: string;
  ih_revenue?: number;

  // Y Combinator enrichment fields
  yc_company_id?: string;
  yc_batch?: string;
  yc_status?: string;
  yc_vertical?: string;
  yc_team_size?: number;
  yc_is_hiring?: boolean;
  yc_funding_stage?: string;
  yc_location?: string;

  // Action tracking
  user_actions?: Array<{
    user_id: string;
    action: 'acted' | 'useful' | 'ignore';
    timestamp: string;
    notes?: string;
  }>;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  location?: string;
  founded_year?: number;
  employee_count?: string;
  tags: string[];
  keywords?: string[];
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface Person {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  email?: string;
  avatar_url?: string;
  company_id?: string;
  company_name?: string;
  tags: string[];
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  created_at: string;
  updated_at?: string;
}



export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
  last_login?: string;
}
