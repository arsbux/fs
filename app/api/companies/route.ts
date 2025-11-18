import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get all companies
export async function GET() {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(companies || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create new company
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data: company, error } = await supabase
      .from('companies')
      .insert([{
        name: body.name,
        description: body.description,
        website: body.website,
        industry: body.industry,
        location: body.location,
        employee_count: body.employee_count,
        founded_year: body.founded_year,
        tags: body.tags || [],
        social_links: body.social_links || {},
        logo_url: body.logo_url,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}