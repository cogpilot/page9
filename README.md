# Page9

**Plan9 Philosophy Applied to GitHub Pages**

Page9 brings the elegant simplicity of Plan9's "everything is a file" philosophy to GitHub Pages by using Service Workers as a client-side runtime kernel. This enables fully self-contained, zero-backend deployments with sophisticated runtime behavior.

## Core Philosophy

Page9 embraces Plan9's fundamental principles in a web context:

- **Everything is a File**: All resources are accessed through file-like interfaces
- **Namespace Mounting**: Virtual file system with configurable mount points
- **Simple, Universal Interface**: Uniform access to all system resources
- **Distributed Computing**: Service Workers + Web Workers = distributed process model
- **Zero Backend**: Pure static deployment on GitHub Pages

## Architecture

```
┌─────────────────────────────────────────┐
│         GitHub Pages (Static)           │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│     Service Worker (Kernel)             │
│  • Configuration Interpreter            │
│  • Request Router                       │
│  • Namespace Manager                    │
│  • Caching Strategy                     │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────┐      ┌──────────────┐
│ Config File  │      │ Web Workers  │
│ (page9.json) │      │ (Isolation)  │
└──────────────┘      └──────────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────┐
│         Static Resources                │
│  • HTML, CSS, JS                        │
│  • Data Files                           │
│  • Mounted Namespaces                   │
└─────────────────────────────────────────┘
```

## Components

### 1. Service Worker Kernel (`sw.js`)

The Service Worker acts as a client-side kernel that:

- **Interprets Configuration**: Reads `page9.config.json` at runtime
- **Routes Requests**: Maps URLs to files using Plan9-style namespaces
- **Manages Cache**: Implements configurable caching strategies
- **Handles Mounts**: Translates virtual paths to actual resources
- **Provides Protocol**: Communication channel with Web Workers

### 2. Configuration File (`page9.config.json`)

Defines runtime behavior through a declarative configuration:

