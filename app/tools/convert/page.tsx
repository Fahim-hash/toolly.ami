// app/page.tsx
"use client";
import dynamic from 'next/dynamic';

// Next.js ke bola hocche eita server-e render na korte (SSR: false)
const StudioEngine = dynamic(() => import('./StudioEngine'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-blue-600 font-black tracking-widest uppercase text-xs">
        Initializing Toolly Engine...
      </div>
    </div>
  ),
});

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050505] py-12 px-6">
      <StudioEngine />
    </main>
  );
}
