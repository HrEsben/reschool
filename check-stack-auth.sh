#!/bin/bash

echo "=== Stack Auth Environment Check ==="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
else
    echo "❌ .env.local file not found"
    exit 1
fi

# Check required environment variables
echo ""
echo "Checking required environment variables:"

# Check NEXT_PUBLIC_STACK_PROJECT_ID
if grep -q "NEXT_PUBLIC_STACK_PROJECT_ID=" .env.local; then
    echo "✅ NEXT_PUBLIC_STACK_PROJECT_ID is set"
else
    echo "❌ NEXT_PUBLIC_STACK_PROJECT_ID is missing"
fi

# Check NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
if grep -q "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=" .env.local; then
    echo "✅ NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY is set"
else
    echo "❌ NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY is missing"
fi

# Check STACK_SECRET_SERVER_KEY
if grep -q "STACK_SECRET_SERVER_KEY=" .env.local; then
    echo "✅ STACK_SECRET_SERVER_KEY is set"
else
    echo "❌ STACK_SECRET_SERVER_KEY is missing"
fi

echo ""
echo "=== Troubleshooting Steps ==="
echo "1. Clear browser cache and cookies for localhost:3000"
echo "2. Check if Stack Auth project is still active in your Stack dashboard"
echo "3. Verify all environment variables are correctly set"
echo "4. Try logging out and back in"
echo ""
