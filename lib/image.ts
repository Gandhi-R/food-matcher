export const MAX_SIZE_MB = 10;

/** Mengembalikan pesan error, atau null kalau gambar valid. */
export function validateImage(file: Blob): string | null {
  if (!file.type.startsWith("image/")) {
    return "File harus berupa gambar (JPG, PNG, dll).";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Ukuran gambar maksimal ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

/**
 * Perkecil gambar (sisi terpanjang maksimal maxSize px) dan ubah ke JPEG.
 * Membuat upload lebih cepat dan muat di batas ukuran server.
 */
export async function resizeImage(file: Blob, maxSize = 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Gambar tidak dapat diproses.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gambar tidak dapat diproses."))),
      "image/jpeg",
      0.85,
    );
  });
}
