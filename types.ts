export type ScriptElementType = 
  | 'slugline' 
  | 'action' 
  | 'character' 
  | 'dialogue' 
  | 'parenthetical' 
  | 'transition';

export interface ScriptElement {
  id: string;
  type: ScriptElementType;
  text: string;
  sceneNumber?: number; // Only for sluglines
}

export interface CoverData {
  title: string;
  author: string;
  treatmentNumber: string;
  date: string;
  email: string;
  phone: string;
}

export interface ProjectData {
  screenplay: ScriptElement[];
  coverData: CoverData | null;
  savedDate: string;
}