
import api from './baseApi';
import { Subitem, SubitemCreateInput } from '@/types/api.types';

// Service functions
export const fetchSubitems = async (itemId: string): Promise<Subitem[]> => {
  try {
    const response = await api.get(`/items/${itemId}/subitems`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subitems for item ${itemId}:`, error);
    throw error;
  }
};

export const createSubitem = async (
  itemId: string,
  subitemData: SubitemCreateInput
): Promise<Subitem> => {
  try {
    const response = await api.post(`/items/${itemId}/subitems`, {
      ...subitemData,
      last_updated_by: subitemData.last_updated_by
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating subitem for item ${itemId}:`, error);
    throw error;
  }
};

export const updateSubitem = async (
  itemId: string,
  subitemId: string,
  subitemData: Partial<SubitemCreateInput>
): Promise<Subitem> => {
  try {
    const response = await api.put(`/items/${itemId}/subitems/${subitemId}`, {
      ...subitemData,
      last_updated_by: subitemData.last_updated_by
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating subitem ${subitemId}:`, error);
    throw error;
  }
};

export const deleteSubitem = async (
  itemId: string,
  subitemId: string
): Promise<void> => {
  try {
    await api.delete(`/items/${itemId}/subitems/${subitemId}`);
  } catch (error) {
    console.error(`Error deleting subitem ${subitemId}:`, error);
    throw error;
  }
};
