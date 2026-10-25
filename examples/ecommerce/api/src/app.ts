import { Volt, cors, logger, openapi } from 'volt';
import { config } from './config';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { sql } from './db';

export function createApplication(): Volt {
  const app = new Volt({
    port: config.port,
    development: true,
  });

  // Global Middleware
  app.use(logger({ format: 'dev' }));
  app.use(cors({ origin: config.cors.origin, credentials: true }));

  // Interactive OpenAPI / Swagger Docs
  app.use(
    openapi({
      info: {
        title: 'Volt High-Performance eCommerce API',
        version: '1.0.0',
        description:
          'Full-featured eCommerce REST API built with Volt, Bun, and PostgreSQL. Powers storefront browsing, product search, cart sessions, checkout, and customer reviews.',
      },
      path: '/docs',
      swaggerPath: '/swagger',
      specPath: '/openapi.json',
      ui: 'both',
    })
  );

  // Health check endpoint
  app.get('/health', async (ctx) => {
    try {
      const dbCheck = await sql`SELECT 1 as healthy`;
      return ctx.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbCheck.length > 0 ? 'connected' : 'disconnected',
        framework: 'Volt',
        runtime: `Bun v${Bun.version}`,
      });
    } catch (err: any) {
      return ctx.json({ status: 'degraded', database: 'error', error: err.message }, 500);
    }
  });

  // Mount eCommerce routes
  app.group('/api/categories', (group) => {
    CategoriesModule.register(group);
  });

  app.group('/api/products', (group) => {
    ProductsModule.register(group);
    ReviewsModule.register(group);
  });

  app.group('/api/cart', (group) => {
    CartModule.register(group);
  });

  app.group('/api/orders', (group) => {
    OrdersModule.register(group);
  });

  app.group('/api/auth', (group) => {
    AuthModule.register(group);
  });

  return app;
}
