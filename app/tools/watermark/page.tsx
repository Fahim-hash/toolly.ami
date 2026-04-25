"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, Settings2, ShieldCheck, 
  Type, ImageIcon, Trash2, RefreshCcw, Layers, Archive, 
  CheckCircle2, MousePointer2 
} from 'lucide-react';
import JSZip from 'jszip'; 

interface BulkImage {
  id: string;
  url: string;
  name: string;
  processedUrl?: string;
}

export default function WatermarkTool() {
  const [images, setImages] = useState<BulkImage[]>([]);
  const [logoBlack, setLogoBlack] = useState<string | null>(null);
  const [logoWhite, setLogoWhite] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [config, setConfig] = useState({
    text: 'Toolly Branded',
    scale: 15,
    threshold: 128,
    position: 'bottom-right',
    padding: 4,
    opacity: 0.8,
  });

  const applyWatermark = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(imageUrl);

      const mainImg = new window.Image();
      mainImg.src = imageUrl;

      mainImg.onload = () => {
        canvas.width = mainImg.width;
        canvas.height = mainImg.height;
        ctx.drawImage(mainImg, 0, 0);

        const pad = canvas.width * (config.padding / 100);
        ctx.globalAlpha = config.opacity;

        if (mode === 'text') {
          const fontSize = Math.floor(canvas.width * (config.scale / 300));
          ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
          const textWidth = ctx.measureText(config.text).width;
          
          let x = pad, y = pad + fontSize;
          if (config.position === 'bottom-right') {
            x = canvas.width - textWidth - pad;
            y = canvas.height - pad;
          } else if (config.position === 'top-right') {
            x = canvas.width - textWidth - pad;
          } else if (config.position === 'center') {
            x = (canvas.width - textWidth) / 2;
            y = (canvas.height + fontSize) / 2;
          }

          const areaData = ctx.getImageData(Math.max(0, x), Math.max(0, y - fontSize), Math.min(textWidth, 100), Math.min(fontSize, 100)).data;
          let brightness = 0;
          for (let i = 0; i < areaData.length; i += 4) {
            brightness += (areaData[i] + areaData[i+1] + areaData[i+2]) / 3;
          }
          ctx.fillStyle = (brightness / (areaData.length / 4)) < config.threshold ? '#FFFFFF' : '#000000';
          ctx.fillText(config.text, x, y);
          resolve(canvas.toDataURL('image/png'));
        } else if (mode === 'image' && logoBlack && logoWhite) {
          const lImg = new window.Image();
          lImg.src = logoWhite; 
          lImg.onload = () => {
            const targetW = canvas.width * (config.scale / 100);
            const aspect = lImg.width / lImg.height;
            const targetH = targetW / aspect;
            let x = pad, y = pad;
            if (config.position === 'bottom-right') {
              x = canvas.width - targetW - pad;
              y = canvas.height - targetH - pad;
            } else if (config.position === 'center') {
              x = (canvas.width - targetW) / 2;
              y = (canvas.height - targetH) / 2;
            }
            ctx.drawImage(lImg, x, y, targetW, targetH);
            resolve(canvas.toDataURL('image/png'));
          };
        } else {
          resolve(canvas.toDataURL('image/png'));
        }
      };
    });
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const img of images) {
        const processedData = await applyWatermark(img.url);
        const base64Data = processedData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        zip.file(`toolly-mark-${img.name}`, base64Data, {base64: true});
      }
      const content = await zip.generateAsync({type: "blob"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `toolly_bulk_${Date.now()}.zip`;
      link.click();
    } catch (err) { console.error(err); } 
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-12 px-8 min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
            <div className="flex items-center gap-4 group">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-2xl shadow-blue-600/20 group-hover:rotate-6 transition-transform duration-500">
                <Layers className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                  Toolly <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">Studio</span>
                </h1>
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  HSC-26 Creative Batch System
                </p>
              </div>
            </div>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/40 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
            {images.length > 0 && (
                <button onClick={() => setImages([])} className="p-5 bg-zinc-900 text-zinc-500 rounded-[2rem] hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5">
                    <Trash2 size={22} />
                </button>
            )}
            <button 
                disabled={images.length === 0 || isProcessing}
                onClick={downloadAll}
                className="px-10 py-5 bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-20 disabled:grayscale flex items-center gap-4"
            >
                {isProcessing ? <RefreshCcw size={20} className="animate-spin" /> : <Archive size={20} />} 
                {isProcessing ? 'Processing Assets...' : `Generate Batch (${images.length})`}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar - Tool Config */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px] -mr-16 -mt-16" />
            
            {/* Mode Switcher */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Rendering Mode</span>
              <div className="flex p-2 bg-black/60 rounded-[1.8rem] border border-white/5">
                <button onClick={() => setMode('text')} className={`flex-1 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${mode === 'text' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}><Type size={16} /> Text Mark</button>
                <button onClick={() => setMode('image')} className={`flex-1 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${mode === 'image' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}><ImageIcon size={16} /> Graphic</button>
              </div>
            </div>

            {mode === 'text' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Branding Text</label>
                <input 
                  type="text" 
                  value={config.text} 
                  onChange={(e) => setConfig({...config, text: e.target.value})} 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-semibold focus:border-blue-600 outline-none transition-all focus:ring-4 ring-blue-600/10 placeholder:text-zinc-800" 
                  placeholder="Enter text..." 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="group relative">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setLogoWhite(URL.createObjectURL(file)); setLogoBlack(URL.createObjectURL(file)); }
                  }} />
                  <div className="border border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center gap-3 bg-black/20 group-hover:bg-blue-600/5 group-hover:border-blue-600/40 transition-all">
                    <div className="p-3 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-blue-500"><ImageIcon size={24} /></div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase italic">Upload Vector/PNG Logo</span>
                  </div>
                </div>
              </div>
            )}

            {/* Precision Controls */}
            <div className="space-y-10 pt-4">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Asset Scale</label>
                  <span className="bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter">{config.scale}%</span>
                </div>
                <input type="range" min="5" max="50" value={config.scale} onChange={(e) => setConfig({...config, scale: parseInt(e.target.value)})} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Positioning Matrix</label>
                <div className="grid grid-cols-2 gap-3">
                  {['top-left', 'top-right', 'center', 'bottom-right'].map((pos) => (
                    <button 
                      key={pos}
                      onClick={() => setConfig({...config, position: pos})}
                      className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${config.position === pos ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-black/40 border-white/5 text-zinc-600 hover:border-zinc-700'}`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Workspace - Bulk Gallery */}
        <div className="lg:col-span-8">
          <div className="bg-[#080808] border border-white/5 rounded-[4rem] min-h-[750px] p-12 relative overflow-y-auto max-h-[85vh] shadow-inner custom-scrollbar">
            {images.length === 0 ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center group transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="w-32 h-32 bg-zinc-900 border border-white/10 rounded-[3rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 relative z-10">
                    <Upload size={40} className="text-blue-500" />
                  </div>
                </div>
                <h3 className="font-black uppercase tracking-[0.6em] text-lg text-zinc-300">Drop Source Assets</h3>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-4 bg-zinc-900/50 px-6 py-2 rounded-full border border-white/5 italic">
                  Bulk Process Engine Ready
                </p>
                <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
              </label>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-[4/3] bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-blue-600/40 transition-all duration-700 shadow-2xl">
                        <img src={img.url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition duration-1000 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-5 right-5 flex gap-2">
                           <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
                              <CheckCircle2 size={14} className="text-blue-500" />
                           </div>
                        </div>

                        <div className="absolute bottom-6 left-8 right-8">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white truncate drop-shadow-lg">{img.name}</p>
                             <div className="flex items-center gap-2 mt-3">
                                <span className="h-[2px] w-8 bg-blue-600 rounded-full" />
                                <span className="text-[8px] font-black text-zinc-500 uppercase italic">Ready to Mark</span>
                             </div>
                        </div>
                    </div>
                ))}
                
                {/* Add More Trigger */}
                <label className="aspect-[4/3] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/[0.02] hover:border-blue-600/20 transition-all duration-500 group">
                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl">
                      <Upload size={22} className="text-zinc-600 group-hover:text-blue-500" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase group-hover:text-zinc-400">Add More</span>
                    <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Global Style for Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}</style>
    </div>
  );
}
