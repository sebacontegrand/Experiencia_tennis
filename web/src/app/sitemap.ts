import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

// Fase 2 suma /experiencias, /calendario y cada /experiencias/[slug] publicada.
const routes = [
  { path: "/", priority: 1 },
  { path: "/comunidad", priority: 0.9 },
  { path: "/contacto", priority: 0.6 },
  { path: "/privacidad", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: absoluteUrl(r.path), changeFrequency: "weekly", priority: r.priority }));
}
