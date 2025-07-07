# Docker Deployment Guide

This guide explains how to build and run the My Money UI application using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Quick Start

### Using Docker Compose (Recommended)

1. **Configure your API URL** in `docker-compose.yml`:
   ```yaml
   environment:
     - VITE_API_BASE_URL=https://your-api-url.com/api
   ```

2. **Build and start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Open your browser and navigate to `http://localhost:8080`

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t my-money-ui .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8080:80 --name my-money-ui my-money-ui
   ```

3. **Access the application:**
   - Open your browser and navigate to `http://localhost:8080`

4. **Stop the container:**
   ```bash
   docker stop my-money-ui
   docker rm my-money-ui
   ```

## Configuration

### Environment Variables

The application can be configured using environment variables:

- `NODE_ENV`: Set to `production` for production builds
- `VITE_API_BASE_URL`: Base URL for your backend API (e.g., `https://my-money-api.masys.io/api`)
- `VITE_APP_TITLE`: Application title (default: "My Money")
- `VITE_APP_VERSION`: Application version (default: "1.0.0")

**Example in docker-compose.yml:**
```yaml
environment:
  - VITE_API_BASE_URL=https://my-money-api.masys.io/api
  - NODE_ENV=production
```

**Runtime Environment Variable Injection:**
The application uses a custom entrypoint script that replaces environment variable placeholders at runtime, allowing you to configure the API base URL without rebuilding the image.

### Backend API Integration

If you have a backend API, you can:

1. **Update the nginx configuration** in `nginx.conf` to proxy API requests:
   ```nginx
   location /api {
       proxy_pass http://your-backend-host:port;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

2. **Or use Docker Compose** with both frontend and backend services:
   - Uncomment the backend service in `docker-compose.yml`
   - Update the backend configuration as needed

## Production Deployment

### Security Considerations

1. **Update nginx configuration** for your domain
2. **Add SSL/TLS certificates** for HTTPS
3. **Configure proper security headers**
4. **Set up proper logging and monitoring**

### Performance Optimization

The Docker image includes:
- ✅ Multi-stage build for smaller image size
- ✅ Gzip compression for static assets
- ✅ Optimized caching headers
- ✅ Nginx performance optimizations

## Troubleshooting

### Common Issues

1. **Port 8080 already in use:**
   ```bash
   # Change the port mapping
   docker-compose up -d --scale my-money-ui=0
   docker-compose up -d
   ```

2. **Build fails:**
   ```bash
   # Clean build without cache
   docker-compose build --no-cache
   ```

3. **Application not accessible:**
   - Check if the container is running: `docker ps`
   - Check container logs: `docker logs my-money-ui`

### Logs

View application logs:
```bash
# Docker Compose
docker-compose logs -f my-money-ui

# Docker
docker logs -f my-money-ui
```

### Testing Environment Variables

To verify that environment variables are properly injected:

1. **Check the container logs** for environment variable replacement:
   ```bash
   docker-compose logs my-money-ui
   ```
   You should see messages like:
   ```
   🔄 Replacing environment variables...
   📝 Processing file: /usr/share/nginx/html/assets/index-abc123.js
   ✅ Environment variables replacement completed
   🚀 Starting nginx...
   ```

2. **Test the API connection** by opening the browser developer tools:
   - Go to `http://localhost:8080`
   - Open Developer Tools (F12)
   - Check the Network tab for API requests
   - Verify requests are going to your configured API URL

3. **Check environment variable values** in the browser console:
   ```javascript
   // This should show your configured API URL
   console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
   ```

## Development

### Local Development with Docker

1. **For development with hot reload:**
   ```bash
   # Run in development mode
   docker run -it -p 8080:5173 -v $(pwd):/app my-money-ui npm run dev
   ```

2. **Or use the local development server:**
   ```bash
   npm install
   npm run dev
   ```

## Files Structure

```
.
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Nginx configuration for production
├── .dockerignore          # Files to exclude from Docker build
├── entrypoint.sh          # Runtime environment variable injection
├── test-env.sh            # Environment variable testing script
└── DOCKER.md             # This documentation
```

## Testing the Setup

Run the automated test to verify everything is working correctly:

```bash
# Make the test script executable (if not already)
chmod +x test-env.sh

# Run the test
./test-env.sh
```

The test script will:
- ✅ Build the Docker image
- ✅ Start the container
- ✅ Verify environment variable replacement
- ✅ Test application accessibility
- ✅ Check API URL injection

## Support

For issues related to:
- **Docker setup**: Check this guide and Docker documentation
- **Application features**: Refer to the main README.md
- **Backend integration**: Check your API documentation 