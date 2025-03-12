
import axios from 'axios';
import { Subitem, SubitemCreateInput } from '@/types/api.types';
import api from './baseApi';

// Endpoints
const ITEMS_ENDPOINT = `${api.defaults.baseURL}/items`;

// Service functions
export const fetchSubitems = async (itemId: string): Promise<Subitem[]> => {
  try {
    const response = await axios.get(`${ITEMS_ENDPOINT}/${itemId}/subitems`);
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
    const response = await axios.post(`${ITEMS_ENDPOINT}/${itemId}/subitems`, {
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
    const response = await axios.put(`${ITEMS_ENDPOINT}/${itemId}/subitems/${subitemId}`, {
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
    await axios.delete(`${ITEMS_ENDPOINT}/${itemId}/subitems/${subitemId}`);
  } catch (error) {
    console.error(`Error deleting subitem ${subitemId}:`, error);
    throw error;
  }
};
