# OHIF Viewer - Build Instructions

This repository contains scripts to build OHIF Viewer for your Apache backend. You have two options: Docker build or local build.

## Option 1: Docker Build (Recommended)

### Prerequisites
- Docker installed and running

### Quick Start
```bash
# Make the script executable (if not already)
chmod +x start-ohif.sh

# Build OHIF using Docker
./start-ohif.sh
```

This will:
1. Build OHIF Viewer using Docker
2. Output static files to `./dist/` directory
3. Provide instructions for Apache setup

### Manual Docker Commands
```bash
# Build the container and generate static files
docker-compose run --rm ohif-build

# Files will be available in ./dist/
```

## Option 2: Local Build

### Prerequisites
- Node.js 20+ installed
- Yarn package manager installed

### Quick Start
```bash
# Make the script executable (if not already)
chmod +x build-local.sh

# Build OHIF locally
./build-local.sh
```

This will:
1. Install dependencies using yarn
2. Build OHIF Viewer
3. Output static files to `platform/app/dist/` directory

### Manual Local Commands
```bash
# Enable yarn workspaces
yarn config set workspaces-experimental true

# Install dependencies
yarn install

# Build for production
yarn run build

# Files will be available in platform/app/dist/
```

## Development Mode

For development with hot reloading:
```bash
yarn run dev
```

This starts a development server at `http://localhost:3000`

## Apache Configuration

After building, you need to configure Apache to serve the static files:

1. Copy the built files to your Apache document root:
   ```bash
   # For Docker build
   cp -r ./dist/* /var/www/html/

   # For local build
   cp -r platform/app/dist/* /var/www/html/
   ```

2. Configure your Apache virtual host (see `apache-config/` directory for examples)

3. Ensure Apache has proper configuration for single-page applications (SPA routing)

## Testing Locally

You can test the built files locally before deploying to Apache:

```bash
# Using Python (built-in)
cd dist  # or platform/app/dist for local build
python3 -m http.server 8080

# Using npx serve
cd dist  # or platform/app/dist for local build
npx serve .

# Then open http://localhost:8080 in your browser
```

## Configuration

The OHIF configuration is set via the `APP_CONFIG` environment variable. By default, it uses `config/default.js`. You can modify this in:

- `docker.env` for Docker builds
- Environment variables for local builds

## Troubleshooting

### Docker Issues
- Ensure Docker is running: `docker info`
- Clean build: `docker-compose down && docker system prune -f`
- Check logs: `docker-compose logs`

### Local Build Issues
- Ensure Node.js version 20+: `node --version`
- Clear cache: `yarn cache clean`
- Delete node_modules: `rm -rf node_modules && yarn install`

### Common Issues
1. **Build fails with "Cannot find module"**: Make sure all dependencies are installed
2. **serve command not found**: Install serve globally: `npm install -g serve`
3. **Path errors**: Make sure you're in the correct directory when running commands

## File Structure After Build

```
dist/ (or platform/app/dist/)
├── index.html          # Main HTML file
├── app.bundle.js       # Main JavaScript bundle
├── app.css             # Compiled CSS
├── manifest.json       # Web app manifest
├── service-worker.js   # Service worker for PWA
└── assets/             # Static assets (images, fonts, etc.)
```

## Next Steps

1. Deploy the built files to your Apache server
2. Configure DICOM data sources in the OHIF configuration
3. Set up SSL certificates for production
4. Configure any required DICOM proxy endpoints
