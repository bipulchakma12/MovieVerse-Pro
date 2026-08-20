import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '../store';

// Dynamic route so responses are never cached statically
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = getAnalyticsSummary();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
