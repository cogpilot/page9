# Page9 Architecture

## Overview

Page9 implements Plan9's "everything is a file" philosophy on GitHub Pages using Service Workers as a client-side runtime kernel. This document provides a detailed technical overview of the architecture.

## System Components

### 1. Service Worker Kernel (sw.js)

The Service Worker acts as the system kernel, implementing:

#### Request Interception
```javascript
// All requests pass through the kernel
self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
```

#### Configuration Interpretation
- Loads `page9.config.json` at startup
- Interprets routing rules
- Manages namespace mounts
- Applies caching strategies

#### Namespace Management
```javascript
// Plan9-style path translation
const mount = findMount(pathname);
const targetPath = mount.target + relativePath;
```

#### Caching Strategies

**Cache-First**
```
Request → Cache Check → Return Cached | Fetch Network → Cache → Return
```

**Network-First**
```
Request → Fetch Network → Cache → Return | Cache Check → Return Cached
```

**Stale-While-Revalidate**
```
Request → Return Cached → Fetch Network → Update Cache
```

### 2. Client Runtime (page9.js)

Manages the client-side system:

#### Kernel Registration
```javascript
await navigator.serviceWorker.register('/sw.js');
await navigator.serviceWorker.ready;
```

#### Worker Pool Management
```javascript
// Initialize worker pool based on config
for (let i = 0; i < poolSize; i++) {
  const worker = createWorker(`worker-${i}`);
  workerPool.push(worker);
}
```

#### Message Protocol
```javascript
// Send message to kernel
messageChannel.port1.onmessage = (event) => {
  // Handle response
};
navigator.serviceWorker.controller.postMessage(
  { type: 'KERNEL_STATUS' },
  [messageChannel.port2]
);
```

### 3. Configuration System (page9.config.json)

Declarative configuration defining runtime behavior:

```json
{
  "namespace": {
    "root": "/",
    "mounts": [
      {
        "path": "/virtual",
        "target": "/physical",
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
    "pool": { "min": 2, "max": 4 },
    "modules": []
  },
  "routes": {
    "/api/*": {
      "file": "/data/{path}.json",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### 4. Web Workers

Process isolation for compute-intensive tasks:

#### Worker Protocol
```javascript
self.addEventListener('message', (event) => {
  const { type, payload, id } = event.data;
  
  // Process request
  const result = processData(payload);
  
  // Return result
  self.postMessage({ id, result });
});
```

#### Worker Pool
- Minimum and maximum pool sizes
- Dynamic worker allocation
- Load balancing across workers

## Plan9 Concepts in Page9

### Everything is a File

| Concept | Page9 Implementation |
|---------|---------------------|
| Files | Static resources (HTML, CSS, JS, JSON) |
| Directories | Namespace mounts |
| Devices | Service Worker interfaces |
| Processes | Web Workers |

### Namespace Mounting

Plan9's `bind` and `mount` operations map to namespace configuration:

```json
{
  "namespace": {
    "mounts": [
      {
        "path": "/data",
        "target": "/static/data",
        "type": "dir"
      }
    ]
  }
}
```

Access pattern:
```
GET /data/file.json → /static/data/file.json
```

### Union Directories

Multiple mounts can overlay the same virtual path:

```json
{
  "namespace": {
    "mounts": [
      {
        "path": "/resources",
        "target": "/local",
        "type": "dir"
      },
      {
        "path": "/resources",
        "target": "/cache",
        "type": "dir"
      }
    ]
  }
}
```

### Per-Process Namespaces

Each Web Worker operates in its own namespace context.

## Request Flow

### 1. Client Request
```
Browser → Service Worker Kernel
```

### 2. Kernel Processing
```
Service Worker:
  1. Parse URL
  2. Match route configuration
  3. Check namespace mounts
  4. Apply caching strategy
  5. Return response
