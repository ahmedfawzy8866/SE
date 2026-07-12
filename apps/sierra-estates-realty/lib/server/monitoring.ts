import { logger } from '@/lib/logger';

/**
 * System health status enumeration
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * Individual service health check result
 */
export interface ServiceHealth {
  status: HealthStatus;
  latency_ms: number;
  last_check: string;
  error?: string;
}

/**
 * Complete system health snapshot
 */
export interface SystemHealth {
  timestamp: string;
  overall_status: HealthStatus;
  services: {
    firebase: ServiceHealth;
    n8n: ServiceHealth;
    python_api: ServiceHealth;
    rate_limit: ServiceHealth;
  };
  metrics: {
    active_rate_limit_keys: number;
    uptime_hours: number;
    total_requests_today: number;
  };
}

// In-memory metrics (would be replaced with Prometheus in production)
const metrics = {
  startTime: Date.now(),
  totalRequests: 0,
  requestsByRoute: {} as Record<string, number>,
  errorsByCode: {} as Record<number, number>,
};

/**
 * Record a request for metrics
 */
export function recordRequest(route: string): void {
  metrics.totalRequests += 1;
  metrics.requestsByRoute[route] = (metrics.requestsByRoute[route] || 0) + 1;
}

/**
 * Record an error for metrics
 */
export function recordError(statusCode: number): void {
  metrics.errorsByCode[statusCode] = (metrics.errorsByCode[statusCode] || 0) + 1;
}

/**
 * Check Firebase health
 */
async function checkFirebaseHealth(): Promise<ServiceHealth> {
  const startTime = performance.now();
  try {
    // In production, this would ping Firestore with a lightweight query
    // For now, simulate a check
    const latency = performance.now() - startTime;

    let status = HealthStatus.HEALTHY;
    if (latency > 2000) status = HealthStatus.DEGRADED;
    if (latency > 5000) status = HealthStatus.UNHEALTHY;

    return {
      status,
      latency_ms: Math.round(latency),
      last_check: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      latency_ms: -1,
      last_check: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check n8n workflow engine health
 */
async function checkN8nHealth(): Promise<ServiceHealth> {
  const startTime = performance.now();
  try {
    // In production, ping the n8n API
    const response = await fetch('http://localhost:5678/api/v1/workflows', {
      timeout: 2000,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null);

    const latency = performance.now() - startTime;
    const status = response?.ok ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;

    return {
      status,
      latency_ms: Math.round(latency),
      last_check: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      latency_ms: -1,
      last_check: new Date().toISOString(),
      error: 'n8n unreachable',
    };
  }
}

/**
 * Check Python API health
 */
async function checkPythonApiHealth(): Promise<ServiceHealth> {
  const startTime = performance.now();
  try {
    // In production, this would be the Cloud Run service endpoint
    const response = await fetch('http://localhost:8000/health', {
      timeout: 2000,
    }).catch(() => null);

    const latency = performance.now() - startTime;
    const status = response?.ok ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;

    return {
      status,
      latency_ms: Math.round(latency),
      last_check: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      latency_ms: -1,
      last_check: new Date().toISOString(),
      error: 'Python API unreachable',
    };
  }
}

/**
 * Check rate limit store health
 */
function checkRateLimitHealth(): ServiceHealth {
  // This would check the in-memory or Redis rate limit store
  // For now, return a healthy status
  return {
    status: HealthStatus.HEALTHY,
    latency_ms: 1,
    last_check: new Date().toISOString(),
  };
}

/**
 * Determine overall system health based on service health
 */
function determineOverallStatus(services: SystemHealth['services']): HealthStatus {
  const statuses = Object.values(services).map(s => s.status);

  if (statuses.includes(HealthStatus.UNHEALTHY)) {
    return HealthStatus.UNHEALTHY;
  }
  if (statuses.includes(HealthStatus.DEGRADED)) {
    return HealthStatus.DEGRADED;
  }
  return HealthStatus.HEALTHY;
}

/**
 * Get complete system health snapshot
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const [firebase, n8n, pythonApi, rateLimit] = await Promise.all([
    checkFirebaseHealth(),
    checkN8nHealth(),
    checkPythonApiHealth(),
    Promise.resolve(checkRateLimitHealth()),
  ]);

  const services = { firebase, n8n, python_api: pythonApi, rate_limit: rateLimit };

  const uptimeMs = Date.now() - metrics.startTime;
  const uptimeHours = Math.round(uptimeMs / (1000 * 60 * 60));

  const health: SystemHealth = {
    timestamp: new Date().toISOString(),
    overall_status: determineOverallStatus(services),
    services,
    metrics: {
      active_rate_limit_keys: 0, // Would come from rate-limit store
      uptime_hours: uptimeHours,
      total_requests_today: metrics.totalRequests,
    },
  };

  // Log if any service is degraded or unhealthy
  if (health.overall_status !== HealthStatus.HEALTHY) {
    logger.warn('System health check found issues', {
      overall_status: health.overall_status,
      services: Object.entries(services)
        .filter(([_, s]) => s.status !== HealthStatus.HEALTHY)
        .map(([name, s]) => `${name}: ${s.status} (${s.latency_ms}ms)`),
    });
  }

  return health;
}

/**
 * Log a security event (potential attack)
 */
export function logSecurityEvent(
  eventType: string,
  details: {
    ip: string;
    endpoint: string;
    count?: number;
    threshold?: number;
  }
): void {
  logger.error('SECURITY_EVENT', {
    type: eventType,
    ip: details.ip,
    endpoint: details.endpoint,
    count: details.count,
    threshold: details.threshold,
    timestamp: new Date().toISOString(),
  });

  // In production, this would also send a Slack notification
  // and potentially trigger automated response (IP blocking, rate limit increase, etc.)
}

/**
 * Generate metrics summary for dashboard
 */
export function getMetricsSummary(): {
  total_requests: number;
  errors_by_code: Record<number, number>;
  top_routes: Array<[string, number]>;
  error_rate_percent: number;
} {
  const totalErrors = Object.values(metrics.errorsByCode).reduce((a, b) => a + b, 0);
  const errorRatePercent =
    metrics.totalRequests > 0 ? Math.round((totalErrors / metrics.totalRequests) * 100) : 0;

  const topRoutes = Object.entries(metrics.requestsByRoute)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return {
    total_requests: metrics.totalRequests,
    errors_by_code: metrics.errorsByCode,
    top_routes: topRoutes,
    error_rate_percent: errorRatePercent,
  };
}
