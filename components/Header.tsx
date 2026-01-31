
import React, { useState, useEffect, useRef } from 'react';
import { Action, EditorState, ToolType } from '../types';

interface HeaderProps {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

const Header: React.FC<HeaderProps> = ({ state, dispatch }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const setTool = (tool: ToolType) => {
    dispatch({ type: 'SET_TOOL', payload: state.activeTool === tool ? 'none' : tool });
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
          <img src="/icon.svg" alt="ShotEasy" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-lg tracking-tight hidden sm:block">ShotEasy</span>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button 
          onClick={() => setTool('rect')}
          className={`p-1.5 rounded transition-colors ${state.activeTool === 'rect' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'}`}
        >
          <span className="material-icons-outlined text-sm">crop_square</span>
        </button>
        <button 
          onClick={() => setTool('circle')}
          className={`p-1.5 rounded transition-colors ${state.activeTool === 'circle' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'}`}
        >
          <span className="material-icons-outlined text-sm">circle</span>
        </button>
        <button 
          onClick={() => setTool('line')}
          className={`p-1.5 rounded transition-colors ${state.activeTool === 'line' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'}`}
        >
          <span className="material-icons-outlined text-sm">horizontal_rule</span>
        </button>
        <button 
          onClick={() => setTool('pencil')}
          className={`p-1.5 rounded transition-colors ${state.activeTool === 'pencil' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'}`}
        >
          <span className="material-icons-outlined text-sm">edit</span>
        </button>
        
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
        
        <button 
          onClick={() => colorInputRef.current?.click()}
          className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors relative"
        >
          <div className="w-4 h-4 rounded-full border border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: state.drawColor }}></div>
          <input 
            ref={colorInputRef}
            type="color" 
            className="absolute opacity-0 w-0 h-0" 
            value={state.drawColor}
            onChange={(e) => dispatch({ type: 'SET_COLOR', payload: e.target.value })}
          />
        </button>

        <button 
          onClick={() => setTool('pan')}
          className={`p-1.5 rounded transition-colors ${state.activeTool === 'pan' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'}`}
        >
          <span className="material-icons-outlined text-sm">pan_tool</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
        >
          <span className="material-icons-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
