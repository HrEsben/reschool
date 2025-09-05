import { NextRequest, NextResponse } from 'next/server';
import { addSlugColumn } from '@/lib/migrate';

export async function POST(request: NextRequest) {
  try {
    await addSlugColumn();
    return NextResponse.json({ success: true, message: 'Slug column added successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to run migration' 
    }, { status: 500 });
  }
}
