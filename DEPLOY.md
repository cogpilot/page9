# Deploying Page9 to GitHub Pages

This guide will help you deploy Page9 to GitHub Pages.

## Quick Start

### 1. Create a GitHub Repository

```bash
# Create a new repository on GitHub
# Clone it locally
git clone https://github.com/yourusername/your-page9-site.git
cd your-page9-site

# Copy Page9 files
cp -r /path/to/page9/* .
```

### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select the branch you want to deploy (e.g., `main`)
4. Click **Save**

Your site will be available at: `https://yourusername.github.io/your-page9-site`

### 3. Customize Your Configuration

Edit `page9.config.json` to customize your site:

```json
{
  "namespace": {
    "root": "/your-page9-site",
    "mounts": [
      {
        "path": "/data",
        "target": "/static/data",
        "type": "dir"
      }
    ]
  },
  "kernel": {
    "cachingStrategy": "cache-first"
  }
}
```

**Important**: If your site is in a subdirectory (not at the root of your GitHub Pages domain), update the `namespace.root` to match your repository name.

## Directory Structure

```
your-page9-site/
├── index.html              # Main entry point
├── sw.js                   # Service Worker kernel
├── page9.js               # Client runtime
├── page9.config.json      # Configuration
├── status.json            # Example data file
├── worker.example.js      # Example worker module
├── README.md              # Documentation
└── .gitignore            # Git ignore rules
```

## Configuration Options

### Namespace Mounting

Mount directories to virtual paths:

```json
{
  "namespace": {
    "mounts": [
      {
        "path": "/api",
        "target": "/data/api",
        "type": "dir"
      },
      {
        "path": "/status",
        "target": "/status.json",
        "type": "file"
      }
    ]
  }
}
```

### Routing

Define URL routes:

```json
{
  "routes": {
    "/": {
      "file": "/index.html"
    },
    "/api/status": {
      "file": "/status.json",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### Caching Strategy

Choose how resources are cached:

- `cache-first`: Serve from cache, fallback to network
- `network-first`: Try network first, fallback to cache
- `stale-while-revalidate`: Serve stale cache while updating

```json
{
  "kernel": {
    "cachingStrategy": "cache-first"
  }
}
```

### Web Workers

Configure worker pool:

```json
{
  "workers": {
    "enabled": true,
    "pool": {
      "min": 2,
      "max": 4
    },
    "modules": [
      {
        "name": "compute",
        "path": "/worker.example.js",
        "type": "classic"
      }
    ]
  }
}
```

## Local Development

### Using Python

```bash
python3 -m http.server 8000
```

### Using Node.js

```bash
npx http-server -p 8000
```

### Using PHP

```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

**Note**: Service Workers require HTTPS in production, but work on `localhost` for development.

## Testing Your Deployment

After deploying, verify:

1. **Kernel Status**: Visit your site and check the "Kernel Status" section
   - Should show "Active"
   - Version should be displayed
   - Configuration should load

2. **Worker Test**: Click the "Test Worker" button
   - Should show success message
   - Worker should perform computation

3. **Configuration**: Click "Reload Config"
   - Should reload without errors

4. **Cache**: Click "Clear Cache"
   - Should clear successfully

## Troubleshooting

### Service Worker Not Registering

**Problem**: Kernel status shows as inactive

**Solutions**:
- Ensure you're using HTTPS (required for Service Workers)
- Check browser console for errors
- Verify `sw.js` is accessible at the root
- Try clearing browser cache and reloading

### Configuration Not Loading

**Problem**: Configuration shows as default values

**Solutions**:
- Verify `page9.config.json` is valid JSON
- Check file is accessible at `/page9.config.json`
- Look for CORS errors in console
- Ensure correct `namespace.root` for subdirectory deployments

### Workers Not Initializing

**Problem**: Worker status shows "No workers initialized"

**Solutions**:
- Check `workers.enabled` is `true` in config
- Verify worker module paths are correct
- Look for worker errors in console
- Ensure worker files are accessible

### Routes Not Working

**Problem**: Custom routes return 404

**Solutions**:
- Verify target files exist
- Check route patterns in configuration
- Ensure Service Worker is active
- Clear cache and reload

## Advanced Configuration

### Custom Worker Module

Create `workers/custom.js`:

```javascript
self.addEventListener('message', (e) => {
  const { type, payload, id } = e.data;
  
  // Your custom logic
  const result = processData(payload);
  
  self.postMessage({ id, result });
});
```

Register in `page9.config.json`:

```json
{
  "workers": {
    "modules": [
      {
        "name": "custom",
        "path": "/workers/custom.js",
        "type": "module"
      }
    ]
  }
}
```

### Dynamic Content

Serve different content based on paths:

```json
{
  "routes": {
    "/blog/*": {
      "file": "/blog/{slug}.html"
    }
  }
}
```

### API Simulation

Create a mock API using static JSON files:

```
data/
  api/
    users.json
    posts.json
    comments.json
```

Mount the API:

```json
{
  "namespace": {
    "mounts": [
      {
        "path": "/api",
        "target": "/data/api",
        "type": "dir"
      }
    ]
  }
}
```

Access at: `/api/users.json`, `/api/posts.json`, etc.

## Performance Tips

1. **Use Cache-First**: For static assets that rarely change
2. **Enable Workers**: Offload heavy computation
3. **Optimize Files**: Minify JS/CSS before deployment
4. **Lazy Load**: Load resources on demand
5. **Service Worker Updates**: Version your kernel for cache busting

## Security Considerations

1. **HTTPS Only**: Service Workers require HTTPS
2. **Same-Origin**: All resources must be same-origin
3. **CSP**: Compatible with Content Security Policy
4. **No Secrets**: Don't store secrets in client code
5. **Input Validation**: Validate all user input

## GitHub Actions Deployment

Automate deployment with GitHub Actions:

```yaml
name: Deploy Page9

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

## Resources

- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Plan9 Documentation](https://9p.io/plan9/)

## Support

For issues and questions:
- Check browser console for errors
- Review configuration syntax
- Test locally before deploying
- Verify all files are committed to git

---

Happy deploying! 🚀
