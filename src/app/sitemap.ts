import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { torneosPublicos } from "@/lib/public-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const estaticas = ["", "/club", "/reservas", "/escuela", "/torneos", "/eventos", "/galeria", "/contacto"].map((r, i) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: (r === "/reservas" || r === "/torneos" ? "daily" : "weekly") as "daily" | "weekly",
    priority: i === 0 ? 1 : 0.8,
  }));
  const torneos = (await torneosPublicos().catch(() => []))
    .filter((t) => !t.esDemo)
    .map((t) => ({ url: `${base}/torneos/${t.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 }));
  return [...estaticas, ...torneos];
}
