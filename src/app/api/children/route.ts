import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  syncUserToDatabase, 
  getUserByStackAuthId, 
  createChild, 
  getChildrenForUser 
} from '@/lib/database-service';

// Type definitions
export interface Child {
  id: number;
  name: string;
  createdAt: Date;
  createdBy: number;
}

export interface UserChildRelation {
  id: number;
  userId: number;
  childId: number;
  relation: 'Mor' | 'Far' | 'Underviser' | 'Ressourceperson';
  customRelationName?: string; // For Ressourceperson
  isAdministrator: boolean;
  createdAt: Date;
}

export async function GET() {
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

    // Get all children related to this user
    const children = await getChildrenForUser(dbUser.id);

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, relation, customRelationName } = body;

    // Validate input
    if (!name || !relation) {
      return NextResponse.json({ error: 'Name and relation are required' }, { status: 400 });
    }

    if (relation === 'Ressourceperson' && !customRelationName) {
      return NextResponse.json({ error: 'Custom relation name is required for Ressourceperson' }, { status: 400 });
    }

    // Create child with relation
    const result = await createChild(name, dbUser.id, relation, customRelationName);
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
    }

    return NextResponse.json({ 
      child: result.child, 
      relation: result.relation 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
