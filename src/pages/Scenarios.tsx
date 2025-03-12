
import React, { useState } from 'react';
import DetailModal from '@/components/ui/DetailModal';
import ScenarioList from '@/components/scenarios/ScenarioList';
import ScenarioItemList from '@/components/scenarios/ScenarioItemList';
import { ItemSelectionDialog } from '@/components/scenarios/ItemSelectionDialog';
import { SubitemVisibilityDialog } from '@/components/scenarios/SubitemVisibilityDialog';
import { useScenarioOperations } from '@/hooks/useScenarioOperations';
import { useScenarioItems } from '@/hooks/useScenarioItems';
import { useItemSelection } from '@/hooks/useItemSelection';
import type { Subitem } from '@/types/api.types';

const ScenariosPage = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedSubitem, setSelectedSubitem] = useState<Subitem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemSelectionOpen, setItemSelectionOpen] = useState(false);
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);

  const {
    scenarios,
    isLoadingScenarios,
    isLoading: isLoadingScenario,
    handleAddScenario,
    handleUpdateScenario,
  } = useScenarioOperations();

  const {
    scenarioItems,
    selectedItem,
    itemSubitems,
    subitemVisibility,
    isLoadingItems,
    isLoading: isLoadingScenarioItems,
    setSelectedItem,
    handleManageSubitems,
    setSubitemVisibility,
    linkItemMutation,
    updateVisibilityMutation,
  } = useScenarioItems(selectedScenario);

  const {
    selectedProductItems,
    setSelectedProductItems,
    toggleItemSelection,
  } = useItemSelection();

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setSelectedItem(null);
  };

  const handleOpenAddItems = () => {
    if (!selectedScenario) return;
    
    const currentItems = scenarioItems?.map(item => item.item_id) || [];
    setSelectedProductItems(currentItems);
    setItemSelectionOpen(true);
  };

  const handleSaveSelectedItems = () => {
    if (!selectedScenario) return;
    
    const promises = selectedProductItems.map(itemId => {
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
      });
  };

  const handleSaveSubitemVisibility = () => {
    if (!selectedItem || !selectedScenario) return;
    
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
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <ScenarioList
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        isLoading={isLoadingScenarios}
        isCreating={isLoadingScenario}
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
          onItemSelect={setSelectedItem}
          onManageItems={handleOpenAddItems}
          onManageSubitems={handleManageSubitems}
          onSelectSubitem={setSelectedSubitem}
        />
      )}
      
      <ItemSelectionDialog
        open={itemSelectionOpen}
        onOpenChange={setItemSelectionOpen}
        onSave={handleSaveSelectedItems}
        isLoading={isLoadingScenarioItems}
        selectedItems={selectedProductItems}
        onItemToggle={toggleItemSelection}
      />
      
      <SubitemVisibilityDialog
        open={visibilityDialogOpen}
        onOpenChange={setVisibilityDialogOpen}
        onSave={handleSaveSubitemVisibility}
        isLoading={isLoadingScenarioItems}
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
          onUpdate={() => {}}
        />
      )}
    </div>
  );
};

export default ScenariosPage;
