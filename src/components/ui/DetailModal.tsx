import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, Save, Bold, Italic, Link, Image, List } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Subitem } from './ItemCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Reset form when subitem changes
  useEffect(() => {
    setEditedTitle(subitem.title);
    setEditedSubtitle(subitem.subtitle || '');
    setEditedDescription(subitem.description);
    setEditing(false);
  }, [subitem]);
  
  useEffect(() => {
    if (editing && editorRef.current) {
      // Set initial content of the editor when entering edit mode
      editorRef.current.innerHTML = editedDescription;
      editorRef.current.focus();
    }
  }, [editing, editedDescription]);

  // Handle the enter key in the editor - FIXED
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editing || !editorRef.current) return;
      
      if (e.key === 'Enter') {
        // Prevent default behavior to stop cursor from going to start of line
        e.preventDefault();
        
        // Insert HTML break at cursor position
        document.execCommand('insertHTML', false, '<br>');
        
        // Update edited description with new content
        if (editorRef.current) {
          setEditedDescription(editorRef.current.innerHTML);
        }
        
        return false;
      }
    };
    
    // Add event listener for keydown
    if (editing && editorRef.current) {
      editorRef.current.addEventListener('keydown', handleKeyDown);
      
      return () => {
        editorRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editing]);

  // Add paste event listener for handling image paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!editing || !editorRef.current) return;
      
      // Check if the paste event contains image data
      const items = e.clipboardData?.items;
      if (!items) return;
      
      let imageFile = null;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          imageFile = items[i].getAsFile();
          break;
        }
      }
      
      if (imageFile) {
        e.preventDefault(); // Prevent default paste behavior
        
        // Create a FileReader to read the image as a data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && editorRef.current) {
            // Create an image element with the data URL
            const img = document.createElement('img');
            img.src = event.target.result as string;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.className = 'my-2 rounded-md';
            
            // Insert the image at the current cursor position
            document.execCommand('insertHTML', false, img.outerHTML);
            
            // Save the current content to the editedDescription state after inserting
            setEditedDescription(editorRef.current.innerHTML);
            
            toast.success('Imagem inserida com sucesso!');
          }
        };
        reader.readAsDataURL(imageFile);
      }
    };
    
    // Add the paste event listener to the editor when in edit mode
    if (editing && editorRef.current) {
      editorRef.current.addEventListener('paste', handlePaste);
      
      // Add input event listener to capture all changes to the editor content
      const handleInput = () => {
        if (editorRef.current) {
          setEditedDescription(editorRef.current.innerHTML);
        }
      };
      
      editorRef.current.addEventListener('input', handleInput);
      
      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener('paste', handlePaste);
          editorRef.current.removeEventListener('input', handleInput);
        }
      };
    }
    
    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('paste', handlePaste);
      }
    };
  }, [editing]);
  
  const handleSave = () => {
    if (onUpdate) {
      // Always get the latest HTML content directly from the editor
      const description = editorRef.current ? editorRef.current.innerHTML : editedDescription;
      
      // Log the description to see what's being saved
      console.log("Saving description:", description);
      
      onUpdate({
        ...subitem,
        title: editedTitle,
        subtitle: editedSubtitle,
        description: description,
        lastUpdatedBy: user?.email || 'system',
        lastUpdatedAt: new Date().toISOString(),
      });
      toast.success('Conteúdo atualizado com sucesso!');
    }
    setEditing(false);
  };
  
  // Handle formatting commands
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      // Update editedDescription after formatting
      setEditedDescription(editorRef.current.innerHTML);
    }
  };
  
  // Insert image
  const insertImage = () => {
    const url = prompt('Insira o URL da imagem:');
    if (url) {
      formatText('insertImage', url);
    }
  };
  
  // Insert link
  const insertLink = () => {
    const url = prompt('Insira o URL do link:');
    const text = window.getSelection()?.toString() || 'Link';
    
    if (url) {
      if (window.getSelection()?.toString()) {
        formatText('createLink', url);
      } else {
        const linkHtml = `<a href="${url}" target="_blank">${text}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
        
        // Update editedDescription after inserting link
        if (editorRef.current) {
          setEditedDescription(editorRef.current.innerHTML);
        }
      }
    }
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
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
        
        {/* Formatting toolbar - only visible when editing */}
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
            <div className="text-xs text-muted-foreground ml-auto pr-2">
              Dica: Cole imagens diretamente no editor (Ctrl+V)
            </div>
          </div>
        )}
        
        {/* Modal content */}
        <div className="flex-1 overflow-y-auto p-4">
          {editing ? (
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary overflow-auto"
              dangerouslySetInnerHTML={{ __html: editedDescription }}
              onBlur={() => {
                // Update state when editor loses focus
                if (editorRef.current) {
                  setEditedDescription(editorRef.current.innerHTML);
                }
              }}
            />
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: subitem.description }}
            />
          )}
        </div>
        
        {/* Modal footer */}
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
