"use client";

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, Link2, RotateCcw, QrCode, Sparkles } from 'lucide-react';

export default function QRGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState('https://toolly.ami');
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(4);
  const [dark, setDark] = useState('#09090b');
  const [light, setLight] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value || ' ', {
      width: size,
      margin,
      errorCorrectionLevel: 'H',
      color: { dark, light },
    });
  }, [value, size, margin, dark, light]);

  const copyValue = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'toolly-qr.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const reset = () => {
    setValue('https://toolly.ami');
    setSize(320);
    setMargin(4);
    setDark('#09090b');
    setLight('#ffffff');
  };

  return (
    <main className="max-w-6xl mx-auto min-h-screen py-12 px-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl rotate-3">
            <QrCode size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">QR <span className="text-zinc-500">Generator</span></h1>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600 mt-1">Fast · Private · Browser based</p>
          </div>
        </div>
        <button onClick={reset} className="self-start md:self-auto flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-wider">
          <RotateCcw size={14} /> Reset
        </button>
      </header>

      <section className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-zinc-900/30 border border-white/5 rounded-[2rem] p-7 md:p-9">
          <div className="flex items-center gap-2 mb-3 text-zinc-400">
            <Link2 size={15} />
            <label htmlFor="qr-value" className="text-xs font-black uppercase tracking-widest">Content</label>
          </div>
          <textarea
            id="qr-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a URL, text, email, phone number..."
            className="w-full min-h-36 resize-y bg-zinc-950 border border-white/10 rounded-2xl p-5 text-sm text-zinc-100 outline-none focus:border-white/25 transition-colors"
          />

          <div className="grid sm:grid-cols-2 gap-5 mt-7">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Size: {size}px</span>
              <input type="range" min="180" max="640" step="10" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full mt-3 accent-white" />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Quiet zone: {margin}</span>
              <input type="range" min="0" max="12" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full mt-3 accent-white" />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-7">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-white/5">
              <span className="text-xs font-bold text-zinc-400">QR color</span>
              <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="w-10 h-8 bg-transparent cursor-pointer" />
            </label>
            <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-white/5">
              <span className="text-xs font-bold text-zinc-400">Background</span>
              <input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="w-10 h-8 bg-transparent cursor-pointer" />
            </label>
          </div>

          <div className="mt-7 flex items-center gap-3 text-[11px] text-zinc-600">
            <Sparkles size={14} /> High error correction enabled for reliable scanning.
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#080808] border border-white/5 rounded-[2rem] p-7 flex flex-col items-center justify-center min-h-[520px]">
          <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/40">
            <canvas ref={canvasRef} aria-label="Generated QR code" />
          </div>
          <div className="w-full max-w-sm flex gap-3 mt-7">
            <button onClick={download} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
              <Download size={16} /> Download PNG
            </button>
            <button onClick={copyValue} className="px-5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors" title="Copy content">
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold mt-5">Generated locally in your browser</p>
        </div>
      </section>
    </main>
  );
}
