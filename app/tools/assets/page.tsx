"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { 
  Search, ExternalLink, Image as ImageIcon, 
  Palette, MousePointer2, Box, 
  Sparkles, Zap, Command
} from 'lucide-react';

const AssetEngine = () => {
  const [query, setQuery] = useState('');
  
  const platforms = [
    { name: 'Unsplash', category: 'High-Res Photos', url: `https://unsplash.com/s/photos/${query}`, icon: ImageIcon, color: 'text-white', bg: 'bg-zinc-800' },
    { name: 'FlatIcon', category: 'Vector Icons', url: `https://www.flaticon.com/search?word=${query}`, icon: Box, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Storyset', category: 'Illustrations', url: `https://storyset.com/search?q=${query}`, icon: Palette, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Pexels', category: 'Stock Videos', url: `https://www.pexels.com/search/${query}`, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Dribbble', category: 'Design Inspiration', url: `https://dribbble.com/search/${query}`, icon: MousePointer2, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Logic for multi-tab search or just focusing the UI
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px]" />
        
        <div className="flex items-center gap-5">
          <div className="p-4 bg-amber-500 rounded-3xl shadow-2xl shadow-amber-500/20 rotate-3">
            <Search className="text-black" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-100">
              Asset <span className="text-amber-500">Search</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Universal Resource Finder</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
          <Command size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search assets (e.g. Minimalist UI)" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform, index) => (
          <div 
            key={platform.name}
            className="group bg-zinc-900/20 border border-white/5 rounded-[2rem] p-8 hover:border-amber-500/30 transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <platform.icon size={120} />
            </div>

            <div className="relative z-10">
              <div className={`w-12 h-12 ${platform.bg} ${platform.color} rounded-2xl flex items-center justify-center mb-6`}>
                <platform.icon size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-200 mb-1">{platform.name}</h3>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-8">{platform.category}</p>
            </div>

            <a 
              href={query ? platform.url : '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${query ? 'bg-amber-500 text-black hover:scale-[1.02]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'}`}
            >
              Search on {platform.name} <ExternalLink size={14} />
            </a>
          </div>
        ))}

        {/* Pro Tip Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/5 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
           <Sparkles className="text-amber-500 mb-4" size={32} />
           <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 mb-2 text-center">Pro Tip</h4>
           <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase italic">
             Use specific keywords like "3D Render" or "Pastel Illustration" for better results.
           </p>
        </div>
      </div>
    </div>
  );
};

const DynamicAssets = dynamic(() => Promise.resolve(AssetEngine), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-amber-500 font-black tracking-widest uppercase text-xs italic">
        Connecting to Hub...
      </div>
    </div>
  ),
});

export default function Page() {
  return <DynamicAssets />;
}
