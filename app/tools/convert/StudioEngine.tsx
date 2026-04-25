// app/components/StudioEngine.tsx
"use client";
import { useState } from 'react';
import { 
  Upload, Download, Layers, Archive, RefreshCcw, 
  Type, ImageIcon, Trash2, AlertCircle 
} from 'lucide-react';
import JSZip from 'jszip'; 
import heic2any from "heic2any";

interface ToollyFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'done' | 'error';
}

export default function StudioEngine() {
  const [activeTab, setActiveTab] = useState<'watermark' | 'converter'>('watermark');
  const [files, setFiles] = useState<ToollyFile[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [config, setConfig] = useState({ text: 'Toolly Branded', scale: 15 });
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('webp');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof window === 'undefined') return;
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
        } catch (err) { console.error(err); }
      } else {
        previewUrl = URL.createObjectURL(file);
      }
      return { id: Math.random().toString(36).substring(7), file: currentFile, preview: previewUrl, status: 'idle' as const };
    }));

    setFiles(prev => [...prev, ...processed]);
    setIsBusy(false);
  };

  const processAndDownload = async () => {
    if (typeof window === 'undefined') return;
    setIsBusy(true);
    const zip = new JSZip();
    
    for (const f of files) {
      const result = await new Promise<string>((resolve) => {
        const img = new Image();
        img.src = f.preview;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(f.preview);
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          if (activeTab === 'watermark') {
            const fontSize = Math.floor(canvas.width * (config.scale / 300));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = "white";
            ctx.fillText(config.text, canvas.width * 0.04, canvas.height - (canvas.width * 0.04));
          }
          const format = activeTab === 'converter' ? `image/${targetFormat}` : 'image/png';
          resolve(canvas.toDataURL(format, 0.9));
        };
      });
      zip.file(`toolly_${f.file.name.split('.')[0]}.${activeTab === 'converter' ? targetFormat : 'png'}`, result.split(',')[1], {base64: true});
    }

    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `toolly_studio_${Date.now()}.zip`;
    link.click();
    setIsBusy(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/5 pb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20"><Layers className="text-white" /></div>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">TOOLLY <span className="text-blue-600">STUDIO</span></h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em]">HSC-26 Creative Engine</p>
          </div>
        </div>
        <div className="flex bg-zinc-900/50 p-1.5 rounded-xl border border-white/5">
          <button onClick={() => setActiveTab('watermark')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'watermark' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>Watermark</button>
          <button onClick={() => setActiveTab('converter')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'converter' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>Converter</button>
        </div>
        <button disabled={files.length === 0 || isBusy} onClick={processAndDownload} className="px-8 py-4 bg-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-20 flex items-center gap-3">
          {isBusy ? <RefreshCcw size={16} className="animate-spin" /> : <Archive size={16} />} Export ZIP ({files.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Settings</h2>
            {activeTab === 'watermark' ? (
              <div className="space-y-4">
                <input type="text" value={config.text} onChange={(e)=>setConfig({...config, text: e.target.value})} className="w-full bg-black border border-white/5 rounded-lg p-3 text-sm" placeholder="Watermark Text" />
                <input type="range" min="5" max="50" value={config.scale} onChange={(e)=>setConfig({...config, scale: parseInt(e.target.value)})} className="w-full accent-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {['webp', 'png', 'jpeg'].map((f) => (
                  <button key={f} onClick={() => setTargetFormat(f as any)} className={`py-3 rounded-lg text-[10px] font-black uppercase border ${targetFormat === f ? 'border-blue-600 text-blue-500' : 'border-white/5 text-zinc-500'}`}>{f}</button>
                ))}
              </div>
            )}
            <div className="p-4 bg-blue-600/5 rounded-xl border border-blue-600/10 flex gap-3 italic text-[9px] text-zinc-500 uppercase font-bold">
              <AlertCircle size={14} className="text-blue-500" /> HEIC/iPhone Support Active
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-[2.5rem] p-10 min-h-[500px] relative">
          {files.length === 0 ? (
            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center">
              <Upload size={32} className="text-blue-600 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Upload Assets</p>
              <input type="file" multiple className="hidden" onChange={handleUpload} />
            </label>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {files.map((f) => (
                <div key={f.id} className="aspect-square rounded-2xl overflow-hidden border border-white/5 relative bg-zinc-900">
                  <img src={f.preview} className="w-full h-full object-cover opacity-70" alt="preview" />
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-900">
                <Upload size={20} className="text-zinc-600" />
                <input type="file" multiple className="hidden" onChange={handleUpload} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
