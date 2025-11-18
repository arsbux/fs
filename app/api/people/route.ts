import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching people:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.message?.includes('relation "people" does not exist')) {
        console.log('People table does not exist yet. Run the database migration scripts.');
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('people')
      .insert([{
        name: body.name,
        title: body.title,
        bio: body.bio,
        email: body.email,
        avatar_url: body.avatar_url,
        company_id: body.company_id,
        company_name: body.company_name,
        tags: body.tags || [],
        social_links: body.social_links || {},
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
