import {
  cors,
  logger,
  openapi,
  rateLimit,
  secureHeaders,
  timeout,
  Volt,
} from 'voltts';
import { config } from './config/env';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { HealthModule } from './modules/health/health.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

export class AppModule {
  /**
   * Configures global middleware, documentation plugins, and registers all eCommerce domain modules.
   */
  static configure(app: Volt): Volt {
    // 1. Global Middleware Pipeline
    app.use(logger({ format: 'dev' }));
    app.use(cors({ origin: config.cors.origin, credentials: true }));
    app.use(
      secureHeaders({
        contentSecurityPolicy:
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net data: blob:;",
      })
    );
    app.use(rateLimit({ max: 1000, windowMs: 60_000 }));
    app.use(timeout(10_000));

    // 2. Interactive Swagger UI & Scalar Documentation
    app.use(
      openapi({
        info: {
          title: '🛒 Volt Enterprise eCommerce API',
          version: '1.0.0',
          description:
            'Production-grade, modular eCommerce REST API built natively for Bun with Volt. Includes Auth, Products, Taxonomy, Cart, Orders, Payments, and Reviews.',
          contact: {
            name: 'Volt Framework Team',
            url: 'https://github.com/volt-framework/volt',
          },
        },
        path: '/docs',
        swaggerPath: '/swagger',
        specPath: '/openapi.json',
        ui: 'both',
      })
    );

    // 3. Register Core System & Health Endpoints
    HealthModule.register(app);

    // 4. Register Scoped eCommerce Feature Modules
    app.group(`${config.apiPrefix}/auth`, (group) => {
      AuthModule.register(group);
    });

    app.group(`${config.apiPrefix}/categories`, (group) => {
      CategoriesModule.register(group);
    });

    app.group(`${config.apiPrefix}/products`, (group) => {
      ProductsModule.register(group);
      ReviewsModule.register(group);
    });

    app.group(`${config.apiPrefix}/cart`, (group) => {
      CartModule.register(group);
    });

    app.group(`${config.apiPrefix}/orders`, (group) => {
      OrdersModule.register(group);
    });

    app.group(`${config.apiPrefix}/payments`, (group) => {
      PaymentsModule.register(group);
    });

    return app;
  }
}
