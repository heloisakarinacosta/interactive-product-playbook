
import React, { useState, useEffect } from 'react';
import { X, Pencil, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Subitem } from './ItemCard';
import { toast } from 'sonner';

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
  
  // Reset form when subitem changes
  useEffect(() => {
    setEditedTitle(subitem.title);
    setEditedSubtitle(subitem.subtitle || '');
    setEditedDescription(subitem.description);
    setEditing(false);
  }, [subitem]);
  
  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...subitem,
        title: editedTitle,
        subtitle: editedSubtitle,
        description: editedDescription,
        lastUpdatedBy: user?.email || 'system',
        lastUpdatedAt: new Date().toISOString(),
      });
      toast.success('Conteúdo atualizado com sucesso!');
    }
    setEditing(false);
  };
  
  // Handle escape key to close modal
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
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center mb-4">
          <div>
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
        
        {/* Modal content */}
        <div className="mt-4">
          {editing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full h-60 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Descrição"
            />
          ) : (
            <div className="prose max-w-none">
              {subitem.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
        
        {/* Modal footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
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
