"use client";
import { useState, useRef } from 'react';
import { 
  Upload, Download, FileType, RefreshCw, 
  Trash2, ArrowRightLeft, Image as ImageIcon, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';

interface FileState {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'converting' | 'done' | 'error';
  convertedUrl?: string;
}

type Format = 'png' | 'jpeg' | 'webp';

export default function FormatConverter() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [targetFormat, setTargetFormat] = useState<Format>('webp');
  const [isConvertingAll, setIsConvertingAll] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    const newFiles = uploaded.map(file => ({
      id: Math.random().toString(36).substring(7),
      file: file,
      preview: URL.createObjectURL(file),
      status: 'idle' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const convertFile = async (fileState: FileState, format: Format): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = fileState.preview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas error');
        
        ctx.drawImage(img, 0, 0);
        const mimeType = `image/${format}`;
        resolve(canvas.toDataURL(mimeType, 0.9));
      };
      img.onerror = () => reject('Load error');
    });
  };

  const processAll = async () => {
    setIsConvertingAll(true);
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'done') continue;
      
      try {
        updatedFiles[i].status = 'converting';
        setFiles([...updatedFiles]);
        
        const result = await convertFile(updatedFiles[i], targetFormat);
        updatedFiles[i].convertedUrl = result;
        updatedFiles[i].status = 'done';
      } catch (err) {
        updatedFiles[i].status = 'error';
      }
      setFiles([...updatedFiles]);
    }
    setIsConvertingAll(false);
  };

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.split('.')[0]}.${targetFormat}`;
    link.click();
  };

  return (
    <div className="max-w-[1600px] mx-auto py-12 px-8 min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4 group">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] shadow-2xl shadow-indigo-600/20 group-hover:rotate-6 transition-transform duration-500">
              <ArrowRightLeft className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                Format <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">Shift</span>
              </h1>
              <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                Universal Image Transcoder
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/40 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
          {files.length > 0 && (
            <button onClick={() => setFiles([])} className="p-5 bg-zinc-900 text-zinc-500 rounded-[2rem] hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5">
              <Trash2 size={22} />
            </button>
          )}
          <button 
            disabled={files.length === 0 || isConvertingAll}
            onClick={processAll}
            className="px-10 py-5 bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-600/30 disabled:opacity-20 flex items-center gap-4"
          >
            {isConvertingAll ? <RefreshCw size={20} className="animate-spin" /> : <FileType size={20} />} 
            {isConvertingAll ? 'Converting...' : `Convert All (${files.length})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar - Settings */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[80px] -mr-16 -mt-16" />
            
            <div className="space-y-6">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Target Format</span>
              <div className="grid grid-cols-1 gap-3">
                {(['webp', 'png', 'jpeg'] as Format[]).map((fmt) => (
                  <button 
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={`group flex items-center justify-between px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${targetFormat === fmt ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    {fmt === 'jpeg' ? 'JPG / JPEG' : fmt}
                    {targetFormat === fmt && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem]">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
                  <AlertCircle size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-indigo-400 italic">Pro Tip</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Use WebP for web performance or PNG for lossless transparency. SVG conversion works best for simple shapes.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-8">
          <div className="bg-[#080808] border border-white/5 rounded-[4rem] min-h-[750px] p-12 relative overflow-y-auto max-h-[85vh] shadow-inner custom-scrollbar">
            {files.length === 0 ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="w-32 h-32 bg-zinc-900 border border-white/10 rounded-[3rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-700 relative z-10">
                    <Upload size={40} className="text-indigo-500" />
                  </div>
                </div>
                <h3 className="font-black uppercase tracking-[0.6em] text-lg text-zinc-300">Drop Source Files</h3>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-4 bg-zinc-900/50 px-6 py-2 rounded-full border border-white/5 italic">
                  High Fidelity Conversion Engine
                </p>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            ) : (
              <div className="space-y-4">
                {files.map((fileState) => (
                  <div key={fileState.id} className="group flex items-center justify-between p-6 bg-zinc-900/30 border border-white/5 rounded-3xl hover:border-indigo-600/30 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-14 bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner">
                        <img src={fileState.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-wider text-zinc-200 truncate max-w-[200px]">{fileState.file.name}</p>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase italic">{(fileState.file.size / 1024).toFixed(1)} KB • {fileState.file.type.split('/')[1]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          fileState.status === 'done' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                          fileState.status === 'converting' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 animate-pulse' :
                          'bg-zinc-800 border-white/5 text-zinc-500'
                        }`}>
                          {fileState.status}
                        </span>
                      </div>

                      {fileState.status === 'done' && fileState.convertedUrl && (
                        <button 
                          onClick={() => downloadFile(fileState.convertedUrl!, fileState.file.name)}
                          className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                        >
                          <Download size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <label className="flex items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-3xl cursor-pointer hover:bg-indigo-600/[0.02] hover:border-indigo-600/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <Upload size={20} className="text-zinc-600 group-hover:text-indigo-500" />
                    <span className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase group-hover:text-zinc-400">Add More Assets</span>
                  </div>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
      `}</style>
    </div>
  );
}
