import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  requests: number;    // Number of requests allowed
  windowMs: number;    // Time window in milliseconds
}

export function rateLimit(options: RateLimitOptions) {
  return (request: NextRequest): { success: boolean; limit: number; remaining: number; reset: Date } => {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}`;
    const now = Date.now();
    
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
    } else {
      store[key].count++;
    }
    
    const remaining = Math.max(0, options.requests - store[key].count);
    const success = store[key].count <= options.requests;
    
    return {
      success,
      limit: options.requests,
      remaining,
      reset: new Date(store[key].resetTime)
    };
  };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  requests: 5,        // 5 requests
  windowMs: 15 * 60 * 1000  // per 15 minutes
});

export const apiRateLimit = rateLimit({
  requests: 100,      // 100 requests
  windowMs: 15 * 60 * 1000  // per 15 minutes
});

export const webhookRateLimit = rateLimit({
  requests: 10,       // 10 requests
  windowMs: 60 * 1000 // per minute
});
