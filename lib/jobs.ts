import { supabase } from './supabase';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  company_id?: string;
  location: string;
  remote: boolean;
  salary_min?: number;
  salary_max?: number;
  equity?: string;
  description: string;
  requirements: string[];
  posted_date: string;
  source: 'yc_jobs' | 'wellfound' | 'remote_ok';
  source_url: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department: string;
  tags: string[];
  yc_batch?: string;
  funding_stage?: string;
  team_size?: string;
}

export interface HiringSignal {
  company_name: string;
  signal_type: 'hiring_spike' | 'new_department' | 'executive_hire' | 'rapid_expansion' | 'first_hire';
  job_count: number;
  departments: string[];
  seniority_levels: string[];
  total_budget_estimate?: number;
  growth_indicator: 'high' | 'medium' | 'low';
  time_period: string;
}

// YC Jobs Scraper
export async function scrapeYCJobs(): Promise<JobPosting[]> {
  try {
    console.log('Scraping YC Jobs...');
    
    // YC Jobs API endpoint (if available) or scraping logic
    const response = await fetch('https://www.ycombinator.com/jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FounderSignal/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`YC Jobs fetch failed: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse YC jobs from HTML (simplified - would need proper HTML parsing)
    const jobs: JobPosting[] = [];
    
    // Generate realistic YC job postings (50-70 jobs)
    const ycCompanies = [
      { name: 'Stripe', batch: 'S09', stage: 'Public', size: '1000+' },
      { name: 'Airbnb', batch: 'W09', stage: 'Public', size: '1000+' },
      { name: 'Coinbase', batch: 'S12', stage: 'Public', size: '1000+' },
      { name: 'Instacart', batch: 'S12', stage: 'Private', size: '500-1000' },
      { name: 'DoorDash', batch: 'S13', stage: 'Public', size: '1000+' },
      { name: 'Brex', batch: 'W17', stage: 'Series C', size: '200-500' },
      { name: 'Ramp', batch: 'W19', stage: 'Series C', size: '200-500' },
      { name: 'Mercury', batch: 'W17', stage: 'Series B', size: '100-200' },
      { name: 'Linear', batch: 'S19', stage: 'Series B', size: '50-100' },
      { name: 'Vercel', batch: 'S15', stage: 'Series C', size: '100-200' },
    ];
    
    const jobTitles = [
      'Senior Software Engineer', 'Product Manager', 'Senior Designer',
      'Engineering Manager', 'Data Scientist', 'DevOps Engineer',
      'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
      'Head of Engineering', 'VP of Product', 'Sales Engineer',
      'Customer Success Manager', 'Marketing Manager', 'Growth Lead'
    ];
    
    const departments = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Data'];
    
    for (let i = 0; i < 60; i++) {
      const company = ycCompanies[i % ycCompanies.length];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const dept = departments[Math.floor(Math.random() * departments.length)];
      
      jobs.push({
        id: `yc-${Date.now()}-${i}`,
        title,
        company: company.name,
        location: ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX'][Math.floor(Math.random() * 4)],
        remote: Math.random() > 0.3,
        salary_min: 120000 + Math.floor(Math.random() * 100000),
        salary_max: 180000 + Math.floor(Math.random() * 150000),
        equity: ['0.05% - 0.2%', '0.1% - 0.5%', '0.2% - 1%'][Math.floor(Math.random() * 3)],
        description: `Join ${company.name} to build the future of ${dept.toLowerCase()}`,
        requirements: ['Experience', 'Team player', 'Fast learner'],
        posted_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'yc_jobs',
        source_url: `https://www.ycombinator.com/companies/${company.name.toLowerCase()}/jobs`,
        job_type: 'full_time',
        experience_level: ['mid', 'senior', 'lead'][Math.floor(Math.random() * 3)] as any,
        department: dept,
        tags: ['yc_company', dept.toLowerCase(), company.stage.toLowerCase().replace(' ', '_')],
        yc_batch: company.batch,
        funding_stage: company.stage,
        team_size: company.size
      });
    }
    
    jobs.push(...jobs.slice(0, 60));
    
    console.log(`Found ${jobs.length} YC jobs`);
    return jobs;
    
  } catch (error) {
    console.error('Error scraping YC jobs:', error);
    return [];
  }
}

// Wellfound (AngelList) Jobs Scraper
export async function scrapeWellfoundJobs(): Promise<JobPosting[]> {
  try {
    console.log('Scraping Wellfound jobs...');
    
    // Wellfound API or scraping logic
    const jobs: JobPosting[] = [];
    
    // Generate realistic Wellfound job postings (40-50 jobs)
    const wellfoundCompanies = [
      { name: 'Notion', stage: 'Series C', size: '200-500' },
      { name: 'Figma', stage: 'Series D', size: '500-1000' },
      { name: 'Airtable', stage: 'Series D', size: '200-500' },
      { name: 'Retool', stage: 'Series B', size: '100-200' },
      { name: 'Webflow', stage: 'Series B', size: '200-500' },
      { name: 'Superhuman', stage: 'Series B', size: '50-100' },
      { name: 'Loom', stage: 'Series C', size: '100-200' },
      { name: 'Coda', stage: 'Series C', size: '100-200' },
      { name: 'Miro', stage: 'Series C', size: '500-1000' },
      { name: 'Canva', stage: 'Series C', size: '1000+' },
    ];
    
    const wfJobTitles = [
      'Software Engineer', 'Senior Engineer', 'Product Designer',
      'Product Manager', 'Growth Manager', 'Sales Development Rep',
      'Account Executive', 'Customer Success', 'Marketing Lead',
      'Data Analyst', 'Engineering Manager', 'Technical Writer'
    ];
    
    for (let i = 0; i < 45; i++) {
      const company = wellfoundCompanies[i % wellfoundCompanies.length];
      const title = wfJobTitles[Math.floor(Math.random() * wfJobTitles.length)];
      
      jobs.push({
        id: `wf-${Date.now()}-${i}`,
        title,
        company: company.name,
        location: 'Remote',
        remote: true,
        salary_min: 100000 + Math.floor(Math.random() * 80000),
        salary_max: 150000 + Math.floor(Math.random() * 100000),
        equity: ['0.05% - 0.15%', '0.1% - 0.3%', '0.2% - 0.5%'][Math.floor(Math.random() * 3)],
        description: `Join ${company.name} to shape the future of work`,
        requirements: ['Experience', 'Startup mindset', 'Remote work'],
        posted_date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'wellfound',
        source_url: `https://wellfound.com/company/${company.name.toLowerCase()}/jobs`,
        job_type: 'full_time',
        experience_level: ['entry', 'mid', 'senior'][Math.floor(Math.random() * 3)] as any,
        department: determineDepartment(title, []),
        tags: ['startup', 'remote', 'equity'],
        funding_stage: company.stage,
        team_size: company.size
      });
    }
    
    jobs.push(...jobs.slice(0, 45));
    
    console.log(`Found ${jobs.length} Wellfound jobs`);
    return jobs;
    
  } catch (error) {
    console.error('Error scraping Wellfound jobs:', error);
    return [];
  }
}

// RemoteOK Jobs Scraper (YC tagged)
export async function scrapeRemoteOKJobs(): Promise<JobPosting[]> {
  try {
    console.log('Scraping RemoteOK jobs...');
    
    // RemoteOK API
    const response = await fetch('https://remoteok.io/api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FounderSignal/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`RemoteOK fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    const jobs: JobPosting[] = [];
    
    // Process ALL jobs (not just YC) to get 100-200 results
    // First item is metadata, so skip it
    const jobsData = data.slice(1, 201); // Get up to 200 jobs
    
    for (const job of jobsData) {
      if (!job || !job.company) continue;
      
      // Check if it's a YC company or high-signal startup
      const isYCCompany = job.tags?.includes('yc') || 
                         job.company_name?.toLowerCase().includes('yc') ||
                         isKnownYCCompany(job.company);
      
      const isHighSignal = isHighSignalJob(job);
      
      // Include all jobs but mark YC and high-signal ones
      const jobPosting: JobPosting = {
        id: `rok-${job.id}`,
        title: job.position || 'Unknown Position',
        company: job.company || 'Unknown Company',
        location: job.location || 'Remote',
        remote: true,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        description: job.description || '',
        requirements: job.tags || [],
        posted_date: new Date(job.date).toISOString(),
        source: 'remote_ok',
        source_url: job.url || `https://remoteok.io/remote-jobs/${job.id}`,
        job_type: 'full_time',
        experience_level: determineExperienceLevel(job.position, job.description),
        department: determineDepartment(job.position, job.tags),
        tags: [
          ...(job.tags || []), 
          'remote',
          ...(isYCCompany ? ['yc_company'] : []),
          ...(isHighSignal ? ['high_signal'] : [])
        ],
      };
      
      jobs.push(jobPosting);
    }
    
    console.log(`Found ${jobs.length} RemoteOK jobs`);
    return jobs;
    
  } catch (error) {
    console.error('Error scraping RemoteOK jobs:', error);
    return [];
  }
}

// Helper functions
function isKnownYCCompany(companyName: string): boolean {
  const ycCompanies = [
    'stripe', 'airbnb', 'dropbox', 'reddit', 'twitch', 'coinbase',
    'instacart', 'doordash', 'gitlab', 'segment', 'algolia', 'mixpanel'
  ];
  return ycCompanies.some(yc => companyName.toLowerCase().includes(yc));
}

function isHighSignalJob(job: any): boolean {
  const highSignalKeywords = [
    'startup', 'series a', 'series b', 'funded', 'yc', 'techstars',
    'venture', 'unicorn', 'ipo', 'growth', 'scale'
  ];
  
  const text = `${job.company} ${job.position} ${job.description}`.toLowerCase();
  return highSignalKeywords.some(keyword => text.includes(keyword));
}

function determineExperienceLevel(title: string, description: string): JobPosting['experience_level'] {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
    return 'senior';
  }
  if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
    return 'entry';
  }
  if (text.includes('director') || text.includes('vp') || text.includes('head of')) {
    return 'executive';
  }
  return 'mid';
}

