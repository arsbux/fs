#!/bin/bash

# Clean Next.js cache and build files
echo "🧹 Cleaning Next.js cache and build files..."

# Remove .next directory
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
fi

# Remove node_modules/.cache
if [ -d "node_modules/.cache" ]; then
    echo "Removing node_modules/.cache..."
    rm -rf node_modules/.cache
fi

# Remove out directory (if exists)
if [ -d "out" ]; then
    echo "Removing out directory..."
    rm -rf out
fi

# Remove TypeScript build info
if [ -f "*.tsbuildinfo" ]; then
    echo "Removing TypeScript build info..."
    rm -f *.tsbuildinfo
fi

echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. The server will rebuild fresh without cache"
