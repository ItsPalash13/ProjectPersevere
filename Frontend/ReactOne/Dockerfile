# Use Node.js 24 Alpine as base image for smaller size
FROM node:24-alpine

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies) for build
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy source code and .env file
COPY . .

# Build the application (Vite will use environment variables from .env)
RUN npm run build

# Install serve to run the built application
RUN npm install -g serve

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5173', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "5173"] 