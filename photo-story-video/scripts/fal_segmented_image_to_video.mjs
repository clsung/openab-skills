#!/usr/bin/env node
import { spawnSync, execFileSync } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const singleScript = join(scriptDir, "fal_image_to_video.mjs");

const defaults = {
  output: "segmented-base.mp4",
  segmentsDir: "segments",
  model: "fal-ai/kling-video/v2.1/standard/image-to-video",
  duration: "5",
  aspectRatio: "9:16",
  prompt: "Animate this photo into a clean vertical video background with gentle cinematic motion. Keep the subject recognizable and stable. No text, no letters, no captions, no watermark.",
};

function parseArgs(argv) {
  const args = { ...defaults, images: [], prompts: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (value == null || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    i += 1;
    if (key === "--image") args.images.push(value);
    else if (key === "--prompt") args.prompts.push(value);
    else if (key === "--output") args.output = value;
    else if (key === "--segments-dir") args.segmentsDir = value;
    else if (key === "--model") args.model = value;
    else if (key === "--duration") args.duration = value;
    else if (key === "--aspect-ratio") args.aspectRatio = value;
    else throw new Error(`Unknown option ${key}`);
  }
  if (!args.images.length) throw new Error("Required: at least one --image <path-or-url>");
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

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) throw new Error(`${command} failed with ${result.status}`);
}

const args = parseArgs(process.argv.slice(2));
await mkdir(args.segmentsDir, { recursive: true });

const clips = [];
for (let i = 0; i < args.images.length; i += 1) {
  const clip = resolve(join(args.segmentsDir, `${String(i + 1).padStart(3, "0")}.mp4`));
  const prompt = args.prompts[i] || args.prompts[0] || args.prompt;
  run("node", [singleScript, "--image", args.images[i], "--output", clip, "--model", args.model, "--duration", args.duration, "--aspect-ratio", args.aspectRatio, "--prompt", prompt]);
  clips.push(clip);
}

const listPath = resolve(join(args.segmentsDir, "concat.txt"));
await writeFile(listPath, clips.map((clip) => `file '${clip.replace(/'/g, "'\\''")}'`).join("\n"));
run(ffmpegPath(), ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", "-movflags", "+faststart", args.output]);
console.log(JSON.stringify({ output: args.output, segments: clips }, null, 2));
