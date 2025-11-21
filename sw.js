/**
 * Page9 Service Worker - The Runtime Kernel
 * 
 * Implements Plan9 philosophy on GitHub Pages:
 * - Everything is a file
 * - Service Worker acts as the kernel
 * - Configuration-driven behavior
 * - Zero backend requirements
 */

const KERNEL_VERSION = '0.1.0';
const CONFIG_PATH = '/page9.config.json';
const CACHE_NAME = `page9-kernel-v${KERNEL_VERSION}`;

let kernelConfig = null;

/**
 * Install Event - Kernel Initialization
 */
self.addEventListener('install', (event) => {
  console.log('[Page9 Kernel] Installing kernel v' + KERNEL_VERSION);
  
  event.waitUntil(
    loadKernelConfig()
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate Event - Kernel Activation
 */
self.addEventListener('activate', (event) => {
  console.log('[Page9 Kernel] Activating kernel v' + KERNEL_VERSION);
  
  event.waitUntil(
    cleanOldCaches()
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch Event - Request Interception (Core Kernel Function)
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignore non-same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    handleRequest(event.request)
  );
});

/**
 * Message Event - Worker Communication Protocol
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'KERNEL_STATUS':
      event.ports[0].postMessage({
        version: KERNEL_VERSION,
        config: kernelConfig,
        active: true
      });
      break;
      
    case 'RELOAD_CONFIG':
      loadKernelConfig().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('[Page9 Kernel] Unknown message type:', type);
  }
});

/**
 * Load Kernel Configuration
 */
async function loadKernelConfig() {
  try {
    const response = await fetch(CONFIG_PATH);
    if (!response.ok) {
      console.warn('[Page9 Kernel] No config found, using defaults');
      kernelConfig = getDefaultConfig();
      return;
    }
    
    kernelConfig = await response.json();
    console.log('[Page9 Kernel] Configuration loaded:', kernelConfig);
  } catch (error) {
    console.error('[Page9 Kernel] Failed to load config:', error);
    kernelConfig = getDefaultConfig();
  }
}

/**
 * Default Kernel Configuration
 */
function getDefaultConfig() {
  return {
    namespace: {
      root: '/',
      mounts: []
    },
    kernel: {
      version: KERNEL_VERSION,
      cachingStrategy: 'cache-first',
      interceptPatterns: ['/*']
    },
    workers: {
      enabled: true,
      pool: { min: 1, max: 4 },
      modules: []
    },
    routes: {}
  };
}

/**
 * Handle Request - Core Routing Logic (Plan9 style)
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Load config if not loaded
  if (!kernelConfig) {
    await loadKernelConfig();
  }
  
  // Check if path matches a configured route
  const route = matchRoute(pathname);
  if (route) {
    return handleRouteRequest(request, route);
  }
  
  // Check namespace mounts
  const mount = findMount(pathname);
  if (mount) {
    return handleMountRequest(request, mount);
  }
  
  // Default behavior based on caching strategy
  return handleDefaultRequest(request);
}

/**
 * Match Route Configuration
 */
function matchRoute(pathname) {
  if (!kernelConfig.routes) return null;
  
  // Exact match
  if (kernelConfig.routes[pathname]) {
    return kernelConfig.routes[pathname];
  }
  
  // Pattern matching
  for (const [pattern, route] of Object.entries(kernelConfig.routes)) {
    if (matchPattern(pathname, pattern)) {
      return route;
    }
  }
  
  return null;
}

/**
 * Simple Pattern Matching
 */
function matchPattern(pathname, pattern) {
  // Convert pattern to regex (simple implementation)
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\//g, '\\/');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

/**
 * Find Mount Point (Plan9 namespace style)
 */
function findMount(pathname) {
  if (!kernelConfig.namespace?.mounts) return null;
  
  // Find longest matching mount
  let bestMatch = null;
  let bestLength = 0;
  
  for (const mount of kernelConfig.namespace.mounts) {
    if (pathname.startsWith(mount.path) && mount.path.length > bestLength) {
      bestMatch = mount;
      bestLength = mount.path.length;
    }
  }
  
  return bestMatch;
}

/**
 * Handle Route Request
 */
async function handleRouteRequest(request, route) {
  try {
    const fileUrl = new URL(route.file, self.location.origin);
    const fileRequest = new Request(fileUrl, {
      method: request.method,
      headers: request.headers
    });
    
    const response = await fetch(fileRequest);
    
    // Apply custom headers if specified
    if (route.headers) {
      const headers = new Headers(response.headers);
      for (const [key, value] of Object.entries(route.headers)) {
        headers.set(key, value);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
    
    return response;
  } catch (error) {
    console.error('[Page9 Kernel] Route request failed:', error);
    return new Response('Route not found', { status: 404 });
  }
}

/**
 * Handle Mount Request (Plan9 namespace translation)
 */
async function handleMountRequest(request, mount) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Translate path through mount
  const relativePath = pathname.substring(mount.path.length);
  const targetPath = mount.target + relativePath;
  
  try {
    const targetUrl = new URL(targetPath, self.location.origin);
    return fetch(new Request(targetUrl, {
      method: request.method,
      headers: request.headers
    }));
  } catch (error) {
    console.error('[Page9 Kernel] Mount request failed:', error);
    return new Response('Mount point not accessible', { status: 404 });
  }
}

/**
 * Handle Default Request with Caching Strategy
 */
async function handleDefaultRequest(request) {
  const strategy = kernelConfig?.kernel?.cachingStrategy || 'cache-first';
  
  switch (strategy) {
    case 'cache-first':
      return cacheFirst(request);
    case 'network-first':
      return networkFirst(request);
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

/**
 * Cache-First Strategy
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Page9 Kernel] Fetch failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network-First Strategy
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Network error and no cache', { status: 503 });
  }
}

/**
 * Stale-While-Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

/**
 * Clean Old Caches
 */
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames
      .filter(name => name.startsWith('page9-kernel-') && name !== CACHE_NAME)
      .map(name => caches.delete(name))
  );
}

/**
 * Clear All Caches
 */
async function clearCache() {
  return caches.delete(CACHE_NAME);
}

console.log('[Page9 Kernel] Service Worker loaded v' + KERNEL_VERSION);
