"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function describeCameraError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.";
    }
    if (error.name === "NotFoundError") {
      return "Kamera tidak ditemukan di perangkat ini.";
    }
  }
  const detail = error instanceof Error ? error.message : "terjadi kesalahan.";
  return `Kamera tidak dapat dibuka: ${detail}`;
}

export function useLiveCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  // Hubungkan stream ke elemen <video> setelah elemen tampil
  useEffect(() => {
    if (isOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isOpen]);

  // Matikan kamera saat komponen ditutup
  useEffect(() => stopTracks, []);

  const stop = useCallback(() => {
    stopTracks();
    setIsOpen(false);
  }, []);

  /** Mengembalikan pesan error, atau null kalau berhasil. */
  const start = useCallback(async (): Promise<string | null> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return "Kamera real-time tidak didukung atau halaman tidak menggunakan koneksi aman (HTTPS).";
    }

    setIsStarting(true);
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      setIsOpen(true);
      return null;
    } catch (error) {
      return describeCameraError(error);
    } finally {
      setIsStarting(false);
    }
  }, []);

  /** Mengambil frame saat ini sebagai File JPEG. */
  const capture = useCallback((): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error("Kamera belum siap. Coba lagi sebentar."));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Gambar dari kamera tidak dapat diproses."));
        return;
      }

      context.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Gambar dari kamera tidak dapat disimpan. Coba lagi."));
            return;
          }
          resolve(new File([blob], "foto-kamera.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92,
      );
    });
  }, []);

  return { videoRef, isOpen, isStarting, start, stop, capture };
}
