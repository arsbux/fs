/**
 * GitHub Trending Sync API with Parallel AI Processing
 * 
 * Scrapes GitHub trending repos and processes them with AI analysis
 * to extract high-quality signals about new tools, AI models, libraries,
 * and emerging technologies.
 * 
 * Features:
 * - Scrapes trending repos across multiple languages
 * - Parallel AI analysis for all repos
 * - Smart filtering for signal-worthy content
 * - Automatic categorization and scoring
 * - Deduplication and error handling
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  fetchTrendingByLanguages,
  filterSignalWorthyRepos,
  calculateGitHubScore,
  categorizeGitHubRepo,
  extractProjectName,
} from '@/lib/github';
import { analyzeProductHuntLaunch } from '@/lib/ai';
import { findOrCreateCompany, findOrCreatePerson } from '@/lib/profile-merger';

export async function POST() {
  try {
    console.log('🚀 Starting GitHub Trending sync with AI processing...');

    // Check AI availability - REQUIRED
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasValidKey = apiKey && apiKey.length > 20 && !apiKey.includes('your_');

    if (!hasValidKey) {
      const errorMsg = 'AI processing is REQUIRED but API key is not configured';
      console.error('❌', errorMsg);
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          message: 'Please configure ANTHROPIC_API_KEY in .env.local to enable AI processing',
        },
        { status: 400 }
      );
    }

    console.log('✅ AI configured - processing GitHub repos with Claude');

    // Fetch trending repos across multiple languages
    console.log('📡 Fetching trending repos from GitHub...');
    const repos = await fetchTrendingByLanguages(
      ['', 'typescript', 'python', 'rust', 'go', 'javascript', 'java', 'c++'],
      'daily'
    );
    console.log(`✅ Got ${repos.length} trending repos`);

    // Filter for signal-worthy content
    const signalRepos = filterSignalWorthyRepos(repos);
    console.log(`🎯 Filtered to ${signalRepos.length} signal-worthy repos`);

    // Filter out already imported repos
    const newRepos = [];
    let skipped = 0;

    for (const repo of signalRepos) {
      const { data: existing } = await supabase
        .from('signals')
        .select('id')
        .eq('github_repo_url', repo.url)
        .single();

      if (existing) {
        skipped++;
      } else {
        newRepos.push(repo);
      }
    }

    console.log(`📊 Processing ${newRepos.length} new repos (${skipped} already imported)`);

    if (newRepos.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        skipped,
        total: repos.length,
        filtered: signalRepos.length,
        message: 'All signal-worthy repos already imported',
      });
    }

    // Process ALL AI analysis in parallel
    const startTime = Date.now();
    console.log(`🤖 Processing ${newRepos.length} repos in parallel with AI...`);

    const allPromises = newRepos.map(async (repo) => {
      try {
        console.log(`🔍 Analyzing "${repo.author}/${repo.name}"...`);

        // Adapt GitHub repo to PH post format for AI analysis
        const adaptedPost = {
          id: Math.abs(repo.url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
          name: extractProjectName(repo),
          tagline: repo.description,
          description: repo.description,
          website: repo.url,
          redirect_url: repo.url,
          votes_count: repo.todayStars,
          comments_count: 0,
          created_at: new Date().toISOString(),
          topics: [{ name: repo.language || 'general' }, { name: categorizeGitHubRepo(repo) }],
          makers: repo.builtBy?.map((contributor) => ({
            name: contributor.username,
            username: contributor.username,
          })) || [],
        };

        const analysis = await analyzeProductHuntLaunch(adaptedPost);
        return { repo, analysis, success: true as const, error: undefined };
      } catch (error) {
        console.error(`❌ AI analysis failed for "${repo.author}/${repo.name}":`, error);
        return {
          repo,
          analysis: undefined,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false as const,
        };
      }
    });

    const results = await Promise.allSettled(allPromises);

    const aiProcessingTime = Date.now() - startTime;
    console.log(
      `🤖 AI processing completed in ${aiProcessingTime}ms (${Math.round(aiProcessingTime / newRepos.length)}ms per repo avg)`
    );

    // Process results and save to database
    let imported = 0;
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === 'rejected') {
        errors.push(`Processing failed: ${result.reason}`);
        continue;
      }

      const { repo, analysis, success, error } = result.value;

      if (!success || !analysis) {
        errors.push(`${repo.author}/${repo.name}: ${error || 'Analysis failed'}`);
        continue;
      }

      try {
        // Smart company handling with profile merging
        let companyId = null;
        let companyName = extractProjectName(repo);

        if (analysis.company && analysis.company.name) {
          const company = await findOrCreateCompany({
            name: analysis.company.name,
            description: analysis.company.description || repo.description,
            website: analysis.company.website || repo.url,
            tags: analysis.company.tags || [repo.language, categorizeGitHubRepo(repo)],
            social_links: {
              ...analysis.company.social_links,
              github: repo.url,
            },
          });

          if (company) {
            companyId = company.id;
            companyName = company.name;
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
              company_name: companyName,
              tags: person.tags || ['developer', 'open_source'],
              social_links: {
                ...person.social_links,
                github: person.social_links?.github || `https://github.com/${person.name}`,
              },
            });

            if (personId) {
              personIds.push(personId);
            }
          }
        }

        // Also create people for top contributors
        if (repo.builtBy && repo.builtBy.length > 0) {
          for (const contributor of repo.builtBy.slice(0, 3)) {
            const contributorId = await findOrCreatePerson({
              name: contributor.username,
              title: 'Open Source Contributor',
              tags: ['developer', 'open_source', 'github'],
              social_links: {
                github: contributor.url,
              },
            });

            if (contributorId && !personIds.includes(contributorId)) {
              personIds.push(contributorId);
            }
          }
        }

        // Calculate score
        const githubScore = calculateGitHubScore(repo);
        const finalScore = Math.min(Math.round(githubScore + 1), 10);

        // Create signal with AI-refined content
        const { error: signalError } = await supabase.from('signals').insert([
          {
            headline: analysis.signal.headline,
            summary: analysis.signal.summary,
            source_link: repo.url,
            why_it_matters: analysis.signal.why_it_matters,
            recommended_action: analysis.signal.recommended_action,
            score: finalScore,
            credibility: 'high',
            signal_type: categorizeGitHubRepo(repo),
            tags: analysis.signal.tags || [repo.language, categorizeGitHubRepo(repo)],
            company_id: companyId,
            company_name: companyName,
            company_ids: companyId ? [companyId] : [],
            person_ids: personIds,
            status: 'published',
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),

            // GitHub enrichment
            github_repo_url: repo.url,
            github_stars: repo.stars,
            github_forks: repo.forks,
            github_today_stars: repo.todayStars,
            github_language: repo.language,
            github_author: repo.author,
            github_repo_name: repo.name,
          },
        ]);

        if (signalError) {
          console.error(`Error creating signal for "${repo.author}/${repo.name}":`, signalError);
          errors.push(`${repo.author}/${repo.name}: ${signalError.message}`);
        } else {
          imported++;
          console.log(
            `✅ Saved "${repo.author}/${repo.name}" with ${personIds.length} people (score: ${finalScore})`
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error saving "${repo.author}/${repo.name}":`, errorMsg);
        errors.push(`${repo.author}/${repo.name}: ${errorMsg}`);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`🎉 GitHub sync completed in ${totalTime}ms - imported ${imported} signals`);

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: repos.length,
      filtered: signalRepos.length,
      processed: newRepos.length,
      processingTimeMs: totalTime,
      avgTimePerRepo: Math.round(totalTime / newRepos.length),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
