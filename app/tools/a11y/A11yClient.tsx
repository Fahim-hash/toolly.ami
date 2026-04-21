"use client";

import { useState } from 'react';
import { 
  ShieldCheck, Upload, X, Search, CheckCircle2, 
  AlertTriangle, Eye, RefreshCcw, Info, ScanSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function A11yClient() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any | null>(null);
  const [log, setLog] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        runA11yAudit();
      };
      reader.readAsDataURL(file);
    }
  };

  const runA11yAudit = async () => {
    setIsScanning(true);
    setScanResults(null);
    setLog("Extracting color palette...");
    
    await new Promise(r => setTimeout(r, 1000));
    setLog("Calculating Luminance & Contrast ratios...");
    
    await new Promise(r => setTimeout(r, 1200));
    setLog("Validating against WCAG 2.1 Standards...");

    await new Promise(r => setTimeout(r, 800));

    // Simulated Audit Results
    setScanResults({
      contrast: "4.5:1",
      status: "PASS",
      level: "AA",
      issues: [
        { type: "Text Size", score: "Good", detail: "Heading contrast is sufficient." },
        { type: "Color Blindness", score: "Fair", detail: "Protanopia vision might struggle with red accents." }
      ],
      score: 82
    });
    setIsScanning(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans min-h-screen relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-zinc-900 pb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">
            <ShieldCheck size={14} fill="currentColor" /> WCAG Audit System
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
            A11y<span className="text-emerald-500">Checker</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-widest text-emerald-400/60 italic">Inclusive Design Intelligence</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Upload Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative">
            {!selectedImage ? (
              <label className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-[2.5rem] cursor-pointer hover:border-emerald-500/30 transition-all group">
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                <div className="w-16 h-16 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={28} />
                </div>
                <h3 className="text-white font-black uppercase text-xs italic tracking-tighter">Upload UI Screenshot</h3>
              </label>
            ) : (
              <div className="relative aspect-square rounded-3xl overflow-hidden group">
                <img src={selectedImage} alt="Audit Preview" className="w-full h-full object-cover" />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <ScanSearch size={40} className="text-emerald-500 animate-bounce mb-4" />
                    <p className="text-emerald-500 font-black uppercase text-[9px] tracking-[0.3em]">{log}</p>
                  </div>
                )}
                <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Audit Metrics */}
          <AnimatePresence>
            {scanResults && !isScanning && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] text-center">
                   <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-2">Contrast</p>
                   <p className="text-2xl font-black text-white italic">{scanResults.contrast}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] text-center">
                   <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-2">Standard</p>
                   <p className="text-2xl font-black text-emerald-500 italic">{scanResults.level}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audit Details */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-950 border-2 border-zinc-900 rounded-[3.5rem] min-h-[500px] p-10 flex flex-col shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {scanResults && !isScanning ? (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Audit Summary</h2>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Vibe Consistency Score: {scanResults.score}%</p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-2xl">
                      <CheckCircle2 className="text-emerald-500" size={32} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6">
                    {scanResults.issues.map((issue: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl hover:bg-zinc-900/50 transition-all">
                        <AlertTriangle className="text-emerald-500 shrink-0 mt-1" size={18} />
                        <div>
                          <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-1">{issue.type} — <span className="text-emerald-500 italic">{issue.score}</span></h4>
                          <p className="text-zinc-500 text-sm leading-relaxed">{issue.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
                       Export Report
                    </button>
                    <button onClick={runA11yAudit} className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl hover:text-white transition-all">
                       <RefreshCcw size={20} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <Eye size={80} className="mb-6 text-emerald-500 stroke-[1px]" />
                  <p className="font-black uppercase tracking-[0.5em] text-sm text-emerald-500 italic">Awaiting Visual Data</p>
                </div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-10 right-10 flex items-center gap-2 text-zinc-800">
               <Info size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest italic underline decoration-emerald-500/20">Willes Little Flower Design Stnd.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}