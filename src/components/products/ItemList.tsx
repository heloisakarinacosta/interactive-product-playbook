
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Carousel from '@/components/ui/carousel';
import ItemCard from '@/components/ui/ItemCard';
import { Item, Subitem } from '@/types/api.types';

interface ItemListProps {
  productTitle: string;
  items: Item[];
  selectedItem: string | null;
  subitems: Subitem[];
  isLoading: boolean;
  onItemSelect: (id: string) => void;
  onAddItem: () => void;
  onUpdateItem: (id: string, title: string) => void;
  onAddSubitem: (itemId: string) => void;
  onSelectSubitem: (subitem: Subitem) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  productTitle,
  items,
  selectedItem,
  subitems,
  isLoading,
  onItemSelect,
  onAddItem,
  onUpdateItem,
  onAddSubitem,
  onSelectSubitem,
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Carregando itens...</p>
      </div>
    );
  }

  return (
    <section className="p-4 mt-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">
            Itens de {productTitle}
          </h2>
          
          {user?.isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddItem}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Adicionar
            </Button>
          )}
        </div>
        
        {items.length > 0 ? (
          <Carousel itemsPerView={3} spacing={16}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                subitems={subitems.filter(s => s.item_id === item.id)}
                selected={selectedItem === item.id}
                onClick={() => onItemSelect(item.id)}
                onUpdate={onUpdateItem}
                onAddSubitem={onAddSubitem}
                onSelectSubitem={onSelectSubitem}
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
                onClick={onAddItem}
              >
                <Plus size={16} className="mr-1" />
                Adicionar Item
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ItemList;
