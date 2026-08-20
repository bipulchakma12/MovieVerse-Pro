import { NextResponse } from 'next/server';
import { resetAnalyticsStore } from '../store';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    resetAnalyticsStore();
    return NextResponse.json({ success: true, message: 'Analytics reset to zero' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to reset analytics' }, { status: 500 });
  }
}
