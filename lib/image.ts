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