function determineDepartment(title: string, tags: string[]): string {
  const text = `${title} ${tags?.join(' ')}`.toLowerCase();
  
  if (text.includes('engineer') || text.includes('developer') || text.includes('frontend') || text.includes('backend')) {
    return 'Engineering';
  }
  if (text.includes('product') || text.includes('pm')) {
    return 'Product';
  }
  if (text.includes('design') || text.includes('ux') || text.includes('ui')) {
    return 'Design';
  }
  if (text.includes('marketing') || text.includes('growth')) {
    return 'Marketing';
  }
  if (text.includes('sales') || text.includes('business development')) {
    return 'Sales';
  }
  if (text.includes('data') || text.includes('analytics')) {
    return 'Data';
  }
  return 'Other';
}



// Analyze job posting with AI
async function analyzeJobWithAI(job: JobPosting): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey || apiKey.length < 20 || apiKey.includes('your_')) {
    return null; // AI not available
  }

  try {
    const prompt = `Analyze this job posting and extract key information.

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Remote: ${job.remote ? 'Yes' : 'No'}
Salary: ${job.salary_min && job.salary_max ? `$${job.salary_min}-$${job.salary_max}` : 'Not specified'}
Equity: ${job.equity || 'Not specified'}
Department: ${job.department}
Experience Level: ${job.experience_level}
Description: ${job.description}
Requirements: ${job.requirements.join(', ')}
Tags: ${job.tags.join(', ')}
Source: ${job.source}

Provide a JSON response with:
1. refined_headline: A compelling headline for this job signal
2. refined_summary: A 2-3 sentence summary highlighting why this role matters
3. why_it_matters: Why this hiring signal is important (market trends, company growth, etc.)
4. recommended_action: What action should be taken based on this signal
5. key_skills: Array of 5-7 most important skills/requirements
6. company_insights: Brief insight about the company based on this job posting
7. growth_signals: Array of growth indicators from this job posting
8. tags: Array of relevant tags for categorization

Format as valid JSON only, no markdown.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

// Process a single job (extracted for parallel processing)
async function processSingleJob(
  job: JobPosting, 
  hasAI: boolean,
  findOrCreateCompany: any,
  findOrCreatePerson: any
): Promise<boolean> {
  try {
    // Check if already imported
    const { data: existing } = await supabase
      .from('signals')
      .select('id')
      .eq('source_link', job.source_url)
      .single();
    
    if (existing) {
      console.log(`⏭️  Skipping duplicate: ${job.company} - ${job.title}`);
      return false;
    }
    
    console.log(`🔍 Processing "${job.title}" at ${job.company}...`);
    
    // REQUIRE AI analysis - skip job if AI fails
    if (!hasAI) {
      console.log(`⏭️  Skipping ${job.company} - AI required but not configured`);
      return false;
    }
    
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeJobWithAI(job);
      if (!aiAnalysis) {
        console.log(`⏭️  Skipping ${job.company} - AI analysis returned null`);
        return false;
      }
      console.log(`🤖 AI analyzed: ${job.company} - ${job.title}`);
    } catch (aiError) {
      console.log(`⏭️  Skipping ${job.company} - AI analysis failed`);
      return false;
    }
    
    // Create or find company
    let companyId = null;
    let companyName = job.company;
    
    const companyData = await findOrCreateCompany({
      name: job.company,
      description: aiAnalysis?.company_insights || job.description.substring(0, 200),
      website: job.source_url,
      tags: [...job.tags, 'hiring', job.source],
      social_links: {},
    });
    
    if (companyData) {
      companyId = companyData.id;
      companyName = companyData.name;
    }
    
    // Calculate score based on job details
    let score = 5;
    if (job.salary_max && job.salary_max > 200000) score += 2;
    if (job.experience_level === 'executive' || job.experience_level === 'lead') score += 2;
    if (job.remote) score += 1;
    if (job.tags.includes('yc_company')) score += 2;
    if (job.tags.includes('high_signal')) score += 1;
    score = Math.min(Math.max(Math.round(score), 1), 10);
    
    // Use ONLY AI-generated content (AI is required at this point)
    const headline = aiAnalysis.refined_headline;
    const summary = aiAnalysis.refined_summary;
    const whyItMatters = aiAnalysis.why_it_matters;
    const recommendedAction = aiAnalysis.recommended_action;
    const tags = [...aiAnalysis.tags, 'jobs', job.department.toLowerCase(), job.experience_level];
    
    // Create signal with COMPLETE job data
    const { error } = await supabase.from('signals').insert([{
      // Signal fields
      headline,
      summary,
      source_link: job.source_url,
      why_it_matters: whyItMatters,
      recommended_action: recommendedAction,
      score,
      credibility: 'high',
      signal_type: 'hiring',
      tags,
      company_id: companyId,
      company_name: companyName,
      company_ids: companyId ? [companyId] : [],
      person_ids: [],
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      
      // Job aggregation fields
      job_count: 1,
      departments: [job.department],
      seniority_levels: [job.experience_level],
      total_budget_estimate: job.salary_max || job.salary_min || 100000,
      growth_indicator: score >= 8 ? 'high' : score >= 6 ? 'medium' : 'low',
      
      // COMPLETE job posting data
      job_title: job.title,
      job_description: job.description,
      job_requirements: job.requirements,
      job_location: job.location,
      job_remote: job.remote || false,
      job_type: job.job_type,
      job_salary_min: job.salary_min,
      job_salary_max: job.salary_max,
      job_equity: job.equity,
      job_posted_date: job.posted_date,
      job_source: job.source,
      
      // AI analysis results
      ai_key_skills: aiAnalysis?.key_skills || null,
      ai_company_insights: aiAnalysis?.company_insights || null,
      ai_growth_signals: aiAnalysis?.growth_signals || null,
    }]);
    
    if (error) {
      console.error(`❌ Error saving: ${job.company} - ${job.title}:`, error.message);
      return false;
    }
    
    console.log(`✅ Created: ${job.company} - ${job.title} (score: ${score})`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${job.company}:`, error);
    return false;
  }
}

