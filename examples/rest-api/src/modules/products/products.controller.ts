import { Context } from 'volt';
import { productsService } from './products.service';
import { CreateProductDto, ProductQueryFilters, UpdateProductDto } from './products.types';

export class ProductsController {
  findAll(c: Context<any, any, ProductQueryFilters>) {
    const items = productsService.findAll(c.query);
    return {
      count: items.length,
      items,
    };
  }

  findById(c: Context<{ id: string }>) {
    const product = productsService.findById(c.params.id);
    if (!product) {
      return c.json({ error: 'NotFound', message: `Product "${c.params.id}" not found` }, 404);
    }
    return product;
  }

  create(c: Context<any, CreateProductDto>) {
    const created = productsService.create(c.body);
    return c.json(created, 201);
  }

  update(c: Context<{ id: string }, UpdateProductDto>) {
    const updated = productsService.update(c.params.id, c.body);
    if (!updated) {
      return c.json({ error: 'NotFound', message: `Product "${c.params.id}" not found` }, 404);
    }
    return updated;
  }

  delete(c: Context<{ id: string }>) {
    const success = productsService.delete(c.params.id);
    if (!success) {
      return c.json({ error: 'NotFound', message: `Product "${c.params.id}" not found` }, 404);
    }
    return { success: true, message: `Product "${c.params.id}" deleted successfully` };
  }
}

export const productsController = new ProductsController();
