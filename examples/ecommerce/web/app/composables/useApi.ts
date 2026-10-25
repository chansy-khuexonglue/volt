export const useApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:3000';

  // Persistent session id for cart stored in cookie/localStorage
  const sessionId = useCookie('volt_session_id', {
    default: () => 'sess_' + Math.random().toString(36).substring(2, 10),
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  const fetchApi = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const url = `${apiBase}${endpoint}`;
    const headers = {
      'x-session-id': sessionId.value,
      ...options.headers,
    };

    return await $fetch<T>(url, {
      ...options,
      headers,
    });
  };

  return {
    apiBase,
    sessionId,
    fetchApi,

    // Categories
    getCategories: () => fetchApi<{ success: boolean; data: any[]; count: number }>('/api/categories'),
    getCategory: (slug: string) => fetchApi<{ success: boolean; data: any; products: any[] }>(`/api/categories/${slug}`),

    // Products
    getProducts: (params?: Record<string, any>) =>
      fetchApi<{ success: boolean; data: any[]; total: number }>('/api/products', { params }),
    getFeaturedProducts: () => fetchApi<{ success: boolean; data: any[] }>('/api/products/featured'),
    getProduct: (id: string) => fetchApi<{ success: boolean; data: any }>(`/api/products/${id}`),

    // Reviews
    getReviews: (productId: string) =>
      fetchApi<{ success: boolean; data: any[]; count: number }>(`/api/products/${productId}/reviews`),
    addReview: (productId: string, data: { userName: string; rating: number; title: string; comment: string }) =>
      fetchApi<{ success: boolean; data: any }>(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: data,
      }),

    // Cart
    getCart: () => fetchApi<{ success: boolean; data: any }>('/api/cart'),
    addToCart: (productId: string, quantity = 1) =>
      fetchApi<{ success: boolean; data: any }>('/api/cart/items', {
        method: 'POST',
        body: { productId, quantity },
      }),
    updateCartItem: (productId: string, quantity: number) =>
      fetchApi<{ success: boolean; data: any }>(`/api/cart/items/${productId}`, {
        method: 'PUT',
        body: { quantity },
      }),
    removeCartItem: (productId: string) =>
      fetchApi<{ success: boolean; data: any }>(`/api/cart/items/${productId}`, {
        method: 'DELETE',
      }),
    clearCart: () =>
      fetchApi<{ success: boolean; data: any }>('/api/cart', {
        method: 'DELETE',
      }),

    // Orders
    checkoutOrder: (orderData: any) =>
      fetchApi<{ success: boolean; data: any }>('/api/orders/checkout', {
        method: 'POST',
        body: orderData,
      }),
    getOrder: (orderId: string) =>
      fetchApi<{ success: boolean; data: any }>(`/api/orders/${orderId}`),
  };
};
