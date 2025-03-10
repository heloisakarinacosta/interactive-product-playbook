import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Carousel from '@/components/ui/carousel';
import ProductCard from '@/components/ui/ProductCard';
import ItemCard, { Subitem } from '@/components/ui/ItemCard';
import DetailModal from '@/components/ui/DetailModal';
import { Button } from '@/components/ui/button';

// Mock data - in a real app, this would come from an API
const initialProducts = [
  { id: 'p1', title: 'Produto 1', description: 'Descrição do produto 1' },
  { id: 'p2', title: 'Produto 2', description: 'Descrição do produto 2' },
  { id: 'p3', title: 'Produto 3', description: 'Descrição do produto 3' },
  { id: 'p4', title: 'Produto 4', description: 'Descrição do produto 4' },
  { id: 'p5', title: 'Produto 5', description: 'Descrição do produto 5' },
];

const initialItems = {
  p1: [
    { id: 'i1', title: 'Item 1 do Produto 1', subitems: [] },
    { id: 'i2', title: 'Item 2 do Produto 1', subitems: [] },
    { id: 'i3', title: 'Item 3 do Produto 1', subitems: [] },
  ],
  p2: [
    { id: 'i4', title: 'Item 1 do Produto 2', subitems: [] },
    { id: 'i5', title: 'Item 2 do Produto 2', subitems: [] },
  ],
};

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
      lastUpdatedAt: '2023-06-16T14:20:00Z'
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

// Define a proper type for items
type Item = {
  id: string;
  title: string;
  subitems: Subitem[];
};

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Item[]>>(initialItems as Record<string, Item[]>);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [subitems, setSubitems] = useState<Record<string, Subitem[]>>(initialSubitems);
  const [selectedSubitem, setSelectedSubitem] = useState<Subitem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
    const newProductId = `p${Date.now()}`;
    const newProduct = {
      id: newProductId,
      title: 'Novo Produto',
      description: 'Descrição do novo produto',
    };
    setProducts([...products, newProduct]);
    setSelectedProduct(newProductId);
    toast.success('Novo produto adicionado');
  };
  
  // Handle updating a product
  const handleUpdateProduct = (id: string, title: string, description: string) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, title, description } 
        : product
    ));
  };
  
  // Handle adding a new item
  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    const newItemId = `i${Date.now()}`;
    const newItem = {
      id: newItemId,
      title: 'Novo Item',
      subitems: [],
    };
    
    setItems({
      ...items,
      [selectedProduct]: [...(items[selectedProduct] || []), newItem],
    });
    setSelectedItem(newItemId);
    toast.success('Novo item adicionado');
  };
  
  // Handle updating an item
  const handleUpdateItem = (id: string, title: string) => {
    if (!selectedProduct) return;
    
    setItems({
      ...items,
      [selectedProduct]: items[selectedProduct].map(item => 
        item.id === id 
          ? { ...item, title } 
          : item
      ),
    });
  };
  
  // Handle adding a new subitem
  const handleAddSubitem = (itemId: string) => {
    const newSubitemId = `s${Date.now()}`;
    const newSubitem: Subitem = {
      id: newSubitemId,
      title: 'Novo Subitem',
      description: 'Descrição do novo subitem',
      lastUpdatedBy: user?.email || 'system',
      lastUpdatedAt: new Date().toISOString(),
    };
    
    setSubitems({
      ...subitems,
      [itemId]: [...(subitems[itemId] || []), newSubitem],
    });
    
    // Immediately open the modal for editing
    setSelectedSubitem(newSubitem);
    setIsModalOpen(true);
    toast.success('Novo subitem adicionado');
  };
  
  // Handle selecting a subitem
  const handleSelectSubitem = (subitem: Subitem) => {
    setSelectedSubitem(subitem);
    setIsModalOpen(true);
  };
  
  // Handle updating a subitem
  const handleUpdateSubitem = (updatedSubitem: Subitem) => {
    if (!selectedItem) return;
    
    setSubitems({
      ...subitems,
      [selectedItem]: (subitems[selectedItem] || []).map(item => 
        item.id === updatedSubitem.id 
          ? updatedSubitem
          : item
      ),
    });
  };
  
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
              >
                <Plus size={16} />
                Adicionar
              </Button>
            )}
          </div>
          
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
                >
                  <Plus size={16} />
                  Adicionar
                </Button>
              )}
            </div>
            
            {items[selectedProduct] && items[selectedProduct].length > 0 ? (
              <Carousel itemsPerView={3} spacing={16}>
                {items[selectedProduct].map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    subitems={subitems[item.id] || []}
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
