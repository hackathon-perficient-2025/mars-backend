# Backend CI/CD Workflows

## 📋 Workflows

### `ci.yml` - Continuous Integration

Runs on every push and pull request to main branches.

**Steps:**

1. **Test & Build**

   - Sets up Node.js 20
   - Starts MongoDB service container
   - Runs Jest tests with coverage
   - Builds TypeScript to JavaScript
   - Uploads coverage reports and build artifacts

2. **Docker Build & Test** (main/master only)
   - Builds Docker image
   - Tests the image
   - Uses build cache for faster builds

### `docker-publish.yml` - Container Registry

Publishes Docker images to GitHub Container Registry.

**Triggers:**

- Push to main/master
- Git tags (v1.0.0, v2.0.0, etc.)
- Manual workflow dispatch

**Output:**

- Images published to `ghcr.io/hackathon-perficient-2025/mars-backend`
- Tags: `latest`, `main`, version tags, SHA tags
- Multi-platform: AMD64 and ARM64

## 🚀 Usage

### Pull Docker Image

```bash
docker pull ghcr.io/hackathon-perficient-2025/mars-backend:latest
```

### Run Tests Locally

```bash
npm test
npm run test:coverage
```

### Build Locally

```bash
npm run build
```

## 🔐 Required Secrets

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## 📊 Artifacts

- **Coverage Reports** - 30 days retention
- **Build Artifacts** - 7 days retention

## 🐳 Docker Deployment

Images are automatically built and pushed for:

- Every push to main/master
- Release tags (v\*)
