# --- Stage 1: Build the server ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install root deps (if any)
COPY package*.json ./
RUN npm ci

# Install server deps
COPY server/package*.json ./server/
RUN cd server && npm ci

# Install client deps
COPY client/package*.json ./client/
RUN cd client && npm ci

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