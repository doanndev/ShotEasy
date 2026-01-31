
export type FrameType = 'none' | 'browser' | 'macos' | 'simple' | 'ios';

export type ToolType = 'none' | 'rect' | 'circle' | 'line' | 'pencil' | 'pan';

export type BackgroundType = {
  id: string;
  name: string;
  style: string;
};

export type EditorState = {
  image: string | null;
  scale: number;
  padding: number;
  rounded: number;
  shadow: number;
  frame: FrameType;
  background: string;
  watermark: boolean;
  aspectRatio: 'auto' | '16:9' | '4:3' | '1:1';
  // New properties
  activeTool: ToolType;
  drawColor: string;
  filename: string;
  exportFormat: 'png' | 'jpeg' | 'webp';
  flipH: boolean;
  flipV: boolean;
};

export type Action =
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_SCALE'; payload: number }
  | { type: 'SET_PADDING'; payload: number }
  | { type: 'SET_ROUNDED'; payload: number }
  | { type: 'SET_SHADOW'; payload: number }
  | { type: 'SET_FRAME'; payload: FrameType }
  | { type: 'SET_BACKGROUND'; payload: string }
  | { type: 'SET_WATERMARK'; payload: boolean }
  | { type: 'SET_ASPECT_RATIO'; payload: EditorState['aspectRatio'] }
  | { type: 'SET_TOOL'; payload: ToolType }
  | { type: 'SET_COLOR'; payload: string }
  | { type: 'SET_FILENAME'; payload: string }
  | { type: 'SET_FORMAT'; payload: EditorState['exportFormat'] }
  | { type: 'TOGGLE_FLIP_H' }
  | { type: 'TOGGLE_FLIP_V' }
  | { type: 'RESET_VIEW' };
