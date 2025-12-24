#!/bin/bash

echo "🐘 PostgreSQL Setup for Restaurant Management System"
echo "===================================================="
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found!"
    echo ""
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        echo "✅ Docker is running!"
        echo ""
        
        # Check if container already exists
        if docker ps -a --format '{{.Names}}' | grep -q '^restaurant-postgres$'; then
            echo "📦 PostgreSQL container already exists"
            
            # Check if it's running
            if docker ps --format '{{.Names}}' | grep -q '^restaurant-postgres$'; then
                echo "✅ PostgreSQL is already running!"
            else
                echo "🚀 Starting existing PostgreSQL container..."
                docker start restaurant-postgres
            fi
        else
            echo "🚀 Starting PostgreSQL with Docker Compose..."
            docker compose up -d postgres
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "⏳ Waiting for PostgreSQL to be ready..."
                sleep 5
                
                # Wait for PostgreSQL to be ready
                for i in {1..30}; do
                    if docker exec restaurant-postgres pg_isready -U postgres &> /dev/null; then
                        echo "✅ PostgreSQL is ready!"
                        break
                    fi
                    echo -n "."
                    sleep 1
                done
                echo ""
            else
                echo "❌ Failed to start PostgreSQL with Docker Compose"
                exit 1
            fi
        fi
        
        echo ""
        echo "✅ PostgreSQL is running on localhost:5432"
        echo ""
        echo "📝 Database Configuration:"
        echo "   Host:     localhost"
        echo "   Port:     5432"
        echo "   Database: restaurant_db"
        echo "   User:     postgres"
        echo "   Password: postgres"
        echo ""
        echo "🔗 DATABASE_URL:"
        echo "   postgresql://postgres:postgres@localhost:5432/restaurant_db?schema=public"
        echo ""
        
        # Update .env file
        if [ -f "packages/database/.env" ]; then
            sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_db?schema=public"|' packages/database/.env
            echo "✅ Updated packages/database/.env with correct DATABASE_URL"
        else
            echo "⚠️  Warning: packages/database/.env not found"
            echo "   Creating it now..."
            echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_db?schema=public"' > packages/database/.env
            echo "✅ Created packages/database/.env"
        fi
        
        echo ""
        echo "🎯 Next steps:"
        echo "   1. Run: ./setup-database.sh"
        echo "   2. Or run manually:"
        echo "      pnpm db:push    # Create tables"
        echo "      pnpm db:seed    # Load dummy data"
        echo "      pnpm dev        # Start applications"
        echo ""
        echo "💡 Useful commands:"
        echo "   docker compose ps              # Check status"
        echo "   docker compose logs postgres   # View logs"
        echo "   docker compose down            # Stop PostgreSQL"
        echo "   pnpm db:studio                 # Open Prisma Studio"
        
    else
        echo "❌ Docker is installed but not running"
        echo ""
        echo "Please start Docker Desktop or run:"
        echo "   sudo systemctl start docker"
        exit 1
    fi
else
    echo "❌ Docker not found!"
    echo ""
    echo "Please choose one of these options:"
    echo ""
    echo "1. Install Docker Desktop:"
    echo "   https://docs.docker.com/desktop/install/linux-install/"
    echo ""
    echo "2. Use a cloud database (free tier):"
    echo "   • Neon: https://neon.tech"
    echo "   • Supabase: https://supabase.com"
    echo "   • Railway: https://railway.app"
    echo ""
    echo "3. Ask your system administrator to:"
    echo "   • Start PostgreSQL service"
    echo "   • Create a database for you"
    echo ""
    echo "See setup-postgres.md for detailed instructions"
    exit 1
fi
