import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// Clear all Product Hunt signals (for re-syncing with AI)
export async function POST() {
  try {
    const signals = storage.getSignals();
    
    // Keep only non-Product Hunt signals
    const nonPHSignals = signals.filter(s => !s.ph_post_id);
    const phCount = signals.length - nonPHSignals.length;
    
    // Write back only non-PH signals
    const fs = require('fs');
    const path = require('path');
    const SIGNALS_FILE = path.join(process.cwd(), 'data', 'signals.json');
    fs.writeFileSync(SIGNALS_FILE, JSON.stringify(nonPHSignals, null, 2));
    
    return NextResponse.json({
      success: true,
      cleared: phCount,
      message: `Cleared ${phCount} Product Hunt signals`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
