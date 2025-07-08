#!/bin/bash

# Secured API Communication Setup Script
echo "🔐 Setting up Secured API Communication with Next.js & FastAPI"
echo "=============================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Clerk Configuration (replace with your actual values)
CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsubWVzc2FnZXJlcGx5LmNvbSQ
CLERK_JWT_ISSUER=https://clerk.messagereply.com
CLERK_JWKS_URL=https://clerk.messagereply.com/.well-known/jwks.json
# Frontend Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsubWVzc2FnZXJlcGx5LmNvbSQ
CLERK_SECRET_KEY=sk_live_Q6FdPLjn7y5yTHgjWGD4NXTQW29IP7wTSSfPSIEvD2

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
EOL
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Get your Clerk credentials:"
echo "   - Go to https://clerk.com and create an account"
echo "   - Create a new application"
echo "   - Go to API Keys in your dashboard"
echo "   - Copy the Publishable Key and Secret Key"
echo "   - Update the .env file with your actual values"
echo ""
echo "2. Update .env file with your Clerk credentials"
echo ""
echo "3. Start the application:"
echo "   docker-compose up --build"
echo ""
echo "4. Access the applications:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Security Notes:"
echo "- Never commit your actual Clerk keys to version control"
echo "- Use different keys for development and production"
echo "- Keep your secret keys secure and rotate them regularly"
echo ""
echo "📚 For more information, see the README.md file" 