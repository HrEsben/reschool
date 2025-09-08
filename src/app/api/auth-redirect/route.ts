import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '../../../stack';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await stackServerApp.getUser();
    
    if (user) {
      // Redirect to dashboard if authenticated
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Redirect to home if not authenticated
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch {
    // Fallback to home page
    return NextResponse.redirect(new URL('/', request.url));
  }
}
