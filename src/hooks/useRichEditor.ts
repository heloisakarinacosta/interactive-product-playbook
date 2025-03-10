
import { useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface UseRichEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export const useRichEditor = ({ initialContent, onChange }: UseRichEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Configuração inicial do editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handlePaste = (e: ClipboardEvent): void => {
    e.preventDefault();
    
    const items = Array.from(e.clipboardData?.items || []);
    let hasProcessedImage = false;

    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        hasProcessedImage = true;
        const file = item.getAsFile();
        if (!file) continue;

        try {
          // Converter a imagem para base64
          const reader = new FileReader();
          reader.onload = (event) => {
            if (!event.target?.result || !editorRef.current) return;
            
            // Inserir a imagem como base64 no editor
            const img = document.createElement('img');
            img.src = event.target.result as string;
            img.style.maxWidth = '100%';
            
            // Garantir que o cursor está na posição correta
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.insertNode(img);
              range.collapse(false);
            } else {
              editorRef.current.appendChild(img);
            }
            
            // Notificar a mudança
            onChange(editorRef.current.innerHTML);
            toast.success('Imagem inserida com sucesso!');
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          toast.error('Erro ao inserir imagem');
        }
      }
    }

    // Se não for uma imagem, inserir o texto normalmente
    if (!hasProcessedImage) {
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    }
  };

  // Manipulador de comandos de formatação
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  // Inserir imagem via URL
  const insertImage = () => {
    const url = prompt('Insira o URL da imagem:');
    if (url && editorRef.current) {
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
      } else {
        editorRef.current.appendChild(img);
      }
      
      onChange(editorRef.current.innerHTML);
      toast.success('Imagem inserida com sucesso!');
    }
  };

  // Inserir link
  const insertLink = () => {
    const url = prompt('Insira o URL do link:');
    if (url) {
      formatText('createLink', url);
    }
  };

  // Lidar com a tecla Enter
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    }
  };

  return {
    editorRef,
    formatText,
    insertImage,
    insertLink,
    handlePaste,
    handleKeyDown
  };
};
