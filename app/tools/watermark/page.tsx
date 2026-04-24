"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, Settings2, ShieldCheck, 
  Type, ImageIcon, Trash2, RefreshCcw, Layers, Archive 
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
    text: 'Toolly ami',
    scale: 15,
    threshold: 128,
    position: 'bottom-right',
    padding: 4,
    opacity: 0.8,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
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
          ctx.fillStyle = (brightness / (areaData.length / 4)) < config.threshold ? 'white' : 'black';
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
        zip.file(`toolly-${img.name}`, base64Data, {base64: true});
      }
      const content = await zip.generateAsync({type: "blob"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "toolly-bulk-branded.zip";
      link.click();
    } catch (err) {
      console.error("Bulk Download Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 border-b border-zinc-900 pb-8">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-2xl">
              <Layers className="text-blue-500" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Toolly <span className="text-blue-600">Bulk Mark</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">HSC-26 Batch Processor</p>
            </div>
        </div>
        <div className="flex gap-3">
            {images.length > 0 && (
                <button onClick={() => setImages([])} className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-red-500 transition-all border border-zinc-800">
                    <Trash2 size={20} />
                </button>
            )}
            <button 
                disabled={images.length === 0 || isProcessing}
                onClick={downloadAll}
                className="px-8 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-30 flex items-center gap-3"
            >
                {isProcessing ? <RefreshCcw size={18} className="animate-spin" /> : <Archive size={18} />} 
                {isProcessing ? 'Processing...' : `Export ZIP (${images.length})`}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-md">
            
            {/* Mode Toggle */}
            <div className="flex p-1.5 bg-black/50 rounded-2xl border border-zinc-800">
              <button onClick={() => setMode('text')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}><Type size={14} /> Text</button>
              <button onClick={() => setMode('image')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 ${mode === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}><ImageIcon size={14} /> Logo</button>
            </div>

            {mode === 'text' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Watermark Label</label>
                <input type="text" value={config.text} onChange={(e) => setConfig({...config, text: e.target.value})} className="w-full bg-black/50 border border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:border-blue-600 outline-none transition-colors" placeholder="e.g. Property of Toolly" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600/5 rounded-2xl border border-dashed border-zinc-800 group-hover:border-blue-600/50 transition-colors" />
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) setLogoBlack(URL.createObjectURL(file));
                  }} />
                  <div className="h-24 flex flex-col items-center justify-center gap-2 relative pointer-events-none">
                    <span className="text-[9px] font-black text-zinc-500 group-hover:text-white transition-colors uppercase italic">Logo Black</span>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600/5 rounded-2xl border border-dashed border-zinc-800 group-hover:border-blue-600/50 transition-colors" />
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) setLogoWhite(URL.createObjectURL(file));
                  }} />
                  <div className="h-24 flex flex-col items-center justify-center gap-2 relative pointer-events-none">
                    <span className="text-[9px] font-black text-zinc-500 group-hover:text-white transition-colors uppercase italic">Logo White</span>
                  </div>
                </div>
              </div>
            )}

            {/* General Config */}
            <div className="space-y-8 pt-4">
              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Scale</label>
                  <span className="text-[10px] font-black text-blue-500 uppercase italic">{config.scale}%</span>
                </div>
                <input type="range" min="5" max="50" value={config.scale} onChange={(e) => setConfig({...config, scale: parseInt(e.target.value)})} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Positioning</label>
                <select value={config.position} onChange={(e) => setConfig({...config, position: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-colors cursor-pointer appearance-none">
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery / Bulk Display */}
        <div className="lg:col-span-8">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] min-h-[650px] p-10 relative overflow-y-auto max-h-[85vh] shadow-inner">
            {images.length === 0 ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center group">
                <div className="w-24 h-24 bg-blue-600/5 text-blue-600 rounded-[2.5rem] border border-blue-600/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
                  <Upload size={36} className="group-hover:animate-bounce" />
                </div>
                <p className="font-black uppercase tracking-[0.5em] text-sm text-zinc-400 italic">Drop assets to process</p>
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mt-4">Supports PNG, JPG, WEBP</p>
                <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
              </label>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {images.map((img) => (
                    <div key={img.id} className="relative aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-800/50 group hover:border-blue-600/30 transition-all duration-500">
                        <img src={img.url} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-4 left-5 right-5 flex justify-between items-center">
                             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate max-w-[100px] italic">{img.name}</span>
                             <div className="p-1.5 bg-blue-600 rounded-full">
                                <ShieldCheck size={10} className="text-white" />
                             </div>
                        </div>
                    </div>
                ))}
                <label className="aspect-video border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-500 group">
                    <div className="p-3 bg-zinc-900 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                      <Upload size={20} className="text-zinc-500" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-600 tracking-widest uppercase">Add More</span>
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
