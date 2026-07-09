// Browser-only image helpers. Downscales field photos before they hit the AI
// endpoint or get embedded in the .docx — keeps payloads and output small/fast.

export async function downscaleToDataUrl(file: File, maxPx = 1600, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return fileToDataUrl(file);
  const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return fileToDataUrl(file);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", quality);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export type ExifBits = { date: string; time: string; gps: { lat: number; lng: number } | null };

export async function readExif(file: File): Promise<ExifBits> {
  try {
    const exifr = (await import("exifr")).default;
    const data = await exifr.parse(file, { pick: ["DateTimeOriginal", "CreateDate", "GPSLatitude", "GPSLongitude"] });
    const dt: Date | undefined = data?.DateTimeOriginal || data?.CreateDate;
    const lat = data?.latitude ?? (typeof data?.GPSLatitude === "number" ? data.GPSLatitude : undefined);
    const lng = data?.longitude ?? (typeof data?.GPSLongitude === "number" ? data.GPSLongitude : undefined);
    if (dt instanceof Date && !isNaN(dt.getTime())) {
      return {
        date: dt.toLocaleDateString("en-US"),
        time: dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        gps: lat != null && lng != null ? { lat, lng } : null,
      };
    }
  } catch {
    /* fall through */
  }
  const mtime = new Date(file.lastModified);
  return {
    date: mtime.toLocaleDateString("en-US"),
    time: mtime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    gps: null,
  };
}
