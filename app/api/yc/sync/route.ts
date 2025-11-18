/**
 * Y Combinator Sync API with AI Processing
 * 
 * Fetches YC companies and processes them with AI analysis
 * to extract signals about new startups, funding updates, and market trends.
 * 
 * Features:
 * - YC directory scraping for latest companies
 * - AI analysis for all companies
 * - Smart filtering for signal-worthy content
 * - Automatic categorization and scoring
 * - Deduplication and error handling
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  fetchYCCompanies,
  filterSignalWorthyCompanies,
  calculateYCScore,
  categorizeYCCompany,
  generateYCHeadline,
  generateYCWhyItMatters,
  generateYCAction,
  extractYCTags,
} from '@/lib/yc';
import { analyzeProductHuntLaunch } from '@/lib/ai';
import { findOrCreateCompany, findOrCreatePerson } from '@/lib/profile-merger';

export async function POST() {
  try {
    console.log('🚀 Starting YC sync with AI processing...');

    // Fetch companies from YC directory
    console.log('📡 Fetching companies from YC directory...');
    const companies = await fetchYCCompanies();
    console.log(`✅ Got ${companies.length} companies`);

    if (companies.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No YC companies found',
        message: 'YC directory returned no companies. Please check API availability.',
        imported: 0,
        skipped: 0,
        total: 0,
      });
    }

    // Filter for signal-worthy content
    const signalCompanies = filterSignalWorthyCompanies(companies);
    console.log(`🎯 Filtered to ${signalCompanies.length} signal-worthy companies`);

    // Filter out already imported companies
    const newCompanies = [];
    let skipped = 0;

    for (const company of signalCompanies) {
      const { data: existing } = await supabase
        .from('signals')
        .select('id')
        .eq('yc_company_id', company.id)
        .single();

      if (existing) {
        skipped++;
      } else {
        newCompanies.push(company);
      }
    }

    console.log(`📊 Processing ${newCompanies.length} new companies (${skipped} already imported)`);

    if (newCompanies.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        skipped,
        total: companies.length,
        filtered: signalCompanies.length,
        message: 'All signal-worthy companies already imported',
      });
    }

    // Check AI availability
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasValidKey = apiKey && apiKey.length > 20 && !apiKey.includes('your_');

    if (!hasValidKey) {
      console.log('⚠️ AI not configured, using basic processing...');
    } else {
      console.log('✅ AI configured - processing YC companies with Claude');
    }

    // Process companies (with or without AI)
    const startTime = Date.now();
    console.log(`🤖 Processing ${newCompanies.length} companies...`);

    let imported = 0;
    const errors: string[] = [];

    for (const company of newCompanies) {
      try {
        console.log(`🔍 Processing "${company.name}" (${company.batch})...`);

        let analysis = null;

        // Try AI analysis if available
        if (hasValidKey) {
          try {
            // Adapt YC company to PH post format for AI analysis
            const adaptedPost = {
              id: Math.abs(company.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
              name: company.name,
              tagline: company.description,
              description: company.description,
              website: company.website || company.url,
              redirect_url: company.url,
              votes_count: calculateYCScore(company) * 10, // Simulate engagement
              comments_count: company.teamSize || 0,
              created_at: company.launchDate?.toISOString() || new Date().toISOString(),
              topics: company.tags.map(tag => ({ name: tag })),
              makers: company.founders.map(founder => ({
                name: founder.name,
                username: founder.name.toLowerCase().replace(/\s+/g, ''),
              })),
            };

            analysis = await analyzeProductHuntLaunch(adaptedPost);
          } catch (aiError) {
            console.error(`AI analysis failed for "${company.name}":`, aiError);
          }
        }

        // Smart company handling with profile merging
        let companyId = null;
        let companyName = company.name;

        if (analysis?.company && analysis.company.name) {
          const companyData = await findOrCreateCompany({
            name: analysis.company.name,
            description: analysis.company.description || company.description,
            website: analysis.company.website || company.website || company.url,
            tags: analysis.company.tags || extractYCTags(company),
            social_links: analysis.company.social_links || {},
          });

          if (companyData) {
            companyId = companyData.id;
            companyName = companyData.name;
          }
        } else {
          // Fallback to basic company creation
          const companyData = await findOrCreateCompany({
            name: company.name,
            description: company.description,
            website: company.website || company.url,
            tags: extractYCTags(company),
            social_links: {},
          });

          if (companyData) {
            companyId = companyData.id;
            companyName = companyData.name;
          }
        }

        // Smart people handling with profile merging
        const personIds: string[] = [];
        const peopleToProcess = analysis?.people || company.founders.map(founder => ({
          name: founder.name,
          title: founder.title,
          tags: ['founder', 'yc_founder'],
          social_links: {
            linkedin: founder.linkedin,
            twitter: founder.twitter,
          },
        }));

        for (const person of peopleToProcess) {
          const socialLinks: Record<string, string> = {};
          if (person.social_links) {
            Object.entries(person.social_links).forEach(([key, value]) => {
              if (value) socialLinks[key] = value;
            });
          }

          const personId = await findOrCreatePerson({
            name: person.name,
            title: person.title || 'Founder',
            company_id: companyId || undefined,
            company_name: companyName,
            tags: person.tags || ['founder', 'yc_founder'],
            social_links: socialLinks,
          });

          if (personId) {
            personIds.push(personId);
          }
        }

        // Calculate score
        const ycScore = calculateYCScore(company);
        const finalScore = Math.min(Math.round(ycScore + 1), 10);

        // Generate signal content (use AI if available, otherwise use templates)
        const headline = analysis?.signal?.headline || generateYCHeadline(company);
        const summary = analysis?.signal?.summary || company.description;
        const whyItMatters = analysis?.signal?.why_it_matters || generateYCWhyItMatters(company);
        const recommendedAction = analysis?.signal?.recommended_action || generateYCAction(company);
        const tags = analysis?.signal?.tags || extractYCTags(company);

        // Create signal
        const { error: signalError } = await supabase.from('signals').insert([
          {
            headline,
            summary,
            source_link: company.url,
            why_it_matters: whyItMatters,
            recommended_action: recommendedAction,
            score: finalScore,
            credibility: 'high', // YC companies are high credibility
            signal_type: categorizeYCCompany(company),
            tags,
            company_id: companyId,
            company_name: companyName,
            company_ids: companyId ? [companyId] : [],
            person_ids: personIds,
            status: 'published',
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),

            // YC enrichment
            yc_company_id: company.id,
            yc_batch: company.batch,
            yc_status: company.status,
            yc_vertical: company.vertical,
            yc_team_size: company.teamSize,
            yc_is_hiring: company.isHiring,
            yc_funding_stage: company.fundingStage,
            yc_location: company.location,
          },
        ]);

        if (signalError) {
          console.error(`Error creating signal for "${company.name}":`, signalError);
          errors.push(`${company.name}: ${signalError.message}`);
        } else {
          imported++;
          console.log(
            `✅ Saved "${company.name}" (${company.batch}) with ${personIds.length} founders (score: ${finalScore})`
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error processing "${company.name}":`, errorMsg);
        errors.push(`${company.name}: ${errorMsg}`);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`🎉 YC sync completed in ${totalTime}ms - imported ${imported} signals`);

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: companies.length,
      filtered: signalCompanies.length,
      processed: newCompanies.length,
      processingTimeMs: totalTime,
      avgTimePerCompany: Math.round(totalTime / newCompanies.length),
      aiEnabled: hasValidKey,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('YC sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}