
import api from './baseApi';

// Subitems API
export const fetchSubitems = async (itemId: string) => {
  try {
    const response = await api.get(`/subitems/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subitems for item ${itemId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

export const createSubitem = async (itemId: string, subitemData: { 
  title: string; 
  subtitle?: string;
  description: string;
  lastUpdatedBy?: string;
}) => {
  try {
    console.log(`Creating subitem for item ${itemId}:`, subitemData);
    // Map frontend field names to backend field names
    const response = await api.post(`/subitems`, { 
      title: subitemData.title,
      subtitle: subitemData.subtitle || null,
      description: subitemData.description,
      item_id: itemId,
      // Use last_updated_by instead of lastUpdatedBy to match DB field names
      last_updated_by: subitemData.lastUpdatedBy || 'system',
      last_updated_at: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating subitem for item ${itemId}:`, error);
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
    // Map frontend field names to backend field names
    const response = await api.put(`/subitems/${id}`, {
      title: subitemData.title,
      subtitle: subitemData.subtitle || null,
      description: subitemData.description,
      // Use last_updated_by instead of lastUpdatedBy to match DB field names
      last_updated_by: subitemData.lastUpdatedBy || 'system',
      last_updated_at: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating subitem ${id}:`, error);
    throw error;
  }
};
