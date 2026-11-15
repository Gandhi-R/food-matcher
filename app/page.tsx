"use client";

import { useState } from "react";
import ImageInput from "../components/ImageInput";
import IngredientEditor from "../components/ingredientseditor";
import { resizeImage } from "../lib/image";
import { type Ingredient, mergeIngredients } from "../lib/ingredients";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleImageChange(file: File | null) {
    setImage(file);
    setError(null);
    setNotice(null);
  }

  async function handleDetect() {
    if (!image) return;

    setIsDetecting(true);
    setError(null);
    setNotice(null);

    try {
      const resized = await resizeImage(image);
      const formData = new FormData();
      formData.append("image", resized, "bahan.jpg");

      const response = await fetch("/api/detect", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Gagal mendeteksi bahan.");
      }

      const detected: Ingredient[] = data.ingredients;
      if (detected.length === 0) {
        setNotice("Tidak ada bahan makanan yang terdeteksi. Coba foto yang lebih jelas atau ketik manual.");
      } else {
        // Hasil scan ditambahkan ke bahan yang sudah ada (termasuk yang diketik manual)
        setIngredients((current) => mergeIngredients(current, detected));
        setNotice(`${detected.length} bahan terdeteksi. Cek dan edit kalau ada yang salah.`);
      }
    } catch (detectError) {
      setError(detectError instanceof Error ? detectError.message : "Terjadi kesalahan.");
    } finally {
      setIsDetecting(false);
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900">
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-3xl font-bold text-amber-900">🍳 Food Matcher</h1>
        <p className="mt-2 text-gray-600">
          Ketik bahan yang kamu punya, atau foto bahannya. Kami carikan masakan yang bisa dibuat.
        </p>

        {/* Cara 1: ketik manual */}
        <div className="mt-8">
          <IngredientEditor ingredients={ingredients} onChange={setIngredients} />
        </div>

        {/* Cara 2: scan foto */}
        <details className="mt-6 rounded-2xl bg-white p-4" open={image !== null}>
          <summary className="cursor-pointer font-semibold text-amber-900">
            📷 Atau scan dari foto
          </summary>

          <div className="mt-4">
            <ImageInput onChange={handleImageChange} />

            <button
              onClick={handleDetect}
              disabled={!image || isDetecting}
              className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDetecting ? "Mendeteksi bahan..." : "Deteksi Bahan"}
            </button>

            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                {notice}
              </p>
            )}
          </div>
        </details>

        {/* Placeholder untuk Tahap 6 */}
        <button
          disabled={ingredients.length === 0}
          className="mt-6 w-full rounded-xl bg-amber-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cari Resep (segera hadir)
        </button>
      </div>
    </main>
  );
}
