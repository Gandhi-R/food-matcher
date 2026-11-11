"use client";

import { useState } from "react";
import ImageInput from "../components/ImageInput";

export default function Home() {
  // File gambar yang dipilih. Di Tahap 4, file ini yang dikirim ke API.
  const [image, setImage] = useState<File | null>(null);

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900">
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-3xl font-bold text-amber-900">🍳 Food Matcher</h1>
        <p className="mt-2 text-gray-600">
          Foto bahan makanan kamu, lalu kami carikan masakan yang bisa dibuat.
        </p>

        <div className="mt-8">
          <ImageInput onChange={setImage} />
        </div>

        {/* Placeholder untuk Tahap 4 */}
        <button
          disabled={!image}
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Deteksi Bahan (segera hadir)
        </button>
      </div>
    </main>
  );
}
