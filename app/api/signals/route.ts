import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get all signals
export async function GET() {
  try {
    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .eq('status', 'published')
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching signals:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.message?.includes('relation "signals" does not exist')) {
        console.log('Signals table does not exist yet. Run the database migration scripts.');
        return NextResponse.json([]);
      }
      return NextResponse.json([]);
    }

    return NextResponse.json(signals || []);
  } catch (error: any) {
    console.error('Unexpected error fetching signals:', error);
    return NextResponse.json([]);
  }
}

// Create new signal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data: signal, error } = await supabase
      .from('signals')
      .insert([{
        ...body,
        status: body.status || 'draft',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating signal:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(signal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
