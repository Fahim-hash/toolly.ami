"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, Settings2, ShieldCheck, 
  Type, ImageIcon, Trash2, RefreshCcw, Layers, Zip 
} from 'lucide-react';
import JSZip from 'jszip'; // Make sure to install: npm install jszip

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

  // Core Watermarking Logic (Reusable for Bulk)
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
          // Contrast logic for image mode can be simplified or pre-calculated
          lImg.src = logoWhite; // Defaulting to white for preview, real logic uses threshold

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
    setIsProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
            <Layers className="text-blue-600" size={32} />
            <h1 className="text-3xl font-black italic uppercase tracking-tight text-white">
            Toolly <span className="text-blue-600">Bulk Mark</span>
            </h1>





        </div>
        <div className="flex gap-3">
            {images.length > 0 && (
                <button onClick={() => setImages([])} className="p-3 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                </button>
            )}
            <button 
                disabled={images.length === 0 || isProcessing}
                onClick={downloadAll}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg disabled:opacity-50"
            >
                {isProcessing ? <RefreshCcw size={20} className="animate-spin" /> : <Download size={20} className="inline mr-2" />} 
                {isProcessing ? 'Processing...' : `Export ZIP (${images.length})`}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 space-y-6">

            {/* Mode Toggle */}
            <div className="flex p-1 bg-black rounded-xl border border-zinc-800">
              <button onClick={() => setMode('text')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Type size={14} /> Text</button>
              <button onClick={() => setMode('image')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${mode === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><ImageIcon size={14} /> Logo</button>
            </div>

            {mode === 'text' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase italic">Watermark Text</label>
                <input type="text" value={config.text} onChange={(e) => setConfig({...config, text: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm focus:border-blue-600 outline-none" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-20 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800/20 transition cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {

                    const file = e.target.files?.[0];
                    if(file) setLogoBlack(URL.createObjectURL(file));
                  }} />
                  <span className="text-[10px] font-bold text-zinc-500">BLACK</span>


                </div>
                <div className="relative h-20 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800/20 transition cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {

                    const file = e.target.files?.[0];
                    if(file) setLogoWhite(URL.createObjectURL(file));
                  }} />
                  <span className="text-[10px] font-bold text-zinc-500">WHITE</span>


                </div>
              </div>
            )}

            {/* General Config */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2 italic">Scale ({config.scale}%)</label>
                <input type="range" min="5" max="50" value={config.scale} onChange={(e) => setConfig({...config, scale: parseInt(e.target.value)})} className="w-full accent-blue-600" />



              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2 italic">Position</label>
                <select value={config.position} onChange={(e) => setConfig({...config, position: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs outline-none">
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
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] min-h-[600px] p-6 relative overflow-y-auto max-h-[80vh]">
            {images.length === 0 ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <p className="font-bold text-xl text-zinc-400">Drop your images here</p>
                <p className="text-zinc-600 text-sm italic mt-1">HSC-26 Batch Bulk Processor</p>
                <input type="file" multiple className="hidden" onChange={handleBulkUpload} />
              </label>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                    <div key={img.id} className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group">
                        <img src={img.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                             <span className="text-[8px] bg-black/50 px-2 py-1 rounded-md text-zinc-300 truncate max-w-[80px]">{img.name}</span>
                             <ShieldCheck size={12} className="text-blue-500" />



                        </div>
                    </div>
                ))}
                <label className="aspect-video border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition">
                    <Upload size={20} className="text-zinc-600 mb-1" />
                    <span className="text-[10px] font-bold text-zinc-600">ADD MORE</span>


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
