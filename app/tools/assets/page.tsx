"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Search, Download, Image as ImageIcon, 
  RefreshCcw, Sparkles, Zap, ArrowUpRight,
  LayoutGrid, MousePointer2
} from 'lucide-react';

const AssetEngine = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  // Tomar deya Access Key eikhane add kora holo
  const ACCESS_KEY = "KhZkznH-Sa_ksNLnCeupL_YRBMmupKI5jS5KriF50W0"; 

  const searchAssets = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsBusy(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=24&client_id=${ACCESS_KEY}`
      );
      const data = await res.json();
      setImages(data.results || []);
    } catch (err) {
      console.error("Fetch Error:", err);
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
      window.open(url, '_blank'); // Fallback jodi fetch block hoy
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 min-h-screen">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center mb-16 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Zap size={12} fill="currentColor" /> Powered by Unsplash API
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
            ASSET <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-700">HUB</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-medium max-w-xl mx-auto">
            Find and download the world's most beautiful imagery for your next design project, right from Toolly.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={searchAssets} className="relative w-full max-w-3xl group">
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-zinc-900/80 border border-white/10 rounded-[2.5rem] p-2 backdrop-blur-3xl focus-within:border-amber-500/50 transition-all">
            <div className="pl-6 pr-4 text-zinc-500">
              <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="Search high-res assets (e.g. Minimalist Interior, Abstract 3D)" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent py-4 text-lg outline-none placeholder:text-zinc-700 font-medium"
            />
            <button 
              type="submit"
              disabled={isBusy}
              className="bg-amber-500 hover:bg-amber-400 text-black px-10 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {isBusy ? <RefreshCcw className="animate-spin" size={18} /> : "Search"}
            </button>
          </div>
        </form>
      </div>

      {/* Masonry-style Grid */}
      {images.length > 0 ? (
        <div className="relative z-10 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {images.map((img) => (
            <div 
              key={img.id} 
              className="relative break-inside-avoid rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 group shadow-2xl"
            >
              <img 
                src={img.urls.regular} 
                alt={img.alt_description} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
              />
              
              {/* Premium Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-between items-start">
                <div className="w-full flex justify-end">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                
                <div className="w-full flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Photographer</p>
                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{img.user.name}</p>
                  </div>
                  
                  <button 
                    onClick={() => downloadImage(img.urls.full, img.id)}
                    className="group/btn relative flex items-center gap-2 bg-amber-500 text-black px-5 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-white transition-colors"
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
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
            <LayoutGrid size={32} className="text-zinc-800" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600">No Assets to display</p>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-20 text-center relative z-10">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em]">
          Toolly Studio Engine v1.0 • Designed for HSC-26 Creators
        </p>
      </div>
    </div>
  );
};

// SSR Prevention
const DynamicAssets = dynamic(() => Promise.resolve(AssetEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      <p className="animate-pulse text-amber-500 font-black tracking-[0.4em] uppercase text-[10px] italic">
        Warming up Asset Engines...
      </div>
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
