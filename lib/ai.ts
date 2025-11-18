// AI processing using Claude API for Product Hunt data analysis
import { PHPost } from './producthunt';

interface ExtractedCompany {
  name: string;
  description?: string;
  website?: string;
  tags: string[];
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface ExtractedPerson {
  name: string;
  title?: string;
  tags: string[];
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

interface RefinedSignal {
  headline: string;
  summary: string;
  why_it_matters: string;
  recommended_action: string;
  tags: string[];
}

interface LaunchAnalysis {
  signal: RefinedSignal;
  company: ExtractedCompany | null;
  people: ExtractedPerson[];
}

/**
 * Check if AI is available and configured
 */
function isAIAvailable(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return !!(apiKey && apiKey.length > 20 && !apiKey.includes('your_'));
}

/**
 * Analyze Product Hunt launch with AI
 * REQUIRES AI - throws error if AI is not available or fails
 */
export async function analyzeProductHuntLaunch(post: PHPost): Promise<LaunchAnalysis> {
  // Check if AI is available
  if (!isAIAvailable()) {
    throw new Error('AI is required but not configured. Add ANTHROPIC_API_KEY to .env.local');
  }

  // AI analysis is REQUIRED
  console.log(`🤖 Analyzing ${post.name} with AI...`);
  const analysis = await analyzeWithAI(post);
  console.log(`✅ AI analyzed: ${analysis.people.length} people, company: ${analysis.company?.name}`);
  return analysis;
}

/**
 * Analyze with Claude AI
 */
async function analyzeWithAI(post: PHPost): Promise<LaunchAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const makers = post.makers.map(m => `${m.name} (${m.username}${m.twitter_username ? `, @${m.twitter_username}` : ''})`).join(', ');
  const topics = post.topics.map(t => t.name).join(', ');

  const prompt = `Analyze this Product Hunt launch and extract ONLY real, verifiable entities.

Product: ${post.name}
Tagline: ${post.tagline}
Description: ${post.description}
Website: ${post.website}
Upvotes: ${post.votes_count}
Comments: ${post.comments_count}
Topics: ${topics}
Makers: ${makers}

CRITICAL INSTRUCTIONS:
1. COMPANY EXTRACTION: Only extract the ACTUAL company name if it's explicitly mentioned or clearly identifiable from the content. DO NOT create fake company names or use generic terms like "Compiler Company" or "Trust Company". If no real company is mentioned, set company to null.

2. REAL PEOPLE ONLY: Extract ONLY real human names (First Last format like "Elon Musk", "Sam Altman"). 
   - DO NOT use usernames like "elon_musk", "samaltman", "i_don_t_know"
   - DO NOT use handles like "@elonmusk", "birdculture", "todsacerdoti"  
   - DO NOT use generic names like "Developer", "Founder", "User"
   - DO NOT use placeholder names like "John Doe", "Jane Smith"
   - ONLY extract if you can identify the actual real name of a person
   - If only usernames/handles are available, set people to empty array []

3. NAME VALIDATION: Real names must:
   - Be in "First Last" format (e.g., "John Smith", "Maria Garcia")
   - Not contain underscores, numbers, or special characters
   - Not be obviously fake or placeholder names
   - Be actual human names, not company names or product names

4. ACCURATE INFORMATION: All extracted data must be factually accurate based on the provided information. Do not invent or assume details.

5. WEBSITE VERIFICATION: Only use the provided website URL. Do not create fake URLs.

IMPORTANT: Return ONLY valid JSON. Use simple text without special characters in headlines and summaries. Avoid quotes inside strings.

Return this exact JSON structure:
{
  "company": null,
  "people": [],
  "signal": {
    "headline": "Simple headline without quotes or special chars",
    "summary": "One sentence summary",
    "why_it_matters": "Why this matters",
    "recommended_action": "What to do about it",
    "tags": ["tag1", "tag2"]
  }
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  // Safely access content
  if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
    throw new Error('Invalid AI response: no content returned');
  }
  
  const content = data.content[0]?.text;
  if (!content) {
    throw new Error('Empty AI response content');
  }
  
  // Try to find and parse JSON with multiple strategies
  let analysis;
  let jsonStr = '';
  
  try {
    // Strategy 1: Try to find complete JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
      
      // Clean up common JSON issues
      jsonStr = jsonStr
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control chars
        .replace(/\n/g, ' ')                // Remove newlines  
        .replace(/\r/g, ' ')                // Remove carriage returns
        .replace(/\t/g, ' ')                // Remove tabs
        .replace(/\s+/g, ' ')               // Normalize whitespace
        .trim();
      
      try {
        analysis = JSON.parse(jsonStr);
      } catch (firstError) {
        // Strategy 2: Try to fix truncated JSON by closing it
        console.log('Attempting to fix truncated JSON...');
        
        // Count open/close braces and brackets
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        
        // Add missing closing characters
        let fixedJson = jsonStr;
        
        // Close any open strings
        const quoteCount = (fixedJson.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          fixedJson += '"';
        }
        
        // Close arrays
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixedJson += ']';
        }
        
        // Close objects
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixedJson += '}';
        }
        
        try {
          analysis = JSON.parse(fixedJson);
          console.log('✅ Successfully fixed truncated JSON');
        } catch (secondError) {
          console.error('Failed to parse AI JSON after fixes:', fixedJson.substring(0, 300));
          throw new Error(`Invalid JSON in AI response: ${firstError instanceof Error ? firstError.message : 'Unknown error'}`);
        }
      }
    } else {
      console.error('No JSON found in AI response:', content.substring(0, 200));
      throw new Error('No JSON found in AI response');
    }
  } catch (error) {
    console.error('JSON parsing failed completely:', error);
    throw error;
  }
  
  // Ensure required fields exist with defaults
  if (!analysis.signal) {
    throw new Error('AI response missing signal object');
  }
  
  analysis.signal.summary = analysis.signal.summary || analysis.signal.headline || 'No summary available';
  analysis.signal.why_it_matters = analysis.signal.why_it_matters || 'This signal represents a notable development in the startup ecosystem worth tracking.';
  analysis.signal.recommended_action = analysis.signal.recommended_action || 'Monitor this development and assess its potential impact on your business or investment strategy.';
  analysis.signal.tags = Array.isArray(analysis.signal.tags) ? analysis.signal.tags : ['startup'];
  
  // Ensure arrays exist
  analysis.people = Array.isArray(analysis.people) ? analysis.people : [];
  analysis.company = analysis.company || null;
  
  // Validate and clean up company extraction
  if (analysis.company && analysis.company.name) {
    const companyName = analysis.company.name;
    
    // Check for fake/generic company names and filter them out
    const fakeCompanyPatterns = [
      /company$/i,
      /corporation$/i,
      /inc\.?$/i,
      /ltd\.?$/i,
      /llc$/i,
      /^the .+ company$/i,
      /^.+ compiler$/i,
      /^.+ trust$/i,
      /^generic/i,
      /^example/i,
      /^sample/i,
      /^test/i,
      /^fake/i,
      /^placeholder/i
    ];
    
    // If company name seems fake or generic, set to null
    const seemsFake = fakeCompanyPatterns.some(pattern => pattern.test(companyName)) ||
                     companyName.length < 2 ||
                     companyName.toLowerCase() === post.name.toLowerCase();
    
    if (seemsFake) {
      console.log(`🚫 Filtered out potentially fake company: "${companyName}"`);
      analysis.company = null;
    } else {
      console.log(`✅ Extracted real company: "${companyName}"`);
    }
  }
  
  // Validate and clean up people extraction
  if (analysis.people && Array.isArray(analysis.people)) {
    const validPeople = analysis.people.filter((person: any) => {
      if (!person.name || typeof person.name !== 'string') {
        return false;
      }
      
      const name = person.name.trim();
      
      // Check for fake/invalid name patterns
      const fakeNamePatterns = [
        /^[a-z_]+$/i,                    // All lowercase with underscores (usernames)
        /\d/,                           // Contains numbers
        /[_@#$%^&*()]/,                 // Contains special characters
        /^(user|developer|founder|maker|admin|test)$/i, // Generic roles
        /^(john|jane)\s+(doe|smith)$/i, // Common placeholder names
        /^[a-z]+[0-9]+$/i,              // Username patterns like "user123"
        /^@/,                           // Starts with @ (handle)
        /^(redacted|unknown|anonymous)$/i, // Placeholder names
      ];
      
      // Check if name seems fake
      const seemsFake = fakeNamePatterns.some(pattern => pattern.test(name)) ||
                       name.length < 3 ||
                       name.length > 50 ||
                       !name.includes(' ') ||  // Must have space (First Last format)
                       name.split(' ').length < 2; // Must have at least 2 parts
      
      if (seemsFake) {
        console.log(`🚫 Filtered out invalid person name: "${name}"`);
        return false;
      }
      
      // Additional validation: check if it looks like a real name
      const nameParts = name.split(' ');
      const hasValidFormat = nameParts.every((part: string) => 
        part.length >= 2 && 
        /^[A-Za-z]+$/.test(part) && // Only letters
        part[0] === part[0].toUpperCase() // Starts with capital
      );
      
      if (!hasValidFormat) {
        console.log(`🚫 Filtered out improperly formatted name: "${name}"`);
        return false;
      }
      
      console.log(`✅ Extracted real person: "${name}"`);
      return true;
    });
    
    analysis.people = validPeople;
    console.log(`👥 Validated ${validPeople.length} real people from ${analysis.people.length} extracted`);
  }
  
  return analysis;
}

// Basic extraction removed - AI is now REQUIRED

/**
 * Extract social links from post data
 */
function extractSocialLinks(post: PHPost): ExtractedCompany['social_links'] {
  const links: ExtractedCompany['social_links'] = {};

  // Try to extract Twitter from makers
  const twitterMaker = post.makers.find(m => m.twitter_username);
  if (twitterMaker?.twitter_username) {
    links.twitter = twitterMaker.twitter_username;
  }

  return Object.keys(links).length > 0 ? links : undefined;
}

/**
 * Generate "why it matters" text
 */
function generateWhyItMatters(post: PHPost): string {
  const topics = post.topics.map(t => t.name).join(', ');
  const topicsText = topics ? ` in ${topics}` : '';
  
  let text = `Launched on Product Hunt with ${post.votes_count} upvotes and ${post.comments_count} comments${topicsText}.`;
  
  if (post.votes_count >= 500) {
    text += ' Strong traction indicates significant market interest and potential for partnership.';
  } else if (post.votes_count >= 200) {
    text += ' Good early traction shows market validation and growth potential.';
  } else {
    text += ' Early opportunity to connect before they scale.';
  }
  
  return text;
}

/**
 * Generate recommended action text
 */
function generateRecommendedAction(post: PHPost): string {
  const makers = post.makers
    .map(m => m.twitter_username ? `@${m.twitter_username}` : m.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');
  
  if (makers) {
    return `Reach out to ${makers} for partnership or integration opportunities. View launch: ${post.redirect_url}`;
  }
  
  return `Explore partnership opportunities. View launch: ${post.redirect_url}`;
}

/**
 * Legacy function for backward compatibility
 */
export async function refineSignalWithAI(post: PHPost): Promise<{
  headline: string;
  summary: string;
  why_it_matters: string;
  recommended_action: string;
}> {
  const analysis = await analyzeProductHuntLaunch(post);
  return analysis.signal;
}
