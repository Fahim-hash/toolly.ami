"use client";

import { useState, useRef, useEffect, useCallback } from 'react'; // Fixed: useCallback added
import { 
  Upload, Download, Scissors, Maximize, 
  Monitor, Smartphone, Camera, 
  Trash2, RefreshCcw, Layers, Zap, Info,
  Share2, Globe, Layout, PlayCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const PRESETS = [
  { id: 'ig-post', name: 'IG Post', w: 1080, h: 1080, icon: Camera },
  { name: 'IG Story', w: 1080, h: 1920, icon: Smartphone },
  { name: 'FB Cover', w: 820, h: 312, icon: Share2 },
  { name: 'Dribbble', w: 1600, h: 1200, icon: Layout },
  { name: 'Behance', w: 1920, h: 1080, icon: Globe },
  { name: 'YouTube', w: 1280, h: 720, icon: PlayCircle },
];

export default function SmartResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1080, height: 1080 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
    }
  };

  const drawResizedImage = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
  }, [image, dimensions]);

  useEffect(() => {
    drawResizedImage();
  }, [drawResizedImage]);

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `toolly-resizer-${dimensions.width}x${dimensions.height}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Zap size={14} fill="currentColor" /> Toolly Engine
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            Smart<span className="text-emerald-500">Resizer</span>
          </h1>
        </motion.div>

        <div className="flex gap-4">
          <button onClick={() => setImage(null)} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all">
            <RefreshCcw size={20} />
          </button>
          <button 
            disabled={!image}
            onClick={downloadImage}
            className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-30"
          >
            <Download size={20} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Side: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-8">
            <div className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Maximize size={16} className="text-emerald-500" /> Presets
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setDimensions({ width: preset.w, height: preset.h })}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                    dimensions.width === preset.w && dimensions.height === preset.h 
                    ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' 
                    : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  <preset.icon size={20} />
                  <span className="text-[10px] font-bold uppercase">{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-zinc-600 ml-2 uppercase">W (px)</label>
                    <input 
                      type="number" value={dimensions.width} 
                      onChange={(e) => setDimensions({...dimensions, width: parseInt(e.target.value) || 0})}
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold text-zinc-300 outline-none focus:border-emerald-600 transition" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-zinc-600 ml-2 uppercase">H (px)</label>
                    <input 
                      type="number" value={dimensions.height} 
                      onChange={(e) => setDimensions({...dimensions, height: parseInt(e.target.value) || 0})}
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold text-zinc-300 outline-none focus:border-emerald-600 transition" 
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="lg:col-span-8">
          <div className="relative min-h-[600px] bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[3rem] flex items-center justify-center overflow-hidden p-8 group hover:border-emerald-500/30 transition-all duration-500">
            {!image ? (
              <label className="flex flex-col items-center cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <div className="w-20 h-20 bg-emerald-600/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={32} />
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Import Design</h2>
              </label>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-[70vh] shadow-2xl shadow-emerald-500/5 rounded-lg object-contain bg-zinc-900 border border-zinc-800" 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}