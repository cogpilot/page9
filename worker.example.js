/**
 * Example Web Worker Module
 * 
 * Demonstrates process isolation in Page9
 */

console.log('[Page9 Worker] Example worker module loaded');

// Worker state
let taskCount = 0;

/**
 * Message Handler
 */
self.addEventListener('message', (event) => {
  const { type, payload, id } = event.data;
  
  console.log(`[Page9 Worker] Received message: ${type}`);
  
  switch (type) {
    case 'ECHO':
      handleEcho(payload, id);
      break;
      
    case 'COMPUTE':
      handleCompute(payload, id);
      break;
      
    case 'HASH':
      handleHash(payload, id);
      break;
      
    case 'STATUS':
      handleStatus(id);
      break;
      
    default:
      self.postMessage({
        id,
        error: `Unknown message type: ${type}`
      });
  }
});

/**
 * Echo Handler - Simple echo test
 */
function handleEcho(payload, id) {
  self.postMessage({
    id,
    result: {
      echo: payload,
      timestamp: Date.now()
    }
  });
}

/**
 * Compute Handler - CPU-intensive task
 */
function handleCompute(payload, id) {
  taskCount++;
  
  try {
    const { operation, value } = payload;
    let result;
    
    switch (operation) {
      case 'square':
        result = value * value;
        break;
      case 'cube':
        result = value * value * value;
        break;
      case 'fibonacci':
        result = fibonacci(value);
        break;
      case 'factorial':
        result = factorial(value);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    self.postMessage({
      id,
      result: {
        operation,
        input: value,
        output: result,
        taskNumber: taskCount
      }
    });
  } catch (error) {
    self.postMessage({
      id,
      error: error.message
    });
  }
}

/**
 * Hash Handler - String hashing
 */
function handleHash(payload, id) {
  try {
    const { text, algorithm } = payload;
    let hash;
    
    switch (algorithm) {
      case 'simple':
        hash = simpleHash(text);
        break;
      case 'djb2':
        hash = djb2Hash(text);
        break;
      default:
        hash = simpleHash(text);
    }
    
    self.postMessage({
      id,
      result: {
        text,
        algorithm,
        hash
      }
    });
  } catch (error) {
    self.postMessage({
      id,
      error: error.message
    });
  }
}

/**
 * Status Handler - Worker status
 */
function handleStatus(id) {
  self.postMessage({
    id,
    result: {
      active: true,
      tasksProcessed: taskCount,
      uptime: 'running'
    }
  });
}

/**
 * Fibonacci - Iterative calculation (efficient)
 * Avoids exponential time complexity of recursive approach
 */
function fibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

/**
 * Factorial - Iterative calculation
 */
function factorial(n) {
  if (n < 0) throw new Error('Factorial of negative number');
  if (n === 0 || n === 1) return 1;
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Simple Hash Function
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * DJB2 Hash Function
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash.toString(16);
}

console.log('[Page9 Worker] Example worker ready');
