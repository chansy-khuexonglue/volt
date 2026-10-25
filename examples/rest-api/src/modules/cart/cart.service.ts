import { productsService } from '../products/products.service';
import { AddToCartDto, Cart, CartItem, UpdateCartItemDto } from './cart.types';

export class CartService {
  // Map of userId -> Cart
  private carts: Map<string, Cart> = new Map();

  getCart(userId: string): Cart {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = {
        userId,
        items: [],
        itemCount: 0,
        totalPrice: 0,
        updatedAt: new Date().toISOString(),
      };
      this.carts.set(userId, cart);
    }
    return this.recalculate(cart);
  }

  addItem(userId: string, dto: AddToCartDto): Cart {
    const product = productsService.findById(dto.productId);
    if (!product) {
      throw new Error(`Product "${dto.productId}" not found`);
    }

    if (product.stock < dto.quantity) {
      throw new Error(
        `Insufficient inventory. Requested ${dto.quantity}, but only ${product.stock} available.`
      );
    }

    const cart = this.getCart(userId);
    const existingIndex = cart.items.findIndex((item) => item.productId === dto.productId);

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + dto.quantity;
      if (product.stock < newQty) {
        throw new Error(
          `Cannot add more items. Max available in stock is ${product.stock}.`
        );
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].subtotal = Number((newQty * product.price).toFixed(2));
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: dto.quantity,
        subtotal: Number((dto.quantity * product.price).toFixed(2)),
      });
    }

    return this.recalculate(cart);
  }

  updateItem(userId: string, productId: string, dto: UpdateCartItemDto): Cart {
    const cart = this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      throw new Error(`Item "${productId}" is not in the shopping cart`);
    }

    const product = productsService.findById(productId);
    if (product && product.stock < dto.quantity) {
      throw new Error(
        `Insufficient inventory. Only ${product.stock} available.`
      );
    }

    item.quantity = dto.quantity;
    item.subtotal = Number((item.quantity * item.price).toFixed(2));
    return this.recalculate(cart);
  }

  removeItem(userId: string, productId: string): Cart {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    return this.recalculate(cart);
  }

  clearCart(userId: string): Cart {
    const cart = this.getCart(userId);
    cart.items = [];
    return this.recalculate(cart);
  }

  private recalculate(cart: Cart): Cart {
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = Number(
      cart.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );
    cart.updatedAt = new Date().toISOString();
    return cart;
  }
}

export const cartService = new CartService();
