"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Settings2, ShieldCheck, Type, ImageIcon, Trash2, RefreshCcw } from 'lucide-react';

export default function WatermarkTool() {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [logoBlack, setLogoBlack] = useState<string | null>(null);
  const [logoWhite, setLogoWhite] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  
  const [config, setConfig] = useState({
    text: 'Toolly ami',
    scale: 15,
    threshold: 128,
    position: 'bottom-right',
    padding: 4,
    opacity: 0.8,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(async () => {
    if (!baseImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const mainImg = new window.Image();
    mainImg.src = baseImage;

    mainImg.onload = () => {
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      ctx.drawImage(mainImg, 0, 0);

      const pad = canvas.width * (config.padding / 100);
      ctx.globalAlpha = config.opacity;

      if (mode === 'text') {
        // --- TEXT MODE LOGIC ---
        const fontSize = Math.floor(canvas.width * (config.scale / 300)); // Scalable font
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

        // Auto-Contrast for Text
        const areaData = ctx.getImageData(x, y - fontSize, textWidth || 1, fontSize || 1).data;
        let brightness = 0;
        for (let i = 0; i < areaData.length; i += 4) {
          brightness += (areaData[i] + areaData[i+1] + areaData[i+2]) / 3;
        }
        ctx.fillStyle = (brightness / (areaData.length / 4)) < config.threshold ? 'white' : 'black';
        ctx.fillText(config.text, x, y);

      } else if (mode === 'image' && logoBlack && logoWhite) {
        // --- IMAGE MODE LOGIC ---
        const lBlack = new window.Image();
        const lWhite = new window.Image();
        lBlack.src = logoBlack; lWhite.src = logoWhite;

        lBlack.onload = () => {
          const targetW = canvas.width * (config.scale / 100);
          const aspect = lBlack.width / lBlack.height;
          const targetH = targetW / aspect;

          let x = pad, y = pad;
          if (config.position === 'bottom-right') {
            x = canvas.width - targetW - pad;
            y = canvas.height - targetH - pad;
          } else if (config.position === 'center') {
            x = (canvas.width - targetW) / 2;
            y = (canvas.height - targetH) / 2;
          }

          const areaData = ctx.getImageData(x, y, targetW || 1, targetH || 1).data;
          let brightness = 0;
          for (let i = 0; i < areaData.length; i += 4) {
            brightness += (areaData[i] + areaData[i+1] + areaData[i+2]) / 3;
          }
          const finalLogo = (brightness / (areaData.length / 4)) < config.threshold ? lWhite : lBlack;
          ctx.drawImage(finalLogo, x, y, targetW, targetH);
        };
      }
    };
  }, [baseImage, logoBlack, logoWhite, config, mode]);

  useEffect(() => { processImage(); }, [processImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black italic uppercase tracking-tight text-white">
          Toolly <span className="text-blue-600">Watermark</span>
        </h1>
        <button 
          onClick={() => {
            const link = document.createElement('a');
            link.download = `toolly-branded-${Date.now()}.png`;
            link.href = canvasRef.current?.toDataURL() || '';
            link.click();
          }}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          <Download size={20} className="inline mr-2" /> Export Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 space-y-6">
            
            {/* Mode Toggle */}
            <div className="flex p-1 bg-black rounded-xl border border-zinc-800">
              <button 
                onClick={() => setMode('text')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                <Type size={14} /> Text Mode
              </button>
              <button 
                onClick={() => setMode('image')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${mode === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                <ImageIcon size={14} /> Logo Mode
              </button>
            </div>

            {mode === 'text' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase italic">Watermark Text</label>
                <input 
                  type="text" 
                  value={config.text} 
                  onChange={(e) => setConfig({...config, text: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm focus:border-blue-600 outline-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-20 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800/20 transition cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, setLogoBlack)} />
                  <span className="text-[10px] font-bold text-zinc-500">BLACK LOGO</span>
                </div>
                <div className="relative h-20 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800/20 transition cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, setLogoWhite)} />
                  <span className="text-[10px] font-bold text-zinc-500">WHITE LOGO</span>
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
                <select 
                  value={config.position} 
                  onChange={(e) => setConfig({...config, position: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs outline-none"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="lg:col-span-8">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] min-h-[500px] flex items-center justify-center overflow-hidden relative group">
            {!baseImage ? (
              <label className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Upload size={28} />
                </div>
                <p className="font-bold text-lg">Upload Base Image</p>
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, setBaseImage)} />
              </label>
            ) : (
              <div className="p-4 w-full h-full flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full max-h-[75vh] object-contain rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}