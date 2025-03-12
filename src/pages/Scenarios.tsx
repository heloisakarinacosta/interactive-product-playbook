
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Carousel from '@/components/ui/carousel';
import ProductCard from '@/components/ui/ProductCard';
import ItemCard, { Subitem } from '@/components/ui/ItemCard';
import DetailModal from '@/components/ui/DetailModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  fetchScenarios,
  createScenario,
  updateScenario,
  fetchScenarioItems,
  linkItemToScenario,
  unlinkItemFromScenario,
  updateSubitemVisibility,
  getSubitemVisibility,
  fetchProducts,
  fetchItems,
  fetchSubitems,
} from '@/services/api';

type ProductItem = {
  id: string;
  title: string;
  productId?: string;
  product_id?: string;
};

const ScenariosPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedSubitem, setSelectedSubitem] = useState<Subitem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemSelectionOpen, setItemSelectionOpen] = useState(false);
  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [subitemVisibility, setSubitemVisibility] = useState<Record<string, boolean>>({});
  const [itemSubitems, setItemSubitems] = useState<Record<string, Subitem[]>>({});
  const [isLoading, setIsLoading] = useState(false);

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
      formattedDescription: '<p>Descrição do novo cenário</p>'
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
        formattedDescription: description 
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
                disabled={isLoading || createScenarioMutation.isPending}
              >
                <Plus size={16} className="mr-1" />
                {isLoading || createScenarioMutation.isPending ? 'Adicionando...' : 'Adicionar'}
              </Button>
            )}
          </div>

          {isLoadingScenarios ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Carregando cenários...</p>
            </div>
          ) : scenarios.length > 0 ? (
            <Carousel itemsPerView={4} spacing={16}>
              {scenarios.map((scenario) => (
                <ProductCard
                  key={scenario.id}
                  id={scenario.id}
                  title={scenario.title}
                  description={scenario.formatted_description || scenario.description}
                  selected={selectedScenario === scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  onUpdate={(id, title, description) => handleUpdateScenario(id, title, description)}
                  isScenario={true}
                />
              ))}
            </Carousel>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum cenário cadastrado.
              </p>
              {user?.isAdmin && (
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={handleAddScenario}
                  disabled={isLoading || createScenarioMutation.isPending}
                >
                  <Plus size={16} className="mr-1" />
                  {isLoading || createScenarioMutation.isPending ? 'Adicionando...' : 'Adicionar Cenário'}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Scenario Items section */}
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
                  disabled={isLoading}
                >
                  <Plus size={16} />
                  Gerenciar Itens
                </Button>
              )}
            </div>
            
            {isLoadingItems ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Carregando itens do cenário...</p>
              </div>
            ) : scenarioItems && scenarioItems.length > 0 ? (
              <Carousel itemsPerView={3} spacing={16}>
                {scenarioItems.map((item) => (
                  <ItemCard
                    key={item.item_id}
                    id={item.item_id}
                    title={item.title || item.item_id}
                    subitems={itemSubitems[item.item_id] || []}
                    selected={selectedItem === item.item_id}
                    onClick={() => handleItemSelect(item.item_id)}
                    onAddSubitem={() => handleManageSubitems(item.item_id)}
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
                    disabled={isLoading}
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
              {allProducts.map((product) => (
                <div key={product.id}>
                  <h3 className="text-md font-semibold mb-2">{product.title}</h3>
                  {product.items && product.items.length > 0 ? (
                    product.items.map((item: ProductItem) => (
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
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic p-2">
                      Nenhum item disponível neste produto
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemSelectionOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveSelectedItems}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
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
            {selectedItem && itemSubitems[selectedItem] && itemSubitems[selectedItem].length > 0 ? (
              <div className="space-y-4">
                {itemSubitems[selectedItem].map((subitem) => (
                  <div key={subitem.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <Checkbox 
                      id={`visibility-${subitem.id}`} 
                      checked={subitemVisibility[subitem.id] ?? !subitem.hidden}
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
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveSubitemVisibility}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
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
