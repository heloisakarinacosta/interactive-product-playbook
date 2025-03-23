import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useRichEditor } from '@/hooks/useRichEditor';
import { toast } from 'sonner';

export interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  onUpdate?: (id: string, title: string, description: string) => void;
  className?: string;
  isScenario?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  description = '',
  selected = false,
  onClick,
  onUpdate,
  className,
  isScenario = false,
}) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  
  const {
    editorRef,
    formatText,
    insertImage,
    insertLink,
    handlePaste,
    handleKeyDown
  } = useRichEditor({
    initialContent: description,
    onChange: (content) => setEditedDescription(content)
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };
  
  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editedTitle.trim()) {
      toast.error('O título não pode estar vazio');
      return;
    }

    if (onUpdate) {
      try {
        await onUpdate(
          id,
          editedTitle,
          isScenario ? editorRef.current?.innerHTML || '' : editedDescription
        );
        setEditing(false);
        toast.success('Informações salvas com sucesso!');
      } catch (error) {
        console.error('Error saving:', error);
        toast.error('Erro ao salvar. Tente novamente.');
      }
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
      
      {/* Card content */}
      <div className="flex-1">
        {editing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Título"
            />
            {isScenario ? (
              <div
                ref={editorRef}
                contentEditable
                className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary overflow-y-auto"
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full h-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Descrição"
              />
            )}
            {isScenario && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => formatText('bold')}>
                  B
                </Button>
                <Button size="sm" variant="outline" onClick={() => formatText('italic')}>
                  I
                </Button>
                <Button size="sm" variant="outline" onClick={insertLink}>
                  Link
                </Button>
                <Button size="sm" variant="outline" onClick={insertImage}>
                  Imagem
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <h3 className="font-medium text-base mb-2 line-clamp-1">{title}</h3>
            {isScenario ? (
              <div 
                className="text-sm text-muted-foreground line-clamp-4"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              description && (
                <p className="text-sm text-muted-foreground line-clamp-4">{description}</p>
              )
            )}
          </>
        )}
      </div>
      
      {/* Admin actions */}
      {user?.isAdmin && (
        <div className="mt-3 pt-3 border-t border-border flex justify-end">
          {editing ? (
            <Button variant="default" size="sm" onClick={handleSave}>
              <Check size={14} className="mr-1" /> Salvar
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Pencil size={14} className="mr-1" /> Editar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
