import { Context } from 'volt';
import { categoriesService } from './categories.service';
import { CreateCategoryDto } from './categories.types';

export class CategoriesController {
  findAll() {
    const items = categoriesService.findAll();
    return {
      count: items.length,
      items,
    };
  }

  findById(c: Context<{ id: string }>) {
    const category = categoriesService.findByIdOrSlug(c.params.id);
    if (!category) {
      return c.json({ error: 'NotFound', message: `Category "${c.params.id}" not found` }, 404);
    }
    return category;
  }

  create(c: Context<any, CreateCategoryDto>) {
    try {
      const created = categoriesService.create(c.body);
      return c.json(created, 201);
    } catch (err: any) {
      return c.json({ error: 'Conflict', message: err.message }, 409);
    }
  }
}

export const categoriesController = new CategoriesController();
