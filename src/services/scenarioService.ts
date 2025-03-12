
import axios from 'axios';
import { Scenario, ScenarioCreateInput } from '@/types/api.types';
import { API_URL } from './baseApi';

// Endpoints
const SCENARIOS_ENDPOINT = `${API_URL}/scenarios`;

// Service functions
export const fetchScenarios = async (): Promise<Scenario[]> => {
  try {
    const response = await axios.get(SCENARIOS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    throw error;
  }
};

export const createScenario = async (scenarioData: ScenarioCreateInput): Promise<Scenario> => {
  try {
    const response = await axios.post(SCENARIOS_ENDPOINT, {
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
    const response = await axios.put(`${SCENARIOS_ENDPOINT}/${id}`, {
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
    await axios.delete(`${SCENARIOS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting scenario ${id}:`, error);
    throw error;
  }
};
