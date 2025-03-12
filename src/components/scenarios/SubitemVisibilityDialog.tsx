
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Subitem } from '@/types/api.types';

interface SubitemVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  isLoading: boolean;
  selectedItem: string | null;
  itemSubitems: Record<string, Subitem[]>;
  visibility: Record<string, boolean>;
  onVisibilityChange: (subitemId: string, isVisible: boolean) => void;
}

export function SubitemVisibilityDialog({
  open,
  onOpenChange,
  onSave,
  isLoading,
  selectedItem,
  itemSubitems,
  visibility,
  onVisibilityChange,
}: SubitemVisibilityDialogProps) {
  const subitems = selectedItem ? itemSubitems[selectedItem] || [] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Visibilidade dos Subitens</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="mt-6 max-h-[60vh]">
          {subitems.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              Nenhum subitem disponível para este item.
            </div>
          ) : (
            <div className="space-y-4">
              {subitems.map((subitem) => (
                <div
                  key={subitem.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{subitem.title}</h4>
                    {subitem.subtitle && (
                      <p className="text-sm text-muted-foreground">{subitem.subtitle}</p>
                    )}
                  </div>
                  
                  <Switch
                    checked={visibility[subitem.id] !== false}
                    onCheckedChange={(isChecked) => onVisibilityChange(subitem.id, isChecked)}
                  />
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
