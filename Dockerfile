# Multi-stage Dockerfile for Turborepo Monorepo

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy source code
COPY . .

# Build all packages and apps
ENV NODE_ENV=production
RUN pnpm build

# Stage 3: API Runner
FROM node:18-alpine AS api-runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/

# Copy node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]

# Stage 4: Web (nginx serving static files)
FROM nginx:alpine AS web-runner

# Copy built web app
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
