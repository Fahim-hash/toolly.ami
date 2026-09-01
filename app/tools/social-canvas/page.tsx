"use client";

import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Layout,
  Upload,
  Download,
  Sliders,
  Sparkles,
  Maximize2,
  Eye,
  EyeOff
} from "lucide-react";

type Preset = {
  name: string;
  ratio: string;
  aspect: number;
  width: number;
  height: number;
};

const PRESETS: Preset[] = [
  { name: "FB Cover", ratio: "16:9", aspect: 16 / 9, width: 1200, height: 675 },
  { name: "Insta Square", ratio: "1:1", aspect: 1, width: 1080, height: 1080 },
  { name: "Insta Story / Reel", ratio: "9:16", aspect: 9 / 16, width: 1080, height: 1920 },
  { name: "LinkedIn Banner", ratio: "4:1", aspect: 4, width: 1584, height: 396 },
  { name: "YT Thumbnail", ratio: "16:9", aspect: 16 / 9, width: 1280, height: 720 },
];

export default function SocialCanvasPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImageSrc(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const canvas = document.createElement("canvas");
    canvas.width = selectedPreset.width;
    canvas.height = selectedPreset.height;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scaledWidth = (img.width * (scale / 100));
        const scaledHeight = (img.height * (scale / 100));
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        const link = document.createElement("a");
        link.download = `${selectedPreset.name.toLowerCase().replace(/\s+/g, "-")}-export.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold flex items-center gap-1.5">
            <Layout size={14} /> Static Layouts
          </span>
        </div>

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center justify-center md:justify-start gap-3">
            Social Banner Canvas
            <Sparkles className="text-blue-400" size={32} />
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl">
            Fit, frame, and preview your static artwork with precise safe zones for social media platforms.
          </p>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Image Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-blue-500/50 bg-zinc-900/40 rounded-3xl p-6 text-center cursor-pointer transition-all backdrop-blur-sm group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <p className="text-sm font-semibold mb-1">Upload Static Artwork</p>
              <p className="text-xs text-zinc-500">Supports PNG, JPG, WebP</p>
            </div>

            {/* Canvas Preset Controls */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm space-y-5">
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} /> Dimension Presets
              </h2>

              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 text-left rounded-xl border flex items-center justify-between transition-all ${
                      selectedPreset.name === preset.name
                        ? "bg-blue-500/20 border-blue-500 text-blue-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-xs font-semibold">{preset.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {preset.width}x{preset.height} ({preset.ratio})
                    </span>
                  </button>
                ))}
              </div>

              {/* Artwork Scale Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Image Scale</span>
                  <span className="text-blue-400 font-mono">{scale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-blue-400 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Safe Area Grid Toggle */}
              <button
                onClick={() => setShowSafeZone(!showSafeZone)}
                className="w-full py-2.5 px-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 text-zinc-300 transition-all"
              >
                {showSafeZone ? <EyeOff size={14} /> : <Eye size={14} />}
                {showSafeZone ? "Hide Safe Area Grid" : "Show Safe Area Grid"}
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm min-h-[450px] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/60">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 size={14} /> Stage Preview ({selectedPreset.name})
                </span>
                <button
                  disabled={!imageSrc}
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={14} /> Export PNG
                </button>
              </div>

              {/* Render Area */}
              <div className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex items-center justify-center p-6 relative overflow-hidden min-h-[320px]">
                {!imageSrc ? (
                  <p className="text-xs text-zinc-600">Upload an artwork to fit social canvas</p>
                ) : (
                  <div
                    className="relative border border-zinc-700 overflow-hidden shadow-2xl flex items-center justify-center bg-black transition-all duration-300"
                    style={{
                      aspectRatio: `${selectedPreset.aspect}`,
                      maxWidth: "100%",
                      maxHeight: "360px",
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Uploaded Banner"
                      className="object-contain max-w-none transition-transform duration-100"
                      style={{ transform: `scale(${scale / 100})` }}
                    />

                    {/* Safe Zone Grid Overlay */}
                    {showSafeZone && (
                      <div className="absolute inset-4 border border-dashed border-blue-400/50 pointer-events-none flex items-center justify-center">
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded backdrop-blur-sm">
                          Content Safe Zone
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
