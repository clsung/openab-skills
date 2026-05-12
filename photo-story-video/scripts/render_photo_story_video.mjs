#!/usr/bin/env node
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const defaults = {
  output: "photo-story-video.mp4",
  seconds: 3,
  font: process.env.PHOTO_STORY_FONT || "/home/node/fonts/NotoSansCJKtc-Bold.otf",
  maxChars: 22,
};

function parseArgs(argv) {
  const args = { ...defaults, images: [], captions: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (value == null || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    i += 1;
    if (key === "--image") args.images.push(value);
    else if (key === "--caption") args.captions.push(value);
    else if (key === "--output") args.output = value;
    else if (key === "--seconds") args.seconds = Number(value);
    else if (key === "--font") args.font = value;
    else if (key === "--max-chars") args.maxChars = Number(value);
    else throw new Error(`Unknown option ${key}`);
  }
  if (!args.images.length) throw new Error("Required: at least one --image <path-or-url>");
  if (!Number.isFinite(args.seconds) || args.seconds <= 0) throw new Error("--seconds must be positive");
  return args;
}

function ffmpegPath() {
  try {
    return execFileSync("bash", ["-lc", "command -v ffmpeg"], { encoding: "utf8" }).trim();
  } catch {
    const requireFromCwd = createRequire(`${process.cwd()}/package.json`);
    return requireFromCwd("@ffmpeg-installer/ffmpeg").path;
  }
}

function extFromContentType(type) {
  if (type?.includes("png")) return ".png";
  if (type?.includes("webp")) return ".webp";
  return ".jpg";
}

async function localizeImage(image, dir, index) {
  if (!/^https?:\/\//i.test(image)) {
    if (!existsSync(image)) throw new Error(`Image not found: ${image}`);
    return resolve(image);
  }
  const response = await fetch(image);
  if (!response.ok) throw new Error(`Failed to download ${image}: ${response.status}`);
  const target = join(dir, `image-${index}${extFromContentType(response.headers.get("content-type"))}`);
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
  return target;
}

function isCjk(text) {
  return /[\u3400-\u9fff\uf900-\ufaff]/.test(text);
}

function shorten(text, maxChars) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if ([...clean].length <= maxChars) return clean;
  const sentences = clean.split(/(?<=[。！？!?；;\.])\s*/).filter(Boolean);
  let out = "";
  for (const sentence of sentences) {
    const next = out ? `${out} ${sentence}` : sentence;
    if ([...next].length <= maxChars) out = next;
    else break;
  }
  if (out) return out.replace(/[。！？!?；;\.]$/, "");
  return [...clean].slice(0, Math.max(1, maxChars - 1)).join("") + "…";
}

function wrapCaption(text, maxChars) {
  const compact = shorten(text, maxChars);
  if (!compact) return [];
  const chars = [...compact];
  const perLine = isCjk(compact) ? 11 : 18;
  if (chars.length <= perLine) return [compact];
  if (!isCjk(compact) && compact.includes(" ")) {
    const words = compact.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if ([...next].length <= perLine) line = next;
      else {
        if (line) lines.push(line);
        line = word;
      }
      if (lines.length === 2) break;
    }
    if (line && lines.length < 2) lines.push(line);
    return lines.slice(0, 2);
  }
  return [chars.slice(0, perLine).join(""), chars.slice(perLine, perLine * 2).join("")].filter(Boolean);
}

function esc(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

function drawTextFilters(caption, font, maxChars) {
  const lines = wrapCaption(caption, maxChars);
  if (!lines.length) return [];
  const y0 = lines.length === 1 ? 1500 : 1450;
  const box = "drawbox=x=70:y=1405:w=940:h=210:color=black@0.34:t=fill";
  const text = lines.map((line, idx) => {
    const size = isCjk(line) ? 62 : 54;
    const y = y0 + idx * 78;
    return `drawtext=fontfile=${font}:text='${esc(line)}':fontsize=${size}:fontcolor=white:x=(w-text_w)/2:y=${y}:shadowcolor=black@0.75:shadowx=3:shadowy=3`;
  });
  return [box, ...text];
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} failed with ${result.status}`);
}

const args = parseArgs(process.argv.slice(2));
const ffmpeg = ffmpegPath();
const tempDir = await mkdtemp(join(tmpdir(), "photo-story-video-"));

try {
  const clips = [];
  for (let i = 0; i < args.images.length; i += 1) {
    const image = await localizeImage(args.images[i], tempDir, i);
    const clip = join(tempDir, `clip-${String(i).padStart(3, "0")}.mp4`);
    const caption = args.captions[i] || args.captions[0] || "";
    const filters = [
      "scale=1080:1920:force_original_aspect_ratio=increase",
      "crop=1080:1920",
      "setsar=1",
      "format=yuv420p",
      ...drawTextFilters(caption, args.font, args.maxChars),
    ].join(",");
    run(ffmpeg, [
      "-y",
      "-loop",
      "1",
      "-t",
      String(args.seconds),
      "-i",
      image,
      "-vf",
      filters,
      "-r",
      "30",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      clip,
    ]);
    clips.push(clip);
  }

  const listPath = join(tempDir, "concat.txt");
  await writeFile(listPath, clips.map((clip) => `file '${clip.replace(/'/g, "'\\''")}'`).join("\n"));
  run(ffmpeg, ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", "-movflags", "+faststart", args.output]);
  console.log(JSON.stringify({ output: args.output, slides: clips.length }, null, 2));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
