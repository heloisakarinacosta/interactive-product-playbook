
import api from './baseApi';
import { Subitem, SubitemCreateInput } from '../types/api.types';

export const fetchSubitems = async (itemId: string): Promise<Subitem[]> => {
  try {
    const response = await api.get(`/subitems/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subitems for item ${itemId}:`, error);
    return [];
  }
};

export const createSubitem = async (itemId: string, subitemData: SubitemCreateInput): Promise<Subitem> => {
  try {
    console.log(`Creating subitem for item ${itemId}:`, subitemData);
    const response = await api.post(`/subitems`, { 
      title: subitemData.title,
      subtitle: subitemData.subtitle || null,
      description: subitemData.description,
      item_id: itemId,
      last_updated_by: subitemData.lastUpdatedBy || 'system',
      last_updated_at: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating subitem for item ${itemId}:`, error);
    throw error;
  }
};

export const updateSubitem = async (id: string, subitemData: SubitemCreateInput): Promise<Subitem> => {
  try {
    const response = await api.put(`/subitems/${id}`, {
      title: subitemData.title,
      subtitle: subitemData.subtitle || null,
      description: subitemData.description,
      last_updated_by: subitemData.lastUpdatedBy || 'system',
      last_updated_at: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating subitem ${id}:`, error);
    throw error;
  }
};
