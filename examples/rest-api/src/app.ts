import { Volt } from 'volt';
import { AppModule } from './app.module';
import { config } from './config/env';

/**
 * Bootstrap factory creating and configuring the enterprise Volt application.
 */
export function createApplication(): Volt {
  const app = new Volt({
    port: config.port,
    development: config.isDev,
    maxRequestBodySize: 5 * 1024 * 1024, // 5MB limit
  });

  return AppModule.configure(app);
}
