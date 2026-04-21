import Link from 'next/link';
import { LayoutDashboard, Type, Image as ImageIcon, Maximize, Scissors } from 'lucide-react';

const tools = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Watermark Adder', icon: Type, href: '/tools/watermark' },
  { name: 'Image Compressor', icon: Maximize, href: '/tools/compress' },
  { name: 'Image Resizer', icon: Scissors, href: '/tools/resize' },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 h-screen p-4 fixed left-0 top-0">
      <div className="text-xl font-bold text-white mb-10 px-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
        CreativeTool
      </div>
      <nav className="space-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-zinc-900 px-3 py-2 rounded-lg transition"
          >
            <tool.icon size={20} />
            {tool.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}