import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// Batas ukuran di server. Vercel membatasi body request sekitar 4,5 MB.
const MAX_BYTES = 4 * 1024 * 1024;

const PROMPT = `Kamu adalah asisten dapur. Lihat gambar ini dan daftar semua BAHAN MAKANAN yang terlihat jelas.

Aturan:
- Tulis nama bahan dalam Bahasa Indonesia, huruf kecil, singkat (contoh: "telur", "bawang merah", "tempe").
- Abaikan benda yang bukan bahan makanan (piring, meja, tangan, alat dapur).
- Jangan menebak bahan yang tidak terlihat. Kalau ragu, beri confidence "low".
- Gabungkan bahan yang sama menjadi satu entri.
- confidence hanya boleh berisi "high", "medium", atau "low".
- Jika tidak ada bahan makanan di gambar, kembalikan daftar kosong.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY belum diatur di server." },
      { status: 500 },
    );
  }

  // 1. Baca dan validasi gambar
  let file: File | null = null;
  try {
    const formData = await request.formData();
    const value = formData.get("image");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Gambar tidak ditemukan." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran gambar terlalu besar." }, { status: 413 });
  }

  // 2. Kirim ke Gemini
  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash",
      contents: [
        { inlineData: { mimeType: file.type, data: base64 } },
        { text: PROMPT },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  confidence: { type: Type.STRING },
                },
                required: ["name", "confidence"],
              },
            },
          },
          required: ["ingredients"],
        },
      },
    });

    // 3. Parse dan rapikan hasil
    const parsed = JSON.parse(response.text ?? "{}");
    const raw: unknown[] = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];

    const seen = new Set<string>();
    const ingredients = raw
      .map((item) => {
        const { name, confidence } = item as { name?: unknown; confidence?: unknown };
        return {
          name: typeof name === "string" ? name.trim().toLowerCase() : "",
          confidence:
            confidence === "high" || confidence === "medium" || confidence === "low"
              ? confidence
              : "medium",
        };
      })
      .filter((item) => {
        if (!item.name || seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      });

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error("Gemini error:", error);

    const status = (error as { status?: number }).status;
    if (status === 429) {
      return NextResponse.json(
        { error: "Batas penggunaan gratis tercapai. Coba lagi beberapa menit lagi." },
        { status: 429 },
      );
    }
    if (status === 404) {
      return NextResponse.json(
        { error: "Model tidak ditemukan. Cek nilai GEMINI_MODEL di .env.local." },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Gagal mendeteksi bahan. Coba lagi." },
      { status: 500 },
    );
  }
}
