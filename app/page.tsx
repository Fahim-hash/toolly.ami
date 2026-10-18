"use client";
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FileText, Type, Maximize, Scissors, Palette, Layers, Zap, ArrowRight, Eraser, FileCode, Wand2, Hash, Image as ImageIcon, Scaling, Move, Search, Contrast, Code, QrCode, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { name: 'Watermark Adder', desc: 'Protect images with adjustable text watermarks and batch processing.', icon: Type, href: '/tools/watermark', color: 'text-blue-400', bg: 'bg-blue-500/10', category: 'Image' },
  { name: 'Image Compressor', desc: 'Reduce image file size with quality and resolution controls.', icon: Maximize, href: '/tools/compress', color: 'text-purple-400', bg: 'bg-purple-500/10', category: 'Image' },
  { name: 'Smart Resizer', desc: 'Resize designs for social media and common creative formats.', icon: Scissors, href: '/tools/resize', color: 'text-emerald-400', bg: 'bg-emerald-500/10', category: 'Image' },
  { name: 'Color Extractor', desc: 'Explore colors and build palettes for your next design.', icon: Palette, href: '/tools/colors', color: 'text-orange-400', bg: 'bg-orange-500/10', category: 'Design' },
  { name: 'Background Remover', desc: 'Create clean cutouts with in-browser AI processing.', icon: Eraser, href: '/tools/bg-remover', color: 'text-pink-400', bg: 'bg-pink-500/10', category: 'Image' },
  { name: 'SVG Optimizer', desc: 'Optimize SVG markup for smaller, cleaner vector files.', icon: FileCode, href: '/tools/svg-opt', color: 'text-yellow-300', bg: 'bg-yellow-500/10', category: 'Developer' },
  { name: 'Font Pairer', desc: 'Preview and compare typography combinations.', icon: Wand2, href: '/tools/fonts', color: 'text-indigo-300', bg: 'bg-indigo-500/10', category: 'Design' },
  { name: 'A11y Checker', desc: 'Review contrast and accessibility considerations for designs.', icon: Hash, href: '/tools/a11y', color: 'text-cyan-300', bg: 'bg-cyan-500/10', category: 'Design' },
  { name: 'Favicon Generator', desc: 'Prepare favicon assets for websites and apps.', icon: ImageIcon, href: '/tools/favicon', color: 'text-red-300', bg: 'bg-red-500/10', category: 'Developer' },
  { name: 'Format Converter', desc: 'Convert images between PNG, JPG and WebP formats.', icon: Move, href: '/tools/convert', color: 'text-rose-300', bg: 'bg-rose-500/10', category: 'Image' },
  { name: 'HD Upscaler', desc: 'Scale up image dimensions with available browser tools.', icon: Scaling, href: '/tools/upscale', color: 'text-blue-300', bg: 'bg-blue-400/10', category: 'Image' },
  { name: 'Border Radius', desc: 'Build and copy CSS corner-radius values visually.', icon: Contrast, href: '/tools/radius', color: 'text-violet-300', bg: 'bg-violet-500/10', category: 'Developer' },
  { name: 'Asset Search', desc: 'Discover imagery for your creative projects.', icon: Search, href: '/tools/assets', color: 'text-amber-300', bg: 'bg-amber-500/10', category: 'Assets' },
  { name: 'Layer Shadow', desc: 'Create layered CSS shadows and copy the result.', icon: Layers, href: '/tools/shadow', color: 'text-sky-300', bg: 'bg-sky-500/10', category: 'Developer' },
  { name: 'Grain Texture', desc: 'Generate a downloadable noise texture for artwork.', icon: Zap, href: '/tools/grain', color: 'text-zinc-300', bg: 'bg-zinc-500/10', category: 'Design' },
  { name: 'Icon Packager', desc: 'Bundle uploaded SVG icons into a convenient ZIP archive.', icon: Code, href: '/tools/package', color: 'text-green-300', bg: 'bg-green-500/10', category: 'Developer' },
  { name: 'Image Vectorizer', desc: 'Trace raster artwork into a simplified SVG image.', icon: Maximize, href: '/tools/vectorize', color: 'text-amber-300', bg: 'bg-amber-500/10', category: 'Image' },
  { name: 'PSD to PDF', desc: 'Convert Photoshop documents into shareable PDF pages.', icon: FileText, href: '/tools/psd-to-pdf', color: 'text-blue-300', bg: 'bg-blue-500/10', category: 'Design' },
  { name: 'QR Generator', desc: 'Create customizable, high-resolution QR codes locally.', icon: QrCode, href: '/tools/qr', color: 'text-white', bg: 'bg-white/10', category: 'Utilities' },
  { name: 'Pattern Maker', desc: 'Create repeatable patterns and export your design.', icon: Sparkles, href: '/tools/pattern-maker', color: 'text-fuchsia-300', bg: 'bg-fuchsia-500/10', category: 'Design' },
];

