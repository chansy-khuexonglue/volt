import { RouteGroup } from 'volt';
import { authenticate, requireRole } from '../../common/guards/auth.guard';
import { categoriesController } from './categories.controller';
import { categoryParamSchema, createCategorySchema } from './categories.schema';

export class CategoriesModule {
  static register(group: RouteGroup): void {
    // GET /api/v1/categories
    group.get('/', () => categoriesController.findAll(), {
      summary: 'List all product categories',
      tags: ['Categories'],
    });

    // GET /api/v1/categories/:id
    group.get('/:id', (c) => categoriesController.findById(c), {
      summary: 'Get category by ID or slug',
      tags: ['Categories'],
      params: categoryParamSchema,
    });

    // POST /api/v1/categories (Admin only)
    group.post(
      '/',
      (c) => categoriesController.create(c),
      {
        summary: 'Create a new category (Admin Only)',
        tags: ['Categories'],
        body: createCategorySchema,
        security: [{ bearerAuth: [] }],
      },
      [authenticate, requireRole('admin')]
    );
  }
}
