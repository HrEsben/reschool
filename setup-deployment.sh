#!/bin/bash

# Deployment Setup Script
# Run this to get the values needed for GitHub secrets

echo "🚀 ReSchool Deployment Setup"
echo "================================"
echo ""

echo "1. Getting Vercel project information..."
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    
    echo "✅ Project ID: $PROJECT_ID"
    echo "✅ Org ID: $ORG_ID"
else
    echo "❌ No .vercel/project.json found. Run 'npx vercel link' first."
    exit 1
fi

echo ""
echo "2. GitHub Secrets to add:"
echo "================================"
echo "Go to: https://github.com/HrEsben/reschool/settings/secrets/actions"
echo ""
echo "Add these secrets:"
echo "VERCEL_PROJECT_ID = $PROJECT_ID"
echo "VERCEL_ORG_ID = $ORG_ID"
echo "VERCEL_TOKEN = [Get from: npx vercel login and then create token in Vercel dashboard]"
echo ""
echo "3. Database secrets (get from Neon):"
echo "DATABASE_URL_PRODUCTION = [Your production Neon connection string]"
echo "DATABASE_URL_STAGING = [Your staging Neon connection string]"
echo ""
echo "4. Vercel Environment Variables:"
echo "================================"
echo "Go to: https://vercel.com/esben-stephansens-projects/reschool/settings/environment-variables"
echo ""
echo "Add DATABASE_URL for each environment (Production, Preview, Development)"
echo ""
echo "✅ Setup complete! Check DATABASE_DEPLOYMENT.md for detailed instructions."
