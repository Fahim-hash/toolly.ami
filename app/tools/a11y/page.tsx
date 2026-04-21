"use client";

import dynamic from 'next/dynamic';
import { ShieldCheck } from 'lucide-react';

const A11yClient = dynamic(() => import('./A11yClient'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
      <ShieldCheck className="text-emerald-500 animate-pulse stroke-[1px]" size={50} />
      <p className="text-emerald-500/50 font-black uppercase text-[10px] tracking-[0.4em] italic animate-pulse">
        Initializing Accessibility Engine...
      </p>
    </div>
  )
});

export default function A11yPage() {
  return <A11yClient />;
}