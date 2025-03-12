
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Carousel from '@/components/ui/carousel';
import ItemCard from '@/components/ui/ItemCard';
import { ScenarioItem, Subitem } from '@/types/api.types';

interface ScenarioItemListProps {
  scenarioTitle: string;
  items: ScenarioItem[];
  selectedItem: string | null;
  itemSubitems: Record<string, Subitem[]>;
  isLoading: boolean;
  onItemSelect: (id: string) => void;
  onManageItems: () => void;
  onManageSubitems: (itemId: string) => void;
  onSelectSubitem: (subitem: Subitem) => void;
}

const ScenarioItemList: React.FC<ScenarioItemListProps> = ({
  scenarioTitle,
  items,
  selectedItem,
  itemSubitems,
  isLoading,
  onItemSelect,
  onManageItems,
  onManageSubitems,
  onSelectSubitem,
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Carregando itens do cenário...</p>
      </div>
    );
  }

  return (
    <section className="p-4 mt-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">
            Itens do Cenário: {scenarioTitle}
          </h2>
          
          {user?.isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onManageItems}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Gerenciar Itens
            </Button>
          )}
        </div>
        
        {items.length > 0 ? (
          <Carousel itemsPerView={3} spacing={16}>
            {items.map((item) => (
              <ItemCard
                key={item.item_id}
                id={item.item_id}
                title={item.title || item.item_id}
                subitems={itemSubitems[item.item_id] || []}
                selected={selectedItem === item.item_id}
                onClick={() => onItemSelect(item.item_id)}
                onAddSubitem={() => onManageSubitems(item.item_id)}
                onSelectSubitem={onSelectSubitem}
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
                onClick={onManageItems}
              >
                <Plus size={16} className="mr-1" />
                Adicionar Itens
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ScenarioItemList;
