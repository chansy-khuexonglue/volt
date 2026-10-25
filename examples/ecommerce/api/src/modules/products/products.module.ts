import { Context, RouteGroup } from 'volt';
import { productsService, ProductFilters } from './products.service';

export class ProductsModule {
  static register(router: RouteGroup): void {
    // Featured products
    router.get('/featured', async (ctx: Context) => {
      try {
        const featured = await productsService.getFeatured();
        return ctx.json({
          success: true,
          data: featured,
        });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });

    // List products with filtering & pagination
    router.get('/', async (ctx: Context) => {
      try {
        const query = ctx.query;
        const toStr = (v: any): string | undefined => (Array.isArray(v) ? v[0] : v);
        const filters: ProductFilters = {
          category: toStr(query.category),
          search: toStr(query.search || query.q),
          sort: toStr(query.sort) as any,
          limit: query.limit ? parseInt(String(toStr(query.limit)), 10) : 50,
          offset: query.offset ? parseInt(String(toStr(query.offset)), 10) : 0,
        };

        const result = await productsService.getAll(filters);
        return ctx.json({
          success: true,
          data: result.products,
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
        });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });

    // Get single product by ID or Slug
    router.get('/:id', async (ctx: Context) => {
      try {
        const id = ctx.params.id;
        const product = await productsService.getById(id);
        if (!product) {
          return ctx.json({ success: false, error: 'Product not found' }, 404);
        }
        return ctx.json({
          success: true,
          data: product,
        });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });
  }
}
