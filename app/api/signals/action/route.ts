import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// Mark signal action (acted/useful/ignore)
export async function POST(request: Request) {
  try {
    const { signal_id, action, notes } = await request.json();
    
    if (!['acted', 'useful', 'ignore'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: acted, useful, or ignore' },
        { status: 400 }
      );
    }

    const signals = storage.getSignals();
    const signal = signals.find(s => s.id === signal_id);
    
    if (!signal) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }

    // Add user action
    const userAction = {
      user_id: 'default-user', // For MVP
      action,
      timestamp: new Date().toISOString(),
      notes: notes || undefined,
    };

    signal.user_actions = signal.user_actions || [];
    signal.user_actions.push(userAction);

    storage.updateSignal(signal_id, signal);

    // Log for metrics
    console.log(`📊 Signal action: ${action} on "${signal.headline}" (score: ${signal.score})`);

    return NextResponse.json({
      success: true,
      signal_id,
      action,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Get action metrics
export async function GET() {
  try {
    const signals = storage.getSignals();
    
    const metrics = {
      total_signals: signals.length,
      acted: 0,
      useful: 0,
      ignored: 0,
      no_action: 0,
      precision: 0, // (acted + useful) / total with actions
      avg_score_acted: 0,
      avg_score_ignored: 0,
    };

    let actedScores: number[] = [];
    let ignoredScores: number[] = [];

    for (const signal of signals) {
      if (!signal.user_actions || signal.user_actions.length === 0) {
        metrics.no_action++;
        continue;
      }

      const lastAction = signal.user_actions[signal.user_actions.length - 1];
      
      if (lastAction.action === 'acted') {
        metrics.acted++;
        actedScores.push(signal.score);
      } else if (lastAction.action === 'useful') {
        metrics.useful++;
        actedScores.push(signal.score);
      } else if (lastAction.action === 'ignore') {
        metrics.ignored++;
        ignoredScores.push(signal.score);
      }
    }

    const totalWithActions = metrics.acted + metrics.useful + metrics.ignored;
    if (totalWithActions > 0) {
      metrics.precision = Math.round(
        ((metrics.acted + metrics.useful) / totalWithActions) * 100
      );
    }

    if (actedScores.length > 0) {
      metrics.avg_score_acted = Math.round(
        (actedScores.reduce((sum, s) => sum + s, 0) / actedScores.length) * 10
      ) / 10;
    }

    if (ignoredScores.length > 0) {
      metrics.avg_score_ignored = Math.round(
        (ignoredScores.reduce((sum, s) => sum + s, 0) / ignoredScores.length) * 10
      ) / 10;
    }

    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
