import { CreateProductDto, Product, ProductQueryFilters, UpdateProductDto } from './products.types';

export class ProductsService {
  private products: Product[] = [
    {
      id: 'prod_1',
      name: 'Keychron Q1 Pro Mechanical Keyboard',
      description: 'Wireless QMK/VIA Custom Mechanical Keyboard with knob and RGB backlighting',
      price: 199.99,
      stock: 45,
      category: 'Electronics',
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-01-15T08:00:00.000Z',
    },
    {
      id: 'prod_2',
      name: 'Dell UltraSharp 32" 4K Monitor',
      description: '4K IPS Black Technology monitor with 98% DCI-P3 color gamut and USB-C hub',
      price: 749.5,
      stock: 18,
      category: 'Electronics',
      createdAt: '2026-02-10T11:30:00.000Z',
      updatedAt: '2026-02-10T11:30:00.000Z',
    },
    {
      id: 'prod_3',
      name: 'Herman Miller Aeron Chair',
      description: 'Ergonomic office chair with PostureFit SL back support and breathable pellicle mesh',
      price: 1395.0,
      stock: 12,
      category: 'Furniture',
      createdAt: '2026-03-01T14:15:00.000Z',
      updatedAt: '2026-03-01T14:15:00.000Z',
    },
  ];

  findAll(filters?: ProductQueryFilters): Product[] {
    let result = [...this.products];

    if (filters?.category) {
      result = result.filter(
        (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  findById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  create(input: CreateProductDto): Product {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: input.name,
      description: input.description || '',
      price: input.price,
      stock: input.stock,
      category: input.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.push(newProduct);
    return newProduct;
  }

  update(id: string, input: UpdateProductDto): Product | null {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }

    const current = this.products[index];
    const updated: Product = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.products[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return false;
    }

    this.products.splice(index, 1);
    return true;
  }
}

export const productsService = new ProductsService();
