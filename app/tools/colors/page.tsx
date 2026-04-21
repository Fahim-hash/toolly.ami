"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Copy, Check, Palette, RefreshCcw, 
  Zap, Info, MousePointer2, Pipette 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ColorExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isDropperActive, setIsDropperActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 1. Auto Extract Dominant Colors
  const extractColors = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use full natural resolution for accuracy
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorMap: { [key: string]: number } = {};

    // Sample every 600th pixel for high-speed analysis
    for (let i = 0; i < imageData.length; i += 2400) {
      const r = imageData[i];
      const g = imageData[i+1];
      const b = imageData[i+2];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      colorMap[hex] = (colorMap[hex] || 0) + 1;
    }

    const sorted = Object.keys(colorMap)
      .sort((a, b) => colorMap[b] - colorMap[a])
      .slice(0, 8);

    setColors(sorted);
  }, []);

  // 2. Color Dropper (Manual Picker)
  const pickColor = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDropperActive || !canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!ctx) return;

    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    
    if (!colors.includes(hex)) {
      setColors(prev => [hex, ...prev.slice(0, 7)]);
    }
    copyToClipboard(hex);
    setIsDropperActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setColors([]); 
    }
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color.toUpperCase());
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Zap size={14} fill="currentColor" /> Toolly Engine
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            Color<span className="text-orange-500">Extractor</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Professional Visual Analysis</p>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsDropperActive(!isDropperActive)}
            className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all border ${
              isDropperActive 
              ? 'bg-orange-600 border-orange-500 text-white shadow-xl shadow-orange-600/30' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Pipette size={18} /> {isDropperActive ? 'Picking...' : 'Eye Dropper'}
          </button>
          <button onClick={() => {setImage(null); setColors([]);}} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Section: Palette Display */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] p-8">
            <div className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-8">
              <Palette size={16} className="text-orange-500" /> Active Palette
            </div>

            <div className="grid grid-cols-2 gap-4">
              {colors.length > 0 ? (
                colors.map((color, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => copyToClipboard(color)}
                    className="group flex items-center gap-3 p-3 bg-black/40 border border-zinc-800 rounded-2xl hover:border-zinc-500 transition-all active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl border border-white/5 shadow-lg" style={{ backgroundColor: color }} />
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase text-white tracking-tighter">{color}</p>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase italic">Hex Code</p>
                    </div>
                    <div className="ml-auto">
                      {copiedColor === color ? <Check size={14} className="text-green-500" /> : <Copy size={12} className="text-zinc-700 opacity-0 group-hover:opacity-100" />}
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center border border-dashed border-zinc-800 rounded-3xl opacity-30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Wait for import...</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-600/5 border border-orange-500/10 rounded-3xl p-6 flex gap-4">
            <Info size={24} className="text-orange-500 shrink-0" />
            <p className="text-[10px] leading-relaxed text-zinc-500 font-medium">
              Activate <span className="text-orange-300">Dropper</span> to pick exact pixels. Auto-extraction analyzes the image for the top 8 dominant shades.
            </p>
          </div>
        </div>

        {/* Right Section: Image Preview & Interaction */}
        <div className="lg:col-span-7">
          <div className={`relative min-h-[550px] bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[3.5rem] flex items-center justify-center overflow-hidden transition-all duration-500 ${isDropperActive ? 'cursor-crosshair ring-2 ring-orange-500/20' : ''}`}>
            <canvas ref={canvasRef} className="hidden" />
            
            {!image ? (
              <label className="flex flex-col items-center cursor-pointer p-20 group">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <div className="w-24 h-24 bg-orange-600/10 text-orange-500 rounded-[2.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={36} />
                </div>
                <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Import Branding</h2>
                <p className="text-zinc-600 font-medium mt-1 uppercase text-[10px] tracking-widest">Supports PNG, JPG, WebP</p>
              </label>
            ) : (
              <div className="w-full h-full p-10 flex items-center justify-center relative">
                <img 
                  ref={imgRef}
                  src={image} 
                  onLoad={extractColors}
                  onClick={pickColor}
                  crossOrigin="anonymous"
                  className={`max-w-full max-h-[65vh] rounded-3xl shadow-2xl object-contain border border-zinc-800 transition-all select-none ${isDropperActive ? 'hover:brightness-110' : ''}`} 
                  alt="Asset Preview" 
                />
                
                <AnimatePresence>
                  {isDropperActive && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="absolute bottom-12 bg-orange-600 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2"
                    >
                      <MousePointer2 size={12} className="animate-pulse" />
                      Click Image to pick Color
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}