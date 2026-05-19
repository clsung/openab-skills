#!/usr/bin/env node
import { fal } from "@fal-ai/client";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const defaults = {
  model: "fal-ai/kling-video/v2.1/standard/image-to-video",
  duration: "5",
  aspectRatio: "9:16",
  output: "corporate-greeting-bg.mp4",
  prompt: `
Animate this corporate building photo into an elegant vertical greeting video background.
Keep the original building recognizable and stable. Use a slow cinematic camera push-in.
The sky gently moves with soft clouds. Warm office lights subtly glow.
Add refined golden festive particles and very subtle fireworks in the upper sky.
Premium Asian corporate anniversary and New Year greeting style, realistic lighting, smooth motion.
No text, no letters, no captions, no watermark, no logo changes.
  `.trim(),
};

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (value == null || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    i += 1;
    if (key === "--image") args.image = value;
    else if (key === "--output") args.output = value;
    else if (key === "--model") args.model = value;
    else if (key === "--duration") args.duration = value;
    else if (key === "--aspect-ratio") args.aspectRatio = value;
    else if (key === "--prompt") args.prompt = value;
    else throw new Error(`Unknown option ${key}`);
  }
  if (!args.image) throw new Error("Required: --image <path-or-url>");
  return args;
}

async function resolveFalImageUrl(image) {
  if (/^https?:\/\//i.test(image)) return image;
  if (!existsSync(image)) throw new Error(`Image file not found: ${image}`);
  const bytes = await readFile(image);
  const file = new File([bytes], image.split("/").pop() || "source.jpg", {
    type: image.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
  });
  return fal.storage.upload(file);
}

const args = parseArgs(process.argv.slice(2));

if (!process.env.FAL_KEY) throw new Error("FAL_KEY must be set in the environment.");

fal.config({ credentials: process.env.FAL_KEY });

const imageUrl = await resolveFalImageUrl(args.image);
console.error(`image_url=${imageUrl}`);

const result = await fal.subscribe(args.model, {
  input: {
    image_url: imageUrl,
    duration: args.duration,
    aspect_ratio: args.aspectRatio,
    cfg_scale: 0.45,
    prompt: args.prompt,
    negative_prompt:
      "text, letters, captions, watermark, logo changes, distorted building, warped architecture, blurry, low quality, flicker, people, cars close-up",
  },
  logs: true,
  onQueueUpdate(status) {
    console.error(`status=${status.status}`);
  },
});

const videoUrl = result.data?.video?.url ?? result.video?.url;
if (!videoUrl) {
  console.log(JSON.stringify(result.data ?? result, null, 2));
  throw new Error("No video URL returned by fal.");
}

const response = await fetch(videoUrl);
if (!response.ok) throw new Error(`Failed to download video: ${response.status}`);
await writeFile(args.output, Buffer.from(await response.arrayBuffer()));

console.log(JSON.stringify({ output: args.output, video_url: videoUrl }, null, 2));
