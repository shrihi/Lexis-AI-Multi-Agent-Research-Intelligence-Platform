# ==== Frontend (Next.js) Dockerfile ====
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (caches better)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built output and production deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]