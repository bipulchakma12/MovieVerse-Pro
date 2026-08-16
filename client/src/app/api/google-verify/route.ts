import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('google-site-verification: googled38457b6a5a09cd3.html', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
