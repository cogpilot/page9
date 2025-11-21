# Page9 Examples

This document provides practical examples of using Page9.

## Example 1: Simple Static Site

### Structure
```
/
├── index.html
├── about.html
├── contact.html
└── page9.config.json
```

### Configuration
```json
{
  "namespace": {
    "root": "/"
  },
  "kernel": {
    "cachingStrategy": "cache-first"
  },
  "routes": {
    "/": {
      "file": "/index.html"
    },
    "/about": {
      "file": "/about.html"
    },
    "/contact": {
      "file": "/contact.html"
    }
  }
}
```

## Example 2: Mock API

### Structure
```
/
├── index.html
├── data/
│   ├── users.json
│   ├── posts.json
│   └── comments.json
└── page9.config.json
```

### Configuration
```json
{
  "namespace": {
    "root": "/",
    "mounts": [
      {
        "path": "/api",
        "target": "/data",
        "type": "dir"
      }
    ]
  },
  "kernel": {
    "cachingStrategy": "network-first"
  },
  "routes": {
    "/api/users": {
      "file": "/data/users.json",
      "headers": {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=300"
      }
    },
    "/api/posts": {
      "file": "/data/posts.json",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### Data Files

**data/users.json**
```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com"
  },
  {
    "id": 2,
    "name": "Bob",
    "email": "bob@example.com"
  }
]
```

**data/posts.json**
```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "First Post",
    "body": "This is my first post!"
  },
  {
    "id": 2,
    "userId": 2,
    "title": "Second Post",
    "body": "Hello from Bob!"
  }
]
```

### Usage
```javascript
// Fetch users
const users = await fetch('/api/users').then(r => r.json());

// Fetch posts
const posts = await fetch('/api/posts').then(r => r.json());
```

## Example 3: Documentation Site

### Structure
```
/
├── index.html
├── docs/
│   ├── getting-started.html
│   ├── api-reference.html
│   └── examples.html
└── page9.config.json
```

### Configuration
```json
{
  "namespace": {
    "root": "/"
  },
  "kernel": {
    "cachingStrategy": "stale-while-revalidate"
  },
  "routes": {
    "/": {
      "file": "/index.html"
    },
    "/docs/*": {
      "file": "/docs/{path}.html",
      "headers": {
        "Content-Type": "text/html",
        "Cache-Control": "max-age=3600"
      }
    }
  }
}
```

## Example 4: SPA with Client-Side Routing

### Structure
```
/
├── index.html
├── app.js
└── page9.config.json
```

### Configuration
```json
{
  "namespace": {
    "root": "/"
  },
  "kernel": {
    "cachingStrategy": "cache-first"
  },
  "routes": {
    "/*": {
      "file": "/index.html",
      "headers": {
        "Content-Type": "text/html"
      }
    }
  }
}
```

### index.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>SPA Example</title>
</head>
<body>
  <div id="app"></div>
  <script>
    // Handle client-side routing
    window.addEventListener('popstate', () => {
      renderRoute(location.pathname);
    });
    
    function renderRoute(path) {
      const app = document.getElementById('app');
      
      switch(path) {
        case '/':
          app.innerHTML = '<h1>Home</h1>';
          break;
        case '/about':
          app.innerHTML = '<h1>About</h1>';
          break;
        default:
          app.innerHTML = '<h1>404</h1>';
      }
    }
    
    renderRoute(location.pathname);
  </script>
</body>
</html>
```

## Example 5: Compute-Intensive Tasks with Workers

### Structure
```
/
├── index.html
├── workers/
│   ├── image-processor.js
│   └── data-analyzer.js
└── page9.config.json
```

### Configuration
```json
{
  "namespace": {
    "root": "/"
  },
  "kernel": {
    "cachingStrategy": "cache-first"
  },
  "workers": {
    "enabled": true,
    "pool": {
      "min": 4,
      "max": 8
    },
    "modules": [
      {
        "name": "image-processor",
        "path": "/workers/image-processor.js",
        "type": "module"
      },
      {
        "name": "data-analyzer",
        "path": "/workers/data-analyzer.js",
        "type": "module"
      }
    ]
  }
}
```

### workers/image-processor.js
```javascript
self.addEventListener('message', async (e) => {
  const { type, payload, id } = e.data;
  
  if (type === 'PROCESS_IMAGE') {
    const { imageData, filter } = payload;
    
    // Apply filter to image data
    const processed = applyFilter(imageData, filter);
    
    self.postMessage({ id, result: processed });
  }
});

function applyFilter(imageData, filter) {
  // Image processing logic
  return imageData; // Processed image data
}
```

### Usage
```javascript
// Get worker from page9
const worker = page9.workers.get('image-processor');

// Process image
const result = await page9.sendToWorker(
  'image-processor',
  'PROCESS_IMAGE',
  { imageData, filter: 'grayscale' }
);
```

## Example 6: Multi-Language Site

### Structure
```
/
├── index.html
├── en/
│   ├── index.html
│   └── about.html
├── es/
│   ├── index.html
│   └── about.html
└── page9.config.json
```

