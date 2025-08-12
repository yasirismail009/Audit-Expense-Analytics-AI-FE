# Analytics Frontend - Docker Setup

This document provides instructions for running the Analytics Frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Development Mode

To run the application in development mode with hot reloading:

```bash
# Start development server
docker-compose --profile dev up

# Or build and start
docker-compose --profile dev up --build
```

The application will be available at `http://localhost:5173`

### Production Mode

To run the application in production mode:

```bash
# Start production server on port 80
docker-compose --profile prod up --build

# Or start on custom port (3000)
docker-compose --profile prod-custom up --build
```

The application will be available at:
- `http://localhost` (for prod profile)
- `http://localhost:3000` (for prod-custom profile)

## Docker Commands

### Build Images

```bash
# Build development image
docker build --target development -t analytics-fe:dev .

# Build production image
docker build --target production -t analytics-fe:prod .
```

### Run Containers

```bash
# Run development container
docker run -p 5173:5173 -v $(pwd):/app analytics-fe:dev

# Run production container
docker run -p 80:80 analytics-fe:prod

# Run production container on custom port
docker run -p 3000:80 analytics-fe:prod
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

## Configuration

### Environment Variables

The application supports the following environment variables:

- `NODE_ENV`: Set to `development` or `production`
- `VITE_API_URL`: Backend API URL (if applicable)

### Nginx Configuration

The production build uses a custom nginx configuration (`nginx.conf`) that includes:

- Gzip compression for better performance
- Security headers
- Proper handling of React Router routes
- Static asset caching
- Health check endpoint at `/health`

### API Proxy Configuration

If you have a backend API, you can configure the proxy in `nginx.conf`:

1. Uncomment the proxy_pass lines in the `/api/` location block
2. Update the `proxy_pass` URL to point to your backend service
3. Rebuild the Docker image

## Development Workflow

1. **Start Development Server:**
   ```bash
   docker-compose --profile dev up
   ```

2. **Make Changes:** Edit files in your local directory - changes will be reflected immediately due to volume mounting

3. **Build for Production:**
   ```bash
   docker-compose --profile prod up --build
   ```

4. **Test Production Build:**
   ```bash
   docker-compose --profile prod-custom up --build
   ```

## Troubleshooting

### Common Issues

1. **Port Already in Use:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :5173
   
   # Kill the process or use a different port
   docker-compose --profile prod-custom up
   ```

2. **Permission Issues:**
   ```bash
   # On Linux/Mac, you might need to fix permissions
   sudo chown -R $USER:$USER .
   ```

3. **Build Cache Issues:**
   ```bash
   # Clear Docker build cache
   docker builder prune
   
   # Rebuild without cache
   docker-compose --profile prod up --build --no-cache
   ```

### Logs

```bash
# View logs for development service
docker-compose --profile dev logs -f analytics-fe-dev

# View logs for production service
docker-compose --profile prod logs -f analytics-fe-prod
```

### Health Check

The production build includes a health check endpoint:

```bash
# Check if the service is running
curl http://localhost/health
```

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (like Traefik or nginx) in front of the container
2. **Setting up SSL/TLS** certificates
3. **Configuring proper logging** and monitoring
4. **Using Docker secrets** for sensitive configuration
5. **Setting up proper backup** and recovery procedures

## Multi-Stage Build Benefits

The Dockerfile uses a multi-stage build approach:

- **Builder stage**: Installs dependencies and builds the application
- **Production stage**: Uses nginx to serve the built static files
- **Development stage**: Runs the Vite dev server with hot reloading

This approach results in:
- Smaller production images
- Better security (no build tools in production)
- Faster builds (cached layers)
- Optimized for production serving

## File Structure

```
.
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Nginx configuration for production
├── .dockerignore          # Files to exclude from Docker build
├── DOCKER_README.md       # This file
├── package.json           # Node.js dependencies
├── vite.config.js         # Vite configuration
└── src/                   # Application source code
```
