import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Sparkles } from 'lucide-react';

export const metadata = {
  title: { default: 'Toolly — Creative Tools for Everyday Work', template: '%s | Toolly' },
  description: 'A practical toolkit for designers and makers: image utilities, color tools, typography helpers and creative workflow essentials.',
  applicationName: 'Toolly',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white selection:bg-violet-400/40">
        <nav aria-label="Main navigation" className="sticky top-0 z-50 border-b border-white/[.08] bg-[#08090d]/85 backdrop-blur-2xl">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/" aria-label="Toolly home" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-violet-300">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-violet-500/15">
                <Image src="/logo.png" alt="" width={36} height={36} className="h-full w-full object-contain" priority />
              </span>
              <span className="truncate text-lg font-extrabold tracking-tight">Toolly<span className="text-violet-300">.</span></span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/#tools" className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white">Explore tools</Link>
              <a href="https://github.com/Fahim-hash/toolly.ami" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[.08]"><Github size={16} /><span className="hidden sm:inline">GitHub</span></a>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-68px)]">{children}</main>
      </body>
    </html>
  );
}
