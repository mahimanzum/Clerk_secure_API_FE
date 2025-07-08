#!/bin/bash

echo "🔐 Testing Secured API Communication"
echo "===================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists and has been configured
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run ./setup.sh first."
    exit 1
fi

# Check if .env file has been configured with real Clerk keys
if grep -q "pk_test_your_publishable_key_here" .env; then
    echo "⚠️  WARNING: .env file still contains placeholder values."
    echo "   Please update .env with your actual Clerk credentials from https://clerk.com"
    echo "   The application will start but authentication will not work until you update these values."
fi

echo ""
echo "🚀 Starting the application..."
echo "   This may take a few minutes the first time..."

# Start the application
docker-compose up --build

echo ""
echo "💡 After the application starts:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
