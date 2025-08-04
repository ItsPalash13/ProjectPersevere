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
RUN npm install --force && npm cache clean --force

# Copy source code and .env file
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and node_modules, then install only production dependencies
RUN rm -rf node_modules package-lock.json
RUN npm install --only=production && npm cache clean --force

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"] 