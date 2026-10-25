import { Context } from 'volt';
import { cartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './cart.types';

export class CartController {
  getCart(c: Context) {
    const userId = c.store.user?.sub;
    const cart = cartService.getCart(userId);
    return c.json(cart, 200);
  }

  addItem(c: Context<any, AddToCartDto>) {
    try {
      const userId = c.store.user?.sub;
      const cart = cartService.addItem(userId, c.body);
      return c.json(cart, 200);
    } catch (err: any) {
      return c.json({ error: 'BadRequest', message: err.message }, 400);
    }
  }

  updateItem(c: Context<{ productId: string }, UpdateCartItemDto>) {
    try {
      const userId = c.store.user?.sub;
      const cart = cartService.updateItem(userId, c.params.productId, c.body);
      return c.json(cart, 200);
    } catch (err: any) {
      return c.json({ error: 'BadRequest', message: err.message }, 400);
    }
  }

  removeItem(c: Context<{ productId: string }>) {
    const userId = c.store.user?.sub;
    const cart = cartService.removeItem(userId, c.params.productId);
    return c.json(cart, 200);
  }

  clearCart(c: Context) {
    const userId = c.store.user?.sub;
    const cart = cartService.clearCart(userId);
    return c.json(cart, 200);
  }
}

export const cartController = new CartController();
