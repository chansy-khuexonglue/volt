import { prisma, Category, Product } from '../../db';

export class CategoriesService {
  async getAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getBySlug(slugOrId: string): Promise<{ category: Category; products: Product[] } | null> {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        products: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!category) return null;

    const { products, ...catData } = category;
    return {
      category: catData as Category,
      products: products as Product[],
    };
  }
}

export const categoriesService = new CategoriesService();
