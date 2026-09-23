"use client";

import { useCallback, useState } from "react";
import Psd from "@webtoon/psd";
import {
  Download,
  FileImage,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  Server,
} from "lucide-react";

type PdfFile = {
  id: string;
  file: File;
  preview: string | null;
  width: number;
  height: number;
  status: "ready" | "error";
  error?: string;
};

type RenderedDocument = {
  blob: Blob;
  width: number;
  height: number;
  preview: string;
};

const MAX_RENDER_SIDE = 2400;
const LARGE_FILE_THRESHOLD = 750 * 1024 * 1024;
const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const PAGE_MARGIN = 36;
const WORKER_URL = process.env.NEXT_PUBLIC_PSD_WORKER_URL?.replace(/\/$/, "");

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const fitToPage = (width: number, height: number) => {
  const maxWidth = A4_WIDTH - PAGE_MARGIN * 2;
  const maxHeight = A4_HEIGHT - PAGE_MARGIN * 2;
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: width * scale,
    height: height * scale,
    x: (A4_WIDTH - width * scale) / 2,
    y: (A4_HEIGHT - height * scale) / 2,
  };
};

async function renderPsd(file: File): Promise<RenderedDocument> {
  const buffer = await file.arrayBuffer();
  const psd = Psd.parse(buffer);
  const composite = await psd.composite();

  if (!psd.width || !psd.height) {
    throw new Error("The document does not contain a valid canvas size.");
  }

  const scale = Math.min(1, MAX_RENDER_SIDE / Math.max(psd.width, psd.height));
  const width = Math.max(1, Math.round(psd.width * scale));
  const height = Math.max(1, Math.round(psd.height * scale));

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = psd.width;
  sourceCanvas.height = psd.height;
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) throw new Error("Could not create the source canvas.");

  sourceContext.putImageData(
    new ImageData(new Uint8ClampedArray(composite), psd.width, psd.height),
    0,
    0,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create a 2D canvas context.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(sourceCanvas, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("Could not encode the document as JPEG."))),
      "image/jpeg",
      0.94,
    );
  });

  return {
    blob,
    width,
    height,
    preview: canvas.toDataURL("image/jpeg", 0.82),
  };
}

async function blobToBytes(blob: Blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

function buildPdf(images: Array<{ jpeg: Uint8Array; width: number; height: number }>) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let byteLength = 0;

  const push = (value: string | Uint8Array) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    byteLength += bytes.length;
  };

  push("%PDF-1.4\\n%\\xFF\\xFF\\xFF\\xFF\\n");

  const pageObjects = images.map((_, index) => 3 + index * 3);
  const objectCount = 2 + images.length * 3;

  const addObject = (id: number, value: string) => {
    offsets[id] = byteLength;
    push(`${id} 0 obj\\n${value}\\nendobj\\n`);
  };

  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  const kids = pageObjects.map((id) => `${id} 0 R`).join(" ");
  addObject(2, `<< /Type /Pages /Kids [${kids}] /Count ${images.length} >>`);

  images.forEach((image, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const fit = fitToPage(image.width, image.height);
    const content = [
      "q",
      "1 1 1 rg",
      `0 0 ${A4_WIDTH} ${A4_HEIGHT} re f`,
      `q ${fit.width.toFixed(2)} 0 0 ${fit.height.toFixed(2)} ${fit.x.toFixed(2)} ${fit.y.toFixed(2)} cm`,
      "/Im0 Do",
      "Q",
      "Q",
      "",
    ].join("\\n");

    addObject(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH} ${A4_HEIGHT}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );

    addObject(
      contentId,
      `<< /Length ${encoder.encode(content).length} >>\\nstream\\n${content}endstream`,
    );

    offsets[imageId] = byteLength;
    push(`${imageId} 0 obj\\n`);
    push(
      `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.jpeg.length} >>\\nstream\\n`,
    );
    push(image.jpeg);
    push("\\nendstream\\nendobj\\n");
  });

  const xrefOffset = byteLength;
  push(`xref\\n0 ${objectCount + 1}\\n`);
  push("0000000000 65535 f \\n");
  for (let id = 1; id <= objectCount; id += 1) {
    push(`${String(offsets[id]).padStart(10, "0")} 00000 n \\n`);
  }
  push(
    `trailer\\n<< /Size ${objectCount + 1} /Root 1 0 R >>\\nstartxref\\n${xrefOffset}\\n%%EOF`,
  );

  const result = new Uint8Array(byteLength);
  let cursor = 0;
  for (const chunk of chunks) {
    result.set(chunk, cursor);
    cursor += chunk.length;
  }
  return new Blob([result], { type: "application/pdf" });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function convertWithWorker(file: File) {
  if (!WORKER_URL) {
    throw new Error(
      "Large-file conversion is not configured yet. Set NEXT_PUBLIC_PSD_WORKER_URL to your PSD worker URL.",
    );
  }

  const response = await fetch(`${WORKER_URL}/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Filename": encodeURIComponent(file.name),
    },
    body: file,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Large-file conversion failed (HTTP ${response.status}).`);
  }

  const blob = await response.blob();
  return blob;
}

