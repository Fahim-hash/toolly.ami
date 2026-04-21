"use client";
import Link from 'next/link';
import { 
  Type, 
  Maximize, 
  Scissors, 
  Palette, 
  Layers, 
  Zap, 
  ArrowRight,
  Eraser,
  FileCode,
  Wand2,
  Hash,
  Image as ImageIcon,
  Scaling,
  Move,
  Search,
  Contrast,
  Code
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Watermark Adder',
    desc: 'Bulk image watermark protection with custom opacity.',
    icon: Type,
    href: '/tools/watermark',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    name: 'Image Compressor',
    desc: 'Reduce file size up to 90% without losing quality.',
    icon: Maximize,
    href: '/tools/compress',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    name: 'Smart Resizer',
    desc: 'Perfect aspect ratios for Instagram, Dribbble & Behance.',
    icon: Scissors,
    href: '/tools/resize',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    name: 'Color Extractor',
    desc: 'Generate color palettes directly from your designs.',
    icon: Palette,
    href: '/tools/colors',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    name: 'BG Remover',
    desc: 'AI-powered background removal for clean cutouts.',
    icon: Eraser,
    href: '/tools/bg-remover',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    name: 'SVG Optimizer',
    desc: 'Clean up and minify complex SVG code instantly.',
    icon: FileCode,
    href: '/tools/svg-opt',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    name: 'Font Pairer',
    desc: 'Discover perfect typography combinations for UI.',
    icon: Wand2,
    href: '/tools/fonts',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    name: 'A11y Checker',
    desc: 'Check color contrast and design accessibility.',
    icon: Hash,
    href: '/tools/a11y',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    name: 'Favicon Gen',
    desc: 'Generate all sizes of favicons for your web projects.',
    icon: ImageIcon,
    href: '/tools/favicon',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    name: 'Format Converter',
    desc: 'Convert images between PNG, JPG, WebP, and SVG.',
    icon: Move,
    href: '/tools/convert',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    name: 'HD Upscaler',
    desc: 'Enhance low-resolution images using AI scaling.',
    icon: Scaling,
    href: '/tools/upscale',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    name: 'Border Radius',
    desc: 'Visual CSS border radius and smooth corner generator.',
    icon: Contrast,
    href: '/tools/radius',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    name: 'Asset Search',
    desc: 'Find royalty-free icons and illustrations instantly.',
    icon: Search,
    href: '/tools/assets',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    name: 'Layer Shadow',
    desc: 'Create realistic multi-layered CSS shadows visually.',
    icon: Layers,
    href: '/tools/shadow',
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
  },
  {
    name: 'Grain Texture',
    desc: 'Add noise and analog grain textures to your art.',
    icon: Zap,
    href: '/tools/grain',
    color: 'text-zinc-400',
    bg: 'bg-zinc-400/10',
  },
  {
    name: 'Icon Packager',
    desc: 'Bundle and export icons for developer handoff.',
    icon: Code,
    href: '/tools/package',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium inline-block mb-6">
            Toolly: All-in-One Designer Toolkit ⚡
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent tracking-tight leading-[1.1]">
            Design Faster, <br /> Work Smarter.
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            A specialized suite of 16 tools built for creative designers. 
            Process images, manage assets, and boost your workflow instantly without any server upload.
          </p>
        </motion.div>
      </section>

      {/* Bento Grid Features - 16 Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        {features.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -5 }}
          >
            <Link 
              href={item.href}
              className="group block p-6 h-full bg-zinc-900/40 border border-zinc-800/50 rounded-3xl hover:border-zinc-600 transition-all backdrop-blur-sm"
            >
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                {item.name} <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Premium Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-900/20 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Privacy First Processing</h2>
          <p className="text-zinc-400 max-w-md">Your creative assets never touch our servers. Everything happens 100% locally in your browser.</p>
        </div>
        <button className="whitespace-nowrap px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2">
          <Zap size={20} fill="black" /> Get Started Now
        </button>
      </div>
    </div>
  );
}