import React, { useRef } from 'react';
import { Save, FolderOpen, FileDown, BookOpen, FilePlus } from 'lucide-react';

interface ToolbarProps {
  onNewProject: () => void;
  onOpenCoverModal: () => void;
  onSaveProject: () => void;
  onLoadProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadPDF: () => void;
  hasCover: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onNewProject,
  onOpenCoverModal, 
  onSaveProject, 
  onLoadProject, 
  onDownloadPDF,
  hasCover
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button 
        onClick={onNewProject}
        className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded border border-zinc-600 transition-colors text-sm"
      >
        <FilePlus size={16} /> Nuevo Proyecto
      </button>

      <button 
        onClick={onOpenCoverModal}
        className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded border border-zinc-600 transition-colors text-sm"
      >
        <BookOpen size={16} /> {hasCover ? 'Editar Portada' : 'Crear Portada'}
      </button>
      
      <button 
        onClick={onSaveProject}
        className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded border border-zinc-600 transition-colors text-sm"
      >
        <Save size={16} /> Guardar Proyecto
      </button>
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded border border-zinc-600 transition-colors text-sm"
      >
        <FolderOpen size={16} /> Abrir Proyecto
      </button>
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".json" 
        className="hidden" 
        onChange={onLoadProject}
      />
      
      <button 
        onClick={onDownloadPDF}
        className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded border border-zinc-600 transition-colors text-sm"
      >
        <FileDown size={16} /> Descargar PDF
      </button>
    </div>
  );
};