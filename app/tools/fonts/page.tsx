"use client";

import dynamic from 'next/dynamic';
import { Type } from 'lucide-react';

const FontPairerClient = dynamic(() => import('./FontPairerClient'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
      <Type className="text-emerald-500 animate-pulse stroke-[1px]" size={50} />
      <p className="text-emerald-500/50 font-black uppercase text-[10px] tracking-[0.4em] italic animate-pulse">
        Initializing Vibe Engine...
      </p>
    </div>
  )
});

export default function FontPairerPage() {
  return <FontPairerClient />;
}