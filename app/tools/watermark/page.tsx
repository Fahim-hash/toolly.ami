"use client";
import { useState, useRef } from 'react';
import { 
  Upload, Download, ShieldCheck, 
  Type, ImageIcon, Trash2, RefreshCcw, Layers, 
  Sparkles, MousePointer2, CheckCircle2, Zap
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

        // Logic to detect background brightness for color switching
        const getBrightness = (x: number, y: number, w: number, h: number) => {
            const data = ctx.getImageData(Math.max(0, x), Math.max(0, y), Math.min(w, 100), Math.min(h, 100)).data;
            let brightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                brightness += (data[i] + data[i+1] + data[i+2]) / 3;
            }
            return brightness / (data.length / 4);
        };

        if (mode === 'text') {
          const fontSize = Math.floor(canvas.width * (config.scale / 300));
          ctx.font = `bold italic ${fontSize}px 'Inter', sans-serif`;
          const textWidth = ctx.measureText(config.text).width;
          
          let x = pad, y = pad + fontSize;
          if (config.position === 'bottom-right') {
            x = canvas.width - textWidth - pad;
            y = canvas.height - pad;
          } else if (config.position === 'center') {
            x = (canvas.width - textWidth) / 2;
            y = (canvas.height + fontSize) / 2;
          }

          const brightness = getBrightness(x, y - fontSize, textWidth, fontSize);
          ctx.fillStyle = brightness < config.threshold ? '#FFFFFF' : '#000000';
          ctx.fillText(config.text, x, y);
          resolve(canvas.toDataURL('image/png'));

        } else if (mode === 'image' && (logoWhite || logoBlack)) {
          const lImg = new window.Image();
          const targetW = canvas.width * (config.scale / 100);
          
          // Determine which logo to use based on background
          let testX = pad, testY = pad;
          if (config.position === 'bottom-right') {
            testX = canvas.width - targetW - pad;
            testY = canvas.height - targetW - pad;
          }

          const brightness = getBrightness(testX, testY, targetW, targetW);
          lImg.src = (brightness < config.threshold ? logoWhite : logoBlack) || (logoWhite || logoBlack)!;

          lImg.onload = () => {
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
    setIsProcessing(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-8 min-h-screen bg-[#050505] text-zinc-100 selection:bg-blue-600/30">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 border-b border-white/5 pb-10">
        <div className="flex items-center gap-5 group">
          <div className="p-4 bg-blue-600 rounded-[1.8rem] shadow-2xl shadow-blue-600/20 group-hover:rotate-12 transition-transform">
            <Zap className="text-white fill-white" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Toolly <span className="text-blue-600">Armor</span>
            </h1>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] mt-2">Batch Branding Protocol v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {images.length > 0 && (
            <button onClick={() => setImages([])} className="p-4 bg-zinc-900/50 text-zinc-600 rounded-2xl border border-white/5 hover:text-red-500 transition-all">
              <Trash2 size={20} />
            </button>
          )}
          <button 
            disabled={images.length === 0 || isProcessing}
            onClick={downloadAll}
            className="px-10 py-5 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-20 flex items-center gap-3"
          >
            {isProcessing ? <RefreshCcw size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isProcessing ? 'Processing...' : `Export Batch (${images.length})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar - Tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/30 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 space-y-10 shadow-2xl">
            
            <div className="space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Rendering Mode</span>
              <div className="flex p-1.5 bg-black/50 rounded-2xl border border-white/5">
                <button onClick={() => setMode('text')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600'}`}>Signature</button>
                <button onClick={() => setMode('image')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600'}`}>Vector Logo</button>
              </div>
            </div>

            {mode === 'text' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase italic ml-2 tracking-widest">Branding Text</label>
                <input type="text" value={config.text} onChange={(e) => setConfig({...config, text: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl p-5 text-sm font-bold focus:border-blue-600 outline-none transition-all placeholder:text-zinc-800" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <label className="relative h-24 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition cursor-pointer group">
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) setLogoBlack(URL.createObjectURL(file));
                  }} />
                  <div className={`p-2 rounded-lg ${logoBlack ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    {logoBlack ? <CheckCircle2 size={16} /> : <ImageIcon size={16} />}
                  </div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Dark Logo</span>
                </label>
                <label className="relative h-24 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition cursor-pointer group">
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) setLogoWhite(URL.createObjectURL(file));
                  }} />
                  <div className={`p-2 rounded-lg ${logoWhite ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    {logoWhite ? <CheckCircle2 size={16} /> : <ImageIcon size={16} />}
                  </div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Light Logo</span>
                </label>
              </div>
            )}

            <div className="space-y-10 pt-4">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-zinc-500 uppercase italic tracking-widest">Asset Scale</label>
                  <span className="text-blue-500 font-bold text-xs">{config.scale}%</span>
                </div>
                <input type="range" min="5" max="40" value={config.scale} onChange={(e) => setConfig({...config, scale: parseInt(e.target.value)})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-600" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase italic tracking-widest ml-2">Matrix Position</label>
                <div className="grid grid-cols-2 gap-3">
                  {['top-right', 'bottom-right', 'bottom-left', 'center'].map((pos) => (
                    <button 
                      key={pos}
                      onClick={() => setConfig({...config, position: pos})}
                      className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${config.position === pos ? 'bg-blue-600 border-transparent text-white' : 'bg-black border-white/5 text-zinc-700 hover:border-zinc-500'}`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace / Gallery */}
        <div className="lg:col-span-8">
          <div className="bg-[#080808] border border-white/5 rounded-[4rem] min-h-[700px] p-10 relative overflow-y-auto max-h-[85vh] shadow-inner">
            {images.length === 0 ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity" />
                  <div className="w-36 h-36 bg-zinc-900 border border-white/10 rounded-[3.5rem] flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                    <Upload size={40} className="text-blue-500" />
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-[0.5em] text-zinc-400">Deploy Assets</h3>
                <p className="mt-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/5 italic">HSC-26 Bulk Engine Ready</p>
                <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
              </label>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/5 bg-black shadow-2xl group">
                    <img src={img.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-8 right-8">
                      <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{img.name}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Logic Ready</span>
                      </div>
                    </div>
                  </div>
                ))}
                <label className="aspect-[4/3] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/5 hover:border-blue-600/30 transition-all group">
                  <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MousePointer2 size={20} className="text-zinc-600 group-hover:text-blue-500" />
                  </div>
                  <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
