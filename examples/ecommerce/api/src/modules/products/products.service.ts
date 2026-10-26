import { prisma, Product } from '../../db';

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

export class ProductsService {
  async getAll(filters?: ProductFilters): Promise<{ products: any[]; total: number }> {
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = filters?.offset || 0;

    const where: any = {};

    if (filters?.category) {
      where.OR = [
        { category_id: filters.category },
        { category_name: { contains: filters.category, mode: 'insensitive' } },
      ];
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category_name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { created_at: 'desc' };
    if (filters?.sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (filters?.sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (filters?.sort === 'rating') {
      orderBy = [{ rating: 'desc' }, { review_count: 'desc' }];
    }

    // Execute queries through Prisma ORM Client
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
    };
  }

  async getFeatured(): Promise<any[]> {
    return prisma.product.findMany({
      where: { is_featured: true },
      orderBy: { rating: 'desc' },
      take: 6,
    });
  }

  async getById(idOrSlug: string): Promise<any | null> {
    return prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
  }
}

export const productsService = new ProductsService();
