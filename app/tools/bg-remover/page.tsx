"use client";

import { useState } from 'react';
import { 
  Upload, Download, RefreshCcw, 
  Zap, Info, Loader2, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { removeBackground } from '@imgly/background-removal';

export default function BGRemover() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRemoveBG = async (file: File) => {
    setLoading(true);
    setProgress(0);
    try {
      // Configuration for faster processing
      const config = {
        model: 'small' as const, // Uses a lighter model for speed
        progress: (key: string, current: number, total: number) => {
          const p = Math.round((current / total) * 100);
          setProgress(p);
        }
      };

      const blob = await removeBackground(file, config);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (error) {
      console.error("AI Error:", error);
      alert("Something went wrong. Try a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setProcessedImage(null);
      handleRemoveBG(file);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.download = `toolly-fast-bg-${Date.now()}.png`;
    link.href = processedImage;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Zap size={14} fill="currentColor" /> Toolly AI Engine
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            BG<span className="text-blue-500">Remover</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-widest text-blue-400/60">Fast-Inference Mode Active</p>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={() => {setImage(null); setProcessedImage(null); setProgress(0);}} 
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all active:rotate-180"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            disabled={!processedImage}
            onClick={downloadImage}
            className="px-8 py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-30 disabled:grayscale"
          >
            <Download size={20} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Input Card */}
        <div className="space-y-4">
          <div className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 ml-4">
            <ImageIcon size={14} /> Source Canvas
          </div>
          <div className="relative aspect-square bg-zinc-950 border-2 border-zinc-900 rounded-[3.5rem] flex items-center justify-center overflow-hidden group">
            {!image ? (
              <label className="flex flex-col items-center cursor-pointer p-20 w-full h-full">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={32} />
                </div>
                <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Import Asset</h2>
              </label>
            ) : (
              <div className="relative w-full h-full p-10 flex items-center justify-center">
                <img src={image} className="max-w-full max-h-full object-contain rounded-2xl opacity-40 grayscale blur-[1px]" alt="Source" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white tracking-widest uppercase">Original</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Card */}
        <div className="space-y-4">
          <div className="text-blue-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 ml-4">
            <Sparkles size={14} /> Neural Result
          </div>
          <div className="relative aspect-square bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-zinc-900 border-2 border-blue-500/30 rounded-[3.5rem] flex items-center justify-center overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <Loader2 size={64} className="text-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-400">
                      {progress}%
                    </div>
                  </div>
                  <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Isolating...</p>
                </motion.div>
              ) : processedImage ? (
                <motion.img 
                  key="result"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={processedImage} 
                  className="w-full h-full object-contain p-10 drop-shadow-2xl" 
                  alt="Result" 
                />
              ) : (
                <div className="text-zinc-800 font-black uppercase tracking-widest text-[10px]">Awaiting Input</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-12 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20 shadow-lg shadow-blue-500/5">
          <Info className="text-blue-500" size={28} />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-white font-black uppercase text-xs tracking-widest">Optimized for HSC 26 Designers</h4>
          <p className="text-zinc-500 text-[11px] font-medium leading-relaxed max-w-3xl italic">
            Speed optimize korar jonno amra lighter neural network use korchi. Prothom bar model-ta download hote ektu somoy nite pare, kintu tarpor theke offline-ei instant kaaj korbe. Privacy thakbe 100% secure.
          </p>
        </div>
      </div>
    </div>
  );
}