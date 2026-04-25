"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Upload, Sparkles, Download, 
  Trash2, RefreshCw, Maximize2, 
  ShieldCheck, Zap 
} from 'lucide-react';
import JSZip from 'jszip';

// --- Client-Side Engine Component ---
const UpscalerEngine = () => {
  const [files, setFiles] = useState<{id: string, file: File, preview: string}[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(2);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    const newFiles = uploaded.map(file => ({
      id: Math.random().toString(36).substring(7),
      file: file,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const upscaleImage = async (filePreview: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = filePreview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(filePreview);

        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        // AI-like High Quality Smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png', 1.0));
      };
    });
  };

  const runUpscale = async () => {
    setIsBusy(true);
    const zip = new JSZip();
    
    for (const f of files) {
      const result = await upscaleImage(f.preview);
      zip.file(`HD_${f.file.name.split('.')[0]}.png`, result.split(',')[1], {base64: true});
    }

    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `Toolly_HD_Pack_${Date.now()}.zip`;
    link.click();
    setIsBusy(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-600/20 rotate-3">
            <Sparkles className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">
              HD <span className="text-emerald-500">Upscaler</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Precision Pixel Enhancer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-black p-1 rounded-2xl border border-white/5">
            {[2, 4].map((f) => (
              <button key={f} onClick={() => setScaleFactor(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black transition ${scaleFactor === f ? 'bg-emerald-600 text-white' : 'text-zinc-600'}`}>{f}X</button>
            ))}
          </div>
          <button 
            disabled={files.length === 0 || isBusy}
            onClick={runUpscale}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 flex items-center gap-3"
          >
            {isBusy ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />} Export ZIP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900/20 border border-white/5 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-3 text-zinc-500">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Bilinear Ultra-Smooth</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500">
              <Maximize2 size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-tighter">HD Output {scaleFactor}X</span>
            </div>
          </div>
          {files.length > 0 && (
            <button onClick={() => setFiles([])} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase text-red-500/50 hover:text-red-500 border border-white/5">Clear All</button>
          )}
        </div>

        <div className="lg:col-span-9 bg-[#080808] border border-white/5 rounded-[3rem] p-10 min-h-[500px] relative">
          {files.length === 0 ? (
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
              <Upload size={32} className="text-emerald-600 mb-4" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Upload Assets to Upscale</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {files.map((f) => (
                <div key={f.id} className="aspect-square bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5">
                  <img src={f.preview} className="w-full h-full object-cover opacity-60" alt="preview" />
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center cursor-pointer hover:bg-emerald-600/5 transition">
                <Upload size={20} className="text-zinc-700" />
                <input type="file" multiple className="hidden" onChange={handleUpload} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Dynamic Export to prevent SSR issues ---
const DynamicUpscaler = dynamic(() => Promise.resolve(UpscalerEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-emerald-600 font-black tracking-widest uppercase text-xs italic">
        Booting HD Engine...
      </div>
    </div>
  ),
});

export default function Page() {
  return <DynamicUpscaler />;
}
