
import axios from 'axios';

// Determine API URL based on environment
const API_URL = '/api'; // Always use relative path

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array on error to prevent map() errors
    return [];
  }
};

export const createProduct = async (productData: { title: string; description: string }) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: { title: string; description: string }) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Items API
export const fetchItems = async (productId: string) => {
  try {
    const response = await api.get(`/items/${productId}`);
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

export const createItem = async (productId: string, itemData: { title: string }) => {
  try {
    const response = await api.post(`/items`, { ...itemData, product_id: productId });
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, itemData: { title: string }) => {
  try {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

// Subitems API
export const fetchSubitems = async (itemId: string) => {
  try {
    const response = await api.get(`/subitems/${itemId}`);
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching subitems:', error);
    return [];
  }
};

export const createSubitem = async (itemId: string, subitemData: { 
  title: string; 
  subtitle?: string;
  description: string;
  lastUpdatedBy?: string;
}) => {
  try {
    const response = await api.post(`/subitems`, { 
      ...subitemData, 
      item_id: itemId,
      last_updated_by: subitemData.lastUpdatedBy,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating subitem:', error);
    throw error;
  }
};

export const updateSubitem = async (id: string, subitemData: { 
  title: string; 
  subtitle?: string;
  description: string;
  lastUpdatedBy?: string;
}) => {
  try {
    const response = await api.put(`/subitems/${id}`, {
      ...subitemData,
      last_updated_by: subitemData.lastUpdatedBy,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating subitem:', error);
    throw error;
  }
};

export default api;
