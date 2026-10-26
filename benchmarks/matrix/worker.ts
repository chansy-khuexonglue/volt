import { createVoltServer } from '../servers/volt';
import { createElysiaServer } from '../servers/elysia';
import { createHonoServer } from '../servers/hono';
import { createBunServeServer } from '../servers/bun-serve';
import { createFastifyServer } from '../servers/fastify';
import { createExpressServer } from '../servers/express';
import { createNestFastifyServer } from '../servers/nest-fastify';
import { createNestExpressServer } from '../servers/nest-express';
const port = 4011;
switch (process.argv[2]) {
  case 'Volt': createVoltServer(port).listen(port); break;
  case 'Elysia': createElysiaServer(port).listen(port); break;
  case 'Hono': Bun.serve({port, hostname: '127.0.0.1', fetch: createHonoServer(port).fetch}); break;
  case 'Bun.serve': createBunServeServer(port); break;
  case 'Fastify': await createFastifyServer(port); break;
  case 'Express': await createExpressServer(port); break;
  case 'NestFastify': await createNestFastifyServer(port); break;
  case 'NestExpress': await createNestExpressServer(port); break;
  default: throw new Error('Unknown framework');
}
console.log('BENCHMARK_READY');
