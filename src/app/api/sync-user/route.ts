import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { ensureUserInDatabase } from '@/lib/user-sync';

export async function POST() {
  try {
    // Get current user from Stack Auth
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure user exists in our database
    const dbUser = await ensureUserInDatabase();
    
    if (!dbUser) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    // Generate user slug
    const generateSlug = (text: string) => {
      return text.toLowerCase()
        .replace(/[æå]/g, 'a')
        .replace(/[ø]/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    const userSlug = dbUser.displayName 
      ? generateSlug(dbUser.displayName)
      : generateSlug(dbUser.email.split('@')[0]);

    return NextResponse.json({ 
      success: true, 
      userSlug,
      user: dbUser
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
