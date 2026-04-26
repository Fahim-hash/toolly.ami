"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Layers, Copy, Check, 
  RotateCcw, Square, Box,
  Code2, Share2, Sun
} from 'lucide-react';

const ShadowEngine = () => {
  const [distance, setDistance] = useState(20);
  const [blur, setBlur] = useState(40);
  const [opacity, setOpacity] = useState(0.15);
  const [color, setColor] = useState('#000000');
  const [copied, setCopied] = useState(false);

  // Multi-layered shadow logic for premium "smooth" look
  const shadowValue = `
    0 ${distance * 0.2}px ${blur * 0.2}px rgba(0,0,0,${opacity * 0.5}),
    0 ${distance * 0.5}px ${blur * 0.5}px rgba(0,0,0,${opacity * 0.3}),
    0 ${distance}px ${blur}px rgba(0,0,0,${opacity})
  `.replace(/\s+/g, ' ').trim();

  const cssCode = `box-shadow: ${shadowValue};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-sky-600 rounded-3xl shadow-2xl shadow-sky-600/20 rotate-3">
            <Layers className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-100">
              Layer <span className="text-sky-500">Shadow</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Ambient Occlusion Engine</p>
          </div>
        </div>

        <button 
          onClick={copyToClipboard}
          className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl transition-transform active:scale-95"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />} 
          {copied ? 'Copied CSS!' : 'Copy Shadow Code'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/20 border border-white/5 rounded-[2rem] p-8 space-y-8">
            {/* Distance */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Distance: {distance}px</label>
                <button onClick={() => setDistance(20)}><RotateCcw size={14} className="text-zinc-600 hover:text-white" /></button>
              </div>
              <input 
                type="range" min="0" max="100" value={distance} 
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Blur */}
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Softness (Blur): {blur}px</label>
              <input 
                type="range" min="0" max="200" value={blur} 
                onChange={(e) => setBlur(parseInt(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Opacity */}
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Opacity: {Math.round(opacity * 100)}%</label>
              <input 
                type="range" min="0" max="1" step="0.01" value={opacity} 
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {/* CSS Snippet */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Code2 size={12} className="text-zinc-500" />
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Layered CSS</span>
              </div>
              <code className="text-[10px] text-sky-400 font-mono block leading-relaxed break-all">
                {cssCode}
              </code>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-[3rem] p-10 min-h-[500px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-sky-600/5 blur-[120px] rounded-full translate-x-1/2" />
          
          {/* Preview Box */}
          <div 
            style={{ 
              width: '240px', 
              height: '240px', 
              boxShadow: shadowValue,
              backgroundColor: '#ffffff',
              transition: 'all 0.1s ease-out'
            }}
            className="rounded-[2.5rem] flex items-center justify-center group relative border border-white/10"
          >
            <div className="text-zinc-200 font-black uppercase text-[10px] tracking-widest px-4 py-2 bg-black rounded-full">
              Preview Box
            </div>
          </div>

          <div className="absolute bottom-8 flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-white/5">
               <Sun size={12} className="text-sky-500" />
               <span className="text-[9px] font-bold text-zinc-500 uppercase italic tracking-widest">Dynamic Lighting</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SSR Prevention ---
const DynamicShadow = dynamic(() => Promise.resolve(ShadowEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-sky-600 font-black tracking-widest uppercase text-xs italic">
        Calculating Depth...
      </div>
    </div>
  ),
});

export default function Page() {
  return <DynamicShadow />;
}
