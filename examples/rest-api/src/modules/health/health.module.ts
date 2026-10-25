import { Volt } from 'volt';
import { healthController } from './health.controller';

export class HealthModule {
  static register(app: Volt): void {
    app.get('/', () => healthController.getRootSummary(), {
      summary: 'Root API summary and documentation links',
      tags: ['Health'],
    });

    app.get('/health', () => healthController.getHealthStatus(), {
      summary: 'Service health check and diagnostics',
      tags: ['Health'],
    });
  }
}
