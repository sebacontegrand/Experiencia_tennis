/**
 * Álbum de EJEMPLO para ver la galería en local (nunca en producción):
 *   npx tsx scripts/gallery-examples.ts [carpeta-con-fotos]
 * Fotos de Pexels (licencia libre, sin atribución obligatoria) o Unsplash; nunca subir _material/ a git.
 * Copia fotos ilustrativas (las de la carpeta indicada o, si no hay, las de /public/photos) a
 * /public/uploads/gallery (ignorada por git) y crea una experiencia FINALIZADA de ejemplo con ellas.
 * Para sacarlo: borrar la experiencia "ejemplo-galeria" desde el panel.
 */
import "dotenv/config";
import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error("Este script es solo para la base local (DATABASE_URL en localhost).");
  process.exit(1);
}

const SLUG = "ejemplo-galeria";
const OUT = path.join(process.cwd(), "public", "uploads", "gallery");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function sources() {
  // Con carpeta: solo esas fotos (p. ej. las de Pexels de _material). Sin carpeta: las ilustrativas del sitio.
  const dirs = process.argv[2] ? [process.argv[2]] : [path.join(process.cwd(), "public", "photos")];
  const files: string[] = [];
  for (const dir of dirs) {
    for (const f of (await readdir(dir)).sort()) if (/\.jpe?g$/i.test(f)) files.push(path.join(dir, f));
  }
  return files;
}

async function main() {
  const format = await db.experienceFormat.findFirst({ where: { slug: "classic" } });
  if (!format) throw new Error("Falta el formato Classic (corré el seed).");

  const old = await db.experience.findUnique({ where: { slug: SLUG }, select: { id: true } });
  if (old) await db.galleryImage.deleteMany({ where: { experienceId: old.id } });

  const exp = await db.experience.upsert({
    where: { slug: SLUG },
    update: {},
    create: {
      slug: SLUG,
      title: "Jornada de ejemplo",
      status: "FINALIZADA",
      startDate: new Date("2026-10-17T13:00:00Z"),
      endDate: new Date("2026-10-17T22:00:00Z"),
      destination: "Álbum de ejemplo (fotos ilustrativas)",
      capacity: 16,
      description: "Experiencia de ejemplo para probar la galería en local. No es real.",
      summary: "Álbum de ejemplo con fotos ilustrativas.",
      formatId: format.id,
    },
  });

  // Nombres nuevos en cada corrida: el optimizador de imágenes de Next cachea por URL.
  await mkdir(OUT, { recursive: true });
  for (const f of await readdir(OUT)) if (f.startsWith("ejemplo-")) await unlink(path.join(OUT, f));
  const run = Date.now().toString(36);

  const files = await sources();
  for (const [i, file] of files.entries()) {
    const name = `ejemplo-${run}-${String(i + 1).padStart(2, "0")}.jpg`;
    const info = await sharp(file).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(path.join(OUT, name));
    await db.galleryImage.create({
      data: {
        experienceId: exp.id,
        url: `/uploads/gallery/${name}`,
        storageKey: `local:${name}`,
        width: info.width,
        height: info.height,
        alt: `Foto ilustrativa ${i + 1} del álbum de ejemplo`,
        isPublic: true,
        sortOrder: i + 1,
      },
    });
  }
  console.log(`Álbum de ejemplo listo: ${files.length} fotos → /galeria/${SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
