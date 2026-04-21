"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, Settings2, Trash2, Maximize, 
  RefreshCcw, FileType, CheckCircle2, AlertCircle, 
  Gauge, Info, Layers, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression'; // Install using: npm install browser-image-compression

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function ImageCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Configuration State
  const [config, setConfig] = useState({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'auto',
    initialQuality: 0.8
  });

  // Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressedFile(null);
      setCompressedUrl(null);
      setProgress(0);
    }
  };

  // Compression Logic
  const handleCompress = async () => {
    if (!selectedFile) return;
    setIsCompressing(true);
    setProgress(10);

    try {
      const options = {
        maxSizeMB: config.maxSizeMB,
        maxWidthOrHeight: config.maxWidthOrHeight,
        useWebWorker: config.useWebWorker,
        onProgress: (p: number) => setProgress(p),
        initialQuality: config.initialQuality
      };

      const compressed = await imageCompression(selectedFile, options);
      setCompressedFile(compressed);
      setCompressedUrl(URL.createObjectURL(compressed));
      setProgress(100);
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  // UI Reset
  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompressedFile(null);
    setCompressedUrl(null);
    setProgress(0);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-purple-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Zap size={14} fill="currentColor" /> Premium Tool
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            Image<span className="text-purple-600">Shrink</span> <span className="text-zinc-800">Pro</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Lossless compression with local privacy.</p>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={resetAll}
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <RefreshCcw size={20} className={isCompressing ? "animate-spin" : ""} />
          </button>
          
          {compressedUrl && (
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.download = `compressed-${selectedFile?.name}`;
                link.href = compressedUrl;
                link.click();
              }}
              className="px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20 active:scale-95"
            >
              <Download size={20} /> Download Result
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: SETTINGS PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                    <Settings2 size={16} className="text-purple-500" /> Compression Config
                </div>
                {isCompressing && <span className="text-purple-500 font-black text-xs animate-pulse">{progress}%</span>}
            </div>

            {/* Quality Slider */}
            <div className="space-y-6">
              <div className="group">
                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500 mb-4 tracking-tighter">
                  <span>Target Max Size</span>
                  <span className="text-purple-500">{config.maxSizeMB} MB</span>
                </div>
                <input 
                  type="range" min="0.1" max="5" step="0.1"
                  value={config.maxSizeMB} 
                  onChange={(e) => setConfig({...config, maxSizeMB: parseFloat(e.target.value)})}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600" 
                />
              </div>

              <div className="group">
                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500 mb-4 tracking-tighter">
                  <span>Resolution Scale</span>
                  <span className="text-purple-500">{config.maxWidthOrHeight}px</span>
                </div>
                <select 
                   value={config.maxWidthOrHeight}
                   onChange={(e) => setConfig({...config, maxWidthOrHeight: parseInt(e.target.value)})}
                   className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold text-zinc-300 outline-none focus:border-purple-600 transition"
                >
                    <option value={1080}>1080p (Standard)</option>
                    <option value={1920}>2K (Professional)</option>
                    <option value={3840}>4K (Ultra HD)</option>
                    <option value={10000}>Original Scale</option>
                </select>
              </div>
            </div>

            {/* Performance Toggle */}
            <div className="pt-4 border-t border-zinc-800/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Gauge size={16} className="text-zinc-600" />
                        <span className="text-xs font-bold text-zinc-400">High Quality Mode</span>
                    </div>
                    <div className="w-10 h-5 bg-purple-600/20 rounded-full relative cursor-pointer border border-purple-600/30">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    </div>
                </div>
            </div>

            <button 
              disabled={!selectedFile || isCompressing}
              onClick={handleCompress}
              className="w-full py-5 bg-zinc-100 text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg active:scale-[0.98]"
            >
              {isCompressing ? 'Processing Assets...' : 'Optimize Image'}
            </button>
          </div>

          {/* Privacy Note */}
          <div className="bg-purple-600/5 border border-purple-500/10 rounded-3xl p-6 flex gap-4">
            <div className="text-purple-500 shrink-0"><Info size={24} /></div>
            <div>
                <p className="text-xs font-bold text-purple-200 uppercase mb-1">Local Processing</p>
                <p className="text-[10px] leading-relaxed text-zinc-500 font-medium">Your images are never sent to a server. We use client-side workers to handle heavy lifting in your browser.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: COMPARISON CANVAS */}
        <div className="lg:col-span-8 space-y-6">
          {!previewUrl ? (
            <label className="group relative min-h-[500px] bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/40 hover:border-purple-500/50 transition-all duration-500">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="w-24 h-24 bg-purple-600/10 text-purple-500 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <Upload size={40} />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Import Design Asset</h2>
              <p className="text-zinc-600 font-medium mt-2">Drag & drop or browse your files</p>
            </label>
          ) : (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Asset */}
                    <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Original</span>
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded-lg">
                                {formatBytes(selectedFile?.size || 0)}
                            </span>
                        </div>
                        <div className="aspect-square rounded-2xl overflow-hidden bg-black/40 relative">
                            <img src={previewUrl} className="w-full h-full object-contain" alt="Original" />
                        </div>
                    </div>

                    {/* Compressed Asset */}
                    <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-[2rem] space-y-4 relative overflow-hidden">
                        {isCompressing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                <span className="text-xs font-black uppercase tracking-tighter text-purple-500">Shrinking...</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 italic">Optimized</span>
                            {compressedFile && (
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                                        -{Math.round(((selectedFile?.size || 0) - compressedFile.size) / (selectedFile?.size || 1) * 100)}%
                                    </span>
                                    <span className="text-[10px] font-bold text-white bg-purple-600 px-2 py-1 rounded-lg">
                                        {formatBytes(compressedFile.size)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="aspect-square rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
                            {compressedUrl ? (
                                <img src={compressedUrl} className="w-full h-full object-contain animate-in fade-in duration-700" alt="Compressed" />
                            ) : (
                                <div className="text-center p-8">
                                    <AlertCircle size={32} className="mx-auto text-zinc-800 mb-2" />
                                    <p className="text-[10px] font-bold text-zinc-700 uppercase">Awaiting Optimization</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Technical Stats Footer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Input Format', value: selectedFile?.type.split('/')[1].toUpperCase(), icon: FileType },
                        { label: 'Color Profile', value: 'sRGB / 8-bit', icon: Layers },
                        { label: 'Scale Factor', value: config.maxWidthOrHeight + 'px', icon: Maximize },
                        { label: 'Status', value: compressedUrl ? 'Ready' : 'Pending', icon: CheckCircle2 }
                    ].map((stat, i) => (
                        <div key={i} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 mb-1">
                                <stat.icon size={14} className="text-zinc-600" />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{stat.label}</span>
                            </div>
                            <div className="text-xs font-black text-zinc-300 italic">{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}