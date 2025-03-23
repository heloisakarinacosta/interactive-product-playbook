
import React, { useState, useEffect } from 'react';
import { X, Pencil, Save, Bold, Italic, Link, Image, List } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Subitem } from './ItemCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRichEditor } from '@/hooks/useRichEditor';

interface DetailModalProps {
  subitem: Subitem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedSubitem: Subitem) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  subitem,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(subitem.title);
  const [editedSubtitle, setEditedSubtitle] = useState(subitem.subtitle || '');
  const [editedDescription, setEditedDescription] = useState(subitem.description);
  
  const {
    editorRef,
    formatText,
    insertImage,
    insertLink,
    handlePaste,
    handleKeyDown
  } = useRichEditor({
    initialContent: subitem.description,
    onChange: (content) => setEditedDescription(content)
  });
  
  useEffect(() => {
    setEditedTitle(subitem.title);
    setEditedSubtitle(subitem.subtitle || '');
    setEditedDescription(subitem.description);
    setEditing(false);
  }, [subitem]);
  
  const handleSave = () => {
    if (onUpdate && editorRef.current) {
      onUpdate({
        ...subitem,
        title: editedTitle,
        subtitle: editedSubtitle,
        description: editorRef.current.innerHTML,
        lastUpdatedBy: user?.email || 'system',
        lastUpdatedAt: new Date().toISOString(),
      });
      toast.success('Conteúdo atualizado com sucesso!');
    }
    setEditing(false);
  };
  
  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.innerHTML = editedDescription;
      editorRef.current.focus();
    }
  }, [editing, editedDescription, editorRef]);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <div className="w-full">
            {editing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-xl font-medium w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Título"
              />
            ) : (
              <h2 className="text-xl font-medium">{subitem.title}</h2>
            )}
            
            {editing ? (
              <input
                type="text"
                value={editedSubtitle}
                onChange={(e) => setEditedSubtitle(e.target.value)}
                className="text-sm text-muted-foreground mt-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Subtítulo (opcional)"
              />
            ) : (
              subitem.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subitem.subtitle}</p>
              )
            )}
          </div>
          
          <div className="flex gap-2">
            {user?.isAdmin && !editing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil size={14} className="mr-1" /> Editar
              </Button>
            )}
            
            {editing && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSave}
              >
                <Save size={14} className="mr-1" /> Salvar
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>
        </div>
        
        {editing && (
          <div className="flex items-center gap-1 p-2 bg-muted/30 border-b">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => formatText('bold')}
              title="Negrito"
            >
              <Bold size={16} />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => formatText('italic')}
              title="Itálico"
            >
              <Italic size={16} />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={insertLink}
              title="Inserir Link"
            >
              <Link size={16} />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={insertImage}
              title="Inserir Imagem"
            >
              <Image size={16} />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => formatText('insertUnorderedList')}
              title="Lista com Marcadores"
            >
              <List size={16} />
            </Button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4">
          {editing ? (
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary overflow-auto"
              onPaste={(e: React.ClipboardEvent<HTMLDivElement>) => handlePaste(e.nativeEvent)}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(e.nativeEvent)}
            />
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: subitem.description }}
            />
          )}
        </div>
        
        <div className="p-4 border-t flex justify-between text-xs text-muted-foreground">
          <div>
            Última atualização: {subitem.lastUpdatedBy || 'Sistema'} 
            {subitem.lastUpdatedAt && ` - ${new Date(subitem.lastUpdatedAt).toLocaleString()}`}
          </div>
          <div>
            Arquivo: {`${subitem.id}.txt`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
