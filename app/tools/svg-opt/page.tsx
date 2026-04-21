"use client";

import dynamic from 'next/dynamic';

const SVGOptimizerClient = dynamic(() => import('./SVGOptimizerClient'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
      <div className="w-16 h-16 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-emerald-500/50 font-black uppercase text-[10px] tracking-[0.4em] italic animate-pulse">Syncing Toolly Core...</p>
    </div>
  )
});

export default function SVGOptimizerPage() {
  return <SVGOptimizerClient />;
}