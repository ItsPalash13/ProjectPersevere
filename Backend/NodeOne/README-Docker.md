# NodeOne Backend - Docker Setup

This document provides instructions for running the NodeOne backend using Docker.

## Prerequisites

- Docker
- Docker Compose
- Environment variables (see `.env` file)

## Quick Start

### 1. Production Setup

```bash
# Build and start all services (production)
docker-compose up -d

# View logs
docker-compose logs -f nodeone

# Stop all services
docker-compose down
```

### 2. Development Setup

```bash
# Build and start development environment
docker-compose --profile dev up -d

# View development logs
docker-compose logs -f nodeone-dev

# Stop development services
docker-compose --profile dev down
```

## Services

### Production Services
- **nodeone**: Backend API server (port 3000)
- **mongo**: MongoDB database (port 27017)
- **redis**: Redis cache (port 6379)

### Development Services
- **nodeone-dev**: Development server with hot reload (port 3001)
- **mongo**: MongoDB database (port 27017)
- **redis**: Redis cache (port 6379)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

## Docker Commands

### Build Images
```bash
# Build production image
docker build -t nodeone:latest .

# Build development image
docker build --target development -t nodeone:dev .
```

### Run Individual Containers
```bash
# Run production container
docker run -p 3000:3000 --env-file .env nodeone:latest

# Run development container
docker run -p 3001:3000 -v $(pwd):/app nodeone:dev
```

### Database Access
```bash
# Access MongoDB shell
docker exec -it nodeone-mongo mongosh

# Access Redis CLI
docker exec -it nodeone-redis redis-cli
```

## Health Checks

The application includes health checks that monitor:
- API server availability
- Database connectivity
- Redis connectivity

## Volumes

- **mongo_data**: Persistent MongoDB data
- **redis_data**: Persistent Redis data

## Networks

All services run on the `nodeone-network` bridge network for secure communication.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Database connection issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongo
   
   # Restart MongoDB
   docker-compose restart mongo
   ```

3. **Build failures**
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Remove all containers and images
   docker system prune -a
   ```

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs nodeone

# Follow logs in real-time
docker-compose logs -f nodeone
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper secrets management
2. **SSL/TLS**: Configure reverse proxy with SSL
3. **Monitoring**: Add monitoring and logging solutions
4. **Backup**: Set up database backups
5. **Scaling**: Use Docker Swarm or Kubernetes for scaling

## Development Workflow

1. **Start development environment**
   ```bash
   docker-compose --profile dev up -d
   ```

2. **Make code changes** - Changes are reflected automatically

3. **View logs**
   ```bash
   docker-compose logs -f nodeone-dev
   ```

4. **Stop development**
   ```bash
   docker-compose --profile dev down
   ```

## Security Notes

- The production container runs as a non-root user
- Environment variables are used for sensitive data
- Network isolation is implemented
- Health checks monitor service availability 