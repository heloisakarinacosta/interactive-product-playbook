
import axios from 'axios';
import { toast } from 'sonner';

// Determine API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('Using API URL:', API_URL); // Debug log

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long waiting when server is down
  timeout: 15000, // Increased timeout for slower connections
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
      
      // Show user-friendly toast based on status code
      if (error.response.status === 404) {
        toast.error(`API endpoint não encontrado: ${error.config.url}`);
      } else if (error.response.status >= 500) {
        toast.error(`Erro no servidor: ${error.response.data.message || 'Erro interno'}`);
      } else {
        toast.error(`Erro: ${error.response.data.message || 'Erro na comunicação com API'}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      // Show a user-friendly message when server is down
      if (error.code === 'ECONNABORTED' || !error.response) {
        toast.error(`Servidor API não está respondendo. Verifique se o servidor está rodando em ${API_URL}`, {
          duration: 6000, // Show longer
          position: 'top-center',
        });
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      toast.error(`Erro de configuração da requisição: ${error.message}`);
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
    const payload = {
      title: scenarioData.title,
      description: scenarioData.description,
      formatted_description: scenarioData.formattedDescription || null,
      created_by: 'admin', // This should come from auth context
      created_at: new Date().toISOString(),
    };
    console.log('Payload:', payload);
    const response = await api.post('/scenarios', payload);
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
    const payload = {
      title: scenarioData.title,
      description: scenarioData.description,
      formatted_description: scenarioData.formattedDescription || null,
      updated_by: 'admin', // This should come from auth context
      updated_at: new Date().toISOString(),
    };
    console.log('Updating scenario with payload:', payload);
    const response = await api.put(`/scenarios/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating scenario ${id}:`, error);
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
    const payload = {
      scenario_id: scenarioId,
      item_id: itemId,
      created_by: 'admin', // This should come from auth context
      created_at: new Date().toISOString(),
    };
    console.log('Linking item to scenario with payload:', payload);
    const response = await api.post(`/scenario-items`, payload);
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

// Subitem visibility for scenarios
export const updateSubitemVisibility = async (
  scenarioId: string,
  itemId: string,
  subitemId: string,
  isVisible: boolean
) => {
  try {
    const payload = {
      scenario_id: scenarioId,
      item_id: itemId,
      subitem_id: subitemId,
      is_visible: isVisible,
      updated_by: 'admin', // This should come from auth context
      updated_at: new Date().toISOString(),
    };
    console.log('Updating subitem visibility with payload:', payload);
    const response = await api.put(`/scenario-subitems/visibility`, payload);
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
