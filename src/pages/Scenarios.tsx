import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DetailModal from '@/components/ui/DetailModal';
import ScenarioList from '@/components/scenarios/ScenarioList';
import ScenarioItemList from '@/components/scenarios/ScenarioItemList';
import { ItemSelectionDialog } from '@/components/scenarios/ItemSelectionDialog';
import { SubitemVisibilityDialog } from '@/components/scenarios/SubitemVisibilityDialog';
import { fetchScenarios, createScenario, updateScenario, fetchScenarioItems, linkItemToScenario, getSubitemVisibility, updateSubitemVisibility, fetchProducts, fetchItems, fetchSubitems } from '@/services/api';
import { Subitem, ScenarioItem, Item } from '@/types/api.types';

const ScenariosPage = () => {
  const queryClient = useQueryClient();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedSubitem, setSelectedSubitem] = useState<Subitem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemSelectionOpen, setItemSelectionOpen] = useState(false);
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [subitemVisibility, setSubitemVisibility] = useState<Record<string, boolean>>({});
  const [itemSubitems, setItemSubitems] = useState<Record<string, Subitem[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);

  // Fetch scenarios
  const { 
    data: scenarios = [], 
    isLoading: isLoadingScenarios,
    refetch: refetchScenarios
  } = useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
  });

  // Fetch scenario items
  const { 
    data: scenarioItems = [], 
    isLoading: isLoadingItems,
    refetch: refetchScenarioItems
  } = useQuery({
    queryKey: ['scenario-items', selectedScenario],
    queryFn: () => fetchScenarioItems(selectedScenario || ''),
    enabled: !!selectedScenario,
  });

  // Fetch all products for item selection
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Fetch subitems for selected items
  useEffect(() => {
    if (selectedScenario && scenarioItems.length > 0) {
      // Fetch subitems for each item in the scenario
      const fetchAllSubitems = async () => {
        const newItemSubitems: Record<string, Subitem[]> = {};
        
        for (const item of scenarioItems) {
          try {
            console.log(`Fetching subitems for item ${item.item_id}`);
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

  // Mutations
  const createScenarioMutation = useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      refetchScenarios();
      toast.success('Novo cenário criado');
    },
    onError: (error) => {
      console.error('Error creating scenario:', error);
      toast.error('Erro ao criar cenário');
    }
  });

  const updateScenarioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateScenario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      toast.success('Cenário atualizado');
    },
    onError: (error) => {
      console.error('Error updating scenario:', error);
      toast.error('Erro ao atualizar cenário');
    }
  });

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

  // Handlers
  const handleAddScenario = () => {
    if (createScenarioMutation.isPending) return;
    
    setIsLoading(true);
    createScenarioMutation.mutate({
      title: 'Novo Cenário',
      description: 'Descrição do novo cenário',
      formatted_description: '<p>Descrição do novo cenário</p>'
    }, {
      onSettled: () => setIsLoading(false)
    });
  };

  const handleUpdateScenario = (id: string, title: string, description: string) => {
    updateScenarioMutation.mutate({
      id,
      data: { 
        title, 
        description,
        formatted_description: description 
      },
    });
  };

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setSelectedItem(null);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
  };

  const handleOpenAddItems = () => {
    if (!selectedScenario) return;
    
    // Set initially selected items
    const currentItems = scenarioItems?.map(item => item.item_id) || [];
    setSelectedProductItems(currentItems);
    setItemSelectionOpen(true);
  };
  
  const handleSaveSelectedItems = () => {
    if (!selectedScenario) return;
    setIsLoading(true);
    
    // Process each selected item
    const promises = selectedProductItems.map(itemId => {
      // Check if item is already linked to scenario
      const isAlreadyLinked = scenarioItems.some(item => item.item_id === itemId);
      if (!isAlreadyLinked) {
        return linkItemMutation.mutateAsync({ scenarioId: selectedScenario, itemId });
      }
      return Promise.resolve();
    });
    
    Promise.all(promises)
      .then(() => {
        setItemSelectionOpen(false);
        toast.success('Itens do cenário atualizados');
      })
      .catch((error) => {
        console.error('Error updating scenario items:', error);
        toast.error('Erro ao atualizar itens do cenário');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedProductItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const handleManageSubitems = (itemId: string) => {
    setSelectedItem(itemId);
    
    // Fetch visibility data for this item's subitems
    if (selectedScenario) {
      getSubitemVisibility(selectedScenario, itemId)
        .then(visibilityData => {
          setSubitemVisibility(visibilityData || {});
          setVisibilityDialogOpen(true);
        })
        .catch(error => {
          console.error('Error fetching subitem visibility:', error);
          setVisibilityDialogOpen(true); // Open dialog anyway with default values
        });
    } else {
      setVisibilityDialogOpen(true);
    }
  };
  
  const handleSaveSubitemVisibility = () => {
    if (!selectedItem || !selectedScenario) return;
    setIsLoading(true);
    
    // For each subitem, update its visibility in the backend
    const promises = Object.entries(subitemVisibility).map(([subitemId, isVisible]) => 
      updateVisibilityMutation.mutateAsync({
        scenarioId: selectedScenario,
        itemId: selectedItem,
        subitemId,
        isVisible
      })
    );
    
    Promise.all(promises)
      .then(() => {
        setVisibilityDialogOpen(false);
        toast.success('Visibilidade dos subitens atualizada');
      })
      .catch((error) => {
        console.error('Error updating subitem visibility:', error);
        toast.error('Erro ao atualizar visibilidade dos subitens');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const handleSelectSubitem = (subitem: Subitem) => {
    setSelectedSubitem(subitem);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <ScenarioList
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        isLoading={isLoadingScenarios}
        isCreating={isLoading || createScenarioMutation.isPending}
        onScenarioSelect={handleScenarioSelect}
        onAddScenario={handleAddScenario}
        onUpdateScenario={handleUpdateScenario}
      />
      
      {selectedScenario && (
        <ScenarioItemList
          scenarioTitle={scenarios.find(s => s.id === selectedScenario)?.title || ''}
          items={scenarioItems}
          selectedItem={selectedItem}
          itemSubitems={itemSubitems}
          isLoading={isLoadingItems}
          onItemSelect={handleItemSelect}
          onManageItems={handleOpenAddItems}
          onManageSubitems={handleManageSubitems}
          onSelectSubitem={handleSelectSubitem}
        />
      )}
      
      <ItemSelectionDialog
        open={itemSelectionOpen}
        onOpenChange={setItemSelectionOpen}
        onSave={handleSaveSelectedItems}
        isLoading={isLoading}
        selectedItems={selectedProductItems}
        onItemToggle={toggleItemSelection}
      />
      
      <SubitemVisibilityDialog
        open={visibilityDialogOpen}
        onOpenChange={setVisibilityDialogOpen}
        onSave={handleSaveSubitemVisibility}
        isLoading={isLoading}
        selectedItem={selectedItem}
        itemSubitems={itemSubitems}
        visibility={subitemVisibility}
        onVisibilityChange={(subitemId, isVisible) => 
          setSubitemVisibility(prev => ({ ...prev, [subitemId]: isVisible }))
        }
      />
      
      {selectedSubitem && (
        <DetailModal
          subitem={selectedSubitem}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={() => {}} // Read-only in scenario mode
        />
      )}
    </div>
  );
};

export default ScenariosPage;
