"use client";
import { useState, useCallback } from 'react';
import { 
  Upload, Trash2, RefreshCcw, Layers, Sparkles, 
  ImageIcon, Sun, Moon, X, Download, MousePointer2 
} from 'lucide-react';
import JSZip from 'jszip'; 

// --- Types ---
interface BulkImage {
  id: string;
  url: string;
  name: string;
  customColor: 'white' | 'black'; // Individual logo color control
}

interface Config {
  scale: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
}

export default function ToollyArmor() {
  const [images, setImages] = useState<BulkImage[]>([]);
  const [logoBlack, setLogoBlack] = useState<string | null>(null);
  const [logoWhite, setLogoWhite] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [globalConfig, setGlobalConfig] = useState<Config>({
    scale: 15,
    position: 'bottom-right',
    opacity: 0.9,
  });

  // --- Handlers ---
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
      customColor: 'white' as const
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const toggleLogoColor = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, customColor: img.customColor === 'white' ? 'black' : 'white' } : img
    ));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // --- Core Processing Logic ---
  const processImage = async (imgObj: BulkImage): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imgObj.url);

      const mainImg = new Image();
      mainImg.src = imgObj.url;

      mainImg.onload = () => {
        canvas.width = mainImg.width;
        canvas.height = mainImg.height;
        ctx.drawImage(mainImg, 0, 0);

        const selectedLogoSrc = imgObj.customColor === 'black' ? logoBlack : logoWhite;
        if (!selectedLogoSrc) return resolve(canvas.toDataURL('image/png'));

        const logoImg = new Image();
        logoImg.src = selectedLogoSrc;

        logoImg.onload = () => {
          const pad = canvas.width * 0.04;
          const targetW = canvas.width * (globalConfig.scale / 100);
          const aspect = logoImg.width / logoImg.height;
          const targetH = targetW / aspect;

          let x = pad, y = pad;
          const pos = globalConfig.position;

          if (pos === 'top-right') x = canvas.width - targetW - pad;
          if (pos === 'bottom-left') y = canvas.height - targetH - pad;
          if (pos === 'bottom-right') {
            x = canvas.width - targetW - pad;
            y = canvas.height - targetH - pad;
          }
          if (pos === 'center') {
            x = (canvas.width - targetW) / 2;
            y = (canvas.height - targetH) / 2;
          }

          ctx.globalAlpha = globalConfig.opacity;
          ctx.drawImage(logoImg, x, y, targetW, targetH);
          resolve(canvas.toDataURL('image/png'));
        };
      };
    });
  };

  const generateZip = async () => {
    if (!logoBlack && !logoWhite) return alert("Please upload at least one logo variant!");
    setIsProcessing(true);
    const zip = new JSZip();

    for (const img of images) {
      const dataUrl = await processImage(img);
      const base64Data = dataUrl.split(',')[1];
      zip.file(`toolly_${img.name}`, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `toolly_bulk_${Date.now()}.zip`;
    link.click();
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-6 md:p-12 font-sans selection:bg-blue-600/30">
      
      {/* Top Navigation / Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-600 rounded-2xl rotate-3 shadow-xl shadow-blue-600/20">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Toolly <span className="text-blue-500 underline decoration-white/10">Bulk</span></h1>
            <p className="text-[9px] font-black tracking-[0.4em] text-zinc-600 uppercase mt-2">Manual Control Protocol</p>
          </div>
        </div>

        <button 
          onClick={generateZip}
          disabled={images.length === 0 || isProcessing}
          className="group relative px-10 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl overflow-hidden transition-all disabled:opacity-20 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-3">
            {isProcessing ? <RefreshCcw className="animate-spin" size={16} /> : <Download size={16} />}
            Export {images.length} Assets
          </span>
          <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar - Global Master Controls */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 space-y-10">
            
            <div className="space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">1. Master Logos</span>
              <div className="grid grid-cols-2 gap-3">
                <label className={`h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-white/5 ${logoBlack ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5'}`}>
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setLogoBlack(URL.createObjectURL(e.target.files[0]))} />
                  <Moon size={14} className={logoBlack ? 'text-blue-500' : 'text-zinc-600'} />
                  <span className="text-[8px] font-black text-zinc-500 uppercase">Dark</span>
                </label>
                <label className={`h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-white/5 ${logoWhite ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5'}`}>
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setLogoWhite(URL.createObjectURL(e.target.files[0]))} />
                  <Sun size={14} className={logoWhite ? 'text-blue-500' : 'text-zinc-600'} />
                  <span className="text-[8px] font-black text-zinc-500 uppercase">Light</span>
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">2. Scale</span>
                <span className="text-blue-500 text-xs font-bold leading-none">{globalConfig.scale}%</span>
              </div>
              <input type="range" min="5" max="30" value={globalConfig.scale} onChange={(e) => setGlobalConfig({...globalConfig, scale: parseInt(e.target.value)})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-600" />
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">3. Global Pos</span>
              <select 
                value={globalConfig.position} 
                onChange={(e) => setGlobalConfig({...globalConfig, position: e.target.value as any})}
                className="w-full bg-black border border-white/5 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none focus:border-blue-600 transition-colors appearance-none"
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center Canvas</option>
              </select>
            </div>
          </div>

          {images.length > 0 && (
            <button onClick={() => setImages([])} className="w-full py-4 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
              Purge All Assets
            </button>
          )}
        </aside>

        {/* Workspace - Individual Overrides */}
        <main className="lg:col-span-9 bg-zinc-950/50 border border-white/5 rounded-[3rem] p-8 min-h-[600px] shadow-inner">
          {images.length === 0 ? (
            <label className="h-[500px] flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-24 h-24 bg-zinc-900 border border-white/5 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Upload size={32} className="text-zinc-600 group-hover:text-blue-500" />
              </div>
              <h3 className="text-zinc-400 font-black uppercase tracking-[0.4em] text-sm italic">Initialize Assets</h3>
              <p className="text-zinc-700 text-[9px] uppercase font-black mt-3 tracking-widest">HSC-26 Creative Batch Support</p>
              <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
            </label>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5">
                  <img src={img.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Individual Control Sheet */}
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                    <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-6 italic underline">Individual Override</p>
                    
                    <div className="flex flex-col w-full gap-3">
                      <button 
                        onClick={() => toggleLogoColor(img.id)}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all ${img.customColor === 'black' ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-white border border-white/5'}`}
                      >
                        {img.customColor === 'black' ? <Moon size={14} /> : <Sun size={14} />}
                        Use {img.customColor} Logo
                      </button>
                      
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="w-full py-4 bg-red-600/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                      >
                        Exclude Asset
                      </button>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${img.customColor === 'black' ? 'bg-zinc-500' : 'bg-white shadow-[0_0_8px_white]'}`} />
                    <span className="text-[8px] font-black text-white/40 uppercase truncate max-w-[120px] tracking-widest">{img.name}</span>
                  </div>
                </div>
              ))}

              <label className="aspect-video border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group">
                <MousePointer2 size={24} className="text-zinc-800 group-hover:text-blue-500 transition-colors" />
                <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
              </label>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
