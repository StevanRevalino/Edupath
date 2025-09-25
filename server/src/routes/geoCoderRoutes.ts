// src/routes/geocodeRoutes.ts
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { LRUCache } from "lru-cache";
import Bottleneck from "bottleneck";
import geocoder from "../services/geoCoderService";

const router = Router();

// limit HTTP call per IP (bukan ke OpenCage-nya)
const httpLimiter = rateLimit({ windowMs: 60_000, max: 120 });

// cache hasil 6 jam
const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 jam
});

// limiter ke OpenCage: 1 request / 1000ms (sesuai free tier)
const ocLimiter = new Bottleneck({ minTime: 1000 });

async function geocodeOnce(query: string) {
  // kamu bisa “mengarahkan” ke Indonesia via countryCode
  // node-geocoder mendukung object params untuk sebagian provider
  // untuk amannya kita lakukan 2 cara: kirim string + countryCode
  const res = await geocoder.geocode({
    address: query,
    countryCode: "id", // bias Indonesia
  });
  if (res && res.length) {
    const r = res[0];
    return {
      latitude: r.latitude,
      longitude: r.longitude,
      formattedAddress: r.formattedAddress ?? "",
    };
  }
  return null;
}

router.post("/", httpLimiter, async (req, res) => {
  try {
    const { query } = req.body as { query?: string };
    if (!query?.trim())
      return res
        .status(400)
        .json({ success: false, message: "query wajib diisi" });

    const key = `q:${query.trim().toLowerCase()}`;
    const cached = cache.get(key);
    if (cached !== undefined)
      return res.json({ success: true, source: "cache", data: cached });

    const data = await ocLimiter.schedule(() => geocodeOnce(query.trim()));
    cache.set(key, data ?? null);
    return res.json({ success: true, source: "live", data });
  } catch (e: any) {
    console.error("Geocode error:", e?.message || e);
    return res.status(500).json({ success: false, message: "Gagal geocode" });
  }
});

router.post("/batch", httpLimiter, async (req, res) => {
  const { queries } = req.body as { queries?: string[] };
  if (!queries?.length)
    return res
      .status(400)
      .json({ success: false, message: "queries wajib diisi" });

  const results = await Promise.all(
    queries.map(async (q) => {
      const key = `q:${q.trim().toLowerCase()}`;
      const cached = cache.get(key);
      if (cached !== undefined) return { q, ...cached };

      try {
        const data = await ocLimiter.schedule(() => geocodeOnce(q.trim()));
        cache.set(
          key,
          data ?? { latitude: "", longitude: "", formattedAddress: "" }
        );
        return {
          q,
          ...(data ?? { latitude: "", longitude: "", formattedAddress: "" }),
        };
      } catch {
        return { q, latitude: "", longitude: "", formattedAddress: "" };
      }
    })
  );

  res.json({ success: true, data: results });
});

export default router;
