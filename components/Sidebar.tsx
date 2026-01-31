
import React, { useState } from 'react';
import { EditorState, Action } from '../types';
import { BACKGROUNDS } from '../constants';
import * as htmlToImage from 'html-to-image';
import { useToast } from './Toast';

interface SidebarProps {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

const Sidebar: React.FC<SidebarProps> = ({ state, dispatch }) => {
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    const canvas = document.getElementById('screenshot-canvas');
    if (!canvas || !state.image) return;

    setExporting(true);
    try {
      // Common fix for html-to-image CSS access errors:
      // Filter out external resources that might trigger CORS issues if they are not strictly needed,
      // though here we try to keep them. The 'crossorigin' in index.html should help.
      const options = {
        pixelRatio: 2,
        quality: 1,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
        // Attempting to catch and log errors for specific resources
        filter: (node: HTMLElement) => {
          // You can exclude specific elements if needed
          return true;
        }
      };

      let dataUrl = '';
      if (state.exportFormat === 'png') {
        dataUrl = await htmlToImage.toPng(canvas, options);
      } else if (state.exportFormat === 'jpeg') {
        dataUrl = await htmlToImage.toJpeg(canvas, options);
      } else if (state.exportFormat === 'webp') {
        dataUrl = await htmlToImage.toPng(canvas, options); // Default to PNG if WebP export has issues
      }

      const link = document.createElement('a');
      link.download = `${state.filename || 'shoteasy'}.${state.exportFormat}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export image. This is often due to browser security restrictions on external fonts. Try again or check the console for details.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    const canvas = document.getElementById('screenshot-canvas');
    if (!canvas || !state.image) return;

    setExporting(true);
    try {
      const blob = await htmlToImage.toBlob(canvas, { 
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Image copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('Failed to copy to clipboard. Ensure you are on a secure (HTTPS) connection and check console for details.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Aspect Ratio Selector */}
        <div>
          <div className="relative group">
            <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-slate-400">aspect_ratio</span>
                <div>
                  <p className="text-sm font-semibold capitalize">{state.aspectRatio}</p>
                  <p className="text-xs text-slate-500">Adaptive screenshot size</p>
                </div>
              </div>
              <span className="material-icons-outlined text-slate-400">expand_more</span>
            </button>
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 hidden group-hover:block overflow-hidden">
               {(['auto', '16:9', '4:3', '1:1'] as const).map(ratio => (
                 <button 
                  key={ratio}
                  onClick={() => dispatch({ type: 'SET_ASPECT_RATIO', payload: ratio })}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 capitalize"
                 >
                   {ratio}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick</h3>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg">
            <button onClick={() => dispatch({ type: 'RESET_VIEW' })} title="Reset View" className="flex-1 py-1.5 flex justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-slate-500">
              <span className="material-icons-outlined text-xl">crop_free</span>
            </button>
            <button onClick={() => dispatch({ type: 'TOGGLE_FLIP_H' })} title="Flip Horizontal" className={`flex-1 py-1.5 flex justify-center rounded transition-colors ${state.flipH ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'}`}>
              <span className="material-icons-outlined text-xl">flip</span>
            </button>
            <button onClick={() => dispatch({ type: 'TOGGLE_FLIP_V' })} title="Flip Vertical" className={`flex-1 py-1.5 flex justify-center rounded transition-colors ${state.flipV ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'}`}>
              <span className="material-icons-outlined text-xl" style={{ transform: 'rotate(90deg)' }}>flip</span>
            </button>
            <button title="Layouts" className="flex-1 py-1.5 flex justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-slate-500">
              <span className="material-icons-outlined text-xl">grid_view</span>
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          <Slider label="Scale" value={state.scale} min={10} max={100} unit="%" onChange={(v) => dispatch({ type: 'SET_SCALE', payload: v })} />
          <Slider label="Padding" value={state.padding} min={0} max={128} unit="px" onChange={(v) => dispatch({ type: 'SET_PADDING', payload: v })} />
          <Slider label="Rounded" value={state.rounded} min={0} max={64} unit="px" onChange={(v) => dispatch({ type: 'SET_ROUNDED', payload: v })} />
          <Slider label="Shadow" value={state.shadow} min={0} max={100} unit="" onChange={(v) => dispatch({ type: 'SET_SHADOW', payload: v })} />
        </div>

        {/* Frames */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Frame</h3>
            <button className="text-xs text-slate-500 flex items-center hover:text-indigo-500">More <span className="material-icons-outlined text-xs">chevron_right</span></button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <FrameButton active={state.frame === 'none'} onClick={() => dispatch({ type: 'SET_FRAME', payload: 'none' })}>
              <div className="w-full h-full border-2 border-slate-300 border-dashed rounded-sm"></div>
            </FrameButton>
            <FrameButton active={state.frame === 'browser'} onClick={() => dispatch({ type: 'SET_FRAME', payload: 'browser' })}>
              <div className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-sm mt-1"></div>
            </FrameButton>
            <FrameButton active={state.frame === 'macos'} onClick={() => dispatch({ type: 'SET_FRAME', payload: 'macos' })}>
              <div className="flex gap-0.5 pt-1 pl-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              </div>
            </FrameButton>
            <FrameButton active={state.frame === 'simple'} onClick={() => dispatch({ type: 'SET_FRAME', payload: 'simple' })}>
              <div className="w-full h-full border border-slate-300 dark:border-slate-600 rounded-sm"></div>
            </FrameButton>
            <FrameButton active={state.frame === 'ios'} onClick={() => dispatch({ type: 'SET_FRAME', payload: 'ios' })}>
              <div className="w-1/2 h-0.5 bg-slate-400 mx-auto mt-0.5 rounded-full"></div>
            </FrameButton>
          </div>
        </div>

        {/* Backgrounds */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Background</h3>
            <button className="text-xs text-slate-500 flex items-center hover:text-indigo-500">More <span className="material-icons-outlined text-xs">chevron_right</span></button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: bg.style })}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${state.background === bg.style ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent'}`}
                style={{ background: bg.style }}
                title={bg.name}
              />
            ))}
          </div>
        </div>

