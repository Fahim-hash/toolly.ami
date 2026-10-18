"use client";
import { useState } from 'react';
import JSZip from 'jszip';
import { Archive, Download, FileCode2, Trash2, Upload } from 'lucide-react';

type IconFile = { id: string; file: File };
export default function IconPackagerPage() {
  const [files, setFiles] = useState<IconFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter(f => f.name.toLowerCase().endsWith('.svg') || f.type === 'image/svg+xml');
    if (incoming.length !== list.length) setMessage('Only SVG files were added. Other file types were skipped.');
    else setMessage('');
    setFiles(prev => [...prev, ...incoming.map(file => ({ id: `${file.name}-${file.size}-${Math.random()}`, file }))]);
  };
  const exportZip = async () => {
    if (!files.length) return;
    setBusy(true); setMessage('');
    try {
      const zip = new JSZip();
      const icons = zip.folder('icons');
      for (const item of files) {
        const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.svg$/i, '') || 'icon';
        icons?.file(`${safeName}.svg`, await item.file.text());
      }
      zip.file('README.txt', `Toolly Icon Packager\n\nIcons are provided as uploaded. Review SVG contents before using files from untrusted sources.\n\nFiles: ${files.length}\n`);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = 'toolly-icon-pack.zip'; link.click(); URL.revokeObjectURL(url);
      setMessage('Your icon ZIP is ready.');
    } catch { setMessage('Could not create the ZIP. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <header className="mb-8"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-300"><Archive size={14}/> Asset utility</span><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Icon <span className="text-emerald-300">Packager</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Collect SVG icons into a neatly named ZIP archive for handoff. Files stay in your browser; the SVG markup is packaged as supplied.</p></header>
    <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-white/15 bg-zinc-950/60 px-6 py-12 text-center transition hover:border-emerald-300/40 hover:bg-zinc-900/60"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Upload size={25}/></span><span className="font-bold">Choose SVG icons</span><span className="mt-2 text-sm text-zinc-500">Select multiple .svg files from your device</span><input className="sr-only" type="file" accept=".svg,image/svg+xml" multiple onChange={e=>{addFiles(e.target.files);e.currentTarget.value='';}}/></label>
    <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">Pack contents</h2><p className="mt-1 text-sm text-zinc-500">{files.length} SVG {files.length===1?'file':'files'} selected</p></div><div className="flex gap-2"><button onClick={()=>{setFiles([]);setMessage('');}} disabled={!files.length||busy} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-40"><Trash2 size={15}/> Clear</button><button onClick={exportZip} disabled={!files.length||busy} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-emerald-100 disabled:opacity-40"><Download size={15}/>{busy?'Packaging…':'Download ZIP'}</button></div></div>
      {files.length ? <ul className="mt-5 divide-y divide-white/[.07]">{files.map(item=><li key={item.id} className="flex items-center gap-3 py-3"><FileCode2 size={18} className="shrink-0 text-emerald-300"/><span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{item.file.name}</span><span className="text-xs text-zinc-500">{(item.file.size/1024).toFixed(1)} KB</span><button aria-label={`Remove ${item.file.name}`} onClick={()=>setFiles(prev=>prev.filter(f=>f.id!==item.id))} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-red-300"><Trash2 size={15}/></button></li>)}</ul> : <div className="py-12 text-center"><Archive size={28} className="mx-auto text-zinc-700"/><p className="mt-3 text-sm text-zinc-500">Your selected icons will appear here.</p></div>}
      {message && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-zinc-300">{message}</p>}
    </section>
    <p className="mt-5 text-xs leading-5 text-zinc-600">Security note: SVGs can contain scripts or external references. This tool does not sanitize uploaded markup; inspect files from unknown sources before publishing them on a website.</p>
  </div>;
}
