import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  createBarometer, 
  getBarometersForChild, 
  getUserByStackAuthId,
  isUserAdministratorForChild 
} from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId: childIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const childId = parseInt(childIdParam);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    const barometers = await getBarometersForChild(childId);
    return NextResponse.json({ barometers });

  } catch (error) {
    console.error('Error fetching barometers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId: childIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const childId = parseInt(childIdParam);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Check if user is admin for this child
    const isAdmin = await isUserAdministratorForChild(dbUser.id, childId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can create barometers' }, { status: 403 });
    }

    const body = await request.json();
    const { topic, scaleMin = 1, scaleMax = 5, displayType = 'numbers' } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (scaleMin >= scaleMax || scaleMin < 1 || scaleMax > 100) {
      return NextResponse.json({ error: 'Invalid scale range' }, { status: 400 });
    }

    const validDisplayTypes = ['numbers', 'smileys'];
    if (!validDisplayTypes.includes(displayType)) {
      return NextResponse.json({ error: 'Invalid display type' }, { status: 400 });
    }

    const barometer = await createBarometer(childId, dbUser.id, topic.trim(), scaleMin, scaleMax, displayType);
    
    if (!barometer) {
      return NextResponse.json({ error: 'Failed to create barometer' }, { status: 500 });
    }

    return NextResponse.json({ barometer }, { status: 201 });

  } catch (error) {
    console.error('Error creating barometer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
