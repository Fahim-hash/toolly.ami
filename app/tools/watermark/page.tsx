"use client";
import { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, ShieldCheck, 
  Type, ImageIcon, Trash2, RefreshCcw, Layers, Archive, 
  CheckCircle2, Sparkles, MousePointer2, Move, Maximize
} from 'lucide-react';
import JSZip from 'jszip'; 

export default function WatermarkTool() {
  const [images, setImages] = useState<any[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [config, setConfig] = useState({
    text: 'TOOL-LY PRO',
    scale: 12,
    position: 'bottom-right',
    padding: 5,
    opacity: 0.7,
    rotation: 0,
    adaptive: true // Auto-brightness logic
  });

  // Function to process and apply watermark
  const processImage = async (imageUrl: string): Promise<string> => {
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
          const fontSize = Math.floor(canvas.width * (config.scale / 250));
          ctx.font = `italic 900 ${fontSize}px 'Inter', sans-serif`;
          ctx.textBaseline = 'middle';
          
          const textWidth = ctx.measureText(config.text).width;
          let x = pad, y = pad + fontSize;

          // Position Logic
          if (config.position === 'bottom-right') {
            x = canvas.width - textWidth - pad;
            y = canvas.height - pad;
          } else if (config.position === 'top-right') {
            x = canvas.width - textWidth - pad;
            y = pad + fontSize;
          } else if (config.position === 'center') {
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
          }

          // Adaptive Logic: Check background brightness
          const brightnessData = ctx.getImageData(x, y - fontSize/2, textWidth, fontSize).data;
          let avgBrightness = 0;
          for (let i = 0; i < brightnessData.length; i += 4) {
            avgBrightness += (brightnessData[i] + brightnessData[i+1] + brightnessData[i+2]) / 3;
          }
          const finalBrightness = avgBrightness / (brightnessData.length / 4);
          
          // Style the text
          ctx.fillStyle = finalBrightness > 128 ? '#000000' : '#FFFFFF';
          ctx.shadowColor = finalBrightness > 128 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          
          ctx.fillText(config.text, x, y);
          resolve(canvas.toDataURL('image/png', 0.9));

        } else if (mode === 'image' && logo) {
          const lImg = new window.Image();
          lImg.src = logo;
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
            resolve(canvas.toDataURL('image/png', 0.9));
          };
        }
      };
    });
  };

  const downloadBatch = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    for (const img of images) {
      const data = await processImage(img.url);
      zip.file(`marked-${img.name}`, data.split(',')[1], { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `toolly-batch-${Date.now()}.zip`;
    link.click();
    setIsProcessing(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto py-12 px-8 min-h-screen bg-[#050505] text-zinc-100 selection:bg-blue-600/30">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20 gap-10">
        <div className="flex items-center gap-6 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 blur-[30px] opacity-20 animate-pulse" />
            <div className="relative p-5 bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl group-hover:rotate-12 transition-transform duration-500">
              <ShieldCheck className="text-blue-500" size={36} />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Armor</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em] mt-3">Advanced Batch Branding Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-inner">
            <button 
              disabled={images.length === 0 || isProcessing}
              onClick={downloadBatch}
              className="px-12 py-5 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-[2rem] hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center gap-3 disabled:opacity-10"
            >
              {isProcessing ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {isProcessing ? 'Armoring Assets...' : `Export Batch (${images.length})`}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[3.5rem] p-10 space-y-12 shadow-2xl relative overflow-hidden">
            
            {/* Logic Mode */}
            <div className="space-y-6">
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest ml-2 italic">Marking System</label>
              <div className="flex p-2 bg-black rounded-[2rem] border border-white/5">
                <button onClick={() => setMode('text')} className={`flex-1 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}>Signature</button>
                <button onClick={() => setMode('image')} className={`flex-1 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}>Logo Meta</button>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest ml-2 italic">Source Branding</label>
              {mode === 'text' ? (
                <input 
                  type="text" 
                  value={config.text} 
                  onChange={(e) => setConfig({...config, text: e.target.value})}
                  className="w-full bg-black border border-white/5 rounded-3xl p-6 text-sm font-black italic tracking-widest focus:border-blue-600 outline-none transition-all placeholder:text-zinc-800"
                />
              ) : (
                <div className="relative group">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) setLogo(URL.createObjectURL(file));
                  }} />
                  <div className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center gap-4 bg-black/40 group-hover:border-blue-500 transition-all">
                    {logo ? <img src={logo} className="h-12 object-contain" /> : <ImageIcon className="text-zinc-700" size={32} />}
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Drop Brand Asset</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scale & Opacity */}
            <div className="grid gap-10">
              <div className="space-y-6">
                <div className="flex justify-between px-2">
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic">Scale Factor</span>
                  <span className="text-blue-500 font-bold">{config.scale}%</span>
                </div>
                <input type="range" min="5" max="40" value={config.scale} onChange={(e) => setConfig({...config, scale: parseInt(e.target.value)})} className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-blue-600" />
              </div>

              <div className="space-y-6">
                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic ml-2">Matrix Alignment</span>
                <div className="grid grid-cols-2 gap-3">
                  {['top-right', 'center', 'bottom-left', 'bottom-right'].map((p) => (
                    <button 
                      key={p} 
                      onClick={() => setConfig({...config, position: p})}
                      className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${config.position === p ? 'bg-blue-600 border-transparent text-white' : 'bg-black border-white/5 text-zinc-700'}`}
                    >
                      {p.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* Workspace */}
        <main className="lg:col-span-8">
          <div className="bg-[#080808] border border-white/5 rounded-[4rem] min-h-[700px] p-12 relative overflow-hidden shadow-inner">
            
            {images.length === 0 ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center group transition-all">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity" />
                  <div className="w-36 h-36 bg-zinc-900 border border-white/10 rounded-[3.5rem] flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <Upload size={48} className="text-blue-500" />
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-[0.5em] text-zinc-400">Deploy Raw Assets</h3>
                <p className="mt-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/5">Local Processing Engaged</p>
                <input type="file" multiple className="hidden" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImages(prev => [...prev, ...files.map(f => ({ id: Math.random(), name: f.name, url: URL.createObjectURL(f) }))]);
                }} />
              </label>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                {images.map(img => (
                  <div key={img.id} className="group relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/5 bg-black shadow-2xl">
                    <img src={img.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute top-6 right-6">
                       <button onClick={() => setImages(images.filter(i => i.id !== img.id))} className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-zinc-500 hover:text-red-500 transition-all border border-white/10">
                         <Trash2 size={16} />
                       </button>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                      <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{img.name}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">Logic Applied</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Plus Trigger */}
                <label className="aspect-[4/3] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/5 hover:border-blue-600/30 transition-all group">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Maximize size={24} className="text-zinc-600 group-hover:text-blue-500" />
                  </div>
                  <input type="file" multiple className="hidden" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setImages(prev => [...prev, ...files.map(f => ({ id: Math.random(), name: f.name, url: URL.createObjectURL(f) }))]);
                  }} />
                </label>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
