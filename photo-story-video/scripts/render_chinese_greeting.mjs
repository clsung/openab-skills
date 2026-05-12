#!/usr/bin/env node
import { spawnSync, execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const defaults = {
  output: "corporate-greeting-final.mp4",
  font: process.env.PHOTO_STORY_FONT || "/home/node/fonts/NotoSansCJKtc-Bold.otf",
  line1: "回望 2025",
  line2: "60 週年感謝",
  line3: "邁向 2026",
  line4: "繼續前行",
};

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (value == null || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    i += 1;
    const name = key.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    args[name] = value;
  }
  if (!args.input) throw new Error("Required: --input <mp4-path>");
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

function esc(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

const args = parseArgs(process.argv.slice(2));
const textStyle =
  `fontfile=${args.font}:fontcolor=white:shadowcolor=black@0.70:shadowx=4:shadowy=4:borderw=1:bordercolor=white@0.20`;

const filters = [
  "scale=-2:1920",
  "crop=1080:1920",
  "format=yuv420p",
  `drawtext=${textStyle}:text='${esc(args.line1)}':fontsize=84:x=(w-text_w)/2:y=330:enable='between(t,0.00,1.55)'`,
  `drawtext=${textStyle}:fontcolor=0xFFE8A3:text='${esc(args.line2)}':fontsize=88:x=(w-text_w)/2:y=330:enable='between(t,1.45,3.35)'`,
  `drawtext=${textStyle}:text='${esc(args.line3)}':fontsize=78:x=(w-text_w)/2:y=300:enable='between(t,3.20,5.10)'`,
  `drawtext=${textStyle}:text='${esc(args.line4)}':fontsize=70:x=(w-text_w)/2:y=405:enable='between(t,3.20,5.10)'`,
].join(",");

const result = spawnSync(
  ffmpegPath(),
  [
    "-y",
    "-i",
    args.input,
    "-vf",
    filters,
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
  ],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