const categories = ['All tools', 'Image', 'Design', 'Developer', 'Assets', 'Utilities'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All tools');
  const filtered = useMemo(() => features.filter((item) =>
    (category === 'All tools' || item.category === category) &&
    (item.name + ' ' + item.desc + ' ' + item.category).toLowerCase().includes(query.toLowerCase().trim())
  ), [query, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[.09] bg-zinc-950/55 px-6 py-14 text-center shadow-2xl shadow-black/20 sm:px-12 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-500/15 blur-[100px]" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="relative mx-auto max-w-4xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[.08] px-4 py-2 text-xs font-semibold tracking-wide text-violet-200"><Sparkles size={14} /> Your creative workflow, simplified</span>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">Make more.<br /><span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-sky-300 bg-clip-text text-transparent">Tool around less.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">A practical toolkit for designers and makers. Edit images, explore color, prepare assets and speed up everyday creative work.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#tools" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-violet-100">Explore tools <ArrowRight size={16} /></a>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-zinc-300"><ShieldCheck size={16} className="text-emerald-300" /> Privacy-conscious tools</span>
          </div>
        </motion.div>
      </section>

      <section id="tools" className="scroll-mt-24 pt-14">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">Tool library</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Everything you need to create</h2><p className="mt-2 text-sm text-zinc-500">{filtered.length} {filtered.length === 1 ? 'tool' : 'tools'} shown · Choose a tool to get started</p></div>
          <div className="relative w-full sm:max-w-xs"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" /><input aria-label="Search tools" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." className="w-full rounded-xl border border-white/10 bg-zinc-950/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60" /></div>
        </div>
        <div className="mb-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filter tools by category">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${category === item ? 'border-violet-300/40 bg-violet-400/15 text-violet-100' : 'border-white/[.08] bg-white/[.02] text-zinc-400 hover:border-white/20 hover:text-white'}`}>{item}</button>)}
        </div>
        {filtered.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, index) => <motion.div key={item.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .018, .18) }}>
            <Link href={item.href} className="group flex h-full min-h-52 flex-col rounded-2xl border border-white/[.08] bg-zinc-950/50 p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-300/30 hover:bg-zinc-900/80 focus-visible:outline-violet-300">
              <div className="mb-5 flex items-start justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} ${item.color}`}><item.icon size={21} strokeWidth={1.8} /></span><span className="rounded-full border border-white/[.07] px-2.5 py-1 text-[10px] text-zinc-500">{item.category}</span></div>
              <h3 className="flex items-center gap-2 font-bold text-zinc-100">{item.name}<ArrowRight size={14} className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-200" /></h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{item.desc}</p>
            </Link>
          </motion.div>)}
        </div> : <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center"><Search size={26} className="mx-auto text-zinc-600" /><p className="mt-3 font-semibold">No matching tools</p><p className="mt-1 text-sm text-zinc-500">Try another search or choose a different category.</p><button onClick={() => { setQuery(''); setCategory('All tools'); }} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">Clear filters</button></div>}
      </section>

      <section className="mt-14 grid gap-4 rounded-3xl border border-white/[.08] bg-gradient-to-br from-violet-500/[.09] via-zinc-950/70 to-sky-500/[.05] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
        <div><div className="flex items-center gap-2 text-sm font-semibold text-violet-200"><ShieldCheck size={17} /> Built with privacy in mind</div><h2 className="mt-3 text-xl font-bold sm:text-2xl">Your creative files deserve care.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Many tools process files directly in your browser. Features that use external services may send requests to those providers; check each tool’s notice before uploading sensitive material.</p></div>
        <Link href="/tools/qr" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-violet-100"><QrCode size={17} /> Create a QR code</Link>
      </section>
      <footer className="mt-12 flex flex-col gap-3 border-t border-white/[.07] pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Toolly. Made for creative workflows.</span><a href="https://github.com/Fahim-hash/toolly.ami" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-zinc-300">Open-source project <ArrowRight size={13} /></a></footer>
    </div>
  );
}
