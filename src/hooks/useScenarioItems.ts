
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchScenarioItems, 
  linkItemToScenario, 
  fetchSubitems,
  updateSubitemVisibility,
  getSubitemVisibility 
} from '@/services/api';
import type { Subitem } from '@/types/api.types';

export function useScenarioItems(selectedScenario: string | null) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [itemSubitems, setItemSubitems] = useState<Record<string, Subitem[]>>({});
  const [subitemVisibility, setSubitemVisibility] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { 
    data: scenarioItems = [], 
    isLoading: isLoadingItems,
    refetch: refetchScenarioItems
  } = useQuery({
    queryKey: ['scenario-items', selectedScenario],
    queryFn: () => fetchScenarioItems(selectedScenario || ''),
    enabled: !!selectedScenario,
  });

  useEffect(() => {
    if (selectedScenario && scenarioItems.length > 0) {
      const fetchAllSubitems = async () => {
        const newItemSubitems: Record<string, Subitem[]> = {};
        
        for (const item of scenarioItems) {
          try {
            const subitems = await fetchSubitems(item.item_id);
            newItemSubitems[item.item_id] = subitems;
          } catch (error) {
            console.error(`Error fetching subitems for item ${item.item_id}:`, error);
            newItemSubitems[item.item_id] = [];
          }
        }
        
        setItemSubitems(newItemSubitems);
      };
      
      fetchAllSubitems();
    }
  }, [selectedScenario, scenarioItems]);

  const linkItemMutation = useMutation({
    mutationFn: ({ scenarioId, itemId }: { scenarioId: string; itemId: string }) =>
      linkItemToScenario(scenarioId, itemId),
    onSuccess: () => {
      if (selectedScenario) {
        queryClient.invalidateQueries({ queryKey: ['scenario-items', selectedScenario] });
        refetchScenarioItems();
      }
      toast.success('Item vinculado ao cenário');
    },
    onError: (error) => {
      console.error('Error linking item to scenario:', error);
      toast.error('Erro ao vincular item ao cenário');
    }
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: ({ 
      scenarioId, 
      itemId, 
      subitemId, 
      isVisible 
    }: { 
      scenarioId: string; 
      itemId: string; 
      subitemId: string; 
      isVisible: boolean 
    }) => updateSubitemVisibility(scenarioId, itemId, subitemId, isVisible),
    onSuccess: () => {
      if (selectedScenario && selectedItem) {
        queryClient.invalidateQueries({ queryKey: ['scenario-items', selectedScenario] });
      }
      toast.success('Visibilidade atualizada');
    },
    onError: (error) => {
      console.error('Error updating visibility:', error);
      toast.error('Erro ao atualizar visibilidade');
    }
  });

  const handleManageSubitems = async (itemId: string) => {
    setSelectedItem(itemId);
    
    if (selectedScenario) {
      try {
        const visibilityData = await getSubitemVisibility(selectedScenario, itemId);
        setSubitemVisibility(visibilityData || {});
      } catch (error) {
        console.error('Error fetching subitem visibility:', error);
      }
    }
  };

  return {
    scenarioItems,
    selectedItem,
    itemSubitems,
    subitemVisibility,
    isLoadingItems,
    isLoading: isLoading || linkItemMutation.isPending,
    setSelectedItem,
    handleManageSubitems,
    setSubitemVisibility,
    linkItemMutation,
    updateVisibilityMutation,
  };
}
