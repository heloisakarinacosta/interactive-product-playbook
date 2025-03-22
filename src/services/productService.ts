
import api from './baseApi';
import { Product, ProductCreateInput } from '../types/api.types';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from API...');
    const response = await api.get('/products');
    console.log('Products fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Retorna um array vazio em caso de erro para evitar quebrar a UI
    return [];
  }
};

export const createProduct = async (productData: ProductCreateInput): Promise<Product> => {
  try {
    console.log('Creating new product:', productData);
    const response = await api.post('/products', productData);
    console.log('Product created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: ProductCreateInput): Promise<Product> => {
  try {
    console.log(`Updating product ${id}:`, productData);
    const response = await api.put(`/products/${id}`, productData);
    console.log('Product updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};
