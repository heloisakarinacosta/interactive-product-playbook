
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Product, ProductCreateInput, Item, ItemCreateInput, Subitem, SubitemCreateInput } from '@/types/api.types';

export const useProductsPage = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedSubitem, setSelectedSubitem] = useState<Subitem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Queries
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['items', selectedProduct],
    queryFn: () => fetchItems(selectedProduct || ''),
    enabled: !!selectedProduct,
  });
  
  const { data: subitems = [], isLoading: isLoadingSubitems } = useQuery({
    queryKey: ['subitems', selectedItem],
    queryFn: () => fetchSubitems(selectedItem || ''),
    enabled: !!selectedItem,
  });
  
  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (productData: ProductCreateInput) => createProduct(productData),
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
    mutationFn: ({ id, data }: { id: string; data: ProductCreateInput }) =>
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
    mutationFn: ({ productId, data }: { productId: string; data: ItemCreateInput }) =>
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
    mutationFn: ({ id, data }: { id: string; data: ItemCreateInput }) =>
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
      data: SubitemCreateInput;
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
    mutationFn: ({ itemId, id, data }: {
      itemId: string;
      id: string;
      data: {
        title: string;
        subtitle?: string;
        description: string;
        last_updated_by?: string;
      };
    }) => updateSubitem(itemId, id, data),
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
  
  // Event handlers
  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setSelectedItem(null);
  };
  
  const handleAddProduct = () => {
    createProductMutation.mutate({
      title: 'Novo Produto',
      description: 'Descrição do novo produto',
    });
  };
  
  const handleUpdateProduct = (id: string, title: string, description: string) => {
    updateProductMutation.mutate({
      id,
      data: { title, description },
    });
  };
  
  const handleAddItem = () => {
    if (!selectedProduct) return;

    createItemMutation.mutate({
      productId: selectedProduct,
      data: { 
        title: 'Novo Item',
        product_id: selectedProduct
      },
    });
  };
  
  const handleUpdateItem = (id: string, title: string) => {
    updateItemMutation.mutate({
      id,
      data: { 
        title,
        product_id: selectedProduct || ''
      },
    });
  };
  
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
  };
  
  const handleAddSubitem = (itemId: string) => {
    createSubitemMutation.mutate({
      itemId,
      data: {
        title: 'Novo Subitem',
        description: 'Descrição do novo subitem',
      },
    });
  };
  
  const handleSelectSubitem = (subitem: Subitem) => {
    setSelectedSubitem(subitem);
    setIsModalOpen(true);
  };
  
  const handleUpdateSubitem = (updatedSubitem: Subitem) => {
    if (!selectedItem) return;
    
    updateSubitemMutation.mutate({
      itemId: selectedItem,
      id: updatedSubitem.id,
      data: {
        title: updatedSubitem.title,
        subtitle: updatedSubitem.subtitle,
        description: updatedSubitem.description,
        last_updated_by: updatedSubitem.last_updated_by,
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return {
    // State
    selectedProduct,
    selectedItem,
    selectedSubitem,
    isModalOpen,
    
    // Data
    products,
    items,
    subitems,
    
    // Loading states
    isLoadingProducts,
    isLoadingItems,
    isLoadingSubitems,
    
    // Handlers
    handleProductSelect,
    handleAddProduct,
    handleUpdateProduct,
    handleItemSelect,
    handleAddItem,
    handleUpdateItem,
    handleAddSubitem,
    handleSelectSubitem,
    handleUpdateSubitem,
    handleCloseModal,
  };
};
