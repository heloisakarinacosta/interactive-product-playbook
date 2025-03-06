
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Carousel from '@/components/ui/Carousel';
import ProductCard from '@/components/ui/ProductCard';
import ItemCard, { Subitem } from '@/components/ui/ItemCard';
import DetailModal from '@/components/ui/DetailModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Mock data - in a real app, this would come from an API
const initialScenarios = [
  { id: 's1', title: 'Cenário 1', description: 'Descrição do cenário 1' },
  { id: 's2', title: 'Cenário 2', description: 'Descrição do cenário 2' },
  { id: 's3', title: 'Cenário 3', description: 'Descrição do cenário 3' },
];

// Reusing the same product items for scenarios
const initialItems = {
  s1: [
    { id: 'i1', title: 'Item 1 do Produto 1', subitems: [] },
    { id: 'i4', title: 'Item 1 do Produto 2', subitems: [] },
  ],
  s2: [
    { id: 'i2', title: 'Item 2 do Produto 1', subitems: [] },
  ],
};

// All available product items for selection
const allProductItems = [
  { id: 'i1', title: 'Item 1 do Produto 1', productId: 'p1' },
  { id: 'i2', title: 'Item 2 do Produto 1', productId: 'p1' },
  { id: 'i3', title: 'Item 3 do Produto 1', productId: 'p1' },
  { id: 'i4', title: 'Item 1 do Produto 2', productId: 'p2' },
  { id: 'i5', title: 'Item 2 do Produto 2', productId: 'p2' },
];

// Reuse the same subitems but with visibility settings for scenarios
const initialSubitems = {
  i1: [
    { 
      id: 's1', 
      title: 'Subitem 1.1', 
      subtitle: 'Informações detalhadas',
      description: 'Descrição detalhada do subitem 1.1', 
      lastUpdatedBy: 'admin',
      lastUpdatedAt: '2023-06-15T10:30:00Z'
    },
    { 
      id: 's2', 
      title: 'Subitem 1.2', 
      description: 'Descrição detalhada do subitem 1.2', 
      lastUpdatedBy: 'admin',
      lastUpdatedAt: '2023-06-16T14:20:00Z',
      hidden: true, // Hidden in scenario view
    },
  ],
  i2: [
    { 
      id: 's3', 
      title: 'Subitem 2.1', 
      description: 'Descrição detalhada do subitem 2.1', 
      lastUpdatedBy: 'admin',
      lastUpdatedAt: '2023-06-17T09:45:00Z'
    },
  ],
};

