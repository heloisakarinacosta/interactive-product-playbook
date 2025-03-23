
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import Carousel from '@/components/ui/carousel';
import ProductCard from '@/components/ui/ProductCard';
import ItemCard, { Subitem } from '@/components/ui/ItemCard';
import DetailModal from '@/components/ui/DetailModal';
import { Button } from '@/components/ui/button';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct,
  fetchItems,
  createItem,
  updateItem,
  fetchSubitems,
  createSubitem,
  updateSubitem
} from '@/services/api';

// Define a proper type for items
type Item = {
  id: string;
  title: string;
  subitems: Subitem[];
};

const ProductsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedSubitem, setSelectedSubitem] = useState<Subitem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch products
  const { 
    data: products = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  
  // Fetch items for selected product
  const { 
    data: items = [], 
    isLoading: isLoadingItems 
  } = useQuery({
    queryKey: ['items', selectedProduct],
    queryFn: () => fetchItems(selectedProduct || ''),
    enabled: !!selectedProduct,
  });
  
  // Fetch subitems for selected item
  const { 
    data: subitems = [], 
    isLoading: isLoadingSubitems 
  } = useQuery({
    queryKey: ['subitems', selectedItem],
    queryFn: () => fetchSubitems(selectedItem || ''),
    enabled: !!selectedItem,
  });
  
  // Mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Novo produto adicionado');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Erro ao adicionar produto');
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; description: string } }) => 
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
    },
  });
  
  const createItemMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { title: string } }) => 
      createItem(productId, data),
    onSuccess: () => {
      if (selectedProduct) {
        queryClient.invalidateQueries({ queryKey: ['items', selectedProduct] });
      }
      toast.success('Novo item adicionado');
    },
    onError: (error) => {
      console.error('Error creating item:', error);
      toast.error('Erro ao adicionar item');
    },
  });
  
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string } }) => 
      updateItem(id, data),
    onSuccess: () => {
      if (selectedProduct) {
        queryClient.invalidateQueries({ queryKey: ['items', selectedProduct] });
      }
      toast.success('Item atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
    },
  });
  
  const createSubitemMutation = useMutation({
    mutationFn: ({ itemId, data }: { 
      itemId: string; 
      data: { 
        title: string; 
        subtitle?: string;
        description: string;
        lastUpdatedBy?: string;
      } 
    }) => createSubitem(itemId, data),
    onSuccess: () => {
      if (selectedItem) {
        queryClient.invalidateQueries({ queryKey: ['subitems', selectedItem] });
      }
      toast.success('Novo subitem adicionado');
    },
    onError: (error) => {
      console.error('Error creating subitem:', error);
      toast.error('Erro ao adicionar subitem');
    },
  });
  
  const updateSubitemMutation = useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { 
        title: string; 
        subtitle?: string;
        description: string;
        lastUpdatedBy?: string;
      } 
    }) => updateSubitem(id, data),
    onSuccess: () => {
      if (selectedItem) {
        queryClient.invalidateQueries({ queryKey: ['subitems', selectedItem] });
      }
      toast.success('Subitem atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating subitem:', error);
      toast.error('Erro ao atualizar subitem');
    },
  });
  
  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setSelectedItem(null);
  };
  
  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
  };
  
  // Handle adding a new product
  const handleAddProduct = () => {
    createProductMutation.mutate({
      title: 'Novo Produto',
      description: 'Descrição do novo produto',
    });
  };
  
  // Handle updating a product
  const handleUpdateProduct = (id: string, title: string, description: string) => {
    updateProductMutation.mutate({
      id,
      data: { title, description },
    });
  };
  
  // Handle adding a new item
  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    createItemMutation.mutate({
      productId: selectedProduct,
      data: { title: 'Novo Item' },
    });
  };
  
  // Handle updating an item
  const handleUpdateItem = (id: string, title: string) => {
    updateItemMutation.mutate({
      id,
      data: { title },
    });
  };
  
  // Handle adding a new subitem
  const handleAddSubitem = (itemId: string) => {
    const newSubitem = {
      title: 'Novo Subitem',
      description: 'Descrição do novo subitem',
      lastUpdatedBy: user?.email || 'system',
    };
    
    createSubitemMutation.mutate({
      itemId,
      data: newSubitem,
    });
    
    // We'll open the modal for editing when the query is refetched
  };
  
  // Handle selecting a subitem
  const handleSelectSubitem = (subitem: Subitem) => {
    setSelectedSubitem(subitem);
    setIsModalOpen(true);
  };
  
  // Handle updating a subitem
  const handleUpdateSubitem = (updatedSubitem: Subitem) => {
    updateSubitemMutation.mutate({
      id: updatedSubitem.id,
      data: {
        title: updatedSubitem.title,
        subtitle: updatedSubitem.subtitle,
        description: updatedSubitem.description,
        lastUpdatedBy: updatedSubitem.lastUpdatedBy,
      },
    });
  };
  
  // When subitems are loaded, update the items with their subitems
  useEffect(() => {
    if (selectedItem && subitems.length > 0) {
      const itemWithSubitems = items.find(item => item.id === selectedItem);
      if (itemWithSubitems) {
        // When a new subitem is created, select it
        const newSubitem = subitems.find(s => !s.lastUpdatedAt);
        if (newSubitem && !isModalOpen) {
          setSelectedSubitem(newSubitem);
          setIsModalOpen(true);
        }
      }
    }
  }, [selectedItem, subitems, items, isModalOpen]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      {/* Products section */}
      <section className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Produtos</h2>
            
            {user?.isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddProduct}
                className="flex items-center gap-1"
                disabled={createProductMutation.isPending}
              >
                <Plus size={16} />
                Adicionar
              </Button>
            )}
          </div>
          
          {isLoadingProducts ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : products.length > 0 ? (
            <Carousel itemsPerView={4} spacing={16}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description}
                  selected={selectedProduct === product.id}
                  onClick={() => handleProductSelect(product.id)}
                  onUpdate={handleUpdateProduct}
                />
              ))}
            </Carousel>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum produto cadastrado.
              </p>
              {user?.isAdmin && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleAddProduct}
                >
                  <Plus size={16} className="mr-1" />
                  Adicionar Produto
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Items section - shown only when a product is selected */}
      {selectedProduct && (
        <section className="p-4 mt-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">
                Itens de {products.find(p => p.id === selectedProduct)?.title}
              </h2>
              
              {user?.isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddItem}
                  className="flex items-center gap-1"
                  disabled={createItemMutation.isPending}
                >
                  <Plus size={16} />
                  Adicionar
                </Button>
              )}
            </div>
            
            {isLoadingItems ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Carregando itens...</p>
              </div>
            ) : items.length > 0 ? (
              <Carousel itemsPerView={3} spacing={16}>
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    subitems={subitems.filter(s => s.item_id === item.id)}
                    selected={selectedItem === item.id}
                    onClick={() => handleItemSelect(item.id)}
                    onUpdate={handleUpdateItem}
                    onAddSubitem={handleAddSubitem}
                    onSelectSubitem={handleSelectSubitem}
                  />
                ))}
              </Carousel>
            ) : (
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum item cadastrado para este produto.
                </p>
                {user?.isAdmin && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleAddItem}
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Item
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Detail modal */}
      {selectedSubitem && (
        <DetailModal
          subitem={selectedSubitem}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateSubitem}
        />
      )}
    </div>
  );
};

export default ProductsPage;
