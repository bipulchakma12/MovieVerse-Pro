import { NextRequest, NextResponse } from 'next/server';
import { registerUserInStore } from '../userStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, device, browser } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const user = registerUserInStore({
      name: name || email.split('@')[0],
      email,
      device: device || 'Desktop',
      browser: browser || 'Chrome',
    });

    const token = 'mv_auth_' + Math.random().toString(36).substring(2, 12);

    return NextResponse.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        accessToken: token,
      },
      tokens: { accessToken: token },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Registration error' }, { status: 500 });
  }
}
