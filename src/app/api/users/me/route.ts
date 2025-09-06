import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId } from '@/lib/database-service';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