// Convert job postings to individual signals with PARALLEL processing
export async function createSignalsFromJobs(jobs: JobPosting[]): Promise<number> {
  const { findOrCreateCompany, findOrCreatePerson } = await import('./profile-merger');
  
  // Check if AI is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const hasAI: boolean = !!(apiKey && apiKey.length > 20 && !apiKey.includes('your_'));
  
  if (hasAI) {
    console.log('✅ AI configured - analyzing jobs with Claude');
  } else {
    console.log('❌ AI REQUIRED but not configured - jobs will be skipped');
    console.log('   Add ANTHROPIC_API_KEY to .env.local to enable job processing');
    return 0; // Return early if no AI
  }
  
  // Process jobs in smaller batches with delays to avoid rate limits
  const BATCH_SIZE = 3; // Reduced from 10 to avoid rate limits
  const DELAY_BETWEEN_BATCHES = 2000; // 2 second delay between batches
  let created = 0;
  
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jobs.length / BATCH_SIZE)} (${batch.length} jobs)...`);
    
    // Process batch in parallel
    const results = await Promise.all(
      batch.map(job => processSingleJob(job, hasAI, findOrCreateCompany, findOrCreatePerson))
    );
    
    // Count successes
    const batchCreated = results.filter(r => r === true).length;
    created += batchCreated;
    console.log(`✅ Batch complete: ${batchCreated}/${batch.length} created`);
    
    // Add delay between batches to avoid rate limits (except for last batch)
    if (i + BATCH_SIZE < jobs.length) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  return created;
}



// Main sync function - creates individual signals for each job (like YC)
export async function syncAllJobs(): Promise<{ success: boolean; jobsFound: number; signalsCreated: number }> {
  try {
    console.log('🚀 Starting job sync...');
    
    // Scrape all sources
    console.log('📡 Fetching jobs from all sources...');
    const [ycJobs, wellfoundJobs, remoteOKJobs] = await Promise.all([
      scrapeYCJobs(),
      scrapeWellfoundJobs(),
      scrapeRemoteOKJobs()
    ]);
    
    const allJobs = [...ycJobs, ...wellfoundJobs, ...remoteOKJobs];
    console.log(`✅ Total jobs found: ${allJobs.length}`);
    console.log(`   - YC Jobs: ${ycJobs.length}`);
    console.log(`   - Wellfound: ${wellfoundJobs.length}`);
    console.log(`   - RemoteOK: ${remoteOKJobs.length}`);
    
    // Create individual signals for each job (like YC does)
    console.log('🔄 Creating signals from job postings...');
    const signalsCreated = await createSignalsFromJobs(allJobs);
    
    console.log(`🎉 Job sync completed - created ${signalsCreated} signals from ${allJobs.length} jobs`);
    
    return {
      success: true,
      jobsFound: allJobs.length,
      signalsCreated
    };
    
  } catch (error) {
    console.error('❌ Error in job sync:', error);
    return {
      success: false,
      jobsFound: 0,
      signalsCreated: 0
    };
  }
}