### Configuration
```json
{
  "namespace": {
    "root": "/",
    "mounts": [
      {
        "path": "/en",
        "target": "/en",
        "type": "dir"
      },
      {
        "path": "/es",
        "target": "/es",
        "type": "dir"
      }
    ]
  },
  "kernel": {
    "cachingStrategy": "cache-first"
  },
  "routes": {
    "/": {
      "file": "/index.html"
    },
    "/en/*": {
      "file": "/en/{path}.html"
    },
    "/es/*": {
      "file": "/es/{path}.html"
    }
  }
}
```

## Example 7: Progressive Web App

### Structure
```
/
├── index.html
├── manifest.json
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── page9.config.json
```

### manifest.json
```json
{
  "name": "Page9 PWA",
  "short_name": "Page9",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#00ff00",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Configuration
```json
{
  "namespace": {
    "root": "/"
  },
  "kernel": {
    "cachingStrategy": "cache-first",
    "interceptPatterns": ["/*"]
  },
  "routes": {
    "/manifest.json": {
      "file": "/manifest.json",
      "headers": {
        "Content-Type": "application/manifest+json"
      }
    }
  }
}
```

### index.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>Page9 PWA</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#00ff00">
</head>
<body>
  <h1>Page9 PWA</h1>
  <button id="install">Install App</button>
  
  <script>
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById('install').style.display = 'block';
    });
    
    document.getElementById('install').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install outcome:', outcome);
        deferredPrompt = null;
      }
    });
  </script>
</body>
</html>
```

## Example 8: Blog with Static Generation

### Structure
```
/
├── index.html
├── blog/
│   ├── 2024-01-01-first-post.html
│   ├── 2024-01-15-second-post.html
│   └── index.json
└── page9.config.json
```

### blog/index.json
```json
{
  "posts": [
    {
      "slug": "2024-01-01-first-post",
      "title": "First Post",
      "date": "2024-01-01",
      "excerpt": "This is my first blog post..."
    },
    {
      "slug": "2024-01-15-second-post",
      "title": "Second Post",
      "date": "2024-01-15",
      "excerpt": "Another great post..."
    }
  ]
}
```

### Configuration
```json
{
  "namespace": {
    "root": "/"
  },
  "kernel": {
    "cachingStrategy": "stale-while-revalidate"
  },
  "routes": {
    "/blog": {
      "file": "/blog/index.json",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "/blog/*": {
      "file": "/blog/{slug}.html",
      "headers": {
        "Content-Type": "text/html"
      }
    }
  }
}
```

## Example 9: Data Visualization Dashboard

### Structure
```
/
├── index.html
├── data/
│   ├── metrics.json
│   └── analytics.json
├── workers/
│   └── data-processor.js
└── page9.config.json
```

### Configuration
```json
{
  "namespace": {
    "root": "/",
    "mounts": [
      {
        "path": "/api/data",
        "target": "/data",
        "type": "dir"
      }
    ]
  },
  "kernel": {
    "cachingStrategy": "network-first"
  },
  "workers": {
    "enabled": true,
    "pool": { "min": 2, "max": 4 },
    "modules": [
      {
        "name": "data-processor",
        "path": "/workers/data-processor.js",
        "type": "module"
      }
    ]
  }
}
```

### workers/data-processor.js
```javascript
self.addEventListener('message', (e) => {
  const { type, payload, id } = e.data;
  
  if (type === 'AGGREGATE') {
    const aggregated = aggregateData(payload.data);
    self.postMessage({ id, result: aggregated });
  }
});

function aggregateData(data) {
  // Aggregation logic
  return data.reduce((acc, item) => {
    acc.total += item.value;
    acc.count++;
    return acc;
  }, { total: 0, count: 0 });
}
```

## Example 10: Offline-First App

### Configuration
```json
{
  "namespace": {
    "root": "/"
  },
  "kernel": {
    "cachingStrategy": "cache-first",
    "interceptPatterns": ["/*"]
  },
  "routes": {
    "/offline": {
      "file": "/offline.html",
      "headers": {
        "Content-Type": "text/html"
      }
    }
  }
}
```

### Service Worker Enhancement
```javascript
// In sw.js, add offline fallback
async function handleDefaultRequest(request) {
  try {
    return await cacheFirst(request);
  } catch (error) {
    // Offline fallback
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}
```

### offline.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>Offline - Page9</title>
</head>
<body>
  <h1>You're Offline</h1>
  <p>Please check your internet connection.</p>
  <button onclick="location.reload()">Retry</button>
</body>
</html>
```

## Best Practices

### 1. Configuration Organization
- Keep configuration files small and focused
- Use meaningful mount point names
- Document complex routing patterns

### 2. Caching Strategies
- Static assets: `cache-first`
- Dynamic content: `network-first`
- Frequently updated: `stale-while-revalidate`

### 3. Worker Usage
- Use workers for CPU-intensive tasks
- Keep worker pool size reasonable
- Implement proper error handling

### 4. File Organization
- Group related files in directories
- Use consistent naming conventions
- Keep namespace hierarchy shallow

### 5. Performance
- Minimize configuration file size
- Pre-cache critical resources
- Use worker pool efficiently

---

For more examples, see the [README](README.md) and [ARCHITECTURE](ARCHITECTURE.md) documentation.
