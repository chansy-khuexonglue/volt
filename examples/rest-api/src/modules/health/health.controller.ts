import { Context } from 'voltts';
import { config } from '../../config/env';

export class HealthController {
  getRootSummary() {
    return {
      name: '⚡ Volt Enterprise REST API',
      version: '1.0.0',
      architecture: 'NestJS-style modular architecture',
      documentation: {
        swagger: `http://localhost:${config.port}/swagger`,
        scalar: `http://localhost:${config.port}/docs`,
        openApiSpec: `http://localhost:${config.port}/openapi.json`,
      },
      status: 'online',
      uptimeSec: Math.floor(process.uptime()),
    };
  }

  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      memoryRssMb: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
      nodeEnv: config.isDev ? 'development' : 'production',
    };
  }
}

export const healthController = new HealthController();