const ScenariosPage = () => {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarioItems, setScenarioItems] = useState<Record<string, any[]>>(initialItems);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [subitems, setSubitems] = useState<Record<string, Subitem[]>>(initialSubitems);
  const [selectedSubitem, setSelectedSubitem] = useState<Subitem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Item selection dialog state
  const [itemSelectionOpen, setItemSelectionOpen] = useState(false);
  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
  
  // Subitem visibility dialog state
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [subitemVisibility, setSubitemVisibility] = useState<Record<string, boolean>>({});
  
  // Handle scenario selection
  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setSelectedItem(null);
  };
  
  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
  };
  
  // Handle adding a new scenario
  const handleAddScenario = () => {
    const newScenarioId = `sc${Date.now()}`;
    const newScenario = {
      id: newScenarioId,
      title: 'Novo Cenário',
      description: 'Descrição do novo cenário',
    };
    setScenarios([...scenarios, newScenario]);
    setSelectedScenario(newScenarioId);
    toast.success('Novo cenário adicionado');
  };
  
  // Handle updating a scenario
  const handleUpdateScenario = (id: string, title: string, description: string) => {
    setScenarios(scenarios.map(scenario => 
      scenario.id === id 
        ? { ...scenario, title, description } 
        : scenario
    ));
  };
  
  // Open dialog to add items to scenario
  const handleOpenAddItems = () => {
    if (!selectedScenario) return;
    
    // Set initially selected items
    const currentItems = scenarioItems[selectedScenario]?.map(item => item.id) || [];
    setSelectedProductItems(currentItems);
    setItemSelectionOpen(true);
  };
  
  // Save selected items to scenario
  const handleSaveSelectedItems = () => {
    if (!selectedScenario) return;
    
    const selectedItems = allProductItems.filter(item => 
      selectedProductItems.includes(item.id)
    );
    
    setScenarioItems({
      ...scenarioItems,
      [selectedScenario]: selectedItems,
    });
    
    setItemSelectionOpen(false);
    toast.success('Itens do cenário atualizados');
  };
  
  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedProductItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  // Open dialog to manage subitem visibility
  const handleManageSubitems = (itemId: string) => {
    if (!subitems[itemId]) return;
    
    // Initialize visibility state
    const initialVisibility: Record<string, boolean> = {};
    subitems[itemId].forEach(subitem => {
      initialVisibility[subitem.id] = !subitem.hidden;
    });
    
    setSubitemVisibility(initialVisibility);
    setSelectedItem(itemId);
    setVisibilityDialogOpen(true);
  };
  
  // Save subitem visibility settings
  const handleSaveSubitemVisibility = () => {
    if (!selectedItem) return;
    
    const updatedSubitems = subitems[selectedItem].map(subitem => ({
      ...subitem,
      hidden: !subitemVisibility[subitem.id],
    }));
    
    setSubitems({
      ...subitems,
      [selectedItem]: updatedSubitems,
    });
    
    setVisibilityDialogOpen(false);
    toast.success('Visibilidade dos subitens atualizada');
  };
  
  // Handle selecting a subitem
  const handleSelectSubitem = (subitem: Subitem) => {
    setSelectedSubitem(subitem);
    setIsModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      {/* Scenarios section */}
      <section className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Cenários</h2>
            
            {user?.isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddScenario}
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                Adicionar
              </Button>
            )}
          </div>
          
          <Carousel itemsPerView={4} spacing={16}>
            {scenarios.map((scenario) => (
              <ProductCard
                key={scenario.id}
                id={scenario.id}
                title={scenario.title}
                description={scenario.description}
                selected={selectedScenario === scenario.id}
                onClick={() => handleScenarioSelect(scenario.id)}
                onUpdate={handleUpdateScenario}
              />
            ))}
          </Carousel>
        </div>
      </section>
      
      {/* Scenario Items section - shown only when a scenario is selected */}
      {selectedScenario && (
        <section className="p-4 mt-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">
                Itens do Cenário: {scenarios.find(s => s.id === selectedScenario)?.title}
              </h2>
              
              {user?.isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenAddItems}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} />
                  Gerenciar Itens
                </Button>
              )}
            </div>
            
            {scenarioItems[selectedScenario] && scenarioItems[selectedScenario].length > 0 ? (
              <Carousel itemsPerView={3} spacing={16}>
                {scenarioItems[selectedScenario].map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    subitems={subitems[item.id] || []}
                    selected={selectedItem === item.id}
                    onClick={() => handleItemSelect(item.id)}
                    onAddSubitem={() => handleManageSubitems(item.id)}
                    onSelectSubitem={handleSelectSubitem}
                  />
                ))}
              </Carousel>
            ) : (
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum item adicionado a este cenário.
                </p>
                {user?.isAdmin && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleOpenAddItems}
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Itens
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Item Selection Dialog */}
      <Dialog open={itemSelectionOpen} onOpenChange={setItemSelectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Itens para o Cenário</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-4">
              {allProductItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                  <Checkbox 
                    id={item.id} 
                    checked={selectedProductItems.includes(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                  />
                  <label 
                    htmlFor={item.id} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {item.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Produto {item.productId.replace('p', '')})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemSelectionOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveSelectedItems}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Subitem Visibility Dialog */}
      <Dialog open={visibilityDialogOpen} onOpenChange={setVisibilityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Subitens</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 max-h-[50vh] overflow-y-auto">
            {selectedItem && subitems[selectedItem] && subitems[selectedItem].length > 0 ? (
              <div className="space-y-4">
                {subitems[selectedItem].map((subitem) => (
                  <div key={subitem.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <Checkbox 
                      id={`visibility-${subitem.id}`} 
                      checked={subitemVisibility[subitem.id] || false}
                      onCheckedChange={(checked) => 
                        setSubitemVisibility({
                          ...subitemVisibility,
                          [subitem.id]: !!checked,
                        })
                      }
                    />
                    <label 
                      htmlFor={`visibility-${subitem.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {subitem.title}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum subitem disponível para este item.
              </div>
            )}
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisibilityDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveSubitemVisibility}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Detail modal */}
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
