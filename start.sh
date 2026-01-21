#!/bin/bash

set -e

echo "🚀 Starting Linear Clone..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OPENROUTER_API_KEY before continuing"
    exit 1
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Starting services with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "🔧 Running database migrations..."
docker exec linear-backend npm run prisma:generate || true
docker exec linear-backend npm run prisma:migrate:deploy || true

echo "🌱 Seeding database with sample data..."
docker exec linear-backend npm run seed || true

echo ""
echo "✅ Linear Clone is running!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:4000"
echo "   API Docs: http://localhost:4000/api"
echo ""
echo "👤 Demo credentials:"
echo "   Email: john@example.com"
echo "   Password: password123"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
