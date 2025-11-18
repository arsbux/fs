import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test endpoint that always returns success
    return NextResponse.json({
      success: true,
      message: 'People API is working',
      timestamp: new Date().toISOString(),
      data: []
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test endpoint failed',
      timestamp: new Date().toISOString()
    });
  }
}