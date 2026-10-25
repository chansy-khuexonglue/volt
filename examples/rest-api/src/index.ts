import { createApplication } from './app';
import { config } from './config/env';

const app = createApplication();

app.listen(config.port, (server) => {
  console.log(`\n===============================================================`);
  console.log(`⚡ Volt Enterprise REST API Server`);
  console.log(`===============================================================`);
  console.log(`🚀 Server Address  : http://localhost:${server.port}`);
  console.log(`📖 Swagger UI Docs : http://localhost:${server.port}/swagger`);
  console.log(`📚 Scalar Reference: http://localhost:${server.port}/docs`);
  console.log(`📋 OpenAPI Schema  : http://localhost:${server.port}/openapi.json`);
  console.log(`🔍 Health Check    : http://localhost:${server.port}/health`);
  console.log(`===============================================================\n`);
});

// Graceful shutdown
const handleExit = async () => {
  console.log('\n🛑 Shutting down Volt server gracefully...');
  await app.stop();
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

export default app;
