/**
 * Page9 Client Runtime
 * 
 * Manages Service Worker kernel and Web Worker pool
 */

class Page9 {
  constructor() {
    this.kernelReady = false;
    this.workers = new Map();
    this.workerPool = [];
    this.config = null;
    
    this.init();
  }
  
  /**
   * Initialize Page9 System
   */
  async init() {
    console.log('[Page9] Initializing...');
    
    // Register Service Worker (Kernel)
    if ('serviceWorker' in navigator) {
      try {
        await this.registerKernel();
        await this.loadConfig();
        this.updateStatus();
        this.initializeWorkers();
      } catch (error) {
        console.error('[Page9] Initialization failed:', error);
        this.showError('Failed to initialize Page9: ' + error.message);
      }
    } else {
      this.showError('Service Workers not supported in this browser');
    }
  }
  
  /**
   * Register Service Worker Kernel
   */
  async registerKernel() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Page9] Kernel registered:', registration.scope);
      
      // Wait for kernel to be ready
      await navigator.serviceWorker.ready;
      this.kernelReady = true;
      
      // Listen for kernel updates
      registration.addEventListener('updatefound', () => {
        console.log('[Page9] Kernel update found');
      });
      
      return registration;
    } catch (error) {
      console.error('[Page9] Kernel registration failed:', error);
      throw error;
    }
  }
  
  /**
   * Load Configuration
   */
  async loadConfig() {
    try {
      const response = await fetch('/page9.config.json');
      if (response.ok) {
        this.config = await response.json();
        console.log('[Page9] Configuration loaded:', this.config);
        this.displayConfig();
      } else {
        console.warn('[Page9] No configuration found, using defaults');
        this.config = this.getDefaultConfig();
      }
    } catch (error) {
      console.error('[Page9] Failed to load config:', error);
      this.config = this.getDefaultConfig();
    }
  }
  
  /**
   * Get Default Configuration
   */
  getDefaultConfig() {
    return {
      namespace: {
        root: '/',
        mounts: []
      },
      kernel: {
        version: '0.1.0',
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
   * Initialize Web Workers
   */
  async initializeWorkers() {
    if (!this.config.workers?.enabled) {
      console.log('[Page9] Workers disabled');
      return;
    }
    
    const poolSize = this.config.workers.pool?.min || 1;
    console.log(`[Page9] Initializing worker pool (size: ${poolSize})`);
    
    // Initialize worker pool
    for (let i = 0; i < poolSize; i++) {
      const worker = this.createWorker(`worker-${i}`);
      this.workerPool.push(worker);
    }
    
    // Load configured worker modules
    if (this.config.workers.modules) {
      for (const module of this.config.workers.modules) {
        await this.loadWorkerModule(module);
      }
    }
    
    this.updateWorkerStatus();
  }
  
  /**
   * Create a Web Worker
   */
  createWorker(name) {
    // Create inline worker for demonstration
    const workerCode = `
      self.addEventListener('message', (e) => {
        const { type, payload, id } = e.data;
        
        switch(type) {
          case 'ECHO':
            self.postMessage({ id, result: payload });
            break;
          case 'COMPUTE':
            // Example computation
            const result = payload.value * 2;
            self.postMessage({ id, result });
            break;
          default:
            self.postMessage({ id, error: 'Unknown message type' });
        }
      });
      
      console.log('[Page9 Worker] Worker initialized');
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    worker.name = name;
    this.workers.set(name, worker);
    
    console.log(`[Page9] Worker created: ${name}`);
    return worker;
  }
  
  /**
   * Load Worker Module
   */
  async loadWorkerModule(module) {
    try {
      const worker = new Worker(module.path, {
        type: module.type || 'module'
      });
      
      this.workers.set(module.name, worker);
      console.log(`[Page9] Worker module loaded: ${module.name}`);
      
      return worker;
    } catch (error) {
      console.error(`[Page9] Failed to load worker module ${module.name}:`, error);
    }
  }
  
  /**
   * Send Message to Worker
   */
  async sendToWorker(workerName, type, payload) {
    const worker = this.workers.get(workerName);
    if (!worker) {
      throw new Error(`Worker ${workerName} not found`);
    }
    
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      const handler = (e) => {
        if (e.data.id === id) {
          worker.removeEventListener('message', handler);
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result);
          }
        }
      };
      
      worker.addEventListener('message', handler);
      worker.postMessage({ type, payload, id });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        worker.removeEventListener('message', handler);
        reject(new Error('Worker timeout'));
      }, 5000);
    });
  }
  
  /**
   * Query Kernel Status
   */
  async getKernelStatus() {
    if (!this.kernelReady) {
      return { active: false };
    }
    
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'KERNEL_STATUS' },
        [messageChannel.port2]
      );
    });
  }
  
  /**
   * Reload Configuration
   */
  async reloadConfig() {
    console.log('[Page9] Reloading configuration...');
    
    try {
      await this.loadConfig();
      
      // Notify kernel to reload config
      if (this.kernelReady) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            this.showSuccess('Configuration reloaded successfully');
            this.updateStatus();
          }
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'RELOAD_CONFIG' },
          [messageChannel.port2]
        );
      }
    } catch (error) {
      this.showError('Failed to reload config: ' + error.message);
    }
  }
  
  /**
   * Clear Cache
   */
  async clearCache() {
    console.log('[Page9] Clearing cache...');
    
    if (!this.kernelReady) {
      this.showError('Kernel not ready');
      return;
    }
    
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      if (event.data.success) {
        this.showSuccess('Cache cleared successfully');
      }
    };
    
    navigator.serviceWorker.controller.postMessage(
      { type: 'CLEAR_CACHE' },
      [messageChannel.port2]
    );
  }
  
  /**
   * Test Worker
   */
  async testWorker() {
    console.log('[Page9] Testing worker...');
    
    if (this.workerPool.length === 0) {
      this.showError('No workers available');
      return;
    }
    
    try {
      const worker = this.workerPool[0];
      const result = await this.sendToWorker(
        worker.name,
        'COMPUTE',
        { value: 42 }
      );
      
      this.showSuccess(`Worker test successful! Result: ${result}`);
    } catch (error) {
      this.showError('Worker test failed: ' + error.message);
    }
  }
  
  /**
   * Update Status Display
   */
  async updateStatus() {
    const statusDiv = document.getElementById('kernel-status');
    if (!statusDiv) return;
    
    try {
      const status = await this.getKernelStatus();
      
      statusDiv.innerHTML = `
        <div class="status-item">
          <span class="status-label">Kernel:</span>
          <span class="status-value">${status.active ? 'Active' : 'Inactive'}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Version:</span>
          <span class="status-value">${status.version || 'Unknown'}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Caching Strategy:</span>
          <span class="status-value">${status.config?.kernel?.cachingStrategy || 'cache-first'}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Namespace Root:</span>
          <span class="status-value">${status.config?.namespace?.root || '/'}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Mount Points:</span>
          <span class="status-value">${status.config?.namespace?.mounts?.length || 0}</span>
        </div>
      `;
    } catch (error) {
      statusDiv.innerHTML = `
        <div class="status-item error">
          Failed to query kernel: ${error.message}
        </div>
      `;
    }
  }
  
  /**
   * Update Worker Status Display
   */
  updateWorkerStatus() {
    const statusDiv = document.getElementById('worker-status');
    if (!statusDiv) return;
    
    if (this.workers.size === 0) {
      statusDiv.innerHTML = '<div class="status-item">No workers initialized</div>';
      return;
    }
    
    const items = Array.from(this.workers.entries())
      .map(([name, worker]) => `
        <div class="status-item">
          <span class="status-label">${name}:</span>
          <span class="status-value">Ready</span>
        </div>
      `)
      .join('');
    
    statusDiv.innerHTML = items;
  }
  
  /**
   * Display Configuration
   */
  displayConfig() {
    const configDiv = document.getElementById('config-example');
    if (!configDiv) return;
    
    configDiv.textContent = JSON.stringify(this.config, null, 2);
  }
  
  /**
   * Show Error Message
   */
  showError(message) {
    console.error('[Page9]', message);
    const statusDiv = document.getElementById('kernel-status');
    if (statusDiv) {
      statusDiv.innerHTML = `<div class="status-item error">${message}</div>`;
    }
  }
  
  /**
   * Show Success Message
   */
  showSuccess(message) {
    console.log('[Page9]', message);
    alert(message);
  }
}

// Initialize Page9
const page9 = new Page9();

// Export for console access
window.page9 = page9;
