# Frontend Docker Setup

This directory contains Docker configuration for the React frontend application.

## Files

- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Local development setup
- `.dockerignore` - Optimizes build context

## Quick Start

### Local Development with Docker

```bash
# Build and start the container
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Production Build

```bash
# Build the image
docker build -t reactone-frontend:latest .

# Run the container
docker run -p 5173:5173 reactone-frontend:latest
```

## Environment Variables

The application uses the following environment variables:

- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:3000)

These are loaded from the `.env` file during build time.

## Ports

- **5173** - Frontend application (Vite dev server in development, static files in production)

## Health Check

The container includes a health check that verifies the application is responding on port 5173.

## Build Process

1. Installs all dependencies
2. Copies source code and environment files
3. Builds the application using `npm run build`
4. Installs `serve` to serve static files
5. Runs the built application on port 5173

## Development vs Production

- **Development**: Use `docker-compose up` for local development
- **Production**: Use `docker build` and `docker run` for production deployment 