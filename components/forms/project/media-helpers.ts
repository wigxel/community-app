export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type MediaMetadata = {
  filename: string;
  mimeType: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
};

export async function extractMetadata(file: File): Promise<MediaMetadata> {
  type VideoMeta = {
    duration: number;
    width: number;
    height: number;
  };

  type ImageMeta = { width: number; height: number };

  const base = { mimeType: file.type, size: file.size, filename: file.name };
  const objectUrl = URL.createObjectURL(file);

  try {
    if (file.type.startsWith("image/")) {
      const dims = await new Promise<ImageMeta>((resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = objectUrl;
      });

      return { ...base, ...dims };
    }

    if (file.type.startsWith("video/")) {
      const info = await new Promise<VideoMeta>((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () =>
          resolve({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
          });
        video.onerror = () => resolve({ duration: 0, width: 0, height: 0 });
        video.src = objectUrl;
      });

      return { ...base, ...info };
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return base;
}
