// ============================================
// PERFORMANCE MONITORING SERVICE
// ============================================

import { Platform, InteractionManager } from 'react-native';

// Performance metrics
interface PerformanceMetrics {
  fps: number;
  memoryUsage: number | null;
  renderTime: number;
  jsHeapSize: number | null;
  frameDrops: number;
}

// Performance mark
interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

// Configuration
interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // How often to sample (ms)
  reportThreshold: number; // Report if render > this (ms)
  debug: boolean;
}

// Current configuration
let config: PerformanceConfig = {
  enabled: __DEV__,
  sampleRate: 1000,
  reportThreshold: 16.67, // 60fps threshold
  debug: false,
};

// Performance data
const marks: Map<string, PerformanceMark> = new Map();
const metrics: PerformanceMetrics[] = [];
let frameCount = 0;
let frameDropCount = 0;
let lastFrameTime = 0;
let samplingInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Configure performance monitoring
 */
export const configurePerformance = (newConfig: Partial<PerformanceConfig>): void => {
  config = { ...config, ...newConfig };

  if (config.enabled) {
    startMonitoring();
  } else {
    stopMonitoring();
  }
};

/**
 * Start performance monitoring
 */
export const startMonitoring = (): void => {
  if (samplingInterval) return;

  lastFrameTime = performance.now();

  // Sample metrics periodically
  samplingInterval = setInterval(() => {
    const currentMetrics = collectMetrics();
    metrics.push(currentMetrics);

    // Keep only last 100 samples
    if (metrics.length > 100) {
      metrics.shift();
    }

    if (config.debug) {
      console.log('[Performance]', currentMetrics);
    }
  }, config.sampleRate);

  // Monitor frame timing on web
  if (Platform.OS === 'web' && typeof requestAnimationFrame !== 'undefined') {
    monitorFrames();
  }
};

/**
 * Stop performance monitoring
 */
export const stopMonitoring = (): void => {
  if (samplingInterval) {
    clearInterval(samplingInterval);
    samplingInterval = null;
  }
};

/**
 * Monitor frame timing
 */
const monitorFrames = (): void => {
  const tick = (timestamp: number) => {
    if (!config.enabled) return;

    frameCount++;
    const delta = timestamp - lastFrameTime;

    if (delta > config.reportThreshold * 2) {
      frameDropCount++;
    }

    lastFrameTime = timestamp;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

/**
 * Collect current metrics
 */
const collectMetrics = (): PerformanceMetrics => {
  const now = performance.now();
  const elapsed = config.sampleRate;
  const fps = Math.round((frameCount / elapsed) * 1000);

  // Reset frame count
  const drops = frameDropCount;
  frameCount = 0;
  frameDropCount = 0;

  // Get memory info (web only, Chrome)
  let memoryUsage: number | null = null;
  let jsHeapSize: number | null = null;

  if (Platform.OS === 'web' && (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory) {
    const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    jsHeapSize = memory.usedJSHeapSize;
    memoryUsage = Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
  }

  return {
    fps,
    memoryUsage,
    renderTime: elapsed,
    jsHeapSize,
    frameDrops: drops,
  };
};

/**
 * Start a performance mark
 */
export const startMark = (name: string): void => {
  if (!config.enabled) return;

  marks.set(name, {
    name,
    startTime: performance.now(),
  });
};

/**
 * End a performance mark
 */
export const endMark = (name: string): number | null => {
  if (!config.enabled) return null;

  const mark = marks.get(name);
  if (!mark) return null;

  const endTime = performance.now();
  const duration = endTime - mark.startTime;

  mark.endTime = endTime;
  mark.duration = duration;

  if (config.debug && duration > config.reportThreshold) {
    console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  return duration;
};

/**
 * Measure a function's execution time
 */
export const measure = async <T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  startMark(name);
  try {
    const result = await fn();
    return result;
  } finally {
    endMark(name);
  }
};

/**
 * Measure a React render
 */
export const measureRender = (componentName: string): { start: () => void; end: () => void } => {
  const markName = `render:${componentName}`;

  return {
    start: () => startMark(markName),
    end: () => {
      const duration = endMark(markName);
      if (duration && duration > config.reportThreshold) {
        console.warn(`[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    },
  };
};

/**
 * Run after interactions (for React Native)
 */
export const runAfterInteractions = (callback: () => void): void => {
  if (Platform.OS === 'web') {
    // Use requestIdleCallback on web, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(callback);
    } else {
      setTimeout(callback, 0);
    }
  } else {
    InteractionManager.runAfterInteractions(callback);
  }
};

/**
 * Get performance summary
 */
export const getSummary = (): {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  totalFrameDrops: number;
  averageMemory: number | null;
  marks: PerformanceMark[];
} => {
  if (metrics.length === 0) {
    return {
      averageFPS: 0,
      minFPS: 0,
      maxFPS: 0,
      totalFrameDrops: 0,
      averageMemory: null,
      marks: [],
    };
  }

  const fpsValues = metrics.map((m) => m.fps);
  const memoryValues = metrics.filter((m) => m.memoryUsage !== null).map((m) => m.memoryUsage!);
  const totalDrops = metrics.reduce((sum, m) => sum + m.frameDrops, 0);

  return {
    averageFPS: Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length),
    minFPS: Math.min(...fpsValues),
    maxFPS: Math.max(...fpsValues),
    totalFrameDrops: totalDrops,
    averageMemory: memoryValues.length > 0
      ? Math.round(memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length)
      : null,
    marks: Array.from(marks.values()).filter((m) => m.duration !== undefined),
  };
};

/**
 * Clear all metrics and marks
 */
export const clear = (): void => {
  marks.clear();
  metrics.length = 0;
  frameCount = 0;
  frameDropCount = 0;
};

/**
 * Log performance report
 */
export const logReport = (): void => {
  const summary = getSummary();
  console.log('=== Performance Report ===');
  console.log(`Average FPS: ${summary.averageFPS}`);
  console.log(`FPS Range: ${summary.minFPS} - ${summary.maxFPS}`);
  console.log(`Frame Drops: ${summary.totalFrameDrops}`);
  if (summary.averageMemory !== null) {
    console.log(`Avg Memory Usage: ${summary.averageMemory}%`);
  }
  if (summary.marks.length > 0) {
    console.log('Slow Operations:');
    summary.marks
      .filter((m) => m.duration && m.duration > config.reportThreshold)
      .forEach((m) => {
        console.log(`  ${m.name}: ${m.duration?.toFixed(2)}ms`);
      });
  }
  console.log('========================');
};

export default {
  configurePerformance,
  startMonitoring,
  stopMonitoring,
  startMark,
  endMark,
  measure,
  measureRender,
  runAfterInteractions,
  getSummary,
  clear,
  logReport,
};
