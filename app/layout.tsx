import './globals.css';
import Link from 'next/link';
import Image from 'next/image';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white selection:bg-blue-500/30">
        <nav className="border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Exactly the same style as CreativeTool */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center overflow-hidden rounded-md bg-blue-600 w-[24px] h-[24px]">
                <Image 
                  src="/logo.png" 
                  alt="Toolly logo" 
                  width={24} // Fixed width for pixel-perfect look
                  height={24} // Fixed height
                  className="object-contain" 
                  priority
                />
              </div>
              <span>Toolly ami</span>
            </Link>

            <div className="flex gap-4">
              <Link href="https://github.com" className="text-sm text-zinc-400 hover:text-white transition self-center">
                Github
              </Link>
              <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition">
                Open Source
              </button>
            </div>
          </div>
        </nav>
        
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}