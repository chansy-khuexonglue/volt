import { Context, RouteGroup } from 'voltts';
import { categoriesService } from './categories.service';

export class CategoriesModule {
  static register(router: RouteGroup): void {
    // List all categories
    router.get('/', async (ctx: Context) => {
      try {
        const categories = await categoriesService.getAll();
        return ctx.json({
          success: true,
          data: categories,
          count: categories.length,
        });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });

    // Get single category by slug/id with associated products
    router.get('/:slug', async (ctx: Context) => {
      try {
        const slug = ctx.params.slug;
        const result = await categoriesService.getBySlug(slug);
        if (!result) {
          return ctx.json({ success: false, error: 'Category not found' }, 404);
        }
        return ctx.json({
          success: true,
          data: result.category,
          products: result.products,
        });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });
  }
}
