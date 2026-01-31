
import React, { useRef, useState, useEffect } from 'react';
import { EditorState, Action } from '../types';

interface EditorCanvasProps {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({ state, dispatch }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatch({ type: 'SET_IMAGE', payload: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatch({ type: 'SET_IMAGE', payload: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drawing Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (state.activeTool === 'none' || state.activeTool === 'pan') return;
    
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // Accounting for CSS scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    
    if (state.activeTool === 'pencil') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = state.drawColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (state.activeTool === 'pencil') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // For shapes, we want to preview. This simple implementation doesn't have a buffer layer,
      // so we'd normally clear and redraw everything, but for this demo, 
      // let's just implement pencil for now and a basic shape on mouse up.
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (state.activeTool === 'pencil') return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.strokeStyle = state.drawColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    const width = x - startPos.x;
    const height = y - startPos.y;

    if (state.activeTool === 'rect') {
      ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else if (state.activeTool === 'circle') {
      const radius = Math.sqrt(width * width + height * height);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state.activeTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  if (!state.image) {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className="max-w-2xl w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-all hover:border-indigo-500 cursor-pointer group"
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors mb-4">
          <span className="material-icons-outlined text-3xl">add_photo_alternate</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Click or Drag image to this area</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">or Paste image from clipboard</p>

        <div className="mt-12 flex gap-4">
          <IconButton icon="photo_camera" />
          <IconButton icon="title" />
          <IconButton icon="code" />
          <IconButton icon="collections" />
        </div>
      </div>
    );
  }

  const shadowOpacity = state.shadow / 100;
  const shadowValue = `0 ${state.shadow * 0.5}px ${state.shadow * 2}px rgba(0,0,0,${shadowOpacity})`;

  // Calculate container aspect ratio styles
  const aspectStyles: React.CSSProperties = {};
  if (state.aspectRatio === '16:9') aspectStyles.aspectRatio = '16/9';
  else if (state.aspectRatio === '4:3') aspectStyles.aspectRatio = '4/3';
  else if (state.aspectRatio === '1:1') aspectStyles.aspectRatio = '1/1';

  return (
    <div
      id="screenshot-canvas"
      className="relative flex items-center justify-center transition-all overflow-hidden"
      style={{
        background: state.background,
        padding: `${state.padding}px`,
        width: 'auto',
        minWidth: '400px',
        maxWidth: '100%',
        ...aspectStyles,
      }}
    >
      <div
        className="relative overflow-hidden transition-all duration-300 flex flex-col group/window"
        style={{
          borderRadius: `${state.rounded}px`,
          boxShadow: shadowValue,
          transform: `scale(${state.scale / 100}) ${state.flipH ? 'scaleX(-1)' : ''} ${state.flipV ? 'scaleY(-1)' : ''}`,
          background: '#1e1e1e', // Window content bg
          cursor: state.activeTool === 'pan' ? 'grab' : (state.activeTool !== 'none' ? 'crosshair' : 'default'),
        }}
      >
        {/* Frame Styles */}
        {state.frame === 'macos' && (
          <div className="h-8 bg-slate-100 dark:bg-slate-800 flex items-center px-3 gap-1.5 border-b border-slate-200 dark:border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
        )}

        {state.frame === 'browser' && (
          <div className="bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
             <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
             </div>
             <div className="flex-1 bg-white dark:bg-slate-900 rounded-md h-6 px-3 flex items-center">
               <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
               <div className="h-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
             </div>
          </div>
        )}

        {state.frame === 'simple' && (
          <div className="absolute inset-0 border border-white/20 pointer-events-none z-10" style={{ borderRadius: `${state.rounded}px` }}></div>
        )}

        <div className="relative">
          <img
            src={state.image}
            alt="Screenshot"
            className="block w-full h-auto object-contain select-none"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              if (drawingCanvasRef.current) {
                drawingCanvasRef.current.width = img.naturalWidth;
                drawingCanvasRef.current.height = img.naturalHeight;
              }
            }}
          />
          <canvas 
            ref={drawingCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {state.frame === 'ios' && (
           <div className="h-6 flex items-center justify-center bg-transparent absolute bottom-0 left-0 right-0">
              <div className="w-32 h-1 bg-white/40 rounded-full mb-1"></div>
           </div>
        )}

        {state.watermark && (
          <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 pointer-events-none">
            <span className="material-icons-outlined text-white text-xs">auto_fix_high</span>
            <span className="text-[10px] text-white font-medium uppercase tracking-widest">ShotEasy</span>
          </div>
        )}
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_IMAGE', payload: null })}
        className="absolute top-4 left-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
      >
        <span className="material-icons-outlined">close</span>
      </button>
    </div>
  );
};

const IconButton: React.FC<{ icon: string }> = ({ icon }) => (
  <button className="w-14 h-14 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors">
    <span className="material-icons-outlined">{icon}</span>
  </button>
);

export default EditorCanvas;
