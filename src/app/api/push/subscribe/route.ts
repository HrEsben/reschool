import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const pool = getPool();
    
    // Check if subscription already exists
    const existingSubscription = await pool.query(
      'SELECT id FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [user.id, endpoint]
    );

    if (existingSubscription.rows.length > 0) {
      return NextResponse.json(
        { message: 'Subscription already exists' },
        { status: 200 }
      );
    }

    // Insert new subscription
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [user.id, endpoint, keys.p256dh, keys.auth]
    );

    return NextResponse.json(
      { message: 'Subscription saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    
    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [user.id, endpoint]
    );

    return NextResponse.json(
      { message: 'Subscription removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
