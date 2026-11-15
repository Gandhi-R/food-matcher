export type Ingredient = { name: string; confidence: "high" | "medium" | "low" };

export const MAX_INGREDIENTS = 30;
const MAX_NAME_LENGTH = 40;

/** Pecah teks "telur, bawang merah" menjadi ["telur", "bawang merah"]. */
export function parseNames(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, " "))
    .filter((name) => name.length > 0 && name.length <= MAX_NAME_LENGTH);
}

/** Gabungkan daftar bahan tanpa duplikat dan dengan batas jumlah. */
export function mergeIngredients(current: Ingredient[], incoming: Ingredient[]): Ingredient[] {
  const result = [...current];
  const seen = new Set(current.map((item) => item.name));

  for (const item of incoming) {
    if (result.length >= MAX_INGREDIENTS) break;
    if (seen.has(item.name)) continue;
    seen.add(item.name);
    result.push(item);
  }
  return result;
}
