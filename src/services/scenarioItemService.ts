
import api from './baseApi';
import { ScenarioItem } from '../types/api.types';

export const fetchScenarioItems = async (scenarioId: string): Promise<ScenarioItem[]> => {
  try {
    const response = await api.get(`/scenario-items/${scenarioId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching items for scenario ${scenarioId}:`, error);
    return [];
  }
};

export const linkItemToScenario = async (scenarioId: string, itemId: string): Promise<ScenarioItem> => {
  try {
    const payload = {
      scenario_id: scenarioId,
      item_id: itemId,
      created_by: 'admin',
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

export const unlinkItemFromScenario = async (scenarioId: string, itemId: string): Promise<void> => {
  try {
    await api.delete(`/scenario-items/${scenarioId}/${itemId}`);
  } catch (error) {
    console.error(`Error unlinking item ${itemId} from scenario ${scenarioId}:`, error);
    throw error;
  }
};

export const updateSubitemVisibility = async (
  scenarioId: string,
  itemId: string,
  subitemId: string,
  isVisible: boolean
): Promise<void> => {
  try {
    const payload = {
      scenario_id: scenarioId,
      item_id: itemId,
      subitem_id: subitemId,
      is_visible: isVisible,
      updated_by: 'admin',
      updated_at: new Date().toISOString(),
    };
    console.log('Updating subitem visibility with payload:', payload);
    await api.put(`/scenario-subitems/visibility`, payload);
  } catch (error) {
    console.error(`Error updating visibility for subitem ${subitemId}:`, error);
    throw error;
  }
};

export const getSubitemVisibility = async (scenarioId: string, itemId: string): Promise<Record<string, boolean>> => {
  try {
    const response = await api.get(`/scenario-subitems/${scenarioId}/${itemId}/visibility`);
    return response.data;
  } catch (error) {
    console.error(`Error getting visibility for scenario ${scenarioId}, item ${itemId}:`, error);
    return {};
  }
};
