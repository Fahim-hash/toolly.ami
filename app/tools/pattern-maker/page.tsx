"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Grid,
  Copy,
  Check,
  Download,
  Sliders,
  Sparkles
} from "lucide-react";

export default function PatternMakerPage() {
  const [patternType, setPatternType] = useState<"grid" | "dots" | "cross">("dots");
  const [size, setSize] = useState<number>(24);
  const [dotSize, setDotSize] = useState<number>(3);
  const [patternColor, setPatternColor] = useState<string>("#52525b");
  const [bgColor, setBgColor] = useState<string>("#09090b");
  const [copied, setCopied] = useState(false);

  // SVG Pattern Code Generator
  const getSvgPattern = () => {
    let patternContent = "";
    if (patternType === "dots") {
      patternContent = `<circle cx="${size / 2}" cy="${size / 2}" r="${dotSize}" fill="${patternColor}" />`;
    } else if (patternType === "grid") {
      patternContent = `<path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${patternColor}" stroke-width="${dotSize}" />`;
    } else {
      patternContent = `<path d="M ${size / 2 - dotSize} ${size / 2} H ${size / 2 + dotSize} M ${size / 2} ${size / 2 - dotSize} V ${size / 2 + dotSize}" stroke="${patternColor}" stroke-width="1.5" stroke-linecap="round" />`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <pattern id="pattern" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
      ${patternContent}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="100%" height="100%" fill="url(#pattern)" />
</svg>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSvgPattern());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getSvgPattern()], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "static-background-pattern.svg";
    a.click();
    URL.revokeObjectURL(url);
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

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <Grid size={14} /> Static Graphics
          </span>
        </div>

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center justify-center md:justify-start gap-3">
            Static Pattern Studio
            <Sparkles className="text-emerald-400" size={32} />
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl">
            Create custom SVG background patterns for static poster designs, ad banners, and social media graphics.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm space-y-5">
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} /> Pattern Controls
              </h2>

              {/* Pattern Type Selection */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["dots", "grid", "cross"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPatternType(type)}
                      className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                        patternType === type
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Tile Spacing</span>
                  <span className="text-emerald-400 font-mono">{size}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="64"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Element Weight */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Element Size / Weight</span>
                  <span className="text-emerald-400 font-mono">{dotSize}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dotSize}
                  onChange={(e) => setDotSize(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Pattern Color</label>
                  <input
                    type="color"
                    value={patternColor}
                    onChange={(e) => setPatternColor(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer p-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Background</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer p-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Preview & Output */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-sm min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/60">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Live Canvas
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all flex items-center gap-1.5 text-xs border border-zinc-700"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? "Copied SVG" : "Copy SVG"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs hover:bg-emerald-300"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

              {/* Live Render Area */}
              <div className="flex-1 rounded-2xl border border-zinc-800 overflow-hidden min-h-[300px]">
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: getSvgPattern() }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
