"use client";

import { useState } from 'react';
import { 
  Upload, Download, RefreshCcw, Zap, Info, 
  Copy, Check, FileCode, ChevronRight, Scissors, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SVGOptimizerClient() {
  const [originalSvg, setOriginalSvg] = useState<string | null>(null);
  const [optimizedSvg, setOptimizedSvg] = useState<string | null>(null);
  const [stats, setStats] = useState<{ original: number; optimized: number } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/svg+xml" || file.name.endsWith('.svg'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgContent = event.target?.result as string;
        processSvg(svgContent);
      };
      reader.readAsText(file);
    }
  };

  const processSvg = (svg: string) => {
    setOriginalSvg(svg);

    // Using RegExp constructors to avoid Turbopack comment parsing errors
    const optimized = svg
      .replace(new RegExp('<\\?xml.*\\?>', 'gi'), '')      // Remove XML header
      .replace(new RegExp('', 'g'), '')   // Remove comments safely
      .replace(new RegExp('<!DOCTYPE.*?>', 'gi'), '')      // Remove doctype
      .replace(/\s+/g, ' ')                                // Collapse whitespace
      .replace(/>\s+</g, '><')                             // Remove whitespace between tags
      .replace(/id="[^"]*"/gi, '')                         // Remove IDs
      .replace(/version="[^"]*"/gi, '')                    // Remove version
      .replace(/xmlns:xlink="[^"]*"/gi, '')                // Remove namespaces
      .replace(/xml:space="[^"]*"/gi, '')
      .trim();

    setOptimizedSvg(optimized);
    setStats({
      original: new Blob([svg]).size,
      optimized: new Blob([optimized]).size,
    });
  };

  const copyToClipboard = () => {
    if (optimizedSvg) {
      navigator.clipboard.writeText(optimizedSvg);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const downloadSvg = () => {
    if (!optimizedSvg) return;
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `toolly-clean-${Date.now()}.svg`;
    link.href = url;
    link.click();
  };

  const savings = stats ? Math.round(((stats.original - stats.optimized) / stats.original) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Zap size={14} fill="currentColor" /> Toolly Core
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            SVG<span className="text-emerald-500">Optimizer</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-widest text-emerald-400/60 italic">Precision Pruning Engine</p>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={() => {setOriginalSvg(null); setOptimizedSvg(null); setStats(null);}} 
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all active:rotate-180 duration-500"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            disabled={!optimizedSvg}
            onClick={downloadSvg}
            className="px-8 py-4 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center gap-2 hover:bg-emerald-500 transition-all disabled:opacity-30"
          >
            <Download size={20} /> Export Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Card: Input & Analysis */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-[3rem] p-8 shadow-2xl">
            <div className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-8">
              <FileCode size={16} className="text-emerald-500" /> Source Vector
            </div>

            {!originalSvg ? (
              <label className="flex flex-col items-center cursor-pointer py-24 border-2 border-dashed border-zinc-800 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group">
                <input type="file" className="hidden" accept=".svg" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={28} />
                </div>
                <h3 className="text-white font-black uppercase text-sm italic tracking-tighter">Import SVG</h3>
                <p className="text-zinc-600 text-[10px] uppercase font-bold mt-1 tracking-widest italic">Fast & Private</p>
              </label>
            ) : (
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-5 bg-black/40 border border-zinc-800 rounded-3xl font-mono text-[11px]">
                    <div>
                      <p className="text-zinc-600 mb-1 tracking-widest">RAW</p>
                      <p className="text-lg font-black text-zinc-400 italic">{(stats!.original / 1024).toFixed(2)} KB</p>
                    </div>
                    <ChevronRight className="text-zinc-800" />
                    <div className="text-right">
                      <p className="text-emerald-500 mb-1 tracking-widest uppercase font-black">Clean</p>
                      <p className="text-xl font-black text-white italic">{(stats!.optimized / 1024).toFixed(2)} KB</p>
                    </div>
                 </div>

                 <div className="relative h-48 bg-emerald-600/5 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/10 overflow-hidden shadow-inner group">
                    <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-[3s]" dangerouslySetInnerHTML={{ __html: originalSvg }} />
                    <div className="text-center relative z-10">
                       <span className="text-6xl font-black italic text-emerald-500 tracking-tighter italic">-{savings}%</span>
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200/40 mt-1 italic">Payload Purged</p>
                    </div>
                 </div>

                 <button 
                  onClick={copyToClipboard}
                  className="w-full py-5 bg-zinc-800 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg border border-white/5"
                 >
                   {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                   {isCopied ? 'Copied' : 'Copy XML'}
                 </button>
              </div>
            )}
          </div>

          <div className="p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl flex gap-4">
             <Info className="text-emerald-500 shrink-0" size={20} />
             <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider leading-relaxed italic">
               Metadata and editor-specific attributes are stripped <span className="text-emerald-400">instantly</span> in your browser.
             </p>
          </div>
        </div>

        {/* Right Card: Output */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-950 border-2 border-zinc-900 rounded-[3.5rem] h-full min-h-[550px] overflow-hidden flex flex-col shadow-2xl relative">
             <div className="p-10 font-mono text-[12px] leading-relaxed overflow-auto text-emerald-400/60 custom-scrollbar scrollbar-thin scrollbar-thumb-zinc-800">
                <AnimatePresence mode="wait">
                  {optimizedSvg ? (
                    <motion.pre 
                      key="code"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="whitespace-pre-wrap break-all"
                    >
                      {optimizedSvg}
                    </motion.pre>
                  ) : (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}
                      className="h-full flex flex-col items-center justify-center text-zinc-500 select-none"
                    >
                      <Scissors size={80} className="mb-6 stroke-[1px]" />
                      <p className="uppercase font-black tracking-[0.5em] text-sm italic">Code Buffer</p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}