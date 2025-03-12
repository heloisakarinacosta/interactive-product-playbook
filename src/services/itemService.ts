
import api from './baseApi';

// Items API
export const fetchItems = async (productId: string) => {
  try {
    const response = await api.get(`/items/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching items for product ${productId}:`, error);
    throw error;
  }
};

export const createItem = async (productId: string, itemData: { title: string }) => {
  try {
    console.log('Creating item for product:', productId, itemData);
    const response = await api.post(`/items`, { ...itemData, product_id: productId });
    return response.data;
  } catch (error) {
    console.error(`Error creating item for product ${productId}:`, error);
    throw error;
  }
};

export const updateItem = async (id: string, itemData: { title: string }) => {
  try {
    console.log(`Updating item ${id} with data:`, itemData);
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
    throw error;
  }
};
