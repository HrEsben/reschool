import { NextRequest, NextResponse } from 'next/server';
import { addSlugColumn, runMigration } from '@/lib/migrate';

export async function POST(request: NextRequest) {
  try {
    // Check if there's a specific migration requested
    const body = await request.json().catch(() => ({}));
    const { migration } = body;

    if (migration === 'smiley_type') {
      await runMigration('add_smiley_type_column.sql');
      return NextResponse.json({ success: true, message: 'Smiley type column added successfully' });
    } else {
      // Default migration
      await addSlugColumn();
      return NextResponse.json({ success: true, message: 'Slug column added successfully' });
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to run migration' 
    }, { status: 500 });
  }
}
