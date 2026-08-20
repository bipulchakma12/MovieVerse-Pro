import { NextRequest, NextResponse } from 'next/server';
import { trackVisitorEvent } from '../store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, path, device, browser, action, clientHistory } = body;

    const country = req.headers.get('x-vercel-ip-country') || 'Live Visitor';

    trackVisitorEvent({
      visitorId: visitorId || 'anonymous_' + Math.random().toString(36).substring(2, 9),
      path: path || '/',
      device: device || 'Desktop',
      browser: browser || 'Chrome',
      country,
      action,
      clientHistory,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to record visit' }, { status: 500 });
  }
}
