import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: { default: 'Toolly — Creative Tools', template: '%s | Toolly' },
  description: 'A focused toolkit for designers and makers. Prepare images, explore color and simplify everyday creative work.',
  applicationName: 'Toolly',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#09090b] text-zinc-100">
        <nav aria-label="Main navigation" className="sticky top-0 z-50 border-b border-white/[.08] bg-[#09090b]/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <Link href="/" aria-label="Toolly home" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-violet-300">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[.04]">
                <Image src="/logo.png" alt="" width={32} height={32} className="h-full w-full object-contain" priority />
              </span>
              <span className="text-base font-semibold tracking-tight">toolly<span className="text-violet-300">.</span></span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-3">
              <Link href="/#tools" className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-white">Tools</Link>
              <a href="https://github.com/Fahim-hash/toolly.ami" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-white">GitHub <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
