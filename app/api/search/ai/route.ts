import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || query.trim().length < 3) {
      return NextResponse.json({
        success: false,
        message: 'Please provide a search query with at least 3 characters.',
      });
    }

    console.log('🔍 AI Search Query:', query);

    // Fetch ALL data from database
    const [signalsRes, companiesRes, peopleRes] = await Promise.all([
      supabase.from('signals').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('people').select('*').order('created_at', { ascending: false }).limit(500),
    ]);

    const signals = signalsRes.data || [];
    const companies = companiesRes.data || [];
    const people = peopleRes.data || [];

    console.log(`📊 Database: ${signals.length} signals, ${companies.length} companies, ${people.length} people`);

    // Use AI to analyze the query and find relevant results
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey.length < 20) {
      console.log('⚠️ AI not configured, using basic search');
      return basicSearch(query, signals, companies, people);
    }

    // Prepare comprehensive data for AI analysis - sanitize strings
    const sanitize = (str: any) => {
      if (!str) return '';
      return String(str).replace(/[\n\r\t]/g, ' ').substring(0, 500);
    };

    const signalsSummary = signals.slice(0, 100).map(s => ({
      id: s.id,
      headline: sanitize(s.headline),
      summary: sanitize(s.summary),
      company: sanitize(s.company_name),
      tags: Array.isArray(s.tags) ? s.tags.slice(0, 5) : [],
      score: s.score,
    }));

    const companiesSummary = companies.slice(0, 100).map(c => ({
      id: c.id,
      name: sanitize(c.name),
      description: sanitize(c.description),
      tags: Array.isArray(c.tags) ? c.tags.slice(0, 5) : [],
    }));

    const peopleSummary = people.slice(0, 100).map(p => ({
      id: p.id,
      name: sanitize(p.name),
      title: sanitize(p.title),
      company: sanitize(p.company_name),
      tags: Array.isArray(p.tags) ? p.tags.slice(0, 5) : [],
    }));

    const dataString = JSON.stringify({ 
      signals: signalsSummary, 
      companies: companiesSummary, 
      people: peopleSummary 
    });

    const prompt = `You are a helpful search assistant helping users discover opportunities in the startup ecosystem.

USER IS LOOKING FOR: "${query}"

AVAILABLE DATA:
${dataString}

YOUR TASK:
Analyze what the user wants and provide a helpful, conversational response. Talk directly to the user like a knowledgeable assistant.

IMPORTANT RULES:
- DO NOT mention "database", "data", or technical terms
- Speak naturally as if talking to the user
- Focus on what you FOUND, not how you searched
- Be specific - mention actual company names, roles, or opportunities
- If searching for "companies hiring", tell them which companies are hiring
- If searching for "AI startups", tell them about the AI companies you found
- Make it actionable and useful

RETURN ONLY THIS JSON (no other text):
{
  "summary": "A natural, conversational 2-3 sentence response directly addressing what the user asked for. Mention specific companies, people, or opportunities you found. Example: 'I found 12 companies actively hiring right now, including Stripe, Airbnb, and several YC-backed startups. Most are looking for engineering and product roles.'",
  "keyFindings": ["Specific finding 1 with names/numbers", "Specific finding 2", "Specific finding 3"],
  "relevantSignals": ["id1", "id2"],
  "relevantCompanies": ["id1", "id2"],
  "relevantPeople": ["id1", "id2"],
  "hasResults": true,
  "suggestions": ["Try: specific alternative 1", "Try: specific alternative 2"]
}`;

    console.log('🤖 Sending to AI...');

    // Retry logic for rate limiting
    let response;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        break;
      }

      // Handle rate limiting with retry
      if (response.status === 429 && retries < maxRetries) {
        console.log(`⏳ Rate limited (429), waiting ${(retries + 1) * 2}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, (retries + 1) * 2000));
        retries++;
        continue;
      }

      // Handle service overload - don't retry, fall back immediately
      if (response.status === 529) {
        console.log('⚠️ AI service overloaded (529), falling back to basic search');
        return basicSearch(query, signals, companies, people);
      }

      console.error('❌ AI API error:', response.status);
      return basicSearch(query, signals, companies, people);
    }

    if (!response) {
      console.error('❌ No response from AI API');
      return basicSearch(query, signals, companies, people);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    console.log('📝 AI Response preview:', content.substring(0, 200));
    
    // Try multiple JSON extraction methods
    let aiResponse;
    
    // Method 1: Look for JSON in code blocks
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      // Method 2: Look for any JSON object
      jsonMatch = content.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      console.error('❌ No JSON found in AI response');
      console.error('Full response:', content);
      return basicSearch(query, signals, companies, people);
    }

    // Clean the JSON string
    let jsonString = jsonMatch[1] || jsonMatch[0];
    jsonString = jsonString
      .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control chars
      .replace(/\n/g, ' ')                // Remove newlines
      .replace(/\r/g, ' ')                // Remove carriage returns
      .replace(/\t/g, ' ')                // Remove tabs
      .replace(/\s+/g, ' ')               // Normalize whitespace
      .trim();
    
    try {
      aiResponse = JSON.parse(jsonString);
      console.log('✅ AI Analysis complete');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonString.substring(0, 300));
      return basicSearch(query, signals, companies, people);
    }
    
    // Validate AI response structure
    if (!aiResponse.summary || typeof aiResponse.summary !== 'string') {
      console.error('❌ Invalid AI response structure');
      return basicSearch(query, signals, companies, people);
    }

    // Get full data for matched IDs
    const matchedSignals = signals.filter(s => 
      Array.isArray(aiResponse.relevantSignals) && aiResponse.relevantSignals.includes(s.id)
    );
    const matchedCompanies = companies.filter(c => 
      Array.isArray(aiResponse.relevantCompanies) && aiResponse.relevantCompanies.includes(c.id)
    );
    const matchedPeople = people.filter(p => 
      Array.isArray(aiResponse.relevantPeople) && aiResponse.relevantPeople.includes(p.id)
    );

    console.log(`📋 Results: ${matchedSignals.length} signals, ${matchedCompanies.length} companies, ${matchedPeople.length} people`);

    return NextResponse.json({
      success: true,
      aiPowered: true,
      query,
      summary: aiResponse.summary,
      keyFindings: Array.isArray(aiResponse.keyFindings) ? aiResponse.keyFindings : [],
      hasResults: matchedSignals.length > 0 || matchedCompanies.length > 0 || matchedPeople.length > 0,
      results: {
        signals: matchedSignals,
        companies: matchedCompanies,
        people: matchedPeople,
      },
      suggestions: Array.isArray(aiResponse.suggestions) ? aiResponse.suggestions : [],
    });

  } catch (error) {
    console.error('❌ AI search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

// Fallback basic search with better results
function basicSearch(query: string, signals: any[], companies: any[], people: any[]) {
  console.log('🔍 Using basic keyword search');
  const q = query.toLowerCase();
  const keywords = q.split(' ').filter(k => k.length > 2);
  
  // Score-based matching for better results
  const scoreItem = (item: any, fields: string[]) => {
    let score = 0;
    const text = fields.map(f => item[f]).join(' ').toLowerCase();
    
    // Exact phrase match
    if (text.includes(q)) score += 10;
    
    // Individual keyword matches
    keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 3;
    });
    
    // Tag matches (higher weight)
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag: string) => {
        if (tag.toLowerCase().includes(q)) score += 5;
        keywords.forEach(keyword => {
          if (tag.toLowerCase().includes(keyword)) score += 2;
        });
      });
    }
    
    return score;
  };
  
  const matchedSignals = signals
    .map(s => ({ ...s, _score: scoreItem(s, ['headline', 'summary', 'company_name']) }))
    .filter(s => s._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 15);

  const matchedCompanies = companies
    .map(c => ({ ...c, _score: scoreItem(c, ['name', 'description']) }))
    .filter(c => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 15);

  const matchedPeople = people
    .map(p => ({ ...p, _score: scoreItem(p, ['name', 'title', 'company_name', 'bio']) }))
    .filter(p => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 15);

  const hasResults = matchedSignals.length > 0 || matchedCompanies.length > 0 || matchedPeople.length > 0;
  
  const totalResults = matchedSignals.length + matchedCompanies.length + matchedPeople.length;

  return NextResponse.json({
    success: true,
    aiPowered: false,
    query,
    summary: hasResults 
      ? `Found ${totalResults} results matching "${query}". Showing ${matchedSignals.length} signals, ${matchedCompanies.length} companies, and ${matchedPeople.length} people. Results are ranked by relevance based on keyword matching.`
      : `No results found for "${query}". The search looked through ${signals.length} signals, ${companies.length} companies, and ${people.length} people but couldn't find any matches. Try using different keywords or browse by category.`,
    keyFindings: hasResults ? [
      `${matchedSignals.length} relevant signals found`,
      `${matchedCompanies.length} matching companies`,
      `${matchedPeople.length} related people`,
    ] : [],
    hasResults,
    results: {
      signals: matchedSignals,
      companies: matchedCompanies,
      people: matchedPeople,
    },
    suggestions: hasResults ? [] : [
      'Try broader search terms',
      'Search for company names like "Stripe" or "Airbnb"',
      'Look for technologies like "AI", "SaaS", or "fintech"',
      'Search for roles like "founder" or "CEO"',
    ],
  });
}
