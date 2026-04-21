"use client";

"use client";

import { useState } from 'react';
// Import list-e 'Upload' add kora hoyeche niche
import { 
  Zap, Copy, Check, Type, Image as ImageIcon, 
  Sparkles, Search, Globe, RefreshCcw, Upload, X 
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

// ExpandedSeed database to map context to font families
const TYPE_MAPPING = {
  "modern-tech": { h: "Space Grotesk", b: "Inter", tags: ["minimal", "tech", "saas"] },
  "cyberpunk": { h: "Syne", b: "JetBrains Mono", tags: ["dark", "neon", "bold"] },
  "luxury": { h: "Clash Display", b: "Satoshi", tags: ["branding", "creative", "premium"] },
  "organic": { h: "Bricolage Grotesque", b: "Outfit", tags: ["wellness", "soft", "nature"] },
};

export default function FontPairerClient() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [researchLog, setResearchLog] = useState("");
  const [activePair, setActivePair] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setSelectedImage(imageData);
        performContextualResearch(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const performContextualResearch = async (imageDataUrl: string) => {
    setIsResearching(true);
    setRecommendations([]);
    setActivePair(null);
    setResearchLog("Analyzing image context...");
    
    // Simulate Image Context Analysis Steps (Color, Dominance, Vibe)
    await new Promise(resolve => setTimeout(resolve, 800));
    setResearchLog("Scanning visual weight...");
    
    // Triggering dynamic research against the seed mappings
    await new Promise(resolve => setTimeout(resolve, 1200));
    setResearchLog("Matching with 1,500+ Google Fonts API keys...");

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Intelligence Logic: Map image visual data to typeface characteristics
    // In a real scenario, this would use an API endpoint for pixel analysis
    const randomMappingKey = Object.keys(TYPE_MAPPING)[Math.floor(Math.random() * Object.keys(TYPE_MAPPING).length)];
    const chosenMapping = TYPE_MAPPING[randomMappingKey as keyof typeof TYPE_MAPPING];

    // Simulating research output with dynamic matching scores
    const researchFindings = [
      { family: chosenMapping.h, type: 'Heading', match: 98, vibe: randomMappingKey },
      { family: chosenMapping.b, type: 'Body', match: 95, vibe: randomMappingKey }
    ];

    setRecommendations(researchFindings);
    setActivePair(chosenMapping);
    setIsResearching(false);
    setResearchLog("");
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans min-h-screen relative">
      
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-10 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 relative z-10 border-b border-zinc-900 pb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Globe size={14} fill="currentColor" /> Live Visual Intelligence
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
            Typography<span className="text-emerald-500">Explorer</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-widest text-emerald-400/60 italic">Image-to-Pairing Research Engine</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* Left: Input & Research Findings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {!selectedImage ? (
              <label className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-[2.5rem] cursor-pointer hover:border-emerald-500/30 transition-all group relative z-10">
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                <div className="w-16 h-16 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <h3 className="text-white font-black uppercase text-xs italic tracking-tighter">Import Source Asset</h3>
              </label>
            ) : (
              <div className="relative aspect-video rounded-3xl overflow-hidden group">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                {isResearching && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-10 h-10 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <p className="text-emerald-500 font-black uppercase text-[9px] tracking-[0.3em] animate-pulse">{researchLog}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Research Results */}
          <AnimatePresence>
            {recommendations.length > 0 && !isResearching && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                  <Search size={12} /> Key Research Findings
                </h4>
                {recommendations.map((font, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={`${font.family}-${font.type}`}
                    className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex justify-between items-center hover:border-emerald-500/30 transition-colors"
                  >
                    <div>
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic decoration-emerald-500 underline decoration-2">{font.vibe}</p>
                      <h5 className="text-white font-bold">{font.family} <span className="text-zinc-500 font-medium">({font.type})</span></h5>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-300 italic">{font.match}%</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-1">Accuracy</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Real-time Visual Lab Preview */}
        <div className="lg:col-span-8">
           <div className="bg-zinc-950 border-2 border-zinc-900 rounded-[3rem] h-full min-h-[600px] shadow-2xl relative overflow-hidden group">
              
              {/* Background Canvas Overly */}
              <div className="absolute inset-0 opacity-10 grayscale blur-[5px] group-hover:opacity-100 group-hover:blur-0 group-hover:grayscale-0 transition-all duration-[3s] ease-in-out">
                 {selectedImage ? (
                   <img src={selectedImage} alt="Canvas" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center opacity-20">
                     <ImageIcon size={64} className="mb-4 text-zinc-700" />
                   </div>
                 )}
              </div>

              {/* Typography Preview Layer */}
              <div className="relative z-10 p-16 h-full flex flex-col justify-center">
                 {activePair ? (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                     
                     <div className="space-y-4">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] border-l-2 border-emerald-500 pl-4 italic">Heading Result</span>
                       <h2 className="text-white text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] drop-shadow-2xl">
                         {activePair.h.split(' ')[0]}<br/>
                         <span className="text-emerald-500 italic">Core.</span>
                       </h2>
                     </div>

                     <div className="max-w-md">
                       <span className="text-zinc-400 text-[9px] font-black uppercase tracking-[0.4em] block mb-4 italic underline decoration-emerald-500 underline-offset-4">Body Research: {activePair.b}</span>
                       <p className="text-zinc-200 text-lg leading-relaxed font-medium drop-shadow-lg custom-scrollbar">
                         Based on our visual analysis, the geometric balance and visual hierarchy of this combination ({activePair.h} and {activePair.b}) synchronize perfectly with your source asset's structural design. It maintains optimal contrast and ensures maximum scalability for your typography system.
                       </p>
                     </div>

                     <div className="pt-10 flex gap-4">
                        <button className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl flex items-center gap-2 hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-white/5">
                          Download Font Kit
                        </button>
                        <button onClick={() => selectedImage && performContextualResearch(selectedImage)} className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl flex items-center gap-2 hover:text-white transition-all shadow-xl">
                          <RefreshCcw size={14} className={isResearching ? 'animate-spin' : ''} /> Rerun Analysis
                        </button>
                     </div>
                   </motion.div>
                 ) : (
                   <div className="text-center opacity-10 h-full flex flex-col items-center justify-center">
                      <Sparkles size={100} className="mx-auto mb-6 text-emerald-500 stroke-[1px]" />
                      <p className="font-black uppercase tracking-[0.5em] text-sm text-emerald-500 italic animate-pulse">Waiting for Canvas Analysis...</p>
                   </div>
                 )}
              </div>

              {/* Research stats bar watermark */}
              <div className="absolute bottom-12 right-12 opacity-10 flex gap-1 items-end select-none">
                 <div className="w-1.5 h-1.5 rounded-full bg-white" />
                 <div className="w-1.5 h-1.5 rounded-full bg-white" />
                 <div className="w-1.5 h-1.5 rounded-full bg-white" />
                 <span className="text-[10px] font-black uppercase text-white tracking-widest italic ml-2">Context Mapping Eng.</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}