"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Search, Download, Image as ImageIcon, 
  RefreshCcw, Zap, ArrowUpRight,
  LayoutGrid
} from 'lucide-react';

const AssetEngine = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const searchAssets = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/assets/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not search assets.");
      setImages(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not search assets. Please try again.");
      setImages([]);
    } finally {
      setIsBusy(false);
    }
  };

  const downloadImage = async (url: string, id: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Toolly_Asset_${id}.jpg`;
      link.click();
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 min-h-screen">
      {/* Hero Section */}
      <div className="relative z-10 mb-10 flex flex-col items-start space-y-5 text-left">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400">
            <Zap size={12} fill="currentColor" /> Powered by Unsplash
          </div>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight sm:text-5xl">
            ASSET <span className="text-zinc-500">HUB</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
            Find and download the world&apos;s most beautiful imagery for your projects.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={searchAssets} className="relative w-full max-w-2xl">
          <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[.025] p-1 transition focus-within:border-violet-400/60">
            <div className="pl-3 pr-2 text-zinc-500">
              <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="Search high-res assets (e.g. 3D Abstract, Minimalist Interior)" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600"
            />
            <button 
              type="submit"
              disabled={isBusy}
              className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {isBusy ? <RefreshCcw className="animate-spin" size={18} /> : "Search"}
            </button>
          </div>
        </form>
      </div>

      {error && <div role="alert" className="relative z-10 mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">{error}</div>}

      {/* Masonry Grid */}
      {images.length > 0 ? (
        <div className="relative z-10 columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {images.map((img) => (
            <div key={img.id} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
              <img 
                src={img.urls.regular} 
                alt={img.alt_description} 
                className="h-auto w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-between">
                <div className="flex justify-end">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Photographer</p>
                    <p className="text-sm font-bold text-white truncate max-w-[120px]">{img.user.name}</p>
                  </div>
                  <button 
                    onClick={() => downloadImage(img.urls.full, img.id)}
                    className="flex items-center gap-2 bg-amber-500 text-black px-5 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-white transition-colors"
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem]">
          <LayoutGrid size={32} className="text-zinc-800 mb-6" />
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">No Assets Found</p>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-20 text-center relative z-10">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em]">
          Toolly Studio Engine v1.0 • Built for HSC-26 Creators
        </p>
      </div>
    </div>
  );
};

// --- Correct Dynamic Export & Loading State ---
const DynamicAssets = dynamic(() => Promise.resolve(AssetEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      <p className="animate-pulse text-amber-500 font-black tracking-[0.4em] uppercase text-[10px] italic">
        Warming up Asset Engines...
      </p>
    </div>
  ),
});

export default function Page() {
  return (
    <main className="bg-[#050505] min-h-screen selection:bg-amber-500 selection:text-black">
      <DynamicAssets />
    </main>
  );
}
