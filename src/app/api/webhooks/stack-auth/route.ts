import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import { webhookRateLimit } from '@/lib/rate-limit';

// Webhook endpoint for Stack Auth user events
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = webhookRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
          }
        }
      );
    }
    
    // Verify webhook signature for security
    const signature = request.headers.get('x-stack-signature');
    const webhookSecret = process.env.STACK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('STACK_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const rawBody = await request.text();
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = JSON.parse(rawBody);
    const { event_type, user } = body;

    switch (event_type) {
      case 'user.created':
        // Create user in local database
        await query(
          `INSERT INTO users (stack_auth_id, email, display_name, profile_image_url, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (stack_auth_id) DO NOTHING`,
          [user.id, user.primary_email, user.display_name, user.profile_image_url]
        );
        break;

      case 'user.updated':
        // Update user in local database
        await query(
          `UPDATE users 
           SET email = $2, display_name = $3, profile_image_url = $4, updated_at = NOW()
           WHERE stack_auth_id = $1`,
          [user.id, user.primary_email, user.display_name, user.profile_image_url]
        );
        break;

      case 'user.deleted':
        // Delete user from local database
        await query(
          'DELETE FROM users WHERE stack_auth_id = $1',
          [user.id]
        );
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
