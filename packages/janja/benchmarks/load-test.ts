import { render } from '../src';

interface LoadTestConfig {
  template: string;
  data: any;
  concurrency: number;
  duration: number; // seconds
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  requestsPerSecond: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

export async function loadTest(
  config: LoadTestConfig,
): Promise<LoadTestResult> {
  const { template, data, concurrency, duration } = config;
  const startTime = Date.now();
  const endTime = startTime + duration * 1000;

  const results: number[] = [];

  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;

  const worker = async (): Promise<void> => {
    while (Date.now() < endTime) {
      const requestStart = performance.now();

      try {
        await render(template, data);
        successfulRequests++;
      } catch {
        failedRequests++;
      }

      const requestEnd = performance.now();
      const latency = requestEnd - requestStart;

      results.push(latency);
      totalRequests++;
    }
  };

  // Run workers concurrently
  const workers = Array.from({ length: concurrency }, () => worker());

  await Promise.all(workers);

  // Calculate statistics
  results.sort((a, b) => a - b);

  const sum = results.reduce((acc, val) => acc + val, 0);
  const averageLatency = sum / results.length;
  const minLatency = results[0] || 0;
  const maxLatency = results[results.length - 1] || 0;

  const p50Index = Math.floor(results.length * 0.5);
  const p95Index = Math.floor(results.length * 0.95);
  const p99Index = Math.floor(results.length * 0.99);

  const p50Latency = results[p50Index] || 0;
  const p95Latency = results[p95Index] || 0;
  const p99Latency = results[p99Index] || 0;

  const actualDuration = (Date.now() - startTime) / 1000;
  const requestsPerSecond = totalRequests / actualDuration;

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    requestsPerSecond,
    averageLatency,
    minLatency,
    maxLatency,
    p50Latency,
    p95Latency,
    p99Latency,
  };
}

export function formatLoadTestResult(result: LoadTestResult): string {
  return `
Load Test Results
=================
Total Requests: ${result.totalRequests}
Successful: ${result.successfulRequests}
Failed: ${result.failedRequests}
Requests/Second: ${result.requestsPerSecond.toFixed(2)}

Latency Statistics (ms):
--------------------------
Average: ${result.averageLatency.toFixed(2)}
Min: ${result.minLatency.toFixed(2)}
Max: ${result.maxLatency.toFixed(2)}
P50: ${result.p50Latency.toFixed(2)}
P95: ${result.p95Latency.toFixed(2)}
P99: ${result.p99Latency.toFixed(2)}
`;
}

// CLI usage example
if (import.meta.url === `file://${process.argv[1]}`) {
  const template = 'Hello {{ name }}!';
  const data = { name: 'World' };

  console.log('Starting load test...');
  console.log('Concurrency: 10, Duration: 5s');

  const result = await loadTest({
    template,
    data,
    concurrency: 10,
    duration: 5,
  });

  console.log(formatLoadTestResult(result));
}
