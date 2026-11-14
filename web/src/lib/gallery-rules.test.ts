import { describe, expect, it } from "vitest";
import { fitWithin, galleryPathname, isAllowedPhotoUrl, photoAlt, uploadedPhotosSchema } from "./gallery-rules";

describe("fitWithin", () => {
  it("achica respetando la proporción", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 2400, height: 1800 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1800, height: 2400 });
  });
  it("no agranda fotos chicas", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe("isAllowedPhotoUrl", () => {
  it("acepta Vercel Blob, subidas locales y fotos del sitio", () => {
    expect(isAllowedPhotoUrl("https://abc123.public.blob.vercel-storage.com/galeria/x/foto-a1b2.jpg")).toBe(true);
    expect(isAllowedPhotoUrl("/uploads/gallery/abc.jpg")).toBe(true);
    expect(isAllowedPhotoUrl("/photos/court-net-bw.jpg")).toBe(true);
  });
  it("rechaza otros dominios, http y rutas con ..", () => {
    expect(isAllowedPhotoUrl("https://evil.com/x.jpg")).toBe(false);
    expect(isAllowedPhotoUrl("http://abc.public.blob.vercel-storage.com/x.jpg")).toBe(false);
    expect(isAllowedPhotoUrl("https://blob.vercel-storage.com.evil.com/x.jpg")).toBe(false);
    expect(isAllowedPhotoUrl("/uploads/gallery/../../.env")).toBe(false);
    expect(isAllowedPhotoUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("galleryPathname", () => {
  it("arma una ruta segura dentro de galeria/<experiencia>/", () => {
    expect(galleryPathname("exp1", "IMG_2041 Señor ñandú.HEIC")).toBe("galeria/exp1/img-2041-senor-nandu.jpg");
    expect(galleryPathname("exp1", "../../etc.jpg")).toBe("galeria/exp1/etc.jpg");
    expect(galleryPathname("exp1", "....jpg")).toBe("galeria/exp1/foto.jpg");
  });
});

describe("uploadedPhotosSchema", () => {
  const ok = { url: "/uploads/gallery/a.jpg", storageKey: "local:a.jpg", width: 1200, height: 800 };
  it("valida el lote", () => {
    expect(uploadedPhotosSchema.safeParse([ok]).success).toBe(true);
    expect(uploadedPhotosSchema.safeParse([]).success).toBe(false);
    expect(uploadedPhotosSchema.safeParse([{ ...ok, storageKey: "local:../../x" }]).success).toBe(false);
    expect(uploadedPhotosSchema.safeParse([{ ...ok, url: "https://evil.com/a.jpg" }]).success).toBe(false);
  });
});

it("photoAlt", () => {
  expect(photoAlt("Villa Gesell 2026", 3)).toBe("Foto 3 de Villa Gesell 2026");
});
