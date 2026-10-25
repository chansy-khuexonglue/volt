import { createApplication } from './app';
import { config } from './config';

const app = createApplication();

console.log('='.repeat(60));
console.log('🛒 Volt High-Performance eCommerce API');
console.log('='.repeat(60));
console.log(`🚀 API Base URL     : http://localhost:${config.port}`);
console.log(`📚 OpenAPI / Docs   : http://localhost:${config.port}/docs`);
console.log(`📖 Swagger UI       : http://localhost:${config.port}/swagger`);
console.log(`🔍 Health Check     : http://localhost:${config.port}/health`);
console.log(`🐘 PostgreSQL Host  : ${new URL(config.databaseUrl).host}`);
console.log('='.repeat(60));

app.listen(config.port, () => {
  console.log(`[Volt] eCommerce API listening on http://localhost:${config.port}`);
});
