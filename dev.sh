#!/bin/bash

# Development helper script for Linear Clone
# Usage: ./dev.sh [command]

set -e

BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

function show_help() {
    echo "Linear Clone Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install         Install dependencies for both backend and frontend"
    echo "  start           Start both backend and frontend in development mode"
    echo "  backend         Start only backend in development mode"
    echo "  frontend        Start only frontend in development mode"
    echo "  db:setup        Set up database (generate, migrate, seed)"
    echo "  db:reset        Reset database (WARNING: deletes all data)"
    echo "  db:studio       Open Prisma Studio to view database"
    echo "  db:seed         Seed database with sample data"
    echo "  test            Run all tests"
    echo "  test:backend    Run backend tests"
    echo "  test:frontend   Run frontend tests"
    echo "  lint            Lint all code"
    echo "  format          Format all code"
    echo "  clean           Clean all build artifacts and node_modules"
    echo "  docker:up       Start Docker services"
    echo "  docker:down     Stop Docker services"
    echo "  docker:logs     Show Docker logs"
    echo "  help            Show this help message"
    echo ""
}

function install_deps() {
    echo "📦 Installing backend dependencies..."
    cd $BACKEND_DIR && npm install
    cd ..
    
    echo "📦 Installing frontend dependencies..."
    cd $FRONTEND_DIR && npm install
    cd ..
    
    echo "✅ Dependencies installed!"
}

function start_all() {
    echo "🚀 Starting backend and frontend..."
    echo "Backend will run on http://localhost:4000"
    echo "Frontend will run on http://localhost:3000"
    echo ""
    
    # Start backend in background
    cd $BACKEND_DIR && npm run start:dev &
    BACKEND_PID=$!
    
    # Start frontend in background
    cd ../$FRONTEND_DIR && npm run dev &
    FRONTEND_PID=$!
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

function start_backend() {
    echo "🚀 Starting backend..."
    cd $BACKEND_DIR && npm run start:dev
}

function start_frontend() {
    echo "🚀 Starting frontend..."
    cd $FRONTEND_DIR && npm run dev
}

function setup_db() {
    echo "🗄️  Setting up database..."
    cd $BACKEND_DIR
    npm run prisma:generate
    npm run prisma:migrate:dev
    npm run seed
    cd ..
    echo "✅ Database setup complete!"
}

function reset_db() {
    echo "⚠️  WARNING: This will delete all data!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗄️  Resetting database..."
        cd $BACKEND_DIR
        npm run prisma:migrate:reset
        cd ..
        echo "✅ Database reset complete!"
    else
        echo "❌ Cancelled"
    fi
}

function open_studio() {
    echo "🎨 Opening Prisma Studio..."
    cd $BACKEND_DIR && npm run prisma:studio
}

function seed_db() {
    echo "🌱 Seeding database..."
    cd $BACKEND_DIR && npm run seed
    cd ..
    echo "✅ Database seeded!"
}

function run_tests() {
    echo "🧪 Running all tests..."
    
    echo "Backend tests:"
    cd $BACKEND_DIR && npm run test
    cd ..
    
    echo "Frontend tests:"
    cd $FRONTEND_DIR && npm run test
    cd ..
    
    echo "✅ All tests complete!"
}

function test_backend() {
    echo "🧪 Running backend tests..."
    cd $BACKEND_DIR && npm run test
}

function test_frontend() {
    echo "🧪 Running frontend tests..."
    cd $FRONTEND_DIR && npm run test
}

function lint_all() {
    echo "🔍 Linting code..."
    
    cd $BACKEND_DIR && npm run lint
    cd ..
    
    cd $FRONTEND_DIR && npm run lint
    cd ..
    
    echo "✅ Linting complete!"
}

function format_all() {
    echo "💅 Formatting code..."
    
    cd $BACKEND_DIR && npm run format
    cd ..
    
    echo "✅ Formatting complete!"
}

function clean_all() {
    echo "🧹 Cleaning build artifacts..."
    
    rm -rf $BACKEND_DIR/node_modules
    rm -rf $BACKEND_DIR/dist
    rm -rf $FRONTEND_DIR/node_modules
    rm -rf $FRONTEND_DIR/.next
    
    echo "✅ Clean complete!"
}

function docker_up() {
    echo "🐳 Starting Docker services..."
    docker-compose up -d
    echo "✅ Docker services started!"
}

function docker_down() {
    echo "🐳 Stopping Docker services..."
    docker-compose down
    echo "✅ Docker services stopped!"
}

function docker_logs() {
    echo "📋 Docker logs:"
    docker-compose logs -f
}

# Main command handler
case "$1" in
    install)
        install_deps
        ;;
    start)
        start_all
        ;;
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    db:setup)
        setup_db
        ;;
    db:reset)
        reset_db
        ;;
    db:studio)
        open_studio
        ;;
    db:seed)
        seed_db
        ;;
    test)
        run_tests
        ;;
    test:backend)
        test_backend
        ;;
    test:frontend)
        test_frontend
        ;;
    lint)
        lint_all
        ;;
    format)
        format_all
        ;;
    clean)
        clean_all
        ;;
    docker:up)
        docker_up
        ;;
    docker:down)
        docker_down
        ;;
    docker:logs)
        docker_logs
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
