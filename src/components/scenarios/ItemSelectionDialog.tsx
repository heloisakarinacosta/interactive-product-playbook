
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchItems } from '@/services/api';
import { Item, Product } from '@/types/api.types';

interface ItemSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  isLoading: boolean;
  selectedItems: string[];
  onItemToggle: (itemId: string) => void;
}

export function ItemSelectionDialog({
  open,
  onOpenChange,
  onSave,
  isLoading,
  selectedItems,
  onItemToggle,
}: ItemSelectionDialogProps) {
  const [productItems, setProductItems] = useState<Record<string, Item[]>>({});
  
  // Fetch all products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Fetch items for all products
  useEffect(() => {
    const loadAllItems = async () => {
      const itemsByProduct: Record<string, Item[]> = {};
      
      for (const product of products) {
        try {
          const items = await fetchItems(product.id);
          itemsByProduct[product.id] = items;
        } catch (error) {
          console.error(`Error fetching items for product ${product.id}:`, error);
          itemsByProduct[product.id] = [];
        }
      }
      
      setProductItems(itemsByProduct);
    };
    
    if (products.length > 0) {
      loadAllItems();
    }
  }, [products]);

  if (isLoadingProducts) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Selecionar Itens para o Cenário</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="mt-6 max-h-[60vh]">
          {products.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              Nenhum produto disponível para seleção.
            </div>
          ) : (
            <div className="space-y-6">
              {products.map((product) => (
                <div key={product.id} className="space-y-2">
                  <h3 className="font-medium">{product.title}</h3>
                  
                  {productItems[product.id]?.length ? (
                    <div className="grid grid-cols-1 gap-2">
                      {productItems[product.id].map((item) => (
                        <div key={item.id} className="flex items-center space-x-2 rounded-md border p-2">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => onItemToggle(item.id)}
                          />
                          <label
                            htmlFor={`item-${item.id}`}
                            className="flex-1 text-sm font-medium cursor-pointer"
                          >
                            {item.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum item encontrado para este produto.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? (
              "Salvando..."
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
