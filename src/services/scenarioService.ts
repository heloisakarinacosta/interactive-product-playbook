
import api from './baseApi';
import { Scenario, ScenarioCreateInput } from '@/types/api.types';

export const fetchScenarios = async (): Promise<Scenario[]> => {
  try {
    const response = await api.get('/scenarios');
    return response.data;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    throw error;
  }
};

export const createScenario = async (scenarioData: ScenarioCreateInput): Promise<Scenario> => {
  try {
    const response = await api.post('/scenarios', {
      ...scenarioData,
      formatted_description: scenarioData.formatted_description
    });
    return response.data;
  } catch (error) {
    console.error('Error creating scenario:', error);
    throw error;
  }
};

export const updateScenario = async (
  id: string,
  scenarioData: Partial<ScenarioCreateInput>
): Promise<Scenario> => {
  try {
    const response = await api.put(`/scenarios/${id}`, {
      ...scenarioData,
      formatted_description: scenarioData.formatted_description
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating scenario ${id}:`, error);
    throw error;
  }
};

export const deleteScenario = async (id: string): Promise<void> => {
  try {
    await api.delete(`/scenarios/${id}`);
  } catch (error) {
    console.error(`Error deleting scenario ${id}:`, error);
    throw error;
  }
};
