import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId, getProgressDataForChild, getUserChildRelation } from '@/lib/database-service';
import { withUserContext } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    // Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate childId
    const childId = parseInt(params.childId);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Check if user has access to this child
    const userRelation = await getUserChildRelation(dbUser.id, childId);
    if (!userRelation) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get progress data for the child using RLS-protected queries
    const progressData = await withUserContext(user.id, async (query) => {
      return await getProgressDataForChildWithRLS(childId, query);
    });

    if (!progressData) {
      // Return empty structure instead of null for consistency
      return NextResponse.json({
        childId,
        plans: [],
        totalEntries: 0
      });
    }

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}

// Simplified function that relies on RLS for access control
async function getProgressDataForChildWithRLS(
  childId: number, 
  query: (text: string, params?: unknown[]) => Promise<any>
) {
  try {
    // Since RLS is enabled, we can directly query without manual access control
    // Get all indsatstrappe plans for this child (RLS will filter based on access)
    const plansResult = await query(`
      SELECT 
        id, child_id, created_by, title, description, start_date, target_date,
        is_active, is_completed, is_public, created_at, updated_at
      FROM indsatstrappe 
      WHERE child_id = $1
      ORDER BY created_at DESC
    `, [childId]);
    
    if (plansResult.rows.length === 0) {
      return null;
    }

    // Get all tool entries for this child (RLS will filter based on access)
    const entriesResult = await query(`
      SELECT 
        'barometer' as tool_type, 
        be.id, be.barometer_id as tool_id, be.recorded_by, be.entry_date,
        be.rating, be.comment, be.created_at, be.updated_at,
        b.topic, b.display_type, b.smiley_type,
        u.display_name as recorded_by_name
      FROM barometer_entries be
      JOIN barometers b ON be.barometer_id = b.id
      LEFT JOIN users u ON be.recorded_by = u.id
      WHERE b.child_id = $1
      
      UNION ALL
      
      SELECT 
        'dagens-smiley' as tool_type,
        dse.id, dse.smiley_id as tool_id, dse.recorded_by, dse.entry_date,
        NULL as rating, dse.reasoning as comment, dse.created_at, dse.updated_at,
        ds.topic, NULL as display_type, NULL as smiley_type,
        u.display_name as recorded_by_name
      FROM dagens_smiley_entries dse
      JOIN dagens_smiley ds ON dse.smiley_id = ds.id
      LEFT JOIN users u ON dse.recorded_by = u.id
      WHERE ds.child_id = $1
      
      UNION ALL
      
      SELECT 
        'sengetider' as tool_type,
        se.id, se.sengetider_id as tool_id, se.recorded_by, se.entry_date,
        NULL as rating, se.notes as comment, se.created_at, se.updated_at,
        s.description as topic, NULL as display_type, NULL as smiley_type,
        u.display_name as recorded_by_name
      FROM sengetider_entries se
      JOIN sengetider s ON se.sengetider_id = s.id
      LEFT JOIN users u ON se.recorded_by = u.id
      WHERE s.child_id = $1
      
      ORDER BY created_at DESC
    `, [childId]);

    return {
      childId,
      plans: plansResult.rows,
      entries: entriesResult.rows,
      totalEntries: entriesResult.rows.length
    };
  } catch (error) {
    console.error('Error fetching RLS-protected progress data:', error);
    return null;
  }
}