import { NextRequest, NextResponse } from 'next/server';
import {
  getUserAuthStats,
  toggleBlockUserInStore,
  deleteUserInStore,
  changeUserRoleInStore,
  resetUserStore,
} from '../../auth/userStore';

export const dynamic = 'force-dynamic';

// GET all registered users and signup/login statistics
export async function GET() {
  try {
    const stats = getUserAuthStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST actions on user (block, unblock, role change, reset)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, role } = body;

    if (action === 'reset_users') {
      resetUserStore();
      return NextResponse.json({ success: true, message: 'All user data reset to 0' });
    }

    if (action === 'toggle_block' && userId) {
      const updated = toggleBlockUserInStore(userId);
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'change_role' && userId && role) {
      const updated = changeUserRoleInStore(userId, role);
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE a user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const deleted = deleteUserInStore(userId);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete user' }, { status: 500 });
  }
}
