import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { getVisibleExperienceSlugs } from "@/lib/data/public";

const routes = [
  { path: "/", priority: 1 },
  { path: "/experiencias", priority: 0.9 },
  { path: "/calendario", priority: 0.9 },
  { path: "/comunidad", priority: 0.9 },
  { path: "/clubes-y-barrios", priority: 0.7 },
  { path: "/hoteles", priority: 0.7 },
  { path: "/sponsors", priority: 0.5 },
  { path: "/empresas", priority: 0.4 },
  { path: "/nosotros", priority: 0.6 },
  { path: "/contacto", priority: 0.6 },
  { path: "/privacidad", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getVisibleExperienceSlugs();
  return [
    ...routes.map((r) => ({ url: absoluteUrl(r.path), changeFrequency: "weekly" as const, priority: r.priority })),
    ...slugs.map((slug) => ({ url: absoluteUrl(`/experiencias/${slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
