#!/bin/bash

echo "🗄️  Database Setup & Seed Script"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f "packages/database/.env" ]; then
    echo "❌ Error: packages/database/.env not found!"
    echo "   Please copy .env.example and configure your DATABASE_URL"
    echo "   Example: cp packages/database/.env.example packages/database/.env"
    exit 1
fi

# Show current DATABASE_URL (masked)
echo "📝 Current configuration:"
DATABASE_URL=$(grep DATABASE_URL packages/database/.env | cut -d '=' -f2)
echo "   DATABASE_URL: ${DATABASE_URL}"
echo ""

# Ask for confirmation
echo "⚠️  This will:"
echo "   1. Push the Prisma schema to your database (create tables)"
echo "   2. Seed the database with dummy data (will clear existing data)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Step 1: Pushing schema to database..."
pnpm db:push

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to push schema. Please check your database connection."
    echo "   Make sure PostgreSQL is running and DATABASE_URL is correct."
    exit 1
fi

echo ""
echo "Step 2: Seeding database with dummy data..."
pnpm db:seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your database is ready!"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Start the dev servers: pnpm dev"
    echo "   2. Visit http://localhost:5173 (Client)"
    echo "   3. Visit http://localhost:3002 (Dashboard)"
    echo "   4. Or open database GUI: pnpm db:studio"
    echo ""
    echo "🎫 Try these coupon codes:"
    echo "   • WELCOME20 (Pizza Palace)"
    echo "   • PIZZA10 (Pizza Palace)"
    echo "   • BURGER15 (Burger Hub)"
    echo "   • SUSHI25 (Sushi Master)"
else
    echo ""
    echo "❌ Seeding failed. Check the error messages above."
    exit 1
fi
