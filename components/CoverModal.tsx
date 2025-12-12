import React, { useState } from 'react';
import { CoverData } from '../types';

interface CoverModalProps {
  onClose: () => void;
  onSave: (data: CoverData) => void;
  onRemove?: () => void;
  initialData: CoverData | null;
}

export const CoverModal: React.FC<CoverModalProps> = ({ onClose, onSave, onRemove, initialData }) => {
  const [data, setData] = useState<CoverData>(initialData || {
    title: '',
    author: '',
    treatmentNumber: '',
    date: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4">
      <div className="bg-zinc-800 p-8 rounded-lg border-2 border-zinc-600 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl text-zinc-300 mb-6 font-bold border-b border-zinc-700 pb-2">
          {initialData ? 'Editar Portada' : 'Crear Portada'}
        </h2>
        
        <div className="space-y-4">
          {/* Main Info */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Información Principal</label>
            <input 
              name="title" 
              value={data.title} 
              onChange={handleChange}
              placeholder="Título del Guion" 
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 p-3 rounded focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500 mb-2"
            />
            <input 
              name="author" 
              value={data.author} 
              onChange={handleChange}
              placeholder="Nombre del Guionista" 
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 p-3 rounded focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500"
            />
          </div>

          {/* Version Info */}
          <div className="pt-2 border-t border-zinc-700">
            <label className="block text-zinc-400 text-sm mb-1">Versión</label>
            <input 
              name="treatmentNumber" 
              value={data.treatmentNumber} 
              onChange={handleChange}
              placeholder="Número de Tratamiento (ej. 1, 2...)" 
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 p-3 rounded focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500 mb-2"
            />
            <input 
              name="date" 
              value={data.date} 
              onChange={handleChange}
              placeholder="Fecha (DD/MM/AAAA)" 
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 p-3 rounded focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500"
            />
          </div>

          {/* Contact Info */}
          <div className="pt-2 border-t border-zinc-700">
            <label className="block text-zinc-400 text-sm mb-1">Contacto (Opcional)</label>
            <input 
              name="email" 
              value={data.email} 
              onChange={handleChange}
              placeholder="Correo Electrónico" 
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 p-3 rounded focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500 mb-2"
            />
            <input 
              name="phone" 
              value={data.phone} 
              onChange={handleChange}
              placeholder="Número de Teléfono" 
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 p-3 rounded focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={() => onSave(data)}
            className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white p-3 rounded font-bold transition-colors"
          >
            {initialData ? 'Guardar Cambios' : 'Crear'}
          </button>
          
          {onRemove && (
            <button 
                onClick={onRemove}
                className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 px-4 rounded font-bold transition-colors"
                title="Eliminar Portada"
            >
                Eliminar
            </button>
          )}

          <button 
            onClick={onClose}
            className="flex-1 bg-transparent border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400 p-3 rounded font-bold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};