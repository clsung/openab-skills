#!/usr/bin/env node
import { spawnSync, execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const defaults = {
  output: "text-overlay-video.mp4",
  font: process.env.PHOTO_STORY_FONT || "/home/node/fonts/NotoSansCJKtc-Bold.otf",
  maxChars: 24,
  position: "lower",
  color: "white",
  boxColor: "black@0.34",
};

function parseArgs(argv) {
  const args = { ...defaults, captions: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (value == null || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    i += 1;
    if (key === "--input") args.input = value;
    else if (key === "--output") args.output = value;
    else if (key === "--caption") args.captions.push(value);
    else if (key === "--font") args.font = value;
    else if (key === "--max-chars") args.maxChars = Number(value);
    else if (key === "--position") args.position = value;
    else if (key === "--color") args.color = value;
    else if (key === "--box-color") args.boxColor = value;
    else throw new Error(`Unknown option ${key}`);
  }
  if (!args.input) throw new Error("Required: --input <mp4-path>");
  if (!args.captions.length) throw new Error("Required: at least one --caption start:end:text");
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

function isCjk(text) {
  return /[\u3400-\u9fff\uf900-\ufaff]/.test(text);
}

function shorten(text, maxChars) {
  const clean = String(text || "").replace(/\\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!clean) return "";
  if (clean.includes("\n")) return clean;
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

function wrapText(text, maxChars) {
  const compact = shorten(text, maxChars);
  if (!compact) return [];
  if (compact.includes("\n")) return compact.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const chars = [...compact];
  const perLine = isCjk(compact) ? 11 : 20;
  if (chars.length <= perLine) return [compact];
  if (!isCjk(compact) && compact.includes(" ")) {
    const lines = [];
    let line = "";
    for (const word of compact.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if ([...next].length <= perLine) line = next;
      else {
        if (line) lines.push(line);
        line = word;
      }
      if (lines.length === 3) break;
    }
    if (line && lines.length < 3) lines.push(line);
    return lines;
  }
  return [chars.slice(0, perLine).join(""), chars.slice(perLine, perLine * 2).join(""), chars.slice(perLine * 2, perLine * 3).join("")].filter(Boolean);
}

function esc(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'").replace(/,/g, "\\,");
}

function parseCaption(raw) {
  const parts = raw.split(":");
  if (parts.length < 3) throw new Error(`Invalid caption ${raw}; expected start:end:text`);
  const start = Number(parts.shift());
  const end = Number(parts.shift());
  const text = parts.join(":");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error(`Invalid caption time range: ${raw}`);
  }
  return { start, end, text };
}

function yFor(position, lineCount, idx) {
  if (position === "upper") return 260 + idx * 82;
  if (position === "center") return `(h-${lineCount * 82})/2+${idx * 82}`;
  return 1450 + idx * 82;
}

const args = parseArgs(process.argv.slice(2));
const filters = ["scale=1080:1920:force_original_aspect_ratio=increase", "crop=1080:1920", "setsar=1", "format=yuv420p"];

for (const caption of args.captions.map(parseCaption)) {
  const lines = wrapText(caption.text, args.maxChars);
  if (!lines.length) continue;
  const boxY = args.position === "upper" ? 205 : args.position === "center" ? "(h-250)/2" : 1405;
  filters.push(`drawbox=x=70:y=${boxY}:w=940:h=${Math.max(130, lines.length * 86 + 45)}:color=${args.boxColor}:t=fill:enable='between(t,${caption.start},${caption.end})'`);
  lines.forEach((line, idx) => {
    const size = isCjk(line) ? 62 : 54;
    filters.push(`drawtext=fontfile=${args.font}:text='${esc(line)}':fontsize=${size}:fontcolor=${args.color}:x=(w-text_w)/2:y=${yFor(args.position, lines.length, idx)}:shadowcolor=black@0.75:shadowx=3:shadowy=3:enable='between(t,${caption.start},${caption.end})'`);
  });
}

const result = spawnSync(ffmpegPath(), [
  "-y",
  "-i",
  args.input,
  "-vf",
  filters.join(","),
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "18",
  "-movflags",
  "+faststart",
  "-an",
  args.output,
], { stdio: "inherit" });

process.exit(result.status ?? 1);
