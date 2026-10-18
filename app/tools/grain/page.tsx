"use client";
import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function GrainTexturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [amount, setAmount] = useState(28);
  const [size, setSize] = useState(1200);
  const [contrast, setContrast] = useState(55);
  const [seed, setSeed] = useState(1);

  const generate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(size, size);
    let state = seed >>> 0;
    const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    for (let i = 0; i < image.data.length; i += 4) {
      const noise = (random() - .5) * contrast * 2;
      image.data[i] = 128; image.data[i + 1] = 128; image.data[i + 2] = 128;
      image.data[i + 3] = Math.round(Math.max(0, Math.min(255, Math.abs(noise) * amount / 100)));
      if (random() > .5) { image.data[i] = 255; image.data[i+1] = 255; image.data[i+2] = 255; }
      else { image.data[i] = 0; image.data[i+1] = 0; image.data[i+2] = 0; }
    }
    ctx.putImageData(image, 0, 0);
  };

  useEffect(() => { generate(); }, [amount, size, contrast, seed]);

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a'); link.download = `toolly-grain-${size}.png`; link.href = canvas.toDataURL('image/png'); link.click();
  };

  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <header className="mb-8"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-violet-300"><Sparkles size={14}/> Texture lab</span><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Grain <span className="text-violet-300">Texture</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Generate a subtle noise overlay for posters, thumbnails and digital artwork. Preview and export a high-resolution transparent PNG, entirely in your browser.</p></header>
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="h-fit rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
        <h2 className="flex items-center gap-2 font-bold"><SlidersHorizontal size={17} className="text-violet-300"/> Texture settings</h2>
        <label className="mt-6 block text-sm text-zinc-300">Grain opacity <span className="float-right text-zinc-500">{amount}%</span><input className="mt-3 w-full accent-violet-400" type="range" min="5" max="100" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label>
        <label className="mt-6 block text-sm text-zinc-300">Contrast <span className="float-right text-zinc-500">{contrast}</span><input className="mt-3 w-full accent-violet-400" type="range" min="5" max="100" value={contrast} onChange={e=>setContrast(Number(e.target.value))}/></label>
        <label className="mt-6 block text-sm text-zinc-300">Canvas size<select className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3 text-sm" value={size} onChange={e=>setSize(Number(e.target.value))}><option value={512}>512 × 512</option><option value={1200}>1200 × 1200</option><option value={2000}>2000 × 2000</option></select></label>
        <button onClick={()=>{setSeed(Math.floor(Math.random()*1000000)+1);}} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"><RefreshCw size={16}/> Randomize grain</button>
        <button onClick={save} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black hover:bg-violet-100"><Download size={16}/> Export transparent PNG</button>
      </section>
      <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Live preview</h2><span className="text-xs text-zinc-500">{size} × {size}px</span></div>
        <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-white/10 p-4" style={{backgroundColor:'#777',backgroundImage:'linear-gradient(45deg,#555 25%,transparent 25%),linear-gradient(-45deg,#555 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#555 75%),linear-gradient(-45deg,transparent 75%,#555 75%)',backgroundSize:'24px 24px',backgroundPosition:'0 0,0 12px,12px -12px,-12px 0'}}>
          <canvas ref={canvasRef} className="h-auto max-h-[560px] w-full max-w-[560px] object-contain" style={{imageRendering:'auto'}} />
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500">Tip: place the exported PNG above a design and adjust its blend mode and opacity in your editor. Transparent grain is an overlay, not a full-color image.</p>
      </section>
    </div>
    
  </div>;
}
