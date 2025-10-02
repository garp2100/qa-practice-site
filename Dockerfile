# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files (if you have them, otherwise this is optional)
COPY package*.json ./

# Copy server + client package files and install dependencies
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install deps
RUN npm ci && \
    cd server && npm ci && \
    cd ../client && npm ci

# Copy all source code
COPY . .

# Build server and client (use docker env for client)
RUN npm run build:server && \
    cp client/.env.docker client/.env.production && \
    npm run build:client

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app

# Copy only built artifacts + node_modules
COPY --from=builder /app/server /app/server
COPY --from=builder /app/client /app/client
COPY --from=builder /app/node_modules /app/node_modules

# Cloud Run expects to listen on $PORT
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server/dist/index.js"]