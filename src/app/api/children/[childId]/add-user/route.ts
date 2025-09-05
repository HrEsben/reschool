import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  syncUserToDatabase, 
  getUserByStackAuthId, 
  addUserToChild, 
  getChildById 
} from '@/lib/database-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    let dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      dbUser = await syncUserToDatabase(user);
      if (!dbUser) {
        return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
      }
    }

    const resolvedParams = await params;
    const childId = parseInt(resolvedParams.childId);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    const body = await request.json();
    const { relation, customRelationName } = body;

    // Validate input
    if (!relation) {
      return NextResponse.json({ error: 'Relation is required' }, { status: 400 });
    }

    if (relation === 'Ressourceperson' && !customRelationName) {
      return NextResponse.json({ 
        error: 'Custom relation name is required for Ressourceperson' 
      }, { status: 400 });
    }

    // Check if child exists
    const child = await getChildById(childId);
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Add user to child
    const newRelation = await addUserToChild(dbUser.id, childId, relation, customRelationName);
    
    if (!newRelation) {
      return NextResponse.json({ 
        error: 'Failed to add user to child. You may already have a relation to this child.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      relation: newRelation,
      message: 'Successfully added to child\'s relations'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding user to child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
