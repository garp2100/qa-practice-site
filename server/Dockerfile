# --- Stage 1: Build the server ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package.json + lock for caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install deps for root, server, and client
RUN npm install --workspaces --include-workspace-root

# Copy full source
COPY . .

# Run the TypeScript build
RUN npm run build


# --- Stage 2: Run in production ---
FROM node:20-alpine
WORKDIR /app

# Copy only built artifacts + node_modules from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY package*.json ./

# Env vars will be injected by Cloud Run or Docker --env-file
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server/dist/index.js"]