import { NextResponse } from 'next/server';
import { syncAllJobs } from '@/lib/jobs';

export async function POST() {
  try {
    console.log('Starting jobs sync...');
    
    const result = await syncAllJobs();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.jobsFound} jobs and created ${result.signalsCreated} hiring signals`,
        jobsFound: result.jobsFound,
        signalsCreated: result.signalsCreated,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Job sync failed',
        error: 'Unknown error occurred'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Jobs sync API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Job sync failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Jobs sync endpoint',
    endpoints: {
      sync: 'POST /api/jobs/sync - Sync all job sources and create hiring signals'
    },
    sources: [
      'YC Jobs',
      'Wellfound (AngelList)',
      'RemoteOK (YC tagged)'
    ]
  });
}