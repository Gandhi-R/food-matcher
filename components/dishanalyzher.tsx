"use client";

import { useState } from "react";
import ImageInput from "./ImageInput";
import { resizeImage } from "../lib/image";
import type { DishAnalysis } from "../lib/dish.ts";

type Props = {
  /** Dipanggil saat pengguna ingin memakai bahan hasil analisis di tab Cari Resep. */
  onUseIngredients: (names: string[]) => void;
};

export default function DishAnalyzer({ onUseIngredients }: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [result, setResult] = useState<DishAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = (image !== null || name.trim().length > 0) && !isLoading;

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      if (image) formData.append("image", await resizeImage(image), "makanan.jpg");
      if (name.trim()) formData.append("name", name.trim());

      const response = await fetch("/api/analyze-dish", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal menganalisis makanan.");

      setResult(data.analysis);
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-amber-950">1. Foto atau ketik nama</h2>
        <p className="mt-1 text-sm text-stone-600">
          Foto lauk, makanan, atau produk kemasan (pastikan label komposisi terlihat kalau ada).
        </p>

        <div className="mt-4">
          <ImageInput onChange={setImage} />
        </div>

        <label className="mt-5 block text-sm font-medium text-stone-700" htmlFor="dish-name">
          Atau ketik nama makanan
        </label>
        <input
          id="dish-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Contoh: rendang, siomay, mie instan goreng"
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-600"
        />

        <button
          onClick={handleAnalyze}
          disabled={!canSubmit}
          className="mt-5 w-full rounded-xl bg-amber-700 px-4 py-3 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Menganalisis..." : "Tebak Bahannya"}
        </button>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      {result && (
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm" aria-label="Hasil analisis">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-amber-950">{result.name}</h2>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              {result.kind === "product" ? "Produk kemasan" : "Masakan"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                result.source === "label" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"
              }`}
            >
              {result.source === "label" ? "✓ Dibaca dari label" : "Perkiraan"}
            </span>
          </div>
          {result.description && <p className="mt-2 text-sm text-stone-600">{result.description}</p>}

          <h3 className="mt-4 text-sm font-semibold text-stone-800">Bahan utama</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {result.main_ingredients.map((item) => (
              <li key={item} className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900">
                {item}
              </li>
            ))}
          </ul>

          {result.seasonings.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold text-stone-800">Bumbu dan bahan tambahan</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.seasonings.map((item) => (
                  <li key={item} className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {result.main_ingredients.length > 0 && (
            <button
              onClick={() => onUseIngredients(result.main_ingredients)}
              className="mt-5 w-full rounded-xl border border-amber-700 px-4 py-3 font-medium text-amber-800 hover:bg-amber-50"
            >
              Pakai bahan utama ini untuk Cari Resep →
            </button>
          )}

          {result.steps.length > 0 && (
            <details className="mt-4" open>
              <summary className="cursor-pointer text-sm font-medium text-amber-800">
                Perkiraan cara membuat
              </summary>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-stone-800">
                {result.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </details>
          )}

          {result.notes && <p className="mt-4 text-sm text-stone-600">📝 {result.notes}</p>}

          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Hasil ini hanya perkiraan dan bukan acuan alergi. Bahan tersembunyi bisa terlewat, jadi selalu
            cek label atau tanyakan penjualnya.
          </p>
        </section>
      )}
    </div>
  );
}
