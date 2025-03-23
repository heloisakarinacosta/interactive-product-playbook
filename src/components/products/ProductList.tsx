
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Carousel from '@/components/ui/carousel';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types/api.types';

interface ProductListProps {
  products: Product[];
  selectedProduct: string | null;
  isLoading: boolean;
  onProductSelect: (id: string) => void;
  onAddProduct: () => void;
  onUpdateProduct: (id: string, title: string, description: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  selectedProduct,
  isLoading,
  onProductSelect,
  onAddProduct,
  onUpdateProduct,
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <section className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Produtos</h2>
          
          {user?.isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddProduct}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Adicionar
            </Button>
          )}
        </div>
        
        {products.length > 0 ? (
          <Carousel itemsPerView={4} spacing={16}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                selected={selectedProduct === product.id}
                onClick={() => onProductSelect(product.id)}
                onUpdate={onUpdateProduct}
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
                onClick={onAddProduct}
              >
                <Plus size={16} className="mr-1" />
                Adicionar Produto
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
