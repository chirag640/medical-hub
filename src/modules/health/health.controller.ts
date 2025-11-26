import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @ApiOperation({
    summary: 'Health check endpoint',
    description: `
      System health check endpoint for monitoring application status.
      
      **Public Access:** No authentication required
      
      **Health Checks:**
      1. **Database:** MongoDB connection status
         - Status: up/down
         - Response time
         
      2. **Memory Heap:** Heap memory usage
         - Threshold: Should not exceed 150MB
         - Status: up (below threshold) / down (above threshold)
         
      3. **Memory RSS:** Resident Set Size memory
         - Threshold: Should not exceed 300MB
         - Status: up/down based on usage
         
      4. **Disk Storage:** Available disk space
         - Threshold: At least 10% free space required
         - Path: C:\\ (Windows) or / (Linux/Mac)
         - Status: up/down based on available space
      
      **Response Format:**
      {
        "status": "ok" | "error",
        "info": { /* healthy services */ },
        "error": { /* unhealthy services */ },
        "details": { /* all services status */ }
      }
      
      **Use Cases:**
      - Kubernetes/Docker liveness probe
      - Load balancer health check
      - Monitoring and alerting systems
      - DevOps infrastructure checks
      
      **Monitoring Integration:**
      - Prometheus: Parse JSON response
      - Datadog: Configure health check endpoint
      - AWS ALB: Target group health check
      - Azure App Service: Health check path
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'All systems healthy',
    schema: {
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: { type: 'object', properties: { status: { type: 'string', example: 'up' } } },
            memory_heap: {
              type: 'object',
              properties: { status: { type: 'string', example: 'up' } },
            },
            memory_rss: {
              type: 'object',
              properties: { status: { type: 'string', example: 'up' } },
            },
            disk: { type: 'object', properties: { status: { type: 'string', example: 'up' } } },
          },
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            database: { type: 'object' },
            memory_heap: { type: 'object' },
            memory_rss: { type: 'object' },
            disk: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - one or more health checks failed',
    schema: {
      properties: {
        status: { type: 'string', example: 'error' },
        info: { type: 'object' },
        error: {
          type: 'object',
          description: 'Services that failed health check',
        },
        details: { type: 'object' },
      },
    },
  })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),

      // Memory heap check (should not exceed 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Memory RSS check (should not exceed 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Disk storage check (should have at least 10% free disk space)
      () =>
        this.disk.checkStorage('disk', {
          path: process.env.DISK_CHECK_PATH || (process.platform === 'win32' ? 'C:\\' : '/'),
          thresholdPercent: 0.9,
        }),
    ]);
  }
}
