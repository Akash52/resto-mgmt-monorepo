# Restaurant Management System

A production-ready monorepo demonstrating **flexible billing rules**, full-stack TypeScript, and modern development practices with Turborepo.

## 🎯 What This Solves

Multi-tenant restaurant system where each restaurant configures unique pricing, tax, and discount rules without code changes.

## 🏗️ Architecture

```
├── apps/
│   ├── api/          # Express REST API (port 3001)
│   ├── web/          # Customer app (port 5173)
│   └── dashboard/    # Admin panel (port 3002)
├── packages/
│   ├── billing-engine/   # Rule-based calculations
│   ├── database/         # Prisma + PostgreSQL
│   ├── types/           # Shared types & validators
│   └── ui/              # React components
```

## ✨ Features

**Flexible Billing Engine**

- Dynamic pricing (happy hour, category-based, time-based)
- Multi-rate tax calculations (category-specific, compound)
- Automated discounts & promotional coupons
- Real-time order preview

**Monorepo Benefits**

- Type safety across frontend/backend
- Shared validation (Zod schemas)
- Fast builds with Turborepo caching
- Independent deployments

## 🚀 Quick Start

**Prerequisites**: Node.js 18+, pnpm 8+, PostgreSQL

```bash
# 1. Install
pnpm install

# 2. Setup database
cp packages/database/.env.example packages/database/.env
# Update DATABASE_URL in packages/database/.env
pnpm db:generate && pnpm db:push

# 3. Start everything
pnpm dev
```

**Access**: API (3001) | Client (5173) | Dashboard (3002) | DB Studio: `pnpm db:studio`

## 📦 Common Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm dev:api               # API only
pnpm dev:client            # Client only
pnpm dev:dashboard         # Dashboard only

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:push               # Push schema (dev)
pnpm db:migrate            # Create migration (prod)
pnpm db:studio             # Open Prisma Studio

# Build & Quality
pnpm build                 # Build all
pnpm lint                  # Lint code
pnpm type-check            # Check types
```

## 🔌 API Endpoints

- `GET /api/restaurants` - List all restaurants
- `GET /api/menu/:restaurantId` - Get menu items
- `POST /api/orders` - Create order
- `POST /api/orders/preview` - Get billing preview
- `POST /api/coupons/validate` - Validate coupon

## Monorepo Best Practices

This project follows industry best practices for monorepo development:

✅ **Proper Namespacing**: All packages use `@demo/*` scope  
✅ **Workspace Protocol**: Internal dependencies use `workspace:*`  
✅ **Shared TypeScript Config**: Centralized in `@demo/typescript-config`  
✅ **Single Source of Truth**: Validation schemas shared via `@demo/types/validators`  
✅ **Controlled Exports**: Each package defines clear export maps  
✅ **Turborepo Caching**: Optimized build performance  
✅ **Path Aliases**: Each app has unique prefixes to avoid conflicts

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL in `.env` files
- Ensure PostgreSQL is running
- Run `pnpm db:push` to sync schema

### Build Errors

- Run `pnpm install` to update dependencies
- Regenerate Prisma client: `pnpm db:generate`
- Clear Turborepo cache: `rm -rf .turbo`

### CORS Issues During Development

All frontend apps (web and dashboard) are configured with API proxy:

- Web app (port 5173) → API (port 3001)
- Dashboard (port 3002) → API (port 3001)
- No CORS configuration needed in development
---

**Built with Turborepo, React, Express, Prisma, and TypeScript**
⭐ Monorepo Best Practices

**Score: 9/10** - Following industry standards

✅ Namespacing (`@demo/*`) | ✅ Workspace protocol | ✅ Shared configs  
✅ Single source validation | ✅ Turborepo caching | ✅ CORS-free dev

## 🔧 Troubleshooting

**Build fails?** → `pnpm install && pnpm db:generate`  
**DB connection?** → Check `DATABASE_URL` in `.env`  
**Cache issues?** → `rm -rf .turbo && pnpm build`

## 📚 Documentation

- [Complete Guide](docs/COMPLETE_PROJECT_GUIDE.md) - Full documentation

---

**Tech Stack**: Turborepo · React · Express · Prisma · TypeScript · TailwindCSS
