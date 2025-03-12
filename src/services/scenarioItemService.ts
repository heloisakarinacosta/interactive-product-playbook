
import api from './baseApi';

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
