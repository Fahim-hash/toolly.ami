"use client";
import { useState } from 'react';
import { 
  Upload, Download, ArrowRightLeft, 
  Trash2, RefreshCcw, FileType, CheckCircle2 
} from 'lucide-react';
import JSZip from 'jszip'; 
import heic2any from "heic2any";

interface ConvFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'done';
}

export default function StudioEngine() {
  const [files, setFiles] = useState<ConvFile[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('webp');

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
          const format = `image/${targetFormat}`;
          resolve(canvas.toDataURL(format, 0.9));
        };
      });
      zip.file(`converted_${f.file.name.split('.')[0]}.${targetFormat}`, result.split(',')[1], {base64: true});
    }

    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `Toolly_Converted_${Date.now()}.zip`;
    link.click();
    setIsBusy(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
            <ArrowRightLeft className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic text-zinc-200">
            Format <span className="text-indigo-500">Shift</span>
          </h1>
        </div>
        
        <button 
          disabled={files.length === 0 || isBusy} 
          onClick={processAndDownload} 
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-20 flex items-center gap-2"
        >
          {isBusy ? <RefreshCcw size={14} className="animate-spin" /> : <Download size={14} />}
          Download All (ZIP)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">Target Format</p>
          <div className="flex flex-col gap-2">
            {(['webp', 'png', 'jpeg'] as const).map((fmt) => (
              <button 
                key={fmt} 
                onClick={() => setTargetFormat(fmt)}
                className={`py-4 rounded-xl text-[10px] font-black uppercase border transition-all flex justify-between px-6 items-center ${targetFormat === fmt ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-black border-white/5 text-zinc-500'}`}
              >
                {fmt === 'jpeg' ? 'JPG' : fmt}
                {targetFormat === fmt && <CheckCircle2 size={14} />}
              </button>
            ))}
          </div>
          {files.length > 0 && (
            <button onClick={() => setFiles([])} className="w-full py-4 rounded-xl text-[10px] font-black uppercase text-red-500/60 hover:text-red-500 border border-white/5 mt-4 transition-all flex items-center justify-center gap-2">
              <Trash2 size={14} /> Clear List
            </button>
          )}
        </div>

        {/* Upload/Grid Area */}
        <div className="lg:col-span-3 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 min-h-[500px]">
          {files.length === 0 ? (
            <label className="h-full w-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-white/5 rounded-[2rem] hover:bg-indigo-600/[0.02] transition-all">
              <Upload size={32} className="text-zinc-700 mb-4" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Drop Images / Select Files</p>
              <input type="file" multiple accept="image/*,.heic" className="hidden" onChange={handleUpload} />
            </label>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((f) => (
                <div key={f.id} className="aspect-square bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5 relative group">
                  <img src={f.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
              <label className="aspect-square flex items-center justify-center cursor-pointer border-2 border-dashed border-white/5 rounded-2xl hover:bg-indigo-600/10">
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
