import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { demoteUserFromAdmin } from '@/lib/database-service';

interface ChildUser {
  id: string;
  stackAuthId: string;
  isAdministrator: boolean;
}

interface ChildData {
  users: ChildUser[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string; userId: string }> }
) {
  try {
    const { childId, userId } = await params;
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's relationship to this child to check admin status
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/children/${childId}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 403 });
    }
    
    const childData: ChildData = await response.json();
    const currentUserData = childData.users.find((u: ChildUser) => u.stackAuthId === user.id);
    
    if (!currentUserData?.isAdministrator) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Prevent demoting the last administrator
    const adminCount = childData.users.filter((u: ChildUser) => u.isAdministrator).length;
    const targetUser = childData.users.find((u: ChildUser) => u.id === userId);
    
    if (targetUser?.isAdministrator && adminCount <= 1) {
      return NextResponse.json({ 
        error: 'Cannot demote the last administrator' 
      }, { status: 400 });
    }

    await demoteUserFromAdmin(childId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error demoting user from admin:', error);
    return NextResponse.json({ 
      error: 'Failed to demote user from admin' 
    }, { status: 500 });
  }
}