```

### 3. Namespace Translation
```
Virtual Path → Mount Lookup → Physical Path
```

### 4. Response Generation
```
Physical Path → Fetch/Cache → Apply Headers → Return
```

## Communication Protocols

### Kernel ↔ Client

#### Message Types
- `KERNEL_STATUS`: Query kernel state
- `RELOAD_CONFIG`: Reload configuration
- `CLEAR_CACHE`: Clear kernel cache

#### Protocol
```javascript
const channel = new MessageChannel();
channel.port1.onmessage = (event) => {
  const { version, config, active } = event.data;
};
navigator.serviceWorker.controller.postMessage(
  { type: 'KERNEL_STATUS' },
  [channel.port2]
);
```

### Client ↔ Workers

#### Message Types
- `ECHO`: Echo test
- `COMPUTE`: Computation task
- `HASH`: Hash computation
- `STATUS`: Worker status

#### Protocol
```javascript
worker.postMessage({ type, payload, id });
worker.addEventListener('message', (event) => {
  const { id, result, error } = event.data;
});
```

## Caching Architecture

### Cache Hierarchy
```
Memory → Service Worker Cache → Network
```

### Cache Invalidation
1. Version-based: Kernel version in cache name
2. Manual: User-triggered clear
3. Automatic: Old versions cleaned on activation

### Cache Strategies

#### Cache-First (Default)
Best for: Static assets, infrequently updated content
```javascript
const cached = await cache.match(request);
return cached || fetch(request);
```

#### Network-First
Best for: Dynamic content, API calls
```javascript
try {
  return await fetch(request);
} catch {
  return await cache.match(request);
}
```

#### Stale-While-Revalidate
Best for: Frequently updated content with fast loading
```javascript
const cached = await cache.match(request);
fetchAndCache(request); // Background update
return cached || fetchAndCache(request);
```

## Security Model

### Same-Origin Policy
All resources must be same-origin:
```
✓ https://example.github.io/page9/resource.json
✗ https://external.com/resource.json
```

### HTTPS Requirement
Service Workers require HTTPS (or localhost):
```
✓ https://example.github.io
✓ http://localhost:8000
✗ http://example.com
```

### Content Security Policy
Compatible with CSP:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; worker-src 'self'">
```

### No Server-Side Code
- No server-side attack surface
- No database vulnerabilities
- No API injection points

## Performance Characteristics

### Latency
- Cached requests: ~1-10ms
- Network requests: ~50-500ms
- Worker computation: Depends on task

### Throughput
- Service Worker: ~1000 req/sec
- Web Workers: Parallel execution
- Cache: Limited by browser storage

### Storage
- Service Worker Cache: ~50MB default
- IndexedDB: ~50% of available disk
- Configuration: <1KB

## Deployment Architecture

### Static Deployment
```
GitHub Repository
    ↓ (Git Push)
GitHub Pages CDN
    ↓ (HTTPS)
User Browser
    ↓ (Service Worker)
Page9 Kernel
```

### Update Flow
```
Code Update → Git Push → GitHub Pages Deploy → 
Service Worker Update → User Reload → New Kernel Active
```

### Versioning
```javascript
const KERNEL_VERSION = '0.1.0';
const CACHE_NAME = `page9-kernel-v${KERNEL_VERSION}`;
```

## Scalability

### Horizontal Scaling
- CDN distribution (GitHub Pages)
- No backend bottleneck
- Unlimited read capacity

### Worker Scaling
```json
{
  "workers": {
    "pool": {
      "min": 2,
      "max": 8
    }
  }
}
```

### Cache Scaling
- Per-user caching
- No shared state
- Independent instances

## Extension Points

### Custom Workers
```javascript
// custom-worker.js
self.addEventListener('message', (e) => {
  // Custom processing logic
});
```

### Custom Routes
```json
{
  "routes": {
    "/custom/*": {
      "file": "/handlers/{path}.json",
      "transform": "custom-worker"
    }
  }
}
```

### Custom Caching
```javascript
// Implement custom caching logic
async function customCachingStrategy(request) {
  // Your logic here
}
```

## Comparison with Traditional Architectures

### Traditional Web App
```
Client → Load Balancer → Web Server → App Server → Database
```

### Page9
```
Client → Service Worker Kernel → Static Files
```

### Benefits
- **Simplicity**: Single deployment unit
- **Cost**: Free hosting on GitHub Pages
- **Performance**: CDN + aggressive caching
- **Scalability**: CDN handles all traffic
- **Maintenance**: No server maintenance

### Trade-offs
- **Static Only**: No server-side computation
- **Client Resources**: Compute on client
- **Storage**: Browser storage limits
- **Compatibility**: Modern browsers only

## Future Directions

### Potential Extensions
1. **IndexedDB Integration**: Persistent client-side database
2. **WebAssembly Workers**: High-performance computation
3. **Offline Sync**: Background synchronization
4. **P2P Communication**: WebRTC for distributed systems
5. **Progressive Enhancement**: Graceful degradation

### Plan9 Inspirations
1. **9P Protocol**: Implement 9P-like protocol over WebSockets
2. **Plumber**: Inter-application messaging
3. **Acme**: Programmable interface model
4. **Fossil**: Content-addressable storage

## Resources

### Plan9 References
- Plan9 from Bell Labs: https://9p.io/plan9/
- Plan9 Papers: https://9p.io/sys/doc/
- Namespace man page: http://man.cat-v.org/plan_9/1/namespace

### Web Standards
- Service Workers: https://www.w3.org/TR/service-workers/
- Web Workers: https://html.spec.whatwg.org/multipage/workers.html
- Cache API: https://www.w3.org/TR/service-workers/#cache-interface

### GitHub Pages
- Documentation: https://docs.github.com/en/pages
- Custom Domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

---

**Page9**: Bringing Plan9's elegant simplicity to the web.
