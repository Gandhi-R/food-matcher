"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveCamera } from "../hooks/useLiveCamera";
import { validateImage } from "../lib/image";

type Props = {
  /** Dipanggil setiap gambar berubah. null = gambar dihapus. */
  onChange: (file: File | null) => void;
};

type Selected = { file: File; url: string };

export default function ImageInput({ onChange }: Props) {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const camera = useLiveCamera();

  // Bersihkan URL preview saat komponen ditutup
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function clearPreviewUrl() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }

  function selectFile(file: File) {
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    clearPreviewUrl();
    const url = URL.createObjectURL(file);
    urlRef.current = url;

    setError(null);
    setSelected({ file, url });
    onChange(file);
  }

  function removeFile() {
    clearPreviewUrl();
    setSelected(null);
    setError(null);
    onChange(null);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    e.target.value = ""; // supaya file yang sama bisa dipilih ulang
  }

  async function handleOpenCamera() {
    setError(null);
    const cameraError = await camera.start();
    if (cameraError) setError(cameraError);
  }

  async function handleCapture() {
    try {
      const file = await camera.capture();
      selectFile(file);
      camera.stop();
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Gagal mengambil gambar.");
    }
  }

  return (
    <div>
      {/* Area preview */}
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-white p-4">
        {selected ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.url}
              alt="Preview bahan makanan"
              className="max-h-96 w-full rounded-xl object-contain"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="truncate text-sm text-gray-500">{selected.file.name}</span>
              <button
                onClick={removeFile}
                className="shrink-0 rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            <div className="text-5xl">📷</div>
            <p className="mt-3">Belum ada gambar</p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Tombol input */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="rounded-xl bg-amber-600 px-4 py-3 font-medium text-white hover:bg-amber-700"
        >
          📸 Foto dengan Kamera HP
        </button>
        <button
          onClick={() => galleryInputRef.current?.click()}
          className="rounded-xl border border-amber-600 px-4 py-3 font-medium text-amber-700 hover:bg-amber-100"
        >
          🖼️ Pilih dari Galeri
        </button>
      </div>

      {/* Kamera langsung */}
      <div className="mt-3">
        {camera.isOpen ? (
          <div className="rounded-xl border border-amber-200 bg-white p-3">
            <video
              ref={camera.videoRef}
              autoPlay
              playsInline
              muted
              className="max-h-96 w-full rounded-lg bg-black object-contain"
              aria-label="Preview kamera langsung"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={handleCapture}
                className="rounded-xl bg-amber-600 px-4 py-3 font-medium text-white hover:bg-amber-700"
              >
                📸 Ambil Gambar
              </button>
              <button
                onClick={camera.stop}
                className="rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
              >
                Tutup Kamera
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleOpenCamera}
            disabled={camera.isStarting}
            className="w-full rounded-xl border border-amber-600 px-4 py-3 font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60"
          >
            {camera.isStarting ? "Membuka kamera..." : "🎥 Kamera Langsung"}
          </button>
        )}
      </div>

      {/* Input file tersembunyi */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
