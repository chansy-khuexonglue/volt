import { productsService } from '../products/products.service';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export class CartService {
  private carts = new Map<string, CartItem[]>();

  getCart(sessionId: string): CartSummary {
    const items = this.carts.get(sessionId) || [];
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = Math.round(items.reduce((acc, item) => acc + item.subtotal, 0) * 100) / 100;
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% estimated tax
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    return {
      items,
      itemCount,
      subtotal,
      shipping,
      tax,
      total,
    };
  }

  async addItem(sessionId: string, productId: string, quantity: number = 1): Promise<CartSummary> {
    const items = this.carts.get(sessionId) || [];
    const existingIndex = items.findIndex((i) => i.productId === productId);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
      items[existingIndex].subtotal =
        Math.round(items[existingIndex].quantity * items[existingIndex].price * 100) / 100;
    } else {
      const product = await productsService.getById(productId);
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      items.push({
        productId: product.id,
        title: product.title,
        price: Number(product.price),
        image: product.images?.[0] || '',
        quantity: Math.max(1, quantity),
        subtotal: Math.round(Number(product.price) * Math.max(1, quantity) * 100) / 100,
      });
    }

    this.carts.set(sessionId, items);
    return this.getCart(sessionId);
  }

  updateItem(sessionId: string, productId: string, quantity: number): CartSummary {
    const items = this.carts.get(sessionId) || [];
    const existingIndex = items.findIndex((i) => i.productId === productId);

    if (existingIndex > -1) {
      if (quantity <= 0) {
        items.splice(existingIndex, 1);
      } else {
        items[existingIndex].quantity = quantity;
        items[existingIndex].subtotal =
          Math.round(items[existingIndex].price * quantity * 100) / 100;
      }
    }

    this.carts.set(sessionId, items);
    return this.getCart(sessionId);
  }

  removeItem(sessionId: string, productId: string): CartSummary {
    const items = this.carts.get(sessionId) || [];
    const filtered = items.filter((i) => i.productId !== productId);
    this.carts.set(sessionId, filtered);
    return this.getCart(sessionId);
  }

  clearCart(sessionId: string): CartSummary {
    this.carts.delete(sessionId);
    return this.getCart(sessionId);
  }
}

export const cartService = new CartService();
