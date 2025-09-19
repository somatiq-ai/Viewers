#!/bin/bash

# OHIF Viewer - Simple Build Script
# This script builds OHIF Viewer static files

set -e

echo "🚀 Building OHIF Viewer..."
echo "========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Create dist directory
mkdir -p dist

echo "🔨 Building OHIF Viewer..."
docker-compose run --rm ohif-build

echo "🎉 OHIF Viewer build completed!"
echo "📂 Static files are available in: ./dist/"
echo ""
echo "📋 For Apache setup:"
echo "1. Copy ./dist/* to your Apache document root"
echo "2. Configure your Apache virtual host"
echo ""
echo "📋 For local testing:"
echo "cd dist && python3 -m http.server 8080"
echo "Then open: http://localhost:8080"
