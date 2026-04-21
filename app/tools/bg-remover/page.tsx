"use client";

import { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { 
  Upload, X, Eraser, Sparkles, 
  Download, RefreshCcw, ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackgroundRemover() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      // Configuration fixed for TypeScript compatibility
      const config: any = {
        model: "isnet", // Standard model supported by the library
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          setProgress(percent);
        },
      };

      const blob = await removeBackground(file, config);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (error) {
      console.error("BG Removal Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "toolly-bg-removed.png";
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-zinc-900 pb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Eraser size={14} fill="currentColor" /> AI Visual Lab
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
            BG<span className="text-emerald-500">Remover</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-widest text-emerald-400/60 italic">Neural Object Isolation</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {!image ? (
              <label className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-[2.5rem] cursor-pointer hover:border-emerald-500/30 transition-all group">
                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                <div className="w-16 h-16 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={28} />
                </div>
                <h3 className="text-white font-black uppercase text-xs italic tracking-tighter">Upload Original</h3>
              </label>
            ) : (
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-950">
                <img src={image} alt="Original" className="w-full h-full object-contain" />
                <button 
                  onClick={() => {setImage(null); setProcessedImage(null);}}
                  className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border-2 border-zinc-900 rounded-[3rem] aspect-square flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24">
                   <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                   <div 
                    className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" 
                    style={{ animationDuration: '0.6s' }}
                   />
                   <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-emerald-500 italic">
                    {progress}%
                   </div>
                </div>
                <p className="text-emerald-500 font-black uppercase text-[9px] tracking-[0.4em] animate-pulse italic">Neural Processing...</p>
              </div>
            ) : processedImage ? (
              <>
                <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] opacity-10" />
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  src={processedImage} 
                  className="relative z-10 w-full h-full object-contain p-8" 
                />
                <div className="absolute bottom-8 flex gap-4 z-20">
                   <button 
                    onClick={downloadImage}
                    className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl"
                   >
                     <Download size={16} /> Save Alpha
                   </button>
                   <button 
                    onClick={() => image && processImage(new File([], ""))} // Simplified re-trigger logic
                    className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl hover:text-white transition-all"
                   >
                     <RefreshCcw size={18} />
                   </button>
                </div>
              </>
            ) : (
              <div className="text-center opacity-10 flex flex-col items-center">
                 <ImageIcon size={80} className="mb-4 stroke-[1px]" />
                 <p className="font-black uppercase tracking-[0.5em] text-xs italic">Awaiting AI Isolation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
