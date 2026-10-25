import { Category, CreateCategoryDto } from './categories.types';

export class CategoriesService {
  private categories: Category[] = [
    {
      id: 'cat_electronics',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Keyboards, displays, computers, and digital devices',
      productCount: 2,
    },
    {
      id: 'cat_furniture',
      name: 'Furniture',
      slug: 'furniture',
      description: 'Ergonomic office seating, standing desks, and accessories',
      productCount: 1,
    },
    {
      id: 'cat_audio',
      name: 'Audio',
      slug: 'audio',
      description: 'High-fidelity headphones, microphones, and studio monitors',
      productCount: 0,
    },
  ];

  findAll(): Category[] {
    return [...this.categories];
  }

  findByIdOrSlug(identifier: string): Category | undefined {
    const term = identifier.toLowerCase();
    return this.categories.find(
      (c) => c.id.toLowerCase() === term || c.slug.toLowerCase() === term
    );
  }

  create(dto: CreateCategoryDto): Category {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = this.findByIdOrSlug(slug);
    if (existing) {
      throw new Error(`Category with slug "${slug}" already exists`);
    }

    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: dto.name,
      slug,
      description: dto.description || '',
      productCount: 0,
    };

    this.categories.push(newCategory);
    return newCategory;
  }
}

export const categoriesService = new CategoriesService();
