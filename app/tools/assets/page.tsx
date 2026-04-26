"use client";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { 
  Search, Download, Image as ImageIcon, 
  RefreshCcw, Sparkles, Zap, ExternalLink 
} from 'lucide-react';

const AssetEngine = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  // Replace with your actual Unsplash Access Key
  const ACCESS_KEY = "KhZkznH-Sa_ksNLnCeupL_YRBMmupKI5jS5KriF50W0"; 

  const searchAssets = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsBusy(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=20&client_id=${ACCESS_KEY}`
      );
      const data = await res.json();
      setImages(data.results || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsBusy(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Toolly_${filename}.jpg`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 min-h-screen">
      {/* Search Header */}
      <div className="flex flex-col items-center mb-16 space-y-8">
        <div className="text-center">
          <div className="inline-flex p-4 bg-amber-500 rounded-3xl shadow-2xl shadow-amber-500/20 mb-6 rotate-3">
            <Search className="text-black" size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            Asset <span className="text-amber-500">Explorer</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2">Premium Unsplash Integration</p>
        </div>

        <form onSubmit={searchAssets} className="relative w-full max-w-2xl group">
          <input 
            type="text" 
            placeholder="Search high-res assets (e.g. 'Cyberpunk City' or 'Minimal UI')" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-[2rem] py-6 pl-8 pr-32 text-lg outline-none focus:border-amber-500/50 transition-all backdrop-blur-xl"
          />
          <button 
            type="submit"
            disabled={isBusy}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-black px-8 py-3 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isBusy ? <RefreshCcw className="animate-spin" size={18} /> : "Search"}
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-[3/4] bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5">
              <img 
                src={img.urls.regular} 
                alt={img.alt_description} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">By {img.user.name}</p>
                    <p className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter italic">Unsplash Premium</p>
                  </div>
                  <button 
                    onClick={() => downloadImage(img.urls.full, img.id)}
                    className="p-4 bg-white text-black rounded-2xl hover:bg-amber-500 transition-colors shadow-xl"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
          <ImageIcon size={60} className="mb-4 opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest">No assets loaded. Try a new search.</p>
        </div>
      )}
    </div>
  );
};

const DynamicAssets = dynamic(() => Promise.resolve(AssetEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-amber-500 font-black tracking-widest uppercase text-xs italic">
        Initializing Asset Engine...
      </div>
    </div>
  ),
});

export default function Page() {
  return <DynamicAssets />;
}
