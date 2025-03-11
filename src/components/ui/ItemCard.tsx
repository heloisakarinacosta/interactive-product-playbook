
import React, { useState } from 'react';
import { Pencil, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface Subitem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  hidden?: boolean;
}

export interface ItemCardProps {
  id: string;
  title: string;
  subitems: Subitem[];
  selected?: boolean;
  onClick?: () => void;
  onUpdate?: (id: string, title: string) => void;
  onAddSubitem?: (itemId: string) => void;
  onSelectSubitem?: (subitem: Subitem) => void;
  className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  subitems = [],
  selected = false,
  onClick,
  onUpdate,
  onAddSubitem,
  onSelectSubitem,
  className,
}) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedTitle(title); // Reset to current title when starting edit
    setEditing(true);
  };
  
  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!editedTitle.trim()) {
      toast.error('O título não pode ser vazio');
      return;
    }
    
    if (onUpdate) {
      try {
        setIsSaving(true);
        console.log(`Saving item ${id} with title: ${editedTitle}`);
        await onUpdate(id, editedTitle);
        toast.success('Item atualizado com sucesso!');
        setEditing(false);
      } catch (error) {
        console.error('Error saving item:', error);
        toast.error('Erro ao atualizar item. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave(e as unknown as React.MouseEvent);
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditedTitle(title); // Reset to original
    }
  };
  
  const handleAddSubitem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddSubitem) {
      onAddSubitem(id);
    }
  };
  
  const handleSubitemClick = (e: React.MouseEvent, subitem: Subitem) => {
    e.stopPropagation();
    if (onSelectSubitem) {
      onSelectSubitem(subitem);
    }
  };
  
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 h-full flex flex-col relative group",
        selected 
          ? "ring-2 ring-primary shadow-lg" 
          : "hover:translate-y-[-2px] hover:shadow-lg",
        "transition-all duration-300 ease-out",
        className
      )}
      onClick={!editing ? onClick : undefined}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
          <Check size={14} />
        </div>
      )}
      
      {/* Card header */}
      <div className="mb-3">
        {editing ? (
          <div onClick={(e) => e.stopPropagation()} className="mb-3">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Título"
              autoFocus
            />
          </div>
        ) : (
          <h3 className="font-medium">{title}</h3>
        )}
      </div>
      
      {/* Card content - subitems */}
      <div className="flex-1 overflow-y-auto max-h-[150px] space-y-2">
        {subitems.filter(item => !item.hidden).map((subitem) => (
          <div
            key={subitem.id}
            onClick={(e) => handleSubitemClick(e, subitem)}
            className="p-2 rounded-md bg-white/50 text-sm hover:bg-primary/5 cursor-pointer transition-colors border border-border/50"
          >
            <div className="font-medium line-clamp-1">{subitem.title}</div>
            {subitem.subtitle && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {subitem.subtitle}
              </div>
            )}
          </div>
        ))}
        
        {subitems.length === 0 && (
          <div className="text-sm text-muted-foreground italic text-center py-4">
            Nenhum subitem cadastrado
          </div>
        )}
      </div>
      
      {/* Admin actions */}
      <div className="mt-3 pt-3 border-t border-border flex justify-between">
        {user?.isAdmin && (
          <>
            {editing ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check size={14} className="mr-1" /> 
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Pencil size={14} className="mr-1" /> Editar
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleAddSubitem}>
              <Plus size={14} className="mr-1" /> Adicionar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
