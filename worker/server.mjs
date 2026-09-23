import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { pipeline } from "node:stream/promises";

const PORT = Number(process.env.PORT || 8080);
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 ** 3);
const WORK_DIR = process.env.WORK_DIR || os.tmpdir();
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function send(res, status, body, type = "text/plain") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, X-Filename",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  });
  res.end(body);
}

function safeName(value) {
  const decoded = decodeURIComponent(value || "document.psb").replace(/\\/g, "/");
  const base = path.basename(decoded).replace(/[^a-zA-Z0-9._-]/g, "_");
  return /\\.(psd|psb)$/i.test(base) ? base : "document.psb";
}

async function convert(input, output) {
  await new Promise((resolve, reject) => {
    const args = [
      input,
      "-flatten",
      "-background", "white",
      "-alpha", "remove",
      "-alpha", "off",
      "-colorspace", "sRGB",
      "-compress", "Zip",
      output,
    ];

    const child = spawn("magick", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `ImageMagick exited with code ${code}`));
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, "");
  if (req.method === "GET" && req.url === "/health") return send(res, 200, JSON.stringify({ ok: true }), "application/json");
  if (req.method !== "POST" || req.url !== "/convert") return send(res, 404, "Not found");

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength && contentLength > MAX_BYTES) {
    return send(res, 413, `File is too large. Maximum is ${MAX_BYTES} bytes.`);
  }

  const filename = safeName(req.headers["x-filename"]);
  const id = crypto.randomUUID();
  const input = path.join(WORK_DIR, `${id}-${filename}`);
  const output = path.join(WORK_DIR, `${id}.pdf`);

  try {
    await pipeline(req, fs.createWriteStream(input, { flags: "wx" }));

    const stats = await fsp.stat(input);
    if (stats.size > MAX_BYTES) throw new Error("File exceeds the configured upload limit.");

    await convert(input, output);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename.replace(/\\.(psd|psb)$/i, ".pdf")}"`,
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Headers": "Content-Type, X-Filename",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    });
    await pipeline(fs.createReadStream(output), res);
  } catch (error) {
    if (!res.headersSent) send(res, 500, error instanceof Error ? error.message : "Conversion failed.");
    else res.destroy();
  } finally {
    await Promise.allSettled([fsp.rm(input, { force: true }), fsp.rm(output, { force: true })]);
  }
});

server.listen(PORT, () => {
  console.log(`Toolly PSD worker listening on :${PORT}`);
});
