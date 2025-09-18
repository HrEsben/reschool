import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  createSengetiderEntry, 
  getSengetiderEntries,
  getUserByStackAuthId,
  getSengetiderById,
  getUsersForChild,
  getChildById
} from '@/lib/database-service';
import { notifyChildSubmission } from '@/lib/novu-eu';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sengetiderId: string }> }
) {
  try {
    const { sengetiderId: sengetiderIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sengetiderId = parseInt(sengetiderIdParam);
    if (isNaN(sengetiderId)) {
      return NextResponse.json({ error: 'Invalid sengetider ID' }, { status: 400 });
    }

    // Check if user has access to this sengetider
    const sengetiderTool = await getSengetiderById(sengetiderId);
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }
    
    // Additional access check would go here (check if user has access to the child)
    // For now, we'll assume if the sengetider exists, the user can access it

    const entries = await getSengetiderEntries(sengetiderId);
    return NextResponse.json({ entries });

  } catch (error) {
    console.error('Error fetching sengetider entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sengetiderId: string }> }
) {
  try {
    const { sengetiderId: sengetiderIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sengetiderId = parseInt(sengetiderIdParam);
    if (isNaN(sengetiderId)) {
      return NextResponse.json({ error: 'Invalid sengetider ID' }, { status: 400 });
    }

    // Check if user has access to this sengetider
    const sengetiderTool = await getSengetiderById(sengetiderId);
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }
    
    // Additional access check would go here (check if user has access to the child)
    // For now, we'll assume if the sengetider exists, the user can access it

    const body = await request.json();
    const { entryDate, puttetid, sovKl, vaagnede, notes } = body;

    // Validate required fields - at least puttetid should be provided
    if (!entryDate || !puttetid) {
      return NextResponse.json({ error: 'Entry date and puttetid (bedtime) are required' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Helper function to validate and format time
    const validateAndFormatTime = (time: string, fieldName: string) => {
      if (!time) return null;
      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(time)) {
        throw new Error(`Invalid time format for ${fieldName}. Use HH:MM or HH:MM:SS`);
      }
      // Convert HH:MM to HH:MM:SS if needed
      return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
    };

    try {
      const formattedPuttetid = validateAndFormatTime(puttetid, 'puttetid');
      const formattedSovKl = validateAndFormatTime(sovKl, 'sov kl');
      const formattedVaagnede = validateAndFormatTime(vaagnede, 'vågnede');

      const entry = await createSengetiderEntry(
        sengetiderId,
        dbUser.id,
        entryDate,
        formattedPuttetid,
        formattedSovKl,
        formattedVaagnede,
        notes
      );

      if (!entry) {
        return NextResponse.json({ error: 'Failed to create sengetider entry' }, { status: 500 });
      }

      // Send notifications to all users connected to this child
      try {
        const child = await getChildById(sengetiderTool.childId);
        const childUsers = await getUsersForChild(sengetiderTool.childId);
        
        if (child && childUsers.length > 0) {
          // Get subscriber IDs (exclude the user who made the submission)
          const subscriberIds = childUsers
            .filter(user => user.id !== dbUser.id)
            .map(user => user.stackAuthId)
            .filter(Boolean);

          if (subscriberIds.length > 0) {
            await notifyChildSubmission(
              subscriberIds,
              child.name,
              'Sengetider',
              'sengetider',
              dbUser.displayName || 'En bruger',
              {
                entry_date: entryDate,
                puttetid: formattedPuttetid,
                sov_kl: formattedSovKl,
                vaagnede: formattedVaagnede,
                notes: notes || null
              }
            );
          }
        }
      } catch (notificationError) {
        console.error('Error sending sengetider entry notifications:', notificationError);
        // Don't fail the API call if notifications fail
      }

      return NextResponse.json({ entry }, { status: 201 });

    } catch (timeError) {
      return NextResponse.json({ error: (timeError as Error).message }, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating sengetider entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
