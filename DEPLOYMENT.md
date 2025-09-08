# Deployment Guide

## Overview
This project uses a git-based deployment flow with automatic preview environments and production promotion.

## Deployment Flow

### 1. Development
- Create feature branches from `main`
- Work on features locally using `npm run dev`
- Test locally before pushing

### 2. Preview Environment
- **Trigger**: Open a Pull Request to `main` or `develop`
- **Action**: Automatic preview deployment via GitHub Actions
- **URL**: Vercel generates a unique preview URL for each PR
- **Use**: Test your changes in a production-like environment

### 3. Staging Environment
- **Trigger**: Push to `develop` branch
- **Action**: Automatic deployment to staging
- **URL**: `https://staging.reschool.app` (configure this in Vercel)
- **Use**: Final testing before production

### 4. Production Environment
- **Trigger**: Push to `main` branch
- **Action**: Automatic deployment to production
- **URL**: Your main domain
- **Use**: Live application

## Commands

```bash
# Development
npm run dev

# Testing
npm run test          # Runs lint + type-check
npm run lint          # ESLint only
npm run type-check    # TypeScript only

# Manual deployment (if needed)
npm run deploy:preview  # Deploy preview
npm run deploy:prod     # Deploy to production
```

## Setup Instructions

### 1. Vercel Setup
1. Connect your GitHub repo to Vercel
2. Get your Vercel credentials:
   ```bash
   npx vercel
   npx vercel --token
   ```

### 2. GitHub Secrets
Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### 3. Branch Protection (Recommended)
1. Go to GitHub > Settings > Branches
2. Add protection rule for `main`:
   - Require status checks before merging
   - Require branches to be up to date
   - Require review from 1 person (if working in a team)

## Workflow

### For Features:
1. `git checkout -b feature/your-feature`
2. Make changes and commit
3. `git push origin feature/your-feature`
4. Open PR to `main`
5. Review preview deployment
6. Merge PR → automatic production deployment

### For Hotfixes:
1. `git checkout -b hotfix/issue-name`
2. Make changes and commit
3. `git push origin hotfix/issue-name`
4. Open PR to `main`
5. Review preview deployment
6. Merge PR → automatic production deployment

### Using Staging (Optional):
1. Merge features to `develop` branch first
2. Test on staging environment
3. When ready, merge `develop` to `main`

## Environment Variables

Set environment variables in Vercel dashboard:
- Production: Set in Vercel project settings
- Preview: Automatically inherits from production (can be overridden)

## Rollback Strategy

If you need to rollback:
1. **Quick rollback**: Use Vercel dashboard to promote previous deployment
2. **Git rollback**: 
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

## Monitoring

- **Vercel Dashboard**: Monitor deployments and performance
- **GitHub Actions**: Check build status and logs
- **Vercel Analytics**: Monitor real user metrics (if enabled)
