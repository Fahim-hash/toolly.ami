"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Layers, Copy, Check, 
  RotateCcw, Box, Code2, 
  Sun, MousePointer2, Sparkles
} from 'lucide-react';

const ShadowEngine = () => {
  const [distance, setDistance] = useState(30);
  const [blur, setBlur] = useState(60);
  const [opacity, setOpacity] = useState(0.12);
  const [layers, setLayers] = useState(4); // Premium control: More layers = smoother
  const [copied, setCopied] = useState(false);

  // Advanced Smooth Shadow Generator logic
  const generateShadow = () => {
    let shadowString = "";
    for (let i = 1; i <= layers; i++) {
      const ratio = i / layers;
      const d = distance * ratio;
      const b = blur * ratio;
      const o = (opacity / layers) * 1.5;
      shadowString += `0 ${d}px ${b}px rgba(0,0,0,${o})${i === layers ? "" : ", "}`;
    }
    return shadowString;
  };

  const cssCode = `box-shadow: ${generateShadow()};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 min-h-screen">
      {/* Premium Glass Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 bg-zinc-900/40 p-10 rounded-[3rem] border border-white/10 backdrop-blur-2xl gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 bg-sky-500 rounded-[2rem] shadow-[0_20px_50px_rgba(14,165,233,0.3)] rotate-6 group hover:rotate-0 transition-transform duration-500">
            <Layers className="text-white group-hover:scale-110 transition-transform" size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic text-white">
              Layer <span className="text-sky-500">Shadow</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-1">Multi-Layer Depth Engine</p>
          </div>
        </div>

        <button 
          onClick={copyToClipboard}
          className="relative group px-10 py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 overflow-hidden transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-sky-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
            {copied ? <Check size={18} /> : <Code2 size={18} />} 
            {copied ? 'Copied Snippet' : 'Copy CSS Code'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Advanced Controls */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-10 space-y-10 backdrop-blur-md">
            
            {/* Distance Control */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Elevation (Y): {distance}px</label>
                <button onClick={() => setDistance(30)} className="hover:rotate-180 transition-transform duration-500"><RotateCcw size={14} className="text-zinc-600" /></button>
              </div>
              <input 
                type="range" min="0" max="150" value={distance} 
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Blur Control */}
            <div className="space-y-6">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block">Diffusion (Blur): {blur}px</label>
              <input 
                type="range" min="0" max="300" value={blur} 
                onChange={(e) => setBlur(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Opacity Control */}
            <div className="space-y-6">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block">Intensity: {Math.round(opacity * 100)}%</label>
              <input 
                type="range" min="0" max="1" step="0.01" value={opacity} 
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Layer Control */}
            <div className="pt-6 border-t border-white/5">
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 italic flex items-center gap-2">
                 <Sparkles size={12} /> Render Precision
               </p>
               <div className="flex gap-2">
                 {[2, 4, 6].map((l) => (
                   <button 
                    key={l}
                    onClick={() => setLayers(l)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all border ${layers === l ? 'bg-sky-500 border-sky-400 text-white shadow-lg' : 'bg-black border-white/5 text-zinc-600'}`}
                   >
                     {l} Layers
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Cinematic Preview Area */}
        <div className="lg:col-span-8 bg-[#030303] border border-white/5 rounded-[4rem] p-20 min-h-[600px] flex items-center justify-center relative overflow-hidden group">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="absolute top-10 left-10 flex items-center gap-3 px-5 py-2.5 bg-zinc-900/50 rounded-full border border-white/5 backdrop-blur-md">
            <Sun size={14} className="text-sky-500 animate-pulse" />
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Studio Lighting: ON</span>
          </div>

          {/* Target Box */}
          <div 
            style={{ 
              width: '320px', 
              height: '320px', 
              boxShadow: generateShadow(),
              backgroundColor: '#ffffff',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="rounded-[3.5rem] flex items-center justify-center relative group/box overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-white" />
            <div className="relative z-10 flex flex-col items-center gap-3 opacity-20 group-hover/box:opacity-40 transition-opacity">
               <Box size={40} className="text-black" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Render Target</p>
            </div>
          </div>

          {/* CSS Code Tooltip */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
            <div className="bg-black/80 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active CSS Export</span>
              </div>
              <code className="text-[10px] text-sky-400 font-mono block break-all leading-relaxed opacity-80">
                {cssCode}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Smooth Dynamic Export ---
const DynamicShadow = dynamic(() => Promise.resolve(ShadowEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
      <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      <p className="animate-pulse text-sky-500 font-black tracking-[0.5em] uppercase text-[9px] italic">
        Rendering Depth Field...
      </p>
    </div>
  ),
});

export default function Page() {
  return (
    <main className="bg-[#050505] selection:bg-sky-500 selection:text-white">
      <DynamicShadow />
    </main>
  );
}