        {/* Watermark Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Watermark</label>
          <button
            onClick={() => dispatch({ type: 'SET_WATERMARK', payload: !state.watermark })}
            className={`w-10 h-5 rounded-full relative transition-colors ${state.watermark ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${state.watermark ? 'left-5.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Export Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Filename and Type controls */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="filename"
              value={state.filename}
              onChange={(e) => dispatch({ type: 'SET_FILENAME', payload: e.target.value })}
              className="bg-transparent border-none focus:ring-0 p-0 text-xs flex-1 text-slate-600 dark:text-slate-300 font-medium"
            />
          </div>
          <div className="relative group">
            <button className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-indigo-500 transition-colors flex items-center gap-1">
              {state.exportFormat}
              <span className="material-icons-outlined text-xs">expand_more</span>
            </button>
            <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl hidden group-hover:block overflow-hidden z-20">
              {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                <button 
                  key={fmt}
                  onClick={() => dispatch({ type: 'SET_FORMAT', payload: fmt })}
                  className="block w-full text-right px-4 py-1.5 text-[10px] font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!state.image || exporting}
            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold h-11 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <span className="material-icons-outlined animate-spin">sync</span>
            ) : (
              <>
                <span className="material-icons-outlined text-xl">download</span>
                <span>Download</span>
                <span className="text-[10px] opacity-60 ml-1">1x as {state.exportFormat.toUpperCase()}</span>
              </>
            )}
          </button>
          <button
            onClick={handleCopy}
            disabled={!state.image || exporting}
            className="h-11 w-11 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <span className="material-icons-outlined text-slate-500">content_copy</span>
          </button>
          <button className="h-11 w-11 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons-outlined text-slate-500">tune</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }> = ({ label, value, min, max, unit, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-semibold">{label}</label>
      <span className="text-xs text-slate-400">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
    />
  </div>
);

const FrameButton: React.FC<{ children: React.ReactNode; active: boolean; onClick: () => void }> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`aspect-square rounded border-2 p-1 flex items-start transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${active ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-transparent'}`}
  >
    {children}
  </button>
);

export default Sidebar;
