"use client";

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, FileCode2, Link2, RotateCcw, QrCode, Sparkles } from 'lucide-react';

export default function QRGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState('https://toolly.ami');
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(4);
  const [dark, setDark] = useState('#09090b');
  const [light, setLight] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  const qrOptions = {
    width: size,
    margin,
    errorCorrectionLevel: 'H' as const,
    color: { dark, light },
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value || ' ', qrOptions);
  }, [value, size, margin, dark, light]);

  const downloadBlob = (content: BlobPart, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyValue = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'toolly-qr.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const downloadSVG = async () => {
    const svg = await QRCode.toString(value || ' ', {
      type: 'svg',
      ...qrOptions,
    });

    downloadBlob(svg, 'toolly-qr.svg', 'image/svg+xml;charset=utf-8');
  };

  const downloadEPS = () => {
    const qr = QRCode.create(value || ' ', {
      errorCorrectionLevel: 'H',
    });

    const moduleCount = qr.modules.size;
    const moduleData = qr.modules.data;
    const quietZone = margin;
    const totalModules = moduleCount + quietZone * 2;
    const pointSize = size;
    const moduleSize = pointSize / totalModules;
    const background = light.toUpperCase();
    const foreground = dark.toUpperCase();

    const hexToRgb = (hex: string) => {
      const normalized = hex.replace('#', '');
      return {
        r: parseInt(normalized.slice(0, 2), 16) / 255,
        g: parseInt(normalized.slice(2, 4), 16) / 255,
        b: parseInt(normalized.slice(4, 6), 16) / 255,
      };
    };

    const rgb = (hex: string) => {
      const { r, g, b } = hexToRgb(hex);
      return `${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} setrgbcolor`;
    };

    const lines = [
      '%!PS-Adobe-3.0 EPSF-3.0',
      `%%BoundingBox: 0 0 ${pointSize} ${pointSize}`,
      '%%Creator: Toolly.ami QR Generator',
      '%%LanguageLevel: 2',
      '%%Pages: 1',
      '%%EndComments',
      'gsave',
      rgb(background),
      `0 0 ${pointSize} ${pointSize} rectfill`,
      rgb(foreground),
    ];

    for (let row = 0; row < moduleCount; row += 1) {
      let runStart = -1;

      for (let col = 0; col <= moduleCount; col += 1) {
        const darkModule = col < moduleCount && moduleData[row * moduleCount + col];

        if (darkModule && runStart === -1) {
          runStart = col;
        }

        if ((!darkModule || col === moduleCount) && runStart !== -1) {
          const x = (runStart + quietZone) * moduleSize;
          const y = pointSize - (row + quietZone + 1) * moduleSize;
          const width = (col - runStart) * moduleSize;

          lines.push(`${x.toFixed(4)} ${y.toFixed(4)} ${width.toFixed(4)} ${moduleSize.toFixed(4)} rectfill`);
          runStart = -1;
        }
      }
    }

    lines.push('grestore', 'showpage', '%%EOF');

    downloadBlob(lines.join('\n') + '\n', 'toolly-qr.eps', 'application/postscript');
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

          <div className="mt-7 flex items-center gap-2 text-[11px] text-zinc-600">
            <Sparkles size={14} /> High error correction enabled for reliable scanning.
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#080808] border border-white/5 rounded-[2rem] p-7 flex flex-col items-center justify-center min-h-[520px]">
          <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/40">
            <canvas ref={canvasRef} aria-label="Generated QR code" />
          </div>

          <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-7">
            <button onClick={downloadPNG} className="flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
              <Download size={16} /> PNG
            </button>
            <button onClick={downloadSVG} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-white/10 text-zinc-200 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
              <FileCode2 size={16} /> SVG
            </button>
            <button onClick={downloadEPS} className="col-span-2 flex items-center justify-center gap-2 py-4 rounded-xl border border-white/10 text-zinc-200 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
              <FileCode2 size={16} /> EPS · Vector
            </button>
          </div>

          <button onClick={copyValue} className="mt-3 px-5 py-3 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors" title="Copy content">
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
          </button>

          <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold mt-5 text-center">
            Generated locally in your browser · PNG, SVG & EPS
          </p>
        </div>
      </section>
    </main>
  );
}
