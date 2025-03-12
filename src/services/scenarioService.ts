
import api from './baseApi';

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
