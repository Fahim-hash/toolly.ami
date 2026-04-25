"use client";
import { useState, useRef } from 'react';
import { 
  Upload, Download, Settings2, ShieldCheck, 
  Type, ImageIcon, Trash2, RefreshCcw, Layers, Archive, 
  ArrowRightLeft, FileType, CheckCircle2, AlertCircle
} from 'lucide-react';
import JSZip from 'jszip'; 
import heic2any from "heic2any";

// --- Types ---
interface ToollyFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  processedUrl?: string;
}

export default function ToollyStudio() {
  const [activeTab, setActiveTab] = useState<'watermark' | 'converter'>('watermark');
  const [files, setFiles] = useState<ToollyFile[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  
  // Watermark Config
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [config, setConfig] = useState({
    text: 'Toolly Branded',
    scale: 15,
    position: 'bottom-right',
    opacity: 0.8,
  });

  // Converter Config
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('webp');

  // --- Handlers ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    setIsBusy(true);

    const processed = await Promise.all(uploaded.map(async (file) => {
      let currentFile = file;
      let previewUrl = "";

      if (file.name.toLowerCase().endsWith(".heic")) {
        try {
          const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
          const finalBlob = Array.isArray(blob) ? blob[0] : blob;
          currentFile = new File([finalBlob], file.name.replace(/\.heic/i, ".jpg"), { type: "image/jpeg" });
          previewUrl = URL.createObjectURL(finalBlob);
        } catch (err) { console.error("HEIC Error", err); }
      } else {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        id: Math.random().toString(36).substring(7),
        file: currentFile,
        preview: previewUrl,
        status: 'idle' as const
      };
    }));

    setFiles(prev => [...prev, ...processed]);
    setIsBusy(false);
  };

  const applyWatermark = async (fileObj: ToollyFile): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = fileObj.preview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(fileObj.preview);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.globalAlpha = config.opacity;
        const pad = canvas.width * 0.04;

        if (activeTab === 'watermark') {
          const fontSize = Math.floor(canvas.width * (config.scale / 300));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = "white"; // Simple auto-color logic removed for speed
          const textWidth = ctx.measureText(config.text).width;
          
          let x = pad, y = canvas.height - pad;
          if (config.position === 'center') {
            x = (canvas.width - textWidth) / 2;
            y = (canvas.height + fontSize) / 2;
          }
          ctx.fillText(config.text, x, y);
        }
        
        const finalFormat = activeTab === 'converter' ? `image/${targetFormat}` : 'image/png';
        resolve(canvas.toDataURL(finalFormat, 0.9));
      };
    });
  };

  const processAll = async () => {
    setIsBusy(true);
    const zip = new JSZip();
    
    for (const f of files) {
      const result = await applyWatermark(f);
      const base64Data = result.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
      zip.file(`toolly_${f.file.name.split('.')[0]}.${activeTab === 'converter' ? targetFormat : 'png'}`, base64Data, {base64: true});
    }

    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `toolly_batch_${Date.now()}.zip`;
    link.click();
    setIsBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-8 font-sans">
      {/* Premium Navbar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-600/20">
            <Layers className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">TOOLLY <span className="text-blue-600">STUDIO</span></h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em]">HSC-26 Creative Engine</p>
          </div>
        </div>

        <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
          <button onClick={() => {setActiveTab('watermark'); setFiles([]);}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'watermark' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Watermark</button>
          <button onClick={() => {setActiveTab('converter'); setFiles([]);}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'converter' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Converter</button>
        </div>

        <button 
          disabled={files.length === 0 || isBusy}
          onClick={processAll}
          className="px-8 py-4 bg-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 disabled:opacity-20 transition flex items-center gap-3"
        >
          {isBusy ? <RefreshCcw size={16} className="animate-spin" /> : <Archive size={16} />} 
          Export ZIP ({files.length})
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">Configuration</h2>
            
            {activeTab === 'watermark' ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase mb-3 block italic">Watermark Text</label>
                  <input type="text" value={config.text} onChange={(e)=>setConfig({...config, text: e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-xl p-4 text-sm outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase mb-3 block italic">Scale ({config.scale}%)</label>
                  <input type="range" min="5" max="50" value={config.scale} onChange={(e)=>setConfig({...config, scale: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-[9px] font-black text-zinc-600 uppercase mb-3 block italic">Target Format</label>
                {['webp', 'png', 'jpeg'].map((f) => (
                  <button key={f} onClick={() => setTargetFormat(f as any)} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase border transition ${targetFormat === f ? 'bg-blue-600/10 border-blue-600 text-blue-500' : 'bg-black/40 border-white/5 text-zinc-500'}`}>{f}</button>
                ))}
              </div>
            )}
            
            <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10 flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-500 mt-1" />
              <p className="text-[9px] text-zinc-500 leading-relaxed font-bold italic uppercase">HEIC files from iPhone will be automatically converted to JPG.</p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="lg:col-span-8">
          <div className="bg-[#080808] border border-white/5 rounded-[3rem] min-h-[600px] p-10 relative">
            {files.length === 0 ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center group">
                <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  <Upload size={32} className="text-blue-600" />
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Drop Assets Here</p>
                <input type="file" multiple className="hidden" onChange={handleUpload} />
              </label>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {files.map((f) => (
                  <div key={f.id} className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 group">
                    <img src={f.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-5">
                      <p className="text-[8px] font-black text-white uppercase truncate w-24">{f.file.name}</p>
                    </div>
                    {isBusy && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"><RefreshCcw className="animate-spin text-blue-500" /></div>}
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 transition-all">
                  <Upload size={20} className="text-zinc-600" />
                  <input type="file" multiple className="hidden" onChange={handleUpload} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
