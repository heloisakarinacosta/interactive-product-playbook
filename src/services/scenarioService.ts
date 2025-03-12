
import api from './baseApi';
import { Scenario, ScenarioCreateInput } from '../types/api.types';

export const fetchScenarios = async (): Promise<Scenario[]> => {
  try {
    const response = await api.get('/scenarios');
    return response.data;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
};

export const createScenario = async (scenarioData: ScenarioCreateInput): Promise<Scenario> => {
  try {
    console.log('Creating scenario:', scenarioData);
    const payload = {
      title: scenarioData.title,
      description: scenarioData.description,
      formatted_description: scenarioData.formattedDescription || null,
      created_by: 'admin',
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

export const updateScenario = async (id: string, scenarioData: ScenarioCreateInput): Promise<Scenario> => {
  try {
    const payload = {
      title: scenarioData.title,
      description: scenarioData.description,
      formatted_description: scenarioData.formattedDescription || null,
      updated_by: 'admin',
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
