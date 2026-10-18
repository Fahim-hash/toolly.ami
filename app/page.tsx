"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight, Search, Image as ImageIcon, Palette, Type, Code2,
  Eraser, FileCode2, Maximize2, Layers2, QrCode, Sparkles, ShieldCheck,
  FileText, Scan, Move, Scaling, Contrast, Zap, WandSparkles
} from "lucide-react";

const tools = [
  { name: "Watermark Adder", description: "Add text watermarks and protect images.", category: "Image", href: "/tools/watermark", icon: Type },
  { name: "Image Compressor", description: "Reduce file size while keeping quality.", category: "Image", href: "/tools/compress", icon: Maximize2 },
  { name: "Smart Resizer", description: "Resize artwork for common formats.", category: "Image", href: "/tools/resize", icon: Scaling },
  { name: "Color Extractor", description: "Explore colors and build palettes.", category: "Design", href: "/tools/colors", icon: Palette },
  { name: "Background Remover", description: "Create clean image cutouts in your browser.", category: "Image", href: "/tools/bg-remover", icon: Eraser },
  { name: "SVG Optimizer", description: "Clean up SVG markup and reduce file size.", category: "Developer", href: "/tools/svg-opt", icon: FileCode2 },
  { name: "Font Pairer", description: "Preview and compare type combinations.", category: "Design", href: "/tools/fonts", icon: Type },
  { name: "Contrast Checker", description: "Check color contrast for accessible design.", category: "Design", href: "/tools/a11y", icon: Contrast },
  { name: "Favicon Generator", description: "Prepare favicon assets for your website.", category: "Developer", href: "/tools/favicon", icon: ImageIcon },
  { name: "Format Converter", description: "Convert images between popular formats.", category: "Image", href: "/tools/convert", icon: Move },
  { name: "Image Upscaler", description: "Scale image dimensions for larger outputs.", category: "Image", href: "/tools/upscale", icon: Scan },
  { name: "Border Radius", description: "Build and copy CSS corner-radius values.", category: "Developer", href: "/tools/radius", icon: Contrast },
  { name: "Asset Search", description: "Find imagery for your creative projects.", category: "Assets", href: "/tools/assets", icon: Search },
  { name: "Layer Shadow", description: "Create and copy layered CSS shadows.", category: "Developer", href: "/tools/shadow", icon: Layers2 },
  { name: "Grain Texture", description: "Generate a noise texture for artwork.", category: "Design", href: "/tools/grain", icon: Sparkles },
  { name: "Icon Packager", description: "Bundle SVG icons into a ZIP archive.", category: "Developer", href: "/tools/package", icon: Code2 },
  { name: "Image Vectorizer", description: "Trace raster artwork into SVG.", category: "Image", href: "/tools/vectorize", icon: Scan },
  { name: "PSD to PDF", description: "Prepare Photoshop files for sharing.", category: "Design", href: "/tools/psd-to-pdf", icon: FileText },
  { name: "QR Generator", description: "Create customizable QR codes locally.", category: "Utilities", href: "/tools/qr", icon: QrCode },
  { name: "Pattern Maker", description: "Create repeatable patterns and export them.", category: "Design", href: "/tools/pattern-maker", icon: WandSparkles },
];

const categories = ["All tools", "Image", "Design", "Developer", "Assets", "Utilities"];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All tools");
  const filtered = useMemo(() => tools.filter((tool) =>
    (category === "All tools" || tool.category === category) &&
    (tool.name + " " + tool.description + " " + tool.category).toLowerCase().includes(query.trim().toLowerCase())
  ), [query, category]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
      <section className="max-w-3xl">
        <p className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> A little more room to create</p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-.045em] text-white sm:text-6xl">Useful tools.<br /><span className="text-zinc-500">Less busywork.</span></h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">A focused toolkit for designers and makers. Prepare images, explore ideas and get everyday creative work done — without the clutter.</p>
        <a href="#tools" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-violet-200">Browse all tools <ArrowUpRight size={16} /></a>
      </section>

      <section id="tools" className="scroll-mt-24 pt-16 sm:pt-20">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[.18em] text-zinc-500">The toolkit</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Find the right tool</h2>
            <p className="mt-2 text-sm text-zinc-500">{filtered.length} {filtered.length === 1 ? "tool" : "tools"}</p>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input aria-label="Search tools" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or task…" className="w-full rounded-xl border border-white/10 bg-white/[.025] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60" />
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto py-5" aria-label="Filter tools by category">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-3.5 py-2 text-xs transition ${category === item ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white/[.06] hover:text-white"}`}>{item}</button>)}
        </div>

        {filtered.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool, index) => <Link key={tool.href} href={tool.href} className={`group flex min-h-[118px] items-start gap-4 border-t border-white/[.08] py-5 transition-colors hover:bg-white/[.025] sm:px-4 ${index % 3 === 0 ? "lg:pl-0" : ""}`}>
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition group-hover:border-violet-300/30 group-hover:text-violet-200"><tool.icon size={17} strokeWidth={1.7} /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium text-zinc-100">{tool.name}<ArrowUpRight size={13} className="text-zinc-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></span>
              <span className="mt-1.5 block text-sm leading-6 text-zinc-500">{tool.description}</span>
              <span className="mt-2 block text-[11px] text-zinc-600">{tool.category}</span>
            </span>
          </Link>)}
        </div> : <div className="border-t border-white/10 py-14 text-center"><p className="text-sm font-medium text-zinc-200">No tools found</p><p className="mt-2 text-sm text-zinc-500">Try a different search or category.</p><button onClick={() => { setQuery(""); setCategory("All tools"); }} className="mt-4 text-sm text-violet-300 hover:text-violet-200">Clear filters</button></div>}
      </section>

      <section className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-300"><ShieldCheck size={16} className="text-zinc-500" /> Thoughtful tools, with privacy in mind.</div>
        <p className="max-w-lg text-xs leading-5 text-zinc-600">Some tools run locally in your browser; tools that use external services may send requests to those providers. Check each tool’s notice before using sensitive files.</p>
      </section>
      <footer className="mt-12 flex flex-col gap-3 border-t border-white/[.08] pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Toolly</span>
        <a href="https://github.com/Fahim-hash/toolly.ami" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-zinc-300">Open-source project <ArrowUpRight size={12} /></a>
      </footer>
    </div>
  );
}
