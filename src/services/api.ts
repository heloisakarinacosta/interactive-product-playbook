
import axios from 'axios';

// Determine API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('Using API URL:', API_URL); // Debug log

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Received response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    return Promise.reject(error);
  }
);

// Products API
export const fetchProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData: { title: string; description: string }) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: { title: string; description: string }) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Items API
export const fetchItems = async (productId: string) => {
  const response = await api.get(`/items/${productId}`);
  return response.data;
};

export const createItem = async (productId: string, itemData: { title: string }) => {
  const response = await api.post(`/items`, { ...itemData, product_id: productId });
  return response.data;
};

export const updateItem = async (id: string, itemData: { title: string }) => {
  const response = await api.put(`/items/${id}`, itemData);
  return response.data;
};

// Subitems API
export const fetchSubitems = async (itemId: string) => {
  const response = await api.get(`/subitems/${itemId}`);
  return response.data;
};

export const createSubitem = async (itemId: string, subitemData: { 
  title: string; 
  subtitle?: string;
  description: string;
  lastUpdatedBy?: string;
}) => {
  const response = await api.post(`/subitems`, { 
    ...subitemData, 
    item_id: itemId,
    last_updated_by: subitemData.lastUpdatedBy,
  });
  return response.data;
};

export const updateSubitem = async (id: string, subitemData: { 
  title: string; 
  subtitle?: string;
  description: string;
  lastUpdatedBy?: string;
}) => {
  const response = await api.put(`/subitems/${id}`, {
    ...subitemData,
    last_updated_by: subitemData.lastUpdatedBy,
  });
  return response.data;
};

export default api;
