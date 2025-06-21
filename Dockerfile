# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npx vite build

# Build the production server (without vite dependencies)
RUN npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any static files needed
COPY --from=builder /app/uploads ./uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]