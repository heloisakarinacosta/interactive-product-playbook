
import { useState } from 'react';

export function useItemSelection() {
  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedProductItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return {
    selectedProductItems,
    setSelectedProductItems,
    toggleItemSelection,
  };
}
