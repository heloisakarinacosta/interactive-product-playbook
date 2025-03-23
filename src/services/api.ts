
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
    // Log request body for debugging if it exists
    if (config.data) {
      console.log('Request payload:', config.data);
    }
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
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Products API
export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
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
    const response = await api.post(`/subitems`, { 
      ...subitemData, 
      item_id: itemId,
      last_updated_by: subitemData.lastUpdatedBy || 'system',
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
    const response = await api.put(`/subitems/${id}`, {
      ...subitemData,
      last_updated_by: subitemData.lastUpdatedBy || 'system',
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating subitem ${id}:`, error);
    throw error;
  }
};

// Scenario Items API
export const fetchScenarioItems = async (scenarioId: string) => {
  try {
    const response = await api.get(`/scenario-items/${scenarioId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching items for scenario ${scenarioId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

export const linkItemToScenario = async (scenarioId: string, itemId: string) => {
  try {
    const response = await api.post(`/scenario-items`, {
      scenario_id: scenarioId,
      item_id: itemId,
      created_by: 'admin', // This should come from the auth context
      created_at: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error linking item ${itemId} to scenario ${scenarioId}:`, error);
    throw error;
  }
};

export const unlinkItemFromScenario = async (scenarioId: string, itemId: string) => {
  try {
    const response = await api.delete(`/scenario-items/${scenarioId}/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unlinking item ${itemId} from scenario ${scenarioId}:`, error);
    throw error;
  }
};

// Scenarios API
export const fetchScenarios = async () => {
  try {
    const response = await api.get('/scenarios');
    return response.data;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return []; // Return empty array instead of throwing
  }
};

export const createScenario = async (scenarioData: { 
  title: string; 
  description: string;
  formattedDescription?: string;
}) => {
  try {
    console.log('Creating scenario:', scenarioData);
    const response = await api.post('/scenarios', scenarioData);
    return response.data;
  } catch (error) {
    console.error('Error creating scenario:', error);
    throw error;
  }
};

export const updateScenario = async (id: string, scenarioData: {
  title: string;
  description: string;
  formattedDescription?: string;
}) => {
  try {
    const response = await api.put(`/scenarios/${id}`, scenarioData);
    return response.data;
  } catch (error) {
    console.error(`Error updating scenario ${id}:`, error);
    throw error;
  }
};

// Subitem visibility for scenarios
export const updateSubitemVisibility = async (
  scenarioId: string,
  itemId: string,
  subitemId: string,
  isVisible: boolean
) => {
  try {
    const response = await api.put(`/scenario-subitems/${scenarioId}/${itemId}/${subitemId}/visibility`, {
      is_visible: isVisible,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating visibility for subitem ${subitemId}:`, error);
    throw error;
  }
};

export const getSubitemVisibility = async (scenarioId: string, itemId: string) => {
  try {
    const response = await api.get(`/scenario-subitems/${scenarioId}/${itemId}/visibility`);
    return response.data;
  } catch (error) {
    console.error(`Error getting visibility for scenario ${scenarioId}, item ${itemId}:`, error);
    return {};
  }
};

export default api;
