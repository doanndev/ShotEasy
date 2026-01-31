
import { BackgroundType, EditorState } from './types';

export const BACKGROUNDS: BackgroundType[] = [
  { id: 'indigo-purple', name: 'Indigo Purple', style: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)' },
  { id: 'rose-red', name: 'Rose Red', style: 'linear-gradient(135deg, #fb7185 0%, #dc2626 100%)' },
  { id: 'blue-navy', name: 'Blue Navy', style: 'linear-gradient(135deg, #60a5fa 0%, #1e3a8a 100%)' },
  { id: 'orange-rose', name: 'Orange Rose', style: 'linear-gradient(135deg, #fb923c 0%, #fb7185 100%)' },
  { id: 'teal-emerald', name: 'Teal Emerald', style: 'linear-gradient(135deg, #2dd4bf 0%, #10b981 100%)' },
  { id: 'blue-indigo', name: 'Blue Indigo', style: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' },
  { id: 'pink-purple', name: 'Pink Purple', style: 'linear-gradient(135deg, #f9a8d4 0%, #c084fc 100%)' },
  { id: 'white', name: 'Clean White', style: '#ffffff' },
  { id: 'slate', name: 'Dark Slate', style: '#0f172a' },
];

export const INITIAL_STATE: EditorState = {
  image: null,
  scale: 85,
  padding: 48,
  rounded: 16,
  shadow: 20,
  frame: 'macos',
  background: BACKGROUNDS[0].style,
  watermark: false,
  aspectRatio: 'auto',
  activeTool: 'none',
  drawColor: '#ef4444',
  filename: 'screenshot',
  exportFormat: 'png',
  flipH: false,
  flipV: false,
};
