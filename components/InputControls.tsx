import React, { useState } from 'react';
import { ScriptElementType } from '../types';
import { Plus } from 'lucide-react';

interface InputControlsProps {
  onAdd: (type: ScriptElementType, text: string) => void;
}

export const InputControls: React.FC<InputControlsProps> = ({ onAdd }) => {
  const [type, setType] = useState<ScriptElementType>('slugline');
  const [text, setText] = useState('');
  
  // Slugline specific state
  const [intExt, setIntExt] = useState('INT.');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('DÍA');

  // Transition specific
  const [transitionType, setTransitionType] = useState('CORTE A:');

  const handleAdd = () => {
    let finalText = '';

    if (type === 'slugline') {
      if (!location.trim()) {
        alert('Por favor ingresa un LUGAR');
        return;
      }
      finalText = `${intExt} ${location.toUpperCase()} - ${time}`;
      // Reset slugline inputs
      setLocation('');
    } else if (type === 'transition') {
      finalText = transitionType;
    } else {
      if (!text.trim()) {
        alert('Por favor ingresa texto');
        return;
      }
      
      // Auto-wrap parenthetical
      if (type === 'parenthetical') {
        const cleanText = text.replace(/^\s*\(|\)\s*$/g, '').trim();
        finalText = `(${cleanText})`;
      } else {
        finalText = text;
      }

      // Reset text input
      setText('');
    }

    onAdd(type, finalText);
  };

  const showTextControl = ['action', 'character', 'dialogue', 'parenthetical'].includes(type);

  return (
    <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700 mb-6 shadow-lg sticky top-4 z-30">
      <div className="flex flex-wrap gap-4 items-end">
        
        {/* Element Type Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-400 text-xs uppercase font-bold">Tipo</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as ScriptElementType)}
            className="bg-zinc-700 text-zinc-200 border border-zinc-600 rounded p-2 text-sm focus:outline-none focus:border-zinc-400 min-w-[150px]"
          >
            <option value="slugline">Encabezado de Escena</option>
            <option value="action">Acción</option>
            <option value="character">Personaje</option>
            <option value="dialogue">Diálogo</option>
            <option value="parenthetical">Paréntesis</option>
            <option value="transition">Transición</option>
          </select>
        </div>

        {/* Dynamic Inputs based on Type */}
        <div className="flex-1 flex flex-wrap gap-2">
          
          {type === 'slugline' && (
            <>
              <select 
                value={intExt} 
                onChange={(e) => setIntExt(e.target.value)}
                className="bg-zinc-700 text-zinc-200 border border-zinc-600 rounded p-2 text-sm focus:outline-none focus:border-zinc-400"
              >
                <option value="INT.">INT.</option>
                <option value="EXT.">EXT.</option>
                <option value="INT./EXT.">INT./EXT.</option>
              </select>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="LUGAR (ej. OFICINA)" 
                className="bg-zinc-700 text-zinc-200 border border-zinc-600 rounded p-2 text-sm flex-1 min-w-[200px] uppercase placeholder:normal-case focus:outline-none focus:border-zinc-400"
              />
              <select 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                className="bg-zinc-700 text-zinc-200 border border-zinc-600 rounded p-2 text-sm focus:outline-none focus:border-zinc-400"
              >
                <option value="DÍA">DÍA</option>
                <option value="NOCHE">NOCHE</option>
                <option value="AMANECER">AMANECER</option>
                <option value="ATARDECER">ATARDECER</option>
                <option value="CONTINUO">CONTINUO</option>
              </select>
            </>
          )}

          {type === 'transition' && (
             <select 
               value={transitionType} 
               onChange={(e) => setTransitionType(e.target.value)}
               className="bg-zinc-700 text-zinc-200 border border-zinc-600 rounded p-2 text-sm flex-1 focus:outline-none focus:border-zinc-400"
             >
              <option value="CORTE A:">CORTE A:</option>
              <option value="FUNDIDO A NEGRO:">FUNDIDO A NEGRO:</option>
              <option value="FUNDIDO DESDE NEGRO:">FUNDIDO DESDE NEGRO:</option>
              <option value="FUNDIDO A BLANCO:">FUNDIDO A BLANCO:</option>
              <option value="DISOLVENCIA:">DISOLVENCIA:</option>
              <option value="BARRIDO:">BARRIDO:</option>
             </select>
          )}

          {showTextControl && (
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={type === 'parenthetical' ? "ej. sarcásticamente" : "Escribe aquí..."} 
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="bg-zinc-700 text-zinc-200 border border-zinc-600 rounded p-2 text-sm flex-1 min-w-[300px] focus:outline-none focus:border-zinc-400"
            />
          )}

        </div>

        <button 
          onClick={handleAdd}
          className="bg-zinc-600 hover:bg-zinc-500 text-white p-2 px-6 rounded border border-zinc-500 shadow transition-all flex items-center gap-2 font-bold"
        >
          <Plus size={18} /> Agregar
        </button>

      </div>
    </div>
  );
};