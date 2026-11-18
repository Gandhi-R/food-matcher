import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

// Batas per pengguna (berdasarkan IP). Ubah angkanya sesuai kebutuhan.
const LIMITS = [
  { name: "minute", max: 8, windowMs: MINUTE },
  { name: "day", max: 60, windowMs: DAY },
];

// Catatan: penyimpanan ini ada di memori satu instance server, jadi sifatnya
// "usaha terbaik". Cukup untuk menahan penyalahgunaan ringan di tahap awal.
const buckets = new Map<string, Bucket>();

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

function cleanup(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Mengembalikan response 429 kalau melewati batas, atau null kalau boleh lanjut. */
export function rateLimit(request: Request): NextResponse | null {
  const now = Date.now();
  const client = getClientId(request);
  cleanup(now);

  let retryAfter = 0;

  for (const limit of LIMITS) {
    const key = `${client}:${limit.name}`;
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + limit.windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > limit.max) {
      retryAfter = Math.max(retryAfter, Math.ceil((bucket.resetAt - now) / 1000));
    }
  }

  if (retryAfter === 0) return null;

  const message =
    retryAfter > 120
      ? "Batas penggunaan harian tercapai. Coba lagi besok."
      : `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`;

  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