export default function PsdToPdfPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const addFiles = useCallback(async (selected: FileList | File[]) => {
    const candidates = Array.from(selected).filter((file) => /\\.(psd|psb)$/i.test(file.name));
    if (!candidates.length) {
      setMessage("Please select PSD or PSB files.");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    const created: PdfFile[] = [];
    for (let index = 0; index < candidates.length; index += 1) {
      const file = candidates[index];
      setProgress(Math.round((index / candidates.length) * 100));

      if (file.size >= LARGE_FILE_THRESHOLD) {
        created.push({
          id: `${file.name}-${file.lastModified}-${index}`,
          file,
          preview: null,
          width: 0,
          height: 0,
          status: WORKER_URL ? "ready" : "error",
          error: WORKER_URL
            ? "Large PSB/PSD: will be processed by the dedicated worker when you export."
            : "This file is too large for browser-only processing. Configure the large-file worker first.",
        });
        continue;
      }

      try {
        const rendered = await renderPsd(file);
        created.push({
          id: `${file.name}-${file.lastModified}-${index}`,
          file,
          preview: rendered.preview,
          width: rendered.width,
          height: rendered.height,
          status: "ready",
        });
      } catch (error) {
        created.push({
          id: `${file.name}-${file.lastModified}-${index}`,
          file,
          preview: null,
          width: 0,
          height: 0,
          status: "error",
          error: error instanceof Error ? error.message : "This Photoshop file could not be read.",
        });
      }
    }

    setFiles((current) => [...current, ...created]);
    setProgress(100);
    setIsProcessing(false);
  }, []);

  const downloadPdf = async () => {
    const ready = files.filter((file) => file.status === "ready");
    if (!ready.length) return;

    setIsProcessing(true);
    setMessage("");

    try {
      if (ready.some((item) => item.file.size >= LARGE_FILE_THRESHOLD)) {
        if (ready.length !== 1) {
          throw new Error("Large-file mode currently converts one PSB/PSD at a time.");
        }

        setMessage(`Uploading ${formatBytes(ready[0].file.size)} to the large-file worker. Keep this tab open while it processes.`);
        setProgress(5);
        const pdf = await convertWithWorker(ready[0].file);
        setProgress(100);
        triggerDownload(pdf, ready[0].file.name.replace(/\\.(psd|psb)$/i, ".pdf"));
        setMessage("Large PSB/PSD converted successfully.");
        return;
      }

      setMessage("Building your PDF locally…");
      const images = [];
      for (let index = 0; index < ready.length; index += 1) {
        const rendered = await renderPsd(ready[index].file);
        images.push({
          jpeg: await blobToBytes(rendered.blob),
          width: rendered.width,
          height: rendered.height,
        });
        setProgress(Math.round(((index + 1) / ready.length) * 100));
      }

      const pdf = buildPdf(images);
      triggerDownload(
        pdf,
        ready.length === 1
          ? ready[0].file.name.replace(/\\.(psd|psb)$/i, ".pdf")
          : `Toolly_PSD_Collection_${Date.now()}.pdf`,
      );
      setMessage(`${ready.length} ${ready.length === 1 ? "document" : "documents"} exported successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDF export failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
              <FileText size={13} /> PSD / PSB CONVERTER
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">
              PSD<span className="text-blue-500"> → PDF</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Convert Photoshop PSD and PSB documents into shareable PDF files. Small files stay local; very large files use the dedicated disk-based worker.
            </p>
          </div>

          <button
            onClick={downloadPdf}
            disabled={!files.some((file) => file.status === "ready") || isProcessing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export PDF
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <section className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950/70 p-6 md:p-8">
            <label
              htmlFor="psd-upload"
              className="group flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-zinc-800 bg-black/30 px-6 text-center transition hover:border-blue-500/50 hover:bg-blue-500/[0.03]"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500 transition group-hover:scale-105">
                <Upload size={34} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Drop PSD / PSB files here</h2>
              <p className="mt-2 text-sm text-zinc-600">or click to browse • multiple files become PDF pages</p>
              <div className="mt-5 flex gap-2">
                <span className="rounded-lg bg-zinc-900 px-3 py-1 text-[9px] font-black uppercase text-zinc-500">.PSD</span>
                <span className="rounded-lg bg-zinc-900 px-3 py-1 text-[9px] font-black uppercase text-zinc-500">.PSB</span>
              </div>
              <input
                id="psd-upload"
                type="file"
                multiple
                accept=".psd,.psb,application/octet-stream"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>

            {isProcessing && (
              <div className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4">
                <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-blue-400">Processing</span>
                  <span className="text-zinc-500">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                {files.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-950">
                      {item.preview ? (
                        <img src={item.preview} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <FileImage className="text-red-500" size={22} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-zinc-200">{item.file.name}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        {formatBytes(item.file.size)}
                        {item.status === "ready" && item.width > 0 ? ` • ${item.width} × ${item.height}px` : ""}
                      </p>
                      {item.error && <p className="mt-1 text-xs text-zinc-500">{item.error}</p>}
                    </div>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="rounded-xl p-2 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {message && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs font-medium text-zinc-400">
                <Info size={16} className="shrink-0 text-blue-400" />
                {message}
              </div>
            )}

            {files.length > 0 && (
              <button
                onClick={() => {
                  setFiles([]);
                  setMessage("");
                  setProgress(0);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 transition hover:text-red-400"
              >
                <Trash2 size={13} /> Clear all
              </button>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-blue-500/10 bg-blue-500/5 p-6">
              {WORKER_URL ? <Server className="mb-4 text-blue-400" size={25} /> : <ShieldCheck className="mb-4 text-blue-400" size={25} />}
              <h3 className="text-sm font-black uppercase tracking-widest">
                {WORKER_URL ? "Large-file mode ready" : "Local processing"}
              </h3>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {WORKER_URL
                  ? "Large PSB/PSD files are uploaded directly to the dedicated converter worker and processed from disk instead of browser RAM."
                  : "Smaller PSD/PSB files are parsed and flattened in your browser. Configure the worker URL to enable the 4 GB large-file path."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">Large PSB mode</h3>
              <ul className="mt-4 space-y-3 text-xs leading-5 text-zinc-500">
                <li>• Designed for multi-GB PSB/PSD uploads.</li>
                <li>• Your 2550 × 3300 px / ~4 GB files are handled outside browser memory.</li>
                <li>• Conversion produces a flattened PDF, not editable Photoshop layers.</li>
                <li>• The worker needs enough disk space for the source PSB plus temporary/output files.</li>
                <li>• One large file is converted at a time.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
