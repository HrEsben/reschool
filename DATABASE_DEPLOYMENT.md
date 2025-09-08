# Database Deployment Strategy

## Problem
Your Neon database branch is suspended, causing deployment failures. This guide fixes the database setup for a proper deployment flow.

## Solution: Neon Database Branching Strategy

### 1. Database Branch Structure
```
production (main)     ← Production database
└── preview/main      ← All preview/staging deployments
```

### 2. Fix Current Issues

#### A. Reactivate Your Database Branch
1. Go to [Neon Console](https://console.neon.tech/)
2. Navigate to your project: `purple-mountain-08515920`
3. Go to branch: `br-old-moon-a2wzu6m9`
4. Click **"Edit"** on the suspended compute
5. Change status from "Suspended" to "Active"
6. Set autosuspend to "Never" for staging/production branches

#### B. Your Current Setup ✅
You now have the optimal 2-branch structure:
1. **Production Branch**: `production` (default)
2. **Preview Branch**: `preview/main`

This setup provides:
- Clean separation between production and testing
- Cost-effective (only 2 compute instances)
- Simple to manage and understand

#### C. Get Connection Strings
For each branch, get the connection string:
1. Select branch → Connect
2. Copy the `DATABASE_URL`
3. Note the format: `postgresql://username:password@hostname/database`

### 3. Configure Vercel Environment Variables

#### Production Environment:
```bash
DATABASE_URL=postgresql://user:pass@ep-xyz-pooler.region.aws.neon.tech/main?sslmode=require
```

#### Preview Environment:
```bash
DATABASE_URL=postgresql://user:pass@ep-xyz-pooler.region.aws.neon.tech/preview_main?sslmode=require
```

### 4. Vercel Configuration Steps

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add Production Variables**:
   - Variable: `DATABASE_URL`
   - Value: Your production Neon connection string
   - Environment: ✅ Production

3. **Add Preview Variables**:
   - Variable: `DATABASE_URL` 
   - Value: Your preview/main Neon connection string
   - Environment: ✅ Preview

4. **Add Development Variables** (optional):
   - Variable: `DATABASE_URL`
   - Value: Your development connection string
   - Environment: ✅ Development

### 5. GitHub Secrets (for CI/CD)

Add these to GitHub → Settings → Secrets:
```
DATABASE_URL_PRODUCTION=your_production_connection_string
DATABASE_URL_PREVIEW=your_preview_main_connection_string
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### 6. Deployment Flow
```
Feature Branch → PR → Preview Deployment (preview/main DB)
                ↓
            Merge to main → Production Deployment (production DB)
```

### 7. Database Migration Strategy

#### For Production:
- Run migrations manually through Neon console
- Or use a migration API endpoint

#### For Preview:
- Auto-run migrations on deployment
- Reset from production data periodically

### 8. Cost Optimization

#### Compute Settings:
- **Production**: Never suspend (or 1 hour autosuspend)
- **Preview/Main**: 5 minutes autosuspend

#### Storage:
- Use branch reset to manage storage costs
- Preview can reset from production weekly

### 9. Troubleshooting

#### If deployment still fails:
1. Check Vercel logs for database connection errors
2. Verify connection string format
3. Ensure database branch is active
4. Test connection from Vercel Functions tab

#### Connection String Format:
```
postgresql://username:password@hostname:port/database?sslmode=require
```

### 10. Next Steps
1. Fix the suspended database branch
2. Configure environment variables in Vercel
3. Test a deployment
4. Set up branch protection rules
5. Add database seeding for staging
