import React, { useEffect, useRef } from 'react';
import { ScriptElement } from '../types';
import { Trash2 } from 'lucide-react';

interface ScriptRendererProps {
  screenplay: ScriptElement[];
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

// Helper for auto-resizing textareas
const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  className 
}: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
  className: string 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`${className} bg-transparent outline-none resize-none overflow-hidden w-full`}
      rows={1}
    />
  );
};

export const ScriptRenderer: React.FC<ScriptRendererProps> = ({ screenplay, onUpdate, onRemove }) => {
  
  let sceneCount = 0;

  return (
    <div className="bg-white min-h-[11in] shadow-[0_0_20px_rgba(0,0,0,0.7)] p-[1in_1in_1in_1.5in] relative max-w-[8.5in] mx-auto text-black font-mono">
      {screenplay.length === 0 && (
        <div className="text-gray-300 text-center mt-20 italic pointer-events-none select-none">
          El guion está vacío. Agrega elementos arriba.
        </div>
      )}
      
      {screenplay.map((element) => {
        // Calculate scene number dynamically for display
        if (element.type === 'slugline') sceneCount++;
        const currentSceneNum = sceneCount;

        return (
          <div key={element.id} className="relative group mb-3">
            {/* Delete Button (visible on hover) */}
            <button 
              onClick={() => onRemove(element.id)}
              className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:text-red-600"
              title="Eliminar elemento"
            >
              <Trash2 size={16} />
            </button>

            {/* Render based on type */}
            <div className="w-full">
              {element.type === 'slugline' ? (
                <div className="font-bold uppercase mt-6 mb-4 flex gap-2">
                  <span className="select-none min-w-[20px]">{currentSceneNum}.</span>
                  <AutoResizeTextarea
                    value={element.text}
                    onChange={(e) => onUpdate(element.id, e.target.value)}
                    className="font-bold uppercase"
                  />
                </div>
              ) : element.type === 'action' ? (
                <div className="mb-4">
                  <AutoResizeTextarea
                    value={element.text}
                    onChange={(e) => onUpdate(element.id, e.target.value)}
                    className=""
                  />
                </div>
              ) : element.type === 'character' ? (
                <div className="mt-4 ml-[2.2in] w-full font-bold uppercase">
                  <AutoResizeTextarea
                    value={element.text}
                    onChange={(e) => onUpdate(element.id, e.target.value)}
                    className="font-bold uppercase"
                  />
                </div>
              ) : element.type === 'parenthetical' ? (
                <div className="ml-[1.6in] max-w-[2.0in]">
                  <AutoResizeTextarea
                    value={element.text}
                    onChange={(e) => onUpdate(element.id, e.target.value)}
                    className=""
                  />
                </div>
              ) : element.type === 'dialogue' ? (
                <div className="ml-[1.0in] max-w-[3.8in] mb-4">
                  <AutoResizeTextarea
                    value={element.text}
                    onChange={(e) => onUpdate(element.id, e.target.value)}
                    className=""
                  />
                </div>
              ) : element.type === 'transition' ? (
                <div className="mt-4 mb-4 text-right font-bold uppercase">
                   <AutoResizeTextarea
                    value={element.text}
                    onChange={(e) => onUpdate(element.id, e.target.value)}
                    className="text-right font-bold uppercase"
                  />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};