import { RouteGroup } from 'volt';
import { authenticate, requireRole } from '../../common/guards/auth.guard';
import { productsController } from './products.controller';
import {
  createProductSchema,
  productParamSchema,
  productQuerySchema,
  updateProductSchema,
} from './products.schema';

export class ProductsModule {
  static register(group: RouteGroup): void {
    // GET /api/v1/products
    group.get(
      '/',
      (c) => productsController.findAll(c),
      {
        summary: 'List products with optional category and price filtering',
        tags: ['Products'],
        query: productQuerySchema,
      }
    );

    // GET /api/v1/products/:id
    group.get(
      '/:id',
      (c) => productsController.findById(c),
      {
        summary: 'Get product details by ID',
        tags: ['Products'],
        params: productParamSchema,
      }
    );

    // POST /api/v1/products (Admin only)
    group.post(
      '/',
      (c) => productsController.create(c),
      {
        summary: 'Create a new product (Admin Only)',
        tags: ['Products'],
        body: createProductSchema,
        security: [{ bearerAuth: [] }],
      },
      [authenticate, requireRole('admin')]
    );

    // PUT /api/v1/products/:id (Admin only)
    group.put(
      '/:id',
      (c) => productsController.update(c),
      {
        summary: 'Update an existing product (Admin Only)',
        tags: ['Products'],
        params: productParamSchema,
        body: updateProductSchema,
        security: [{ bearerAuth: [] }],
      },
      [authenticate, requireRole('admin')]
    );

    // DELETE /api/v1/products/:id (Admin only)
    group.delete(
      '/:id',
      (c) => productsController.delete(c),
      {
        summary: 'Delete a product (Admin Only)',
        tags: ['Products'],
        params: productParamSchema,
        security: [{ bearerAuth: [] }],
      },
      [authenticate, requireRole('admin')]
    );
  }
}
