import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE_CDN = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd";

let instance: FFmpeg | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (instance) return instance;

  const ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: await toBlobURL(`${CORE_CDN}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${CORE_CDN}/ffmpeg-core.wasm`, "application/wasm"),
  });

  instance = ffmpeg;
  return instance;
}

export async function convertToWhatsApp(
  file: File,
  onProgress: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  const handler = ({ progress }: { progress: number }) => {
    onProgress(Math.max(0, Math.min(1, progress)));
  };

  ffmpeg.on("progress", handler);

  try {
    await ffmpeg.writeFile("input.avi", await fetchFile(file));

    await ffmpeg.exec([
      "-i", "input.avi",
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "28",
      "-c:a", "aac",
      "-b:a", "128k",
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-movflags", "+faststart",
      "-f", "mp4",
      "output.mp4",
    ]);

    const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;

    await ffmpeg.deleteFile("input.avi").catch(() => {});
    await ffmpeg.deleteFile("output.mp4").catch(() => {});

    return new Blob([data.slice().buffer as ArrayBuffer], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", handler);
  }
}
