export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  subtotal: number;
}

export interface CartData {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const useCart = () => {
  const api = useApi();
  const cart = useState<CartData>('cart_state', () => ({
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  }));

  const isDrawerOpen = useState<boolean>('cart_drawer_open', () => false);
  const isLoading = ref(false);

  const refreshCart = async () => {
    try {
      const res = await api.getCart();
      if (res && res.data) {
        cart.value = res.data;
      }
    } catch (e) {
      console.warn('Failed to refresh cart:', e);
    }
  };

  const addItem = async (productId: string, quantity = 1) => {
    isLoading.value = true;
    try {
      const res = await api.addToCart(productId, quantity);
      if (res && res.data) {
        cart.value = res.data;
      }
      isDrawerOpen.value = true;
    } catch (e) {
      console.error('Failed to add item to cart:', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    isLoading.value = true;
    try {
      const res = await api.updateCartItem(productId, quantity);
      if (res && res.data) {
        cart.value = res.data;
      }
    } catch (e) {
      console.error('Failed to update cart quantity:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const removeItem = async (productId: string) => {
    isLoading.value = true;
    try {
      const res = await api.removeCartItem(productId);
      if (res && res.data) {
        cart.value = res.data;
      }
    } catch (e) {
      console.error('Failed to remove item:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const clear = async () => {
    isLoading.value = true;
    try {
      const res = await api.clearCart();
      if (res && res.data) {
        cart.value = res.data;
      }
    } catch (e) {
      console.error('Failed to clear cart:', e);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    cart,
    isDrawerOpen,
    isLoading,
    refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };
};
