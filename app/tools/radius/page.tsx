"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Contrast, Copy, Check, 
  RotateCcw, Square, Layers, 
  Code2, Share2
} from 'lucide-react';

const RadiusEngine = () => {
  const [radius, setRadius] = useState(40);
  const [isSmooth, setIsSmooth] = useState(true);
  const [copied, setCopied] = useState(false);

  // Smooth Corner (Squircle) Approximation
  const borderRadiusStyle = isSmooth 
    ? { borderRadius: `${radius}px`, maskImage: `paint(smooth-corners)`, WebkitMaskImage: `radial-gradient(circle at center, black 100%, transparent 100%)` } 
    : { borderRadius: `${radius}px` };

  const cssCode = `border-radius: ${radius}px;${isSmooth ? '\n/* Apple-style Smooth Corners (Visual Simulation) */\nmask-image: smooth-corners;' : ''}`;

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
          <div className="p-4 bg-violet-600 rounded-3xl shadow-2xl shadow-violet-600/20 rotate-3">
            <Contrast className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-100">
              Radius <span className="text-violet-500">Studio</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Smooth Corner Engine</p>
          </div>
        </div>

        <button 
          onClick={copyToClipboard}
          className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl transition-transform active:scale-95"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />} 
          {copied ? 'Copied CSS!' : 'Copy CSS Code'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/20 border border-white/5 rounded-[2rem] p-8 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Radius: {radius}px</label>
                <button onClick={() => setRadius(40)}><RotateCcw size={14} className="text-zinc-600 hover:text-white" /></button>
              </div>
              <input 
                type="range" min="0" max="200" value={radius} 
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
               <button 
                 onClick={() => setIsSmooth(!isSmooth)}
                 className={`w-full py-4 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between px-6 border ${isSmooth ? 'bg-violet-600/10 border-violet-500 text-violet-500' : 'bg-black border-white/5 text-zinc-600'}`}
               >
                 Smooth Corners (iOS)
                 <div className={`w-2 h-2 rounded-full ${isSmooth ? 'bg-violet-500 animate-pulse' : 'bg-zinc-800'}`} />
               </button>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={12} className="text-zinc-500" />
                <span className="text-[9px] font-black text-zinc-600 uppercase">CSS Snippet</span>
              </div>
              <code className="text-[11px] text-violet-400 font-mono block leading-relaxed">
                {cssCode.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </code>
            </div>
          </div>
        </div>

        {/* Visual Preview Area */}
        <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-[3rem] p-10 min-h-[500px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-600/5 blur-[120px] rounded-full translate-x-1/2" />
          
          <div 
            style={{ 
              width: '280px', 
              height: '280px', 
              borderRadius: `${radius}px`,
              transition: 'border-radius 0.3s ease-out'
            }}
            className="bg-gradient-to-br from-violet-600 to-indigo-900 shadow-2xl shadow-violet-600/20 border border-white/10 flex items-center justify-center group relative"
          >
            <div className="absolute inset-4 border border-white/5 rounded-[inherit] opacity-20" />
            <Layers className="text-white/20 group-hover:scale-110 transition-transform duration-500" size={60} />
          </div>

          <div className="absolute bottom-8 flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-white/5">
               <Square size={12} className="text-violet-500" />
               <span className="text-[9px] font-bold text-zinc-500 uppercase italic">Preview 1:1 Aspect</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DynamicRadius = dynamic(() => Promise.resolve(RadiusEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-violet-600 font-black tracking-widest uppercase text-xs italic">
        Warping Corners...
      </div>
    </div>
  ),
});

export default function Page() {
  return <DynamicRadius />;
}
