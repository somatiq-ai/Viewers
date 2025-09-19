#!/bin/bash

# OHIF Viewer - Local Build Script (No Docker)
# This script builds OHIF Viewer locally using yarn

set -e

echo "🚀 Building OHIF Viewer locally..."
echo "================================="

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Error: yarn is not installed. Please install yarn first."
    echo "Visit: https://yarnpkg.com/getting-started/install"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "📋 Setting up yarn workspaces..."
yarn config set workspaces-experimental true

echo "📦 Installing dependencies..."
yarn install

echo "🔨 Building OHIF Viewer..."
yarn run build

echo "🎉 OHIF Viewer build completed!"
echo "📂 Static files are available in: platform/app/dist/"
echo ""
echo "📋 For Apache setup:"
echo "1. Copy platform/app/dist/* to your Apache document root"
echo "2. Configure your Apache virtual host"
echo ""
echo "📋 For local testing:"
echo "cd platform/app && npx serve ./dist"
echo "Or: cd platform/app/dist && python3 -m http.server 8080"
echo ""
echo "📋 For development:"
echo "yarn run dev"
