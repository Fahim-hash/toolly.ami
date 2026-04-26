"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Upload, ImageIcon, Download, 
  Trash2, RefreshCw, Box, 
  Globe, Smartphone, CheckCircle2 
} from 'lucide-react';
import JSZip from 'jszip';

const FaviconEngine = () => {
  const [file, setFile] = useState<{file: File, preview: string} | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile({
        file: uploaded,
        preview: URL.createObjectURL(uploaded)
      });
    }
  };

  const generateIcons = async () => {
    if (!file) return;
    setIsBusy(true);
    const zip = new JSZip();

    for (const s of sizes) {
      const dataUrl = await new Promise<string>((resolve) => {
        const img = new Image();
        img.src = file.preview;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = s.size;
          canvas.height = s.size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, s.size, s.size);
          }
          resolve(canvas.toDataURL('image/png'));
        };
      });
      zip.file(s.name, dataUrl.split(',')[1], {base64: true});
    }

    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `Toolly_Favicon_Pack.zip`;
    link.click();
    setIsBusy(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-red-600 rounded-3xl shadow-2xl shadow-red-600/20 rotate-3">
            <ImageIcon className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">
              Favicon <span className="text-red-500">Generator</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Universal Asset Packager</p>
          </div>
        </div>

        <button 
          disabled={!file || isBusy}
          onClick={generateIcons}
          className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 flex items-center gap-3 shadow-xl"
        >
          {isBusy ? <RefreshCw className="animate-spin" size={16} /> : <Box size={16} />} 
          Generate ZIP Pack
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/20 border border-white/5 rounded-[2rem] p-8 space-y-6">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Included Sizes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-zinc-500">
                <span className="flex items-center gap-2"><Globe size={14} className="text-red-500" /> Web (16x16, 32x32)</span>
                <CheckCircle2 size={14} className="text-zinc-700" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-zinc-500">
                <span className="flex items-center gap-2"><Smartphone size={14} className="text-red-500" /> Mobile (180x180+)</span>
                <CheckCircle2 size={14} className="text-zinc-700" />
              </div>
            </div>
            {file && (
              <button onClick={() => setFile(null)} className="w-full py-4 rounded-xl text-[9px] font-black uppercase text-red-500/50 hover:text-red-500 border border-white/5 transition-all">
                Remove Image
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-[3rem] p-10 min-h-[500px] relative">
          {!file ? (
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload size={30} className="text-red-600" />
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Drop Square Image</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-8">
               <div className="relative group">
                  <div className="absolute inset-0 bg-red-600/20 blur-[60px] rounded-full" />
                  <img src={file.preview} className="w-48 h-48 rounded-3xl object-cover border-4 border-white/10 relative z-10" alt="Preview" />
               </div>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic bg-zinc-900 px-6 py-2 rounded-full border border-white/5">
                 Ready to Pack: {file.file.name}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DynamicFavicon = dynamic(() => Promise.resolve(FaviconEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-red-600 font-black tracking-widest uppercase text-xs italic">
        Loading Packager...
      </div>
    </div>
  ),
});

export default function Page() {
  return <DynamicFavicon />;
}
