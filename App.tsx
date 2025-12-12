import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScriptElement, ScriptElementType, CoverData, ProjectData } from './types';
import { generatePDF } from './services/pdfGenerator';
import { InputControls } from './components/InputControls';
import { ScriptRenderer } from './components/ScriptRenderer';
import { CoverModal } from './components/CoverModal';
import { Toolbar } from './components/Toolbar';
import { FileText, Undo, Redo, Save, FolderOpen, FileDown, ArrowUp } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'villoScreenplay_autosave';

export default function App() {
  const [screenplay, setScreenplay] = useState<ScriptElement[]>([]);
  const [coverData, setCoverData] = useState<CoverData | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [projectKey, setProjectKey] = useState(0);
  
  // History management
  const [history, setHistory] = useState<ScriptElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Initialize
  useEffect(() => {
    loadAutoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save and History logic
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    if (screenplay.length > 0 || coverData) {
      // Save to local storage
      const projectData: ProjectData = {
        screenplay,
        coverData,
        savedDate: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectData));

      // Add to history (only screenplay changes tracked for undo/redo for now)
      if (screenplay.length > 0) {
        const newHistory = history.slice(0, historyIndex + 1);
        // Only push if different from last
        const lastEntry = newHistory[newHistory.length - 1];
        if (JSON.stringify(lastEntry) !== JSON.stringify(screenplay)) {
             newHistory.push(JSON.parse(JSON.stringify(screenplay)));
             // Limit history size to 50 steps
             if (newHistory.length > 50) newHistory.shift();
             setHistory(newHistory);
             setHistoryIndex(newHistory.length - 1);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenplay, coverData]);

  const addToScreenplay = (type: ScriptElementType, text: string) => {
    const newElement: ScriptElement = {
      id: crypto.randomUUID(),
      type,
      text: type === 'character' || type === 'slugline' || type === 'transition' ? text.toUpperCase() : text,
    };
    setScreenplay(prev => [...prev, newElement]);
  };

  const updateElement = (id: string, newText: string) => {
    setScreenplay(prev => prev.map(el => {
      if (el.id === id) {
        return { 
          ...el, 
          text: (el.type === 'character' || el.type === 'slugline' || el.type === 'transition') 
            ? newText.toUpperCase() 
            : newText 
        };
      }
      return el;
    }));
  };

  const removeElement = (id: string) => {
    setScreenplay(prev => prev.filter(el => el.id !== id));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setScreenplay(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setScreenplay(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const loadAutoSave = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as ProjectData;
        const savedDate = new Date(data.savedDate);
        if (window.confirm(`Se encontró un proyecto guardado automáticamente del ${savedDate.toLocaleString()}. ¿Deseas cargarlo?`)) {
          setScreenplay(data.screenplay || []);
          setCoverData(data.coverData || null);
          // Reset history for loaded project
          setHistory([data.screenplay || []]);
          setHistoryIndex(0);
          setProjectKey(prev => prev + 1);
        }
      }
    } catch (e) {
      console.error("Failed to load autosave", e);
    }
  };

  const createNewProject = () => {
    const hasContent = screenplay.length > 0 || coverData !== null;

    if (hasContent) {
        if (!window.confirm('¿Estás seguro de que deseas crear un nuevo proyecto? Se perderán los cambios no guardados.')) {
            return;
        }
    }
    
    setScreenplay([]);
    setCoverData(null);
    setHistory([]);
    setHistoryIndex(-1);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    
    // Force reset of InputControls (clears typed but unadded text)
    setProjectKey(prev => prev + 1);
  };

  const saveProject = () => {
    const projectData: ProjectData = {
      screenplay,
      coverData,
      savedDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guion_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Proyecto guardado exitosamente');
  };

  const loadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result) as ProjectData;
        setScreenplay(data.screenplay || []);
        setCoverData(data.coverData || null);
        setHistory([data.screenplay || []]);
        setHistoryIndex(0);
        setProjectKey(prev => prev + 1);
        alert('Proyecto cargado exitosamente');
      } catch (error) {
        alert('Error al cargar el proyecto. Asegúrate de que sea un archivo válido.');
      }
    };
    reader.readAsText(file);
    // Reset value so same file can be loaded again
    event.target.value = '';
  };

  const handleDownloadPDF = () => {
    generatePDF(screenplay, coverData);
  };

  const handleRemoveCover = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar la portada?')) {
      setCoverData(null);
      setIsCoverModalOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-800 to-zinc-900 pb-20">
      
      {/* Floating Actions */}
      <div className="fixed top-5 right-5 z-50 flex gap-2">
        <button 
          onClick={handleUndo} 
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 p-2 rounded shadow-lg border border-zinc-600 transition-colors"
          title="Deshacer"
        >
          <Undo size={18} />
        </button>
        <button 
          onClick={handleRedo} 
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 p-2 rounded shadow-lg border border-zinc-600 transition-colors"
          title="Rehacer"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Header */}
      <div className="p-5 relative z-40">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-10 bg-zinc-800 border-2 border-zinc-500 rounded relative shadow-inner">
            <div className="absolute -top-2 -left-0.5 -right-0.5 h-3 bg-[repeating-linear-gradient(45deg,#808080,#808080_8px,#2c2c2c_8px,#2c2c2c_16px)] border-2 border-zinc-500 rounded-t"></div>
          </div>
          <h1 className="text-3xl font-bold text-zinc-300 tracking-widest">
            <span className="text-4xl">V</span>illoScreenPlay
          </h1>
        </div>

        <Toolbar 
          onNewProject={createNewProject}
          onOpenCoverModal={() => setIsCoverModalOpen(true)}
          onSaveProject={saveProject}
          onLoadProject={loadProject}
          onDownloadPDF={handleDownloadPDF}
          hasCover={!!coverData}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        
        {/* Input Controls - key forces reset on new project */}
        <InputControls key={projectKey} onAdd={addToScreenplay} />

        {/* Script Editor / Renderer */}
        <ScriptRenderer 
          screenplay={screenplay} 
          onUpdate={updateElement} 
          onRemove={removeElement} 
          coverData={coverData}
          onEditCover={() => setIsCoverModalOpen(true)}
        />
      </div>

      {/* Modals */}
      {isCoverModalOpen && (
        <CoverModal 
          onClose={() => setIsCoverModalOpen(false)} 
          onSave={(data) => {
            setCoverData(data);
            setIsCoverModalOpen(false);
          }}
          onRemove={coverData ? handleRemoveCover : undefined}
          initialData={coverData}
        />
      )}

      {/* Scroll To Top */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-zinc-700 text-white rounded-full shadow-lg border border-zinc-500 flex items-center justify-center hover:bg-zinc-600 transition-transform hover:scale-110 z-50"
      >
        <ArrowUp size={24} />
      </button>

    </div>
  );
}