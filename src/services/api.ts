
// API service for making requests to the backend

export const API_URL = process.env.API_URL || 'http://localhost:3001/api';

export const api = {
  // Generic fetch function with error handling
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Unknown error occurred');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Products
  getProducts: () => api.fetch('/products'),
  getProduct: (id: number) => api.fetch(`/products/${id}`),
  createProduct: (data: any) => api.fetch('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProduct: (id: number, data: any) => api.fetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id: number) => api.fetch(`/products/${id}`, {
    method: 'DELETE',
  }),

  // Similar methods for items, subitems, scenarios, etc.
};

export default api;
