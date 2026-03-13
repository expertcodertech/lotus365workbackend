#!/bin/bash

echo "🪷 Lotus365 Work Platform Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo "🔧 Setting up backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created backend/.env - Please configure your database settings"
fi
npm install
cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📝 Created frontend/.env.local - Please configure your API URL"
fi
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Configure backend/.env with your database settings"
echo "2. Configure frontend/.env.local with your API URL"
echo "3. Run 'npm run dev' to start development servers"
echo "4. For production deployment, see README.md"
echo ""
echo "🌐 Development URLs:"
echo "   Backend API: http://localhost:3000"
echo "   Frontend Admin: http://localhost:3001"