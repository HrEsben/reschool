import { Pool, QueryResult } from 'pg';

// Create a connection pool to your Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds
});

// Helper function to execute queries with optional user context
export async function query(text: string, params?: unknown[], userStackId?: string) {
  let client;
  
  try {
    client = await pool.connect();
    
    // Set user context for RLS if provided
    if (userStackId) {
      await client.query('SET app.current_user_stack_id = $1', [userStackId]);
    }
    
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Helper function to get a client for transactions with optional user context
export async function getClient(userStackId?: string) {
  const client = await pool.connect();
  
  // Set user context for RLS if provided
  if (userStackId) {
    await client.query('SET app.current_user_stack_id = $1', [userStackId]);
  }
  
  return client;
}

// Helper function to execute multiple database operations with user context
export async function withUserContext<T>(
  userStackId: string,
  callback: (query: (text: string, params?: unknown[]) => Promise<QueryResult>) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    // Set user context for RLS
    await client.query('SET app.current_user_stack_id = $1', [userStackId]);
    
    // Create a query function that uses this client
    const queryWithClient = async (text: string, params?: unknown[]) => {
      try {
        const res = await client.query(text, params);
        return res;
      } catch (error) {
        console.error('Database query error with user context:', error);
        throw error;
      }
    };
    
    return await callback(queryWithClient);
  } finally {
    client.release();
  }
}

export default pool;
