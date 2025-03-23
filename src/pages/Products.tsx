
import React from 'react';
import DetailModal from '@/components/ui/DetailModal';
import ProductList from '@/components/products/ProductList';
import ItemList from '@/components/products/ItemList';
import { useProductsPage } from '@/hooks/useProductsPage';

const ProductsPage = () => {
  const {
    selectedProduct,
    selectedItem,
    selectedSubitem,
    isModalOpen,
    products,
    items,
    subitems,
    isLoadingProducts,
    isLoadingItems,
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
  } = useProductsPage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <ProductList
        products={products}
        selectedProduct={selectedProduct}
        isLoading={isLoadingProducts}
        onProductSelect={handleProductSelect}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
      />
      
      {selectedProduct && (
        <ItemList
          productTitle={products.find(p => p.id === selectedProduct)?.title || ''}
          items={items}
          selectedItem={selectedItem}
          subitems={subitems}
          isLoading={isLoadingItems}
          onItemSelect={handleItemSelect}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onAddSubitem={handleAddSubitem}
          onSelectSubitem={handleSelectSubitem}
        />
      )}
      
      {selectedSubitem && (
        <DetailModal
          subitem={selectedSubitem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSubitem}
        />
      )}
    </div>
  );
};

export default ProductsPage;