```json
{
  "namespace": {
    "root": "/",
    "mounts": [
      {
        "path": "/data",
        "target": "/static/data",
        "type": "dir"
      }
    ]
  },
  "kernel": {
    "cachingStrategy": "cache-first",
    "interceptPatterns": ["/*"]
  },
  "workers": {
    "enabled": true,
    "pool": { "min": 2, "max": 4 }
  },
  "routes": {
    "/api/status": {
      "file": "/status.json",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### 3. Client Runtime (`page9.js`)

Manages the client-side system:

- **Kernel Registration**: Registers and communicates with Service Worker
- **Worker Pool**: Manages Web Workers for process isolation
- **Configuration Loading**: Loads and applies configuration
- **Status Monitoring**: Provides visibility into system state

### 4. Web Workers

Provide process isolation for compute-intensive tasks:

- **Message-Based IPC**: Communication via postMessage protocol
- **Resource Isolation**: Separate execution contexts
- **Parallel Execution**: True multi-threading capability
- **Configurable Pool**: Dynamic worker pool management

## Key Features

### Plan9-Style Namespaces

Mount virtual paths to actual resources:

```json
{
  "namespace": {
    "mounts": [
      {
        "path": "/data",
        "target": "/static/data",
        "type": "dir"
      },
      {
        "path": "/api/status",
        "target": "/status.json",
        "type": "file"
      }
    ]
  }
}
```

### File-Based Routing

Route URLs to files with custom headers:

```json
{
  "routes": {
    "/status": {
      "file": "/status.json",
      "headers": {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    }
  }
}
```

### Configurable Caching

Choose caching strategy per deployment:

- **cache-first**: Serve from cache, fallback to network
- **network-first**: Try network first, fallback to cache
- **stale-while-revalidate**: Serve cache immediately, update in background

### Zero Backend Requirement

Everything runs client-side:

- No server-side code
- No databases
- No API endpoints
- Pure static files on GitHub Pages

## Getting Started

### 1. Deploy to GitHub Pages

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Choose the branch to deploy (e.g., `main`)
4. Your site will be available at `https://username.github.io/page9`

### 2. Customize Configuration

Edit `page9.config.json` to define your namespace and routing:

```json
{
  "namespace": {
    "root": "/",
    "mounts": [
      {
        "path": "/your-mount",
        "target": "/your-target",
        "type": "dir"
      }
    ]
  },
  "routes": {
    "/your-route": {
      "file": "/your-file.html"
    }
  }
}
```

### 3. Test Locally

Serve with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# Or any other static server
```

Visit `http://localhost:8000` and verify:
- Kernel status shows "Active"
- Configuration loads correctly
- Workers initialize successfully

## Use Cases

### Static API Simulation

Create a mock API using JSON files and namespace mounting:

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

### Documentation Sites

Serve documentation with intelligent caching:

```json
{
  "kernel": {
    "cachingStrategy": "stale-while-revalidate"
  },
  "routes": {
    "/docs/*": {
      "file": "/documentation/{path}.html"
    }
  }
}
```

### Single Page Applications

Route all paths to your SPA:

```json
{
  "routes": {
    "/*": {
      "file": "/index.html"
    }
  }
}
```

### Computational Workloads

Offload work to Web Workers:

```json
{
  "workers": {
    "enabled": true,
    "pool": { "min": 4, "max": 8 },
    "modules": [
      {
        "name": "compute",
        "path": "/workers/compute.js",
        "type": "module"
      }
    ]
  }
}
```

## Plan9 Concepts

### Everything is a File

In Page9, all resources are accessed through file-like interfaces:

- HTML pages are files
- API responses are files (JSON)
- Configuration is a file
- Even routes map to files

### Namespace Mounting

Like Plan9's `bind` and `mount`, Page9 lets you:

- Mount directories to virtual paths
- Overlay multiple sources
- Create unified namespaces
- Transparent path translation

### Simple Interfaces

Uniform access patterns:

- HTTP requests → File reads
- Service Worker → Kernel
- Web Workers → Processes
- Configuration → System calls

## Technical Details

### Browser Support

Requires:
- Service Workers (all modern browsers)
- Web Workers (all modern browsers)
- ES6+ JavaScript
- Fetch API

### Performance

- **Offline-First**: Service Worker caches enable offline operation
- **Fast Loading**: Aggressive caching strategies
- **Parallel Processing**: Web Workers for compute tasks
- **Zero Latency**: No network round-trips for cached resources

### Security

- **Same-Origin**: All resources must be same-origin
- **HTTPS Required**: Service Workers require HTTPS (or localhost)
- **Content Security Policy**: Compatible with CSP
- **No Server Code**: No server-side attack surface

## Advanced Usage

### Custom Worker Modules

Create custom worker modules for specialized tasks:

```javascript
// workers/custom.js
self.addEventListener('message', (e) => {
  const { type, payload } = e.data;
  
  if (type === 'PROCESS') {
    // Your processing logic
    const result = processData(payload);
    self.postMessage({ result });
  }
});
```

Register in configuration:

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

### Dynamic Routing

Implement pattern-based routing:

```json
{
  "routes": {
    "/blog/*": {
      "file": "/blog/{slug}.html"
    },
    "/api/*": {
      "file": "/data/{path}.json"
    }
  }
}
```

### Cache Management

Control caching behavior:

```javascript
// Reload configuration
page9.reloadConfig();

// Clear cache
page9.clearCache();

// Query kernel status
const status = await page9.getKernelStatus();
```

## Comparison with Traditional Architectures

| Feature | Traditional | Page9 |
|---------|------------|-------|
| Backend | Required | None |
| Database | Required | Static files |
| Deployment | Complex | Git push |
| Scaling | Horizontal | CDN |
| Cost | Server costs | Free (GitHub Pages) |
| Maintenance | Ongoing | Minimal |

## Philosophy in Practice

### Simplicity

- One configuration file
- No build process required
- No dependencies
- Pure web standards

### Universality

- Same interface for all resources
- File-based everything
- Uniform access patterns

### Transparency

- Configuration is declarative
- Behavior is explicit
- No hidden magic

### Composability

- Mount namespaces
- Chain workers
- Combine configurations

## Contributing

Contributions welcome! This project embraces:

- Plan9 philosophy
- Web standards
- Simplicity over complexity
- Configuration over code

## License

GNU Affero General Public License v3.0 (AGPL-3.0)

## Acknowledgments

Inspired by:
- Plan9 from Bell Labs
- Service Workers specification
- The Unix philosophy
- Static site generators
- JAMstack architecture

---

**Page9**: Where Plan9 meets the web, and everything is a file.
