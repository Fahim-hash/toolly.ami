"use client";

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  Globe,
  Instagram,
  Link2,
  RotateCcw,
  QrCode,
  Sparkles,
  Youtube,
} from 'lucide-react';

type LogoPreset = 'none' | 'facebook' | 'instagram' | 'youtube' | 'behance' | 'x' | 'website';
type ModuleStyle = 'square' | 'rounded' | 'dots' | 'soft';
type EyeStyle = 'square' | 'rounded' | 'circle';

const LOGO_PRESETS: { id: LogoPreset; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'behance', label: 'Behance' },
  { id: 'x', label: 'X' },
  { id: 'website', label: 'Website' },
];

const MODULE_STYLES: { id: ModuleStyle; label: string }[] = [
  { id: 'square', label: 'Classic' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'dots', label: 'Dots' },
  { id: 'soft', label: 'Soft' },
];

const EYE_STYLES: { id: EyeStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'circle', label: 'Circle' },
];

export default function QRGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState('https://toolly.ami');
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(4);
  const [dark, setDark] = useState('#09090b');
  const [light, setLight] = useState('#ffffff');
  const [moduleStyle, setModuleStyle] = useState<ModuleStyle>('square');
  const [eyeStyle, setEyeStyle] = useState<EyeStyle>('square');
  const [logo, setLogo] = useState<LogoPreset>('none');
  const [logoColor, setLogoColor] = useState('#09090b');
  const [logoBg, setLogoBg] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  const createQR = () =>
    QRCode.create(value || ' ', {
      errorCorrectionLevel: 'H',
    });

  const getLogoGap = (moduleCount: number) =>
    logo === 'none' ? 0 : Math.max(9, Math.min(13, Math.floor(moduleCount * 0.24)));

  const isFinder = (row: number, col: number, moduleCount: number) => {
    const finderSize = 7;
    return (
      (row < finderSize && col < finderSize) ||
      (row < finderSize && col >= moduleCount - finderSize) ||
      (row >= moduleCount - finderSize && col < finderSize)
    );
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    ctx.fill();
  };

  const drawFinder = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    moduleSize: number,
  ) => {
    const outer = moduleSize * 7;
    const middle = moduleSize * 5;
    const inner = moduleSize * 3;
    const radius = eyeStyle === 'rounded' ? moduleSize * 1.4 : eyeStyle === 'circle' ? outer / 2 : 0;

    ctx.fillStyle = dark;
    if (radius) drawRoundedRect(ctx, x, y, outer, outer, radius);
    else ctx.fillRect(x, y, outer, outer);

    ctx.fillStyle = light;
    if (radius) drawRoundedRect(ctx, x + moduleSize, y + moduleSize, middle, middle, radius * 0.72);
    else ctx.fillRect(x + moduleSize, y + moduleSize, middle, middle);

    ctx.fillStyle = dark;
    if (radius) drawRoundedRect(ctx, x + moduleSize * 2, y + moduleSize * 2, inner, inner, radius * 0.5);
    else ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, inner, inner);
  };

  const drawLogo = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    boxSize: number,
  ) => {
    if (logo === 'none') return;

    const pad = boxSize * 0.13;
    const outer = boxSize + pad * 2;
    const x = centerX - outer / 2;
    const y = centerY - outer / 2;
    const radius = outer * 0.18;

    ctx.fillStyle = logoBg;
    drawRoundedRect(ctx, x, y, outer, outer, radius);

    const inner = boxSize * 0.66;
    const ix = centerX - inner / 2;
    const iy = centerY - inner / 2;
    ctx.fillStyle = logoColor;

    if (logo === 'facebook') {
      ctx.font = `900 ${inner * 0.95}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('f', centerX, centerY + inner * 0.08);
    } else if (logo === 'instagram') {
      ctx.lineWidth = Math.max(2, inner * 0.11);
      ctx.strokeStyle = logoColor;
      ctx.strokeRect(ix, iy, inner, inner);
      ctx.beginPath();
      ctx.arc(centerX, centerY, inner * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = logoColor;
      ctx.beginPath();
      ctx.arc(ix + inner * 0.78, iy + inner * 0.22, inner * 0.07, 0, Math.PI * 2);
      ctx.fill();
    } else if (logo === 'youtube') {
      ctx.fillStyle = logoColor;
      drawRoundedRect(ctx, ix, iy + inner * 0.15, inner, inner * 0.7, inner * 0.18);
      ctx.fillStyle = logoBg;
      ctx.beginPath();
      ctx.moveTo(centerX - inner * 0.1, centerY - inner * 0.16);
      ctx.lineTo(centerX - inner * 0.1, centerY + inner * 0.16);
      ctx.lineTo(centerX + inner * 0.18, centerY);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.font = `900 ${inner * (logo === 'x' ? 0.66 : 0.38)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(logo === 'behance' ? 'Be' : logo === 'x' ? '𝕏' : '↗', centerX, centerY);
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const qr = createQR();
    const moduleCount = qr.modules.size;
    const moduleData = qr.modules.data;
    const quietZone = margin;
    const totalModules = moduleCount + quietZone * 2;
    const moduleSize = size / totalModules;
    const logoGap = getLogoGap(moduleCount);
    const centerStart = Math.floor((moduleCount - logoGap) / 2);
    const centerEnd = centerStart + logoGap;

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = dark;

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        const darkModule = moduleData[row * moduleCount + col];
        if (!darkModule || isFinder(row, col, moduleCount)) continue;
        if (logo !== 'none' && row >= centerStart && row < centerEnd && col >= centerStart && col < centerEnd) continue;

        const x = (col + quietZone) * moduleSize;
        const y = (row + quietZone) * moduleSize;
        const gap = moduleStyle === 'dots' ? moduleSize * 0.18 : moduleStyle === 'soft' ? moduleSize * 0.08 : 0;
        const w = moduleSize - gap * 2;

        if (moduleStyle === 'dots') {
          ctx.beginPath();
          ctx.arc(x + moduleSize / 2, y + moduleSize / 2, w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (moduleStyle === 'rounded' || moduleStyle === 'soft') {
          drawRoundedRect(ctx, x + gap, y + gap, w, w, moduleStyle === 'rounded' ? w * 0.28 : w * 0.16);
        } else {
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }

    drawFinder(ctx, quietZone * moduleSize, quietZone * moduleSize, moduleSize);
    drawFinder(ctx, (quietZone + moduleCount - 7) * moduleSize, quietZone * moduleSize, moduleSize);
    drawFinder(ctx, quietZone * moduleSize, (quietZone + moduleCount - 7) * moduleSize, moduleSize);

    if (logo !== 'none') {
      drawLogo(ctx, size / 2, size / 2, logoGap * moduleSize * 0.72);
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [value, size, margin, dark, light, moduleStyle, eyeStyle, logo, logoColor, logoBg]);

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

  const svgLogo = (centerX: number, centerY: number, boxSize: number) => {
    if (logo === 'none') return '';
    const outer = boxSize * 1.18;
    const x = centerX - outer / 2;
    const y = centerY - outer / 2;
    const inner = boxSize * 0.66;

    const base = `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${outer * 0.18}" fill="${logoBg}"/>`;
    const ix = centerX - inner / 2;
    const iy = centerY - inner / 2;

    if (logo === 'facebook') return `${base}<text x="${centerX}" y="${centerY + inner * 0.31}" text-anchor="middle" font-family="Arial" font-weight="900" font-size="${inner * 0.95}" fill="${logoColor}">f</text>`;
    if (logo === 'behance') return `${base}<text x="${centerX}" y="${centerY + inner * 0.15}" text-anchor="middle" font-family="Arial" font-weight="900" font-size="${inner * 0.38}" fill="${logoColor}">Be</text>`;
    if (logo === 'x') return `${base}<text x="${centerX}" y="${centerY + inner * 0.18}" text-anchor="middle" font-family="Arial" font-weight="900" font-size="${inner * 0.66}" fill="${logoColor}">𝕏</text>`;
    if (logo === 'website') return `${base}<text x="${centerX}" y="${centerY + inner * 0.18}" text-anchor="middle" font-family="Arial" font-weight="900" font-size="${inner * 0.62}" fill="${logoColor}">↗</text>`;
    if (logo === 'youtube') {
      return `${base}<rect x="${ix}" y="${iy + inner * 0.15}" width="${inner}" height="${inner * 0.7}" rx="${inner * 0.18}" fill="${logoColor}"/><path d="M ${centerX - inner * 0.1} ${centerY - inner * 0.16} L ${centerX - inner * 0.1} ${centerY + inner * 0.16} L ${centerX + inner * 0.18} ${centerY} Z" fill="${logoBg}"/>`;
    }
    return `${base}<rect x="${ix}" y="${iy}" width="${inner}" height="${inner}" rx="${inner * 0.18}" fill="none" stroke="${logoColor}" stroke-width="${inner * 0.11}"/><circle cx="${centerX}" cy="${centerY}" r="${inner * 0.22}" fill="none" stroke="${logoColor}" stroke-width="${inner * 0.11}"/><circle cx="${ix + inner * 0.78}" cy="${iy + inner * 0.22}" r="${inner * 0.07}" fill="${logoColor}"/>`;
  };

  const buildSVG = () => {
    const qr = createQR();
    const moduleCount = qr.modules.size;
    const moduleData = qr.modules.data;
    const quietZone = margin;
    const totalModules = moduleCount + quietZone * 2;
    const moduleSize = size / totalModules;
    const logoGap = getLogoGap(moduleCount);
    const centerStart = Math.floor((moduleCount - logoGap) / 2);
    const centerEnd = centerStart + logoGap;
    const parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
      `<rect width="${size}" height="${size}" fill="${light}"/>`,
    ];

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        const darkModule = moduleData[row * moduleCount + col];
        if (!darkModule || isFinder(row, col, moduleCount)) continue;
        if (logo !== 'none' && row >= centerStart && row < centerEnd && col >= centerStart && col < centerEnd) continue;

        const x = (col + quietZone) * moduleSize;
        const y = (row + quietZone) * moduleSize;
        const gap = moduleStyle === 'dots' ? moduleSize * 0.18 : moduleStyle === 'soft' ? moduleSize * 0.08 : 0;
        const w = moduleSize - gap * 2;
        const rx = moduleStyle === 'rounded' ? w * 0.28 : moduleStyle === 'soft' ? w * 0.16 : 0;

        parts.push(
          moduleStyle === 'dots'
            ? `<circle cx="${x + moduleSize / 2}" cy="${y + moduleSize / 2}" r="${w / 2}" fill="${dark}"/>`
            : `<rect x="${x + gap}" y="${y + gap}" width="${w}" height="${w}" rx="${rx}" fill="${dark}"/>`,
        );
      }
    }

    const finder = (x: number, y: number) => {
      const outer = moduleSize * 7;
      const middle = moduleSize * 5;
      const inner = moduleSize * 3;
      const rx = eyeStyle === 'rounded' ? moduleSize * 1.4 : eyeStyle === 'circle' ? outer / 2 : 0;
      return `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${rx}" fill="${dark}"/><rect x="${x + moduleSize}" y="${y + moduleSize}" width="${middle}" height="${middle}" rx="${rx * 0.72}" fill="${light}"/><rect x="${x + moduleSize * 2}" y="${y + moduleSize * 2}" width="${inner}" height="${inner}" rx="${rx * 0.5}" fill="${dark}"/>`;
    };

    parts.push(
      finder(quietZone * moduleSize, quietZone * moduleSize),
      finder((quietZone + moduleCount - 7) * moduleSize, quietZone * moduleSize),
      finder(quietZone * moduleSize, (quietZone + moduleCount - 7) * moduleSize),
    );

    if (logo !== 'none') {
      parts.push(svgLogo(size / 2, size / 2, logoGap * moduleSize * 0.72));
    }

    parts.push('</svg>');
    return parts.join('');
  };

  const downloadSVG = () => {
    downloadBlob(buildSVG(), 'toolly-qr.svg', 'image/svg+xml;charset=utf-8');
  };

  const downloadEPS = () => {
    const qr = createQR();
    const moduleCount = qr.modules.size;
    const moduleData = qr.modules.data;
    const quietZone = margin;
    const totalModules = moduleCount + quietZone * 2;
    const moduleSize = size / totalModules;
    const logoGap = getLogoGap(moduleCount);
    const centerStart = Math.floor((moduleCount - logoGap) / 2);
    const centerEnd = centerStart + logoGap;

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

    const rect = (x: number, y: number, w: number, h: number, rx = 0) => {
      if (!rx) return `${x.toFixed(4)} ${y.toFixed(4)} ${w.toFixed(4)} ${h.toFixed(4)} rectfill`;
      const r = Math.min(rx, w / 2, h / 2);
      return `newpath ${(x + r).toFixed(4)} ${y.toFixed(4)} moveto ${(x + w - r).toFixed(4)} ${y.toFixed(4)} lineto ${(x + w).toFixed(4)} ${(y + r).toFixed(4)} lineto ${(x + w).toFixed(4)} ${(y + h - r).toFixed(4)} lineto ${(x + w - r).toFixed(4)} ${(y + h).toFixed(4)} lineto ${(x + r).toFixed(4)} ${(y + h).toFixed(4)} lineto ${x.toFixed(4)} ${(y + h - r).toFixed(4)} lineto ${x.toFixed(4)} ${(y + r).toFixed(4)} lineto closepath fill`;
    };

    const lines = [
      '%!PS-Adobe-3.0 EPSF-3.0',
      `%%BoundingBox: 0 0 ${size} ${size}`,
      '%%Creator: Toolly.ami QR Generator',
      '%%LanguageLevel: 2',
      '%%Pages: 1',
      '%%EndComments',
      'gsave',
      rgb(light),
      `0 0 ${size} ${size} rectfill`,
      rgb(dark),
    ];

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        const darkModule = moduleData[row * moduleCount + col];
        if (!darkModule || isFinder(row, col, moduleCount)) continue;
        if (logo !== 'none' && row >= centerStart && row < centerEnd && col >= centerStart && col < centerEnd) continue;

        const x = (col + quietZone) * moduleSize;
        const y = size - (row + quietZone + 1) * moduleSize;
        const gap = moduleStyle === 'dots' ? moduleSize * 0.18 : moduleStyle === 'soft' ? moduleSize * 0.08 : 0;
        const w = moduleSize - gap * 2;
        const radius = moduleStyle === 'rounded' ? w * 0.28 : moduleStyle === 'soft' ? w * 0.16 : 0;

        if (moduleStyle === 'dots') {
          const cx = x + moduleSize / 2;
          const cy = y + moduleSize / 2;
          lines.push(`newpath ${cx.toFixed(4)} ${cy.toFixed(4)} ${(w / 2).toFixed(4)} 0 360 arc closepath fill`);
        } else {
          lines.push(rect(x + gap, y + gap, w, w, radius));
        }
      }
    }

    const finderEPS = (x: number, y: number) => {
      const outer = moduleSize * 7;
      const middle = moduleSize * 5;
      const inner = moduleSize * 3;
      const radius = eyeStyle === 'rounded' ? moduleSize * 1.4 : eyeStyle === 'circle' ? outer / 2 : 0;
      return [
        rect(x, y, outer, outer, radius),
        rgb(light),
        rect(x + moduleSize, y + moduleSize, middle, middle, radius * 0.72),
        rgb(dark),
        rect(x + moduleSize * 2, y + moduleSize * 2, inner, inner, radius * 0.5),
      ];
    };

    lines.push(...finderEPS(quietZone * moduleSize, size - (quietZone + 7) * moduleSize));
    lines.push(...finderEPS((quietZone + moduleCount - 7) * moduleSize, size - (quietZone + 7) * moduleSize));
    lines.push(...finderEPS(quietZone * moduleSize, size - (quietZone + moduleCount) * moduleSize));

    if (logo !== 'none') {
      const boxSize = logoGap * moduleSize * 0.72;
      const outer = boxSize * 1.18;
      const x = size / 2 - outer / 2;
      const y = size / 2 - outer / 2;
      lines.push(rgb(logoBg), rect(x, y, outer, outer, outer * 0.18), rgb(logoColor));
      const centerX = size / 2;
      const centerY = size / 2;
      if (logo === 'facebook') {
        lines.push(`/Helvetica-Bold findfont ${(boxSize * 0.7).toFixed(2)} scalefont setfont ${(centerX - boxSize * 0.12).toFixed(2)} ${(centerY - boxSize * 0.24).toFixed(2)} moveto (f) show`);
      } else if (logo === 'behance') {
        lines.push(`/Helvetica-Bold findfont ${(boxSize * 0.3).toFixed(2)} scalefont setfont ${(centerX - boxSize * 0.28).toFixed(2)} ${(centerY - boxSize * 0.1).toFixed(2)} moveto (Be) show`);
      } else if (logo === 'x') {
        lines.push(`/Helvetica-Bold findfont ${(boxSize * 0.55).toFixed(2)} scalefont setfont ${(centerX - boxSize * 0.25).toFixed(2)} ${(centerY - boxSize * 0.18).toFixed(2)} moveto (X) show`);
      } else if (logo === 'website') {
        lines.push(`/Helvetica-Bold findfont ${(boxSize * 0.52).toFixed(2)} scalefont setfont ${(centerX - boxSize * 0.18).toFixed(2)} ${(centerY - boxSize * 0.18).toFixed(2)} moveto (>) show`);
      } else if (logo === 'youtube') {
        lines.push(rect(centerX - boxSize * 0.33, centerY - boxSize * 0.22, boxSize * 0.66, boxSize * 0.44, boxSize * 0.1), rgb(logoBg));
        lines.push(`newpath ${(centerX - boxSize * 0.07).toFixed(4)} ${(centerY - boxSize * 0.11).toFixed(4)} moveto ${(centerX - boxSize * 0.07).toFixed(4)} ${(centerY + boxSize * 0.11).toFixed(4)} lineto ${(centerX + boxSize * 0.14).toFixed(4)} ${centerY.toFixed(4)} lineto closepath fill`);
      } else {
        lines.push(`newpath ${centerX.toFixed(4)} ${(centerY - boxSize * 0.2).toFixed(4)} ${(boxSize * 0.15).toFixed(4)} 0 360 arc stroke`);
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
    setModuleStyle('square');
    setEyeStyle('square');
    setLogo('none');
    setLogoColor('#09090b');
    setLogoBg('#ffffff');
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

          <div className="mt-8 border-t border-white/5 pt-7">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
              <Sparkles size={15} />
              <span className="text-xs font-black uppercase tracking-widest">QR style</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODULE_STYLES.map((style) => (
                <button key={style.id} onClick={() => setModuleStyle(style.id)} className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors ${moduleStyle === style.id ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                  {style.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {EYE_STYLES.map((style) => (
                <button key={style.id} onClick={() => setEyeStyle(style.id)} className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors ${eyeStyle === style.id ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                  Eyes · {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-7">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
              <span className="text-xs font-black uppercase tracking-widest">Center logo</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LOGO_PRESETS.map((item) => (
                <button key={item.id} onClick={() => setLogo(item.id)} className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors ${logo === item.id ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                  {item.label}
                </button>
              ))}
            </div>

            {logo !== 'none' && (
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-white/5">
                  <span className="text-xs font-bold text-zinc-400">Logo color</span>
                  <input type="color" value={logoColor} onChange={(e) => setLogoColor(e.target.value)} className="w-10 h-8 bg-transparent cursor-pointer" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-white/5">
                  <span className="text-xs font-bold text-zinc-400">Logo background</span>
                  <input type="color" value={logoBg} onChange={(e) => setLogoBg(e.target.value)} className="w-10 h-8 bg-transparent cursor-pointer" />
                </label>
              </div>
            )}
          </div>

          <div className="mt-7 flex items-center gap-2 text-[11px] text-zinc-600">
            <Sparkles size={14} /> High error correction enabled · center logo is automatically protected.
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
