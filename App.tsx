
import React, { useReducer, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EditorCanvas from './components/EditorCanvas';
import { ToastProvider } from './components/Toast';
import { EditorState, Action } from './types';
import { INITIAL_STATE } from './constants';

const editorReducer = (state: EditorState, action: Action): EditorState => {
  switch (action.type) {
    case 'SET_IMAGE': return { ...state, image: action.payload };
    case 'SET_SCALE': return { ...state, scale: action.payload };
    case 'SET_PADDING': return { ...state, padding: action.payload };
    case 'SET_ROUNDED': return { ...state, rounded: action.payload };
    case 'SET_SHADOW': return { ...state, shadow: action.payload };
    case 'SET_FRAME': return { ...state, frame: action.payload };
    case 'SET_BACKGROUND': return { ...state, background: action.payload };
    case 'SET_WATERMARK': return { ...state, watermark: action.payload };
    case 'SET_ASPECT_RATIO': return { ...state, aspectRatio: action.payload };
    case 'SET_TOOL': return { ...state, activeTool: action.payload };
    case 'SET_COLOR': return { ...state, drawColor: action.payload };
    case 'SET_FILENAME': return { ...state, filename: action.payload };
    case 'SET_FORMAT': return { ...state, exportFormat: action.payload };
    case 'TOGGLE_FLIP_H': return { ...state, flipH: !state.flipH };
    case 'TOGGLE_FLIP_V': return { ...state, flipV: !state.flipV };
    case 'RESET_VIEW': return { ...state, scale: 85, padding: 48, flipH: false, flipV: false };
    default: return state;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(editorReducer, INITIAL_STATE);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            dispatch({ type: 'SET_IMAGE', payload: event.target?.result as string });
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Header state={state} dispatch={dispatch} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative flex items-center justify-center overflow-auto p-8 dotted-bg">
            <EditorCanvas state={state} dispatch={dispatch} />
          </div>
          <Sidebar state={state} dispatch={dispatch} />
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;
