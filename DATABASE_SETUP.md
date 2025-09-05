# Database Setup Guide for ReSchool

## Prerequisites

1. **Neon Database Account**: Make sure you have a Neon PostgreSQL database set up
2. **Database URL**: Get your connection string from Neon dashboard

## Setup Steps

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Update the `DATABASE_URL` with your Neon connection string:
```
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
```

### 2. Run Database Migration

Execute the SQL migration in your Neon database console:

```sql
-- Copy and paste the contents of src/lib/migrations/001_create_children_tables.sql
-- into your Neon database SQL editor and execute
```

Or use the Neon CLI if you have it installed:
```bash
# Install Neon CLI
npm install -g neonctl

# Run migration (replace with your project details)
neonctl sql-execute --project-id your-project-id --database-name your-db-name --file src/lib/migrations/001_create_children_tables.sql
```

### 3. Test Database Connection

Start the development server and test the child management functionality:

```bash
npm run dev
```

Navigate to `/dashboard` and try:
1. Adding a child
2. Viewing children list
3. Different relation types

## Database Schema

### Tables Created

1. **users**: Syncs Stack Auth users to your database
2. **children**: Stores child information  
3. **user_child_relations**: Links users to children with specific relations

### Relations

- A user can have multiple children with different relations
- A child can have multiple users (parents, teachers, etc.)
- Each user-child pair has exactly one relation type
- The user who creates a child is automatically an administrator

## API Endpoints

- `GET /api/children` - Get all children for current user
- `POST /api/children` - Create a new child
- `POST /api/children/[childId]/add-user` - Add another user to a child

## Troubleshooting

### Database Connection Issues

1. Verify your `DATABASE_URL` is correct
2. Check that your IP is whitelisted in Neon (if applicable)
3. Ensure SSL is properly configured

### Migration Issues

1. Make sure you have proper permissions in your Neon database
2. Check if tables already exist before running migration
3. Verify the SQL syntax is compatible with PostgreSQL

### Development Tips

1. Use Neon's web console to inspect data
2. Check browser network tab for API errors
3. Monitor server logs for database connection issues

## Security Notes

- Database credentials are stored in environment variables
- Connection uses SSL by default
- User authentication is handled by Stack Auth
- All database operations verify user authentication first